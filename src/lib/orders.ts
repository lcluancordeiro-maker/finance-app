import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computePosition } from "@/lib/portfolio";
import { supportsAutoQuoteClient } from "@/lib/quotes-client";
import { HttpError } from "@/lib/auth";

export async function getOrCreatePortfolio(userId: string) {
  const existing = await prisma.portfolio.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.portfolio.create({ data: { userId } });
}

export async function computeCashBalance(portfolioId: string, startingCash: number): Promise<number> {
  const transactions = await prisma.transaction.findMany({ where: { portfolioId } });
  let cash = startingCash;
  for (const t of transactions) {
    const total = t.price * t.quantity;
    cash += t.type === "COMPRA" ? -total : total;
  }
  return cash;
}

type PlaceOrderInput = {
  userId: string;
  assetId: string;
  type: TransactionType;
  quantity: number;
  price?: number;
  notes?: string;
};

// Ponto de extensão: uma corretora real trocaria a origem do preço (cotação ao vivo
// de um provedor pago/streaming) e a execução (API externa) mantendo essa mesma assinatura.
export async function placeOrder({ userId, assetId, type, quantity, price: manualPrice, notes }: PlaceOrderInput) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new HttpError(400, "Quantidade deve ser maior que zero.");
  }

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw new HttpError(404, "Ativo não encontrado.");

  let price: number;
  if (supportsAutoQuoteClient(asset.type)) {
    if (asset.currentPrice == null) {
      throw new HttpError(409, "Cotação indisponível para este ativo — atualize as cotações antes de operar.");
    }
    price = asset.currentPrice;
  } else {
    if (typeof manualPrice !== "number" || manualPrice <= 0) {
      throw new HttpError(400, "Preço é obrigatório para este tipo de ativo.");
    }
    price = manualPrice;
  }

  const portfolio = await getOrCreatePortfolio(userId);
  const total = price * quantity;

  if (type === "COMPRA") {
    const cash = await computeCashBalance(portfolio.id, portfolio.startingCash);
    if (cash < total) {
      throw new HttpError(400, "Saldo insuficiente para esta compra.");
    }
  } else {
    const assetTransactions = await prisma.transaction.findMany({
      where: { portfolioId: portfolio.id, assetId },
    });
    const position = computePosition(assetTransactions);
    if (position.quantity < quantity) {
      throw new HttpError(400, "Quantidade insuficiente em carteira para esta venda.");
    }
  }

  return prisma.transaction.create({
    data: {
      portfolioId: portfolio.id,
      assetId,
      type,
      quantity,
      price,
      date: new Date(),
      notes: notes || null,
    },
  });
}

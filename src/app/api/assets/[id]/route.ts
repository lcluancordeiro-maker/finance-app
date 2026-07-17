import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, HttpError } from "@/lib/auth";
import { getOrCreatePortfolio } from "@/lib/orders";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { currentPrice } = body ?? {};

    if (typeof currentPrice !== "number" || Number.isNaN(currentPrice) || currentPrice < 0) {
      return NextResponse.json({ error: "currentPrice deve ser um número válido" }, { status: 400 });
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: { currentPrice, quoteUpdatedAt: new Date() },
    });
    return NextResponse.json(asset);
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

// Não apaga o Asset em si — ele é um catálogo compartilhado entre usuários.
// "Remover" aqui significa limpar o histórico de transações do usuário logado
// para este ativo, sem afetar outros usuários que também o negociam.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    const portfolio = await getOrCreatePortfolio(userId);
    await prisma.transaction.deleteMany({ where: { portfolioId: portfolio.id, assetId: id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

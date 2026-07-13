import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, HttpError } from "@/lib/auth";
import { getOrCreatePortfolio, computeCashBalance } from "@/lib/orders";
import { computePosition } from "@/lib/portfolio";

export async function GET() {
  try {
    const userId = await requireAuth();
    const portfolio = await getOrCreatePortfolio(userId);

    const transactions = await prisma.transaction.findMany({
      where: { portfolioId: portfolio.id },
      include: { asset: true },
    });

    const cashBalance = await computeCashBalance(portfolio.id, portfolio.startingCash);

    const byAsset = new Map<string, typeof transactions>();
    for (const t of transactions) {
      const list = byAsset.get(t.assetId) ?? [];
      list.push(t);
      byAsset.set(t.assetId, list);
    }

    const holdings = [...byAsset.entries()]
      .map(([assetId, txs]) => {
        const position = computePosition(txs);
        const asset = txs[0].asset;
        const currentValue =
          position.quantity > 0 && asset.currentPrice != null ? position.quantity * asset.currentPrice : null;
        const unrealizedProfit = currentValue != null ? currentValue - position.costBasis : null;
        return {
          assetId,
          ticker: asset.ticker,
          name: asset.name,
          type: asset.type,
          quantity: position.quantity,
          avgPrice: position.avgPrice,
          costBasis: position.costBasis,
          realizedProfit: position.realizedProfit,
          currentPrice: asset.currentPrice,
          currentValue,
          unrealizedProfit,
        };
      })
      .filter((h) => h.quantity > 0);

    const holdingsValue = holdings.reduce((sum, h) => sum + (h.currentValue ?? h.costBasis), 0);

    return NextResponse.json({
      startingCash: portfolio.startingCash,
      cashBalance,
      holdings,
      holdingsValue,
      totalValue: cashBalance + holdingsValue,
    });
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchQuotes, supportsAutoQuote } from "@/lib/quotes";
import { requireAuth, HttpError } from "@/lib/auth";

export async function POST() {
  try {
    await requireAuth();
  } catch (err) {
    if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }

  const assets = await prisma.asset.findMany();
  const quotable = assets.filter((a) => supportsAutoQuote(a.type));

  const quotes = await fetchQuotes(quotable.map((a) => ({ ticker: a.ticker, type: a.type })));

  const updated: string[] = [];
  const failed: { ticker: string; error: string }[] = [];

  await Promise.all(
    quotable.map(async (asset) => {
      const quote = quotes.get(asset.ticker);
      if (quote?.price != null) {
        await prisma.asset.update({
          where: { id: asset.id },
          data: { currentPrice: quote.price, quoteUpdatedAt: new Date() },
        });
        updated.push(asset.ticker);
      } else {
        failed.push({ ticker: asset.ticker, error: quote?.error ?? "sem resposta" });
      }
    })
  );

  return NextResponse.json({ updated, failed });
}

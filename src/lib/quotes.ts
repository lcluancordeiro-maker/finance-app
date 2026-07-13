import type { AssetType } from "@/lib/types";
import { supportsAutoQuoteClient } from "@/lib/quotes-client";

type QuoteResult = { ticker: string; price: number | null; error?: string };

async function fetchBrapiPrices(tickers: string[]): Promise<QuoteResult[]> {
  if (tickers.length === 0) return [];
  const token = process.env.BRAPI_TOKEN;
  const url = new URL(`https://brapi.dev/api/quote/${tickers.join(",")}`);
  if (token) url.searchParams.set("token", token);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      const message = data?.message ?? `brapi respondeu ${res.status}`;
      return tickers.map((ticker) => ({ ticker, price: null, error: message }));
    }
    const results = new Map<string, number>(
      (data.results ?? []).map((r: { symbol: string; regularMarketPrice: number }) => [
        r.symbol,
        r.regularMarketPrice,
      ])
    );
    return tickers.map((ticker) => ({
      ticker,
      price: results.get(ticker) ?? null,
      error: results.has(ticker) ? undefined : "cotação não encontrada",
    }));
  } catch {
    return tickers.map((ticker) => ({ ticker, price: null, error: "falha ao consultar brapi.dev" }));
  }
}

async function fetchCoinGeckoPrices(ids: string[]): Promise<QuoteResult[]> {
  if (ids.length === 0) return [];
  const url = new URL("https://api.coingecko.com/api/v3/simple/price");
  url.searchParams.set("ids", ids.join(","));
  url.searchParams.set("vs_currencies", "brl");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      return ids.map((id) => ({ ticker: id, price: null, error: `CoinGecko respondeu ${res.status}` }));
    }
    return ids.map((id) => ({
      ticker: id,
      price: data[id]?.brl ?? null,
      error: data[id]?.brl != null ? undefined : "cotação não encontrada",
    }));
  } catch {
    return ids.map((id) => ({ ticker: id, price: null, error: "falha ao consultar CoinGecko" }));
  }
}

export const supportsAutoQuote = supportsAutoQuoteClient;

export async function fetchQuotes(
  assets: { ticker: string; type: AssetType }[]
): Promise<Map<string, QuoteResult>> {
  const brapiTickers = assets
    .filter((a) => a.type === "ACAO" || a.type === "FII" || a.type === "ETF")
    .map((a) => a.ticker);
  const cryptoIds = assets.filter((a) => a.type === "CRIPTO").map((a) => a.ticker);

  const [brapiResults, cryptoResults] = await Promise.all([
    fetchBrapiPrices(brapiTickers),
    fetchCoinGeckoPrices(cryptoIds),
  ]);

  const map = new Map<string, QuoteResult>();
  for (const r of [...brapiResults, ...cryptoResults]) map.set(r.ticker, r);
  return map;
}

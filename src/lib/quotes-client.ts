import type { AssetType } from "@/lib/types";

const AUTO_QUOTE_TYPES: AssetType[] = ["ACAO", "FII", "ETF", "CRIPTO"];

export function supportsAutoQuoteClient(type: AssetType): boolean {
  return AUTO_QUOTE_TYPES.includes(type);
}

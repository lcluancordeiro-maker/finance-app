export type AssetType = "ACAO" | "FII" | "CRIPTO" | "RENDA_FIXA" | "ETF" | "OUTRO";
export type TransactionType = "COMPRA" | "VENDA";

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  ACAO: "Ação",
  FII: "FII",
  CRIPTO: "Cripto",
  RENDA_FIXA: "Renda fixa",
  ETF: "ETF",
  OUTRO: "Outro",
};

export const ASSET_TYPE_ORDER: AssetType[] = ["ACAO", "FII", "ETF", "CRIPTO", "RENDA_FIXA", "OUTRO"];

export const ASSET_TYPE_COLORS: Record<AssetType, { light: string; dark: string }> = {
  ACAO: { light: "#2a78d6", dark: "#3987e5" },
  FII: { light: "#1baf7a", dark: "#199e70" },
  ETF: { light: "#eda100", dark: "#c98500" },
  CRIPTO: { light: "#008300", dark: "#008300" },
  RENDA_FIXA: { light: "#4a3aa7", dark: "#9085e9" },
  OUTRO: { light: "#e34948", dark: "#e66767" },
};

export type Transaction = {
  id: string;
  assetId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  date: string;
  notes: string | null;
};

export type Asset = {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  currentPrice: number | null;
  quoteUpdatedAt: string | null;
  transactions: Transaction[];
};

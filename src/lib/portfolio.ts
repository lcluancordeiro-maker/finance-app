import type { TransactionType } from "@/lib/types";

export type TxLike = { type: TransactionType; quantity: number; price: number; date: Date };

export type AssetPosition = {
  quantity: number;
  avgPrice: number;
  costBasis: number;
  realizedProfit: number;
};

export function computePosition(transactions: TxLike[]): AssetPosition {
  const sorted = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

  let quantity = 0;
  let avgPrice = 0;
  let realizedProfit = 0;

  for (const t of sorted) {
    if (t.type === "COMPRA") {
      const newQty = quantity + t.quantity;
      const totalCost = quantity * avgPrice + t.quantity * t.price;
      avgPrice = newQty > 0 ? totalCost / newQty : 0;
      quantity = newQty;
    } else {
      realizedProfit += (t.price - avgPrice) * t.quantity;
      quantity -= t.quantity;
      if (quantity <= 0) {
        quantity = Math.max(quantity, 0);
        avgPrice = 0;
      }
    }
  }

  return {
    quantity,
    avgPrice,
    costBasis: quantity * avgPrice,
    realizedProfit,
  };
}

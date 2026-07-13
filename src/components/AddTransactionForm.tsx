"use client";

import { useState } from "react";
import type { Asset, TransactionType } from "@/lib/types";
import { supportsAutoQuoteClient } from "@/lib/quotes-client";
import { formatCurrency } from "@/lib/format";

type Props = {
  asset: Asset;
  onCreated: () => void;
  onClose: () => void;
};

export function AddTransactionForm({ asset, onCreated, onClose }: Props) {
  const autoQuote = supportsAutoQuoteClient(asset.type);
  const [type, setType] = useState<TransactionType>("COMPRA");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          type,
          quantity: Number(quantity),
          ...(autoQuote ? {} : { price: Number(price) }),
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "erro ao executar a ordem");
        return;
      }
      onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[#52514e] dark:text-[#c3c2b7]">
        {asset.ticker} · {asset.name}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("COMPRA")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            type === "COMPRA" ? "bg-[#0ca30c] text-white" : "border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] text-[#52514e] dark:text-[#c3c2b7]"
          }`}
        >
          Comprar
        </button>
        <button
          type="button"
          onClick={() => setType("VENDA")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            type === "VENDA" ? "bg-[#d03b3b] text-white" : "border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] text-[#52514e] dark:text-[#c3c2b7]"
          }`}
        >
          Vender
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">Quantidade</label>
          <input
            type="number"
            step="any"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">Preço unitário (R$)</label>
          {autoQuote ? (
            <div className="mt-1 w-full rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 text-sm">
              {asset.currentPrice != null ? formatCurrency(asset.currentPrice) : "cotação indisponível"}
            </div>
          ) : (
            <input
              type="number"
              step="any"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-transparent px-3 py-2 text-sm"
            />
          )}
        </div>
      </div>
      {autoQuote && (
        <p className="text-xs text-[#898781]">
          A ordem é executada à cotação atual do ativo. Se ela estiver desatualizada, atualize as cotações antes de operar.
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">Notas (opcional)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-transparent px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-[#d03b3b] dark:text-[#e66767]">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-[#52514e] dark:text-[#c3c2b7]">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[#2a78d6] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Executando..." : "Executar ordem"}
        </button>
      </div>
    </form>
  );
}

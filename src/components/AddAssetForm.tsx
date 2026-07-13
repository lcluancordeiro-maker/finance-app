"use client";

import { useState } from "react";
import { ASSET_TYPE_LABELS, ASSET_TYPE_ORDER, type AssetType } from "@/lib/types";

type Props = {
  onCreated: () => void;
  onClose: () => void;
};

export function AddAssetForm({ onCreated, onClose }: Props) {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>("ACAO");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, name, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "erro ao criar ativo");
        return;
      }
      onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AssetType)}
          className="mt-1 w-full rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-transparent px-3 py-2 text-sm"
        >
          {ASSET_TYPE_ORDER.map((t) => (
            <option key={t} value={t}>
              {ASSET_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">
          Ticker {type === "CRIPTO" && <span className="font-normal">(id da CoinGecko, ex: bitcoin)</span>}
        </label>
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder={type === "CRIPTO" ? "bitcoin" : "PETR4"}
          required
          className="mt-1 w-full rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#52514e] dark:text-[#c3c2b7]">Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Petrobras PN"
          required
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
          {loading ? "Criando..." : "Criar ativo"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { Fragment, useState } from "react";
import type { Asset } from "@/lib/types";
import { ASSET_TYPE_LABELS } from "@/lib/types";
import { computePosition } from "@/lib/portfolio";
import { formatCurrency, formatDate, formatDateTime, formatPercent, formatQuantity } from "@/lib/format";
import { supportsAutoQuoteClient } from "@/lib/quotes-client";

type Props = {
  assets: Asset[];
  onChanged: () => void;
  onAddTransaction: (asset: Asset) => void;
};

export function PortfolioTable({ assets, onChanged, onAddTransaction }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");

  async function deleteAsset(id: string) {
    if (!confirm("Remover este ativo e todas as suas transações?")) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    onChanged();
  }

  async function deleteTransaction(id: string) {
    if (!confirm("Remover esta transação?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    onChanged();
  }

  async function saveManualPrice(id: string) {
    const value = Number(priceInput);
    if (!Number.isFinite(value) || value < 0) return;
    await fetch(`/api/assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPrice: value }),
    });
    setEditingPrice(null);
    onChanged();
  }

  if (assets.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-[#898781]">
        Nenhum ativo cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] text-left text-xs uppercase tracking-wide text-[#898781]">
            <th className="py-2 pr-3">Ativo</th>
            <th className="py-2 pr-3">Tipo</th>
            <th className="py-2 pr-3 text-right">Qtd.</th>
            <th className="py-2 pr-3 text-right">Preço médio</th>
            <th className="py-2 pr-3 text-right">Cotação atual</th>
            <th className="py-2 pr-3 text-right">Valor investido</th>
            <th className="py-2 pr-3 text-right">Valor atual</th>
            <th className="py-2 pr-3 text-right">Lucro/Prejuízo</th>
            <th className="py-2 pr-3"></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const position = computePosition(
              asset.transactions.map((t) => ({ ...t, date: new Date(t.date) }))
            );
            const currentValue = asset.currentPrice != null ? position.quantity * asset.currentPrice : null;
            const profit = currentValue != null ? currentValue - position.costBasis + position.realizedProfit : null;
            const profitPct = position.costBasis > 0 && profit != null ? profit / position.costBasis : null;
            const isExpanded = expanded === asset.id;

            return (
              <Fragment key={asset.id}>
                <tr
                  className="border-b border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  onClick={() => setExpanded(isExpanded ? null : asset.id)}
                >
                  <td className="py-2.5 pr-3">
                    <div className="font-medium">{asset.ticker}</div>
                    <div className="text-xs text-[#898781]">{asset.name}</div>
                  </td>
                  <td className="py-2.5 pr-3 text-[#52514e] dark:text-[#c3c2b7]">{ASSET_TYPE_LABELS[asset.type]}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatQuantity(position.quantity)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatCurrency(position.avgPrice)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums" onClick={(e) => e.stopPropagation()}>
                    {editingPrice === asset.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          autoFocus
                          type="number"
                          step="any"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveManualPrice(asset.id)}
                          className="w-24 rounded border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-transparent px-2 py-1 text-right text-sm"
                        />
                        <button onClick={() => saveManualPrice(asset.id)} className="text-xs text-[#2a78d6]">
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPrice(asset.id);
                          setPriceInput(asset.currentPrice?.toString() ?? "");
                        }}
                        className="hover:underline"
                        title={asset.quoteUpdatedAt ? `Atualizado em ${formatDateTime(asset.quoteUpdatedAt)}` : "Definir preço manualmente"}
                      >
                        {asset.currentPrice != null ? formatCurrency(asset.currentPrice) : "definir"}
                      </button>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatCurrency(position.costBasis)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {currentValue != null ? formatCurrency(currentValue) : "—"}
                  </td>
                  <td
                    className={`py-2.5 pr-3 text-right tabular-nums ${
                      profit == null ? "" : profit >= 0 ? "text-[#006300] dark:text-[#0ca30c]" : "text-[#d03b3b] dark:text-[#e66767]"
                    }`}
                  >
                    {profit != null ? (
                      <>
                        {formatCurrency(profit)}
                        {profitPct != null && <div className="text-xs">{formatPercent(profitPct)}</div>}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-3 text-xs">
                      <button onClick={() => onAddTransaction(asset)} className="text-[#2a78d6] hover:underline">
                        + transação
                      </button>
                      <button onClick={() => deleteAsset(asset.id)} className="text-[#d03b3b] hover:underline">
                        remover
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-black/[0.015] dark:bg-white/[0.02]">
                    <td colSpan={9} className="px-3 py-3">
                      {asset.transactions.length === 0 ? (
                        <p className="text-xs text-[#898781]">Nenhuma transação registrada.</p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-[#898781]">
                              <th className="py-1 pr-3">Data</th>
                              <th className="py-1 pr-3">Tipo</th>
                              <th className="py-1 pr-3 text-right">Qtd.</th>
                              <th className="py-1 pr-3 text-right">Preço</th>
                              <th className="py-1 pr-3">Notas</th>
                              <th className="py-1 pr-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...asset.transactions]
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((t) => (
                                <tr key={t.id}>
                                  <td className="py-1 pr-3">{formatDate(t.date)}</td>
                                  <td className={`py-1 pr-3 ${t.type === "COMPRA" ? "text-[#006300] dark:text-[#0ca30c]" : "text-[#d03b3b] dark:text-[#e66767]"}`}>
                                    {t.type === "COMPRA" ? "Compra" : "Venda"}
                                  </td>
                                  <td className="py-1 pr-3 text-right tabular-nums">{formatQuantity(t.quantity)}</td>
                                  <td className="py-1 pr-3 text-right tabular-nums">{formatCurrency(t.price)}</td>
                                  <td className="py-1 pr-3 text-[#898781]">{t.notes}</td>
                                  <td className="py-1 pr-3 text-right">
                                    <button onClick={() => deleteTransaction(t.id)} className="text-[#d03b3b] hover:underline">
                                      remover
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                      {!supportsAutoQuoteClient(asset.type) && (
                        <p className="mt-2 text-xs text-[#898781]">
                          Este tipo de ativo não tem cotação automática — atualize o preço manualmente clicando no valor da coluna &quot;Cotação atual&quot;.
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

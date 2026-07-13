"use client";

import { useCallback, useEffect, useState } from "react";
import type { Asset, AssetType } from "@/lib/types";
import { ASSET_TYPE_ORDER } from "@/lib/types";
import { computePosition } from "@/lib/portfolio";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/format";
import { StatTile } from "@/components/StatTile";
import { CompositionChart } from "@/components/CompositionChart";
import { PortfolioTable } from "@/components/PortfolioTable";
import { Modal } from "@/components/Modal";
import { AddAssetForm } from "@/components/AddAssetForm";
import { AddTransactionForm } from "@/components/AddTransactionForm";

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [txAsset, setTxAsset] = useState<Asset | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    const res = await fetch("/api/assets");
    const data = await res.json();
    setAssets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // fetch-on-mount: state updates happen after the async gap, not synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAssets();
  }, [loadAssets]);

  async function refreshQuotes() {
    setRefreshing(true);
    try {
      await fetch("/api/quotes/refresh", { method: "POST" });
      await loadAssets();
      setLastRefresh(new Date().toISOString());
    } finally {
      setRefreshing(false);
    }
  }

  let totalInvested = 0;
  let totalCurrent = 0;
  let totalRealized = 0;
  let hasMissingQuote = false;
  const byType = new Map<AssetType, number>();

  for (const asset of assets) {
    const position = computePosition(asset.transactions.map((t) => ({ ...t, date: new Date(t.date) })));
    totalInvested += position.costBasis;
    totalRealized += position.realizedProfit;
    if (position.quantity > 0) {
      if (asset.currentPrice != null) {
        const value = position.quantity * asset.currentPrice;
        totalCurrent += value;
        byType.set(asset.type, (byType.get(asset.type) ?? 0) + value);
      } else {
        totalCurrent += position.costBasis;
        hasMissingQuote = true;
      }
    }
  }

  const totalProfit = totalCurrent - totalInvested + totalRealized;
  const totalProfitPct = totalInvested > 0 ? totalProfit / totalInvested : 0;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Carteira de investimentos</h1>
          <p className="mt-1 text-sm text-[#52514e] dark:text-[#c3c2b7]">
            Acompanhe posições, aportes e rentabilidade em um só lugar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshQuotes}
            disabled={refreshing}
            className="rounded-md border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {refreshing ? "Atualizando..." : "Atualizar cotações"}
          </button>
          <button
            onClick={() => setShowAddAsset(true)}
            className="rounded-md bg-[#2a78d6] px-4 py-2 text-sm font-medium text-white"
          >
            + Novo ativo
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-[#898781]">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Valor investido" value={formatCurrency(totalInvested)} />
            <StatTile
              label="Valor atual"
              value={formatCurrency(totalCurrent)}
              sub={hasMissingQuote ? "algumas cotações ausentes" : lastRefresh ? `atualizado ${formatDateTime(lastRefresh)}` : undefined}
            />
            <StatTile
              label="Lucro / Prejuízo"
              value={`${formatCurrency(totalProfit)} (${formatPercent(totalProfitPct)})`}
              tone={totalProfit >= 0 ? "good" : "critical"}
            />
          </div>

          <section className="mt-8 rounded-lg border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-[#fcfcfb] dark:bg-[#1a1a19] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#52514e] dark:text-[#c3c2b7]">Composição por tipo</h2>
            <CompositionChart
              data={ASSET_TYPE_ORDER.map((type) => ({ type, value: byType.get(type) ?? 0 }))}
            />
          </section>

          <section className="mt-8 rounded-lg border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-[#fcfcfb] dark:bg-[#1a1a19] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#52514e] dark:text-[#c3c2b7]">Ativos</h2>
            <PortfolioTable assets={assets} onChanged={loadAssets} onAddTransaction={setTxAsset} />
          </section>
        </>
      )}

      {showAddAsset && (
        <Modal title="Novo ativo" onClose={() => setShowAddAsset(false)}>
          <AddAssetForm
            onCreated={() => {
              setShowAddAsset(false);
              loadAssets();
            }}
            onClose={() => setShowAddAsset(false)}
          />
        </Modal>
      )}

      {txAsset && (
        <Modal title="Nova transação" onClose={() => setTxAsset(null)}>
          <AddTransactionForm
            asset={txAsset}
            onCreated={() => {
              setTxAsset(null);
              loadAssets();
            }}
            onClose={() => setTxAsset(null)}
          />
        </Modal>
      )}
    </div>
  );
}

"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ASSET_TYPE_COLORS, ASSET_TYPE_LABELS, type AssetType } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useIsDark } from "@/lib/useIsDark";

type Props = {
  data: { type: AssetType; value: number }[];
};

export function CompositionChart({ data }: Props) {
  const isDark = useIsDark();
  const rows = data
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((d) => ({ ...d, label: ASSET_TYPE_LABELS[d.type] }));

  if (rows.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[#898781]">
        Sem posições para exibir ainda.
      </div>
    );
  }

  const gridColor = isDark ? "#2c2c2a" : "#e1e0d9";
  const axisColor = isDark ? "#898781" : "#898781";
  const surface = isDark ? "#1a1a19" : "#fcfcfb";
  const ink = isDark ? "#ffffff" : "#0b0b0b";

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 44)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrency(v)}
          stroke={gridColor}
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={90}
          stroke={gridColor}
          tick={{ fill: ink, fontSize: 13 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(11,11,11,0.04)" }}
          contentStyle={{
            background: surface,
            border: `1px solid ${gridColor}`,
            borderRadius: 8,
            color: ink,
            fontSize: 13,
          }}
          formatter={(value) => [formatCurrency(Number(value)), "Valor atual"]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
          {rows.map((row) => (
            <Cell key={row.type} fill={isDark ? ASSET_TYPE_COLORS[row.type].dark : ASSET_TYPE_COLORS[row.type].light} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

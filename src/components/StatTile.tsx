type Props = {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "critical";
  sub?: string;
};

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "text-[#0b0b0b] dark:text-[#ffffff]",
  good: "text-[#006300] dark:text-[#0ca30c]",
  critical: "text-[#d03b3b] dark:text-[#e66767]",
};

export function StatTile({ label, value, tone = "neutral", sub }: Props) {
  return (
    <div className="rounded-lg border border-[rgba(11,11,11,0.10)] dark:border-[rgba(255,255,255,0.10)] bg-[#fcfcfb] dark:bg-[#1a1a19] p-5">
      <div className="text-sm text-[#52514e] dark:text-[#c3c2b7]">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass[tone]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-[#898781]">{sub}</div>}
    </div>
  );
}

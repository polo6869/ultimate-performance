"use client";

interface BreakdownItem {
  label: string;
  value: string | number | null;
  unit?: string;
  highlight?: boolean;
}

interface ScoreCardProps {
  title: string;
  weight?: string;
  score: number | null;
  scoreColor?: string;
  prefix?: string;
  breakdown: BreakdownItem[];
  icon: React.ReactNode;
}

function fmt(val: string | number | null, unit?: string): string {
  if (val === null || val === undefined) return "—";
  return `${val}${unit ? unit : ""}`;
}

export default function ScoreCard({
  title,
  weight,
  score,
  scoreColor = "#2563EB",
  prefix,
  breakdown,
  icon,
}: ScoreCardProps) {
  const displayScore = score != null ? `${prefix ?? ""}${score}` : "—";

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 border border-[#1e1e1e]"
      style={{ background: "#161616" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#555555]">{icon}</span>
          <span className="text-sm font-medium text-[#f0f0f0] tracking-wide uppercase">
            {title}
          </span>
          {weight && (
            <span className="text-xs text-[#555555] ml-1">{weight}</span>
          )}
        </div>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: scoreColor }}
        >
          {displayScore}
        </span>
      </div>

      {/* Slim divider */}
      <div className="h-px bg-[#1e1e1e]" />

      {/* Breakdown */}
      <div className="flex flex-col gap-2">
        {breakdown.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-[#8a8a8a]">{item.label}</span>
            <span
              className={`text-xs tabular-nums font-medium ${
                item.highlight ? "text-[#f0f0f0]" : "text-[#8a8a8a]"
              }`}
            >
              {fmt(item.value, item.unit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

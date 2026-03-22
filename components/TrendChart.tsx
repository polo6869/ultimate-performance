"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PerformanceRow } from "@/lib/supabase";

interface TrendChartProps {
  data: PerformanceRow[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

interface TooltipPayloadItem {
  name: string;
  value: number | null;
  color: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-lg border border-[#1e1e1e] p-3 text-xs"
      style={{ background: "#111111" }}
    >
      <p className="text-[#8a8a8a] mb-2 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-[#8a8a8a]">{entry.name}:</span>
          <span className="text-[#f0f0f0] font-medium tabular-nums">
            {entry.value != null ? entry.value : "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((row) => ({
    date: formatDate(row.date),
    "Total Score": row.total_score,
    Health: row.health_score,
    Projects: row.project_score,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 8, left: -20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e1e1e"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: "#555555", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#555555", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#8a8a8a", paddingTop: 12 }}
        />
        <Line
          type="monotone"
          dataKey="Total Score"
          stroke="#2563EB"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#2563EB" }}
        />
        <Line
          type="monotone"
          dataKey="Health"
          stroke="#0EA5E9"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: "#0EA5E9" }}
          strokeDasharray="4 2"
        />
        <Line
          type="monotone"
          dataKey="Projects"
          stroke="#8B5CF6"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: "#8B5CF6" }}
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

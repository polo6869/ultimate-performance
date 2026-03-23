"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchTodayAndTrend,
  PerformanceRow,
  getBerlinDateString,
} from "@/lib/supabase";
import ScoreRing from "@/components/ScoreRing";
import ScoreCard from "@/components/ScoreCard";
import dynamic from "next/dynamic";

// Recharts uses browser APIs — load client-side only
const TrendChart = dynamic(() => import("@/components/TrendChart"), {
  ssr: false,
  loading: () => (
    <div className="skeleton h-[260px] w-full rounded-xl" />
  ),
});

// ─── Icons (inline SVG, no extra dep) ────────────────────────────────────────
const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const BodyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v8M9 10l3-3 3 3M9 20l3-5 3 5" />
  </svg>
);
const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const NutritionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(val: number | null | undefined, decimals = 0): string {
  if (val == null) return "—";
  return val.toFixed(decimals);
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Berlin",
  });
}

function fmtUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

function recoveryColor(score: number | null): string {
  if (score == null) return "#555555";
  if (score >= 70) return "#1D9E75";
  if (score >= 40) return "#EF9F27";
  return "#E24B4A";
}

function deltaSign(delta: number | null): string {
  if (delta == null) return "";
  return delta >= 0 ? "+" : "";
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonDashboard() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="skeleton h-7 w-52 rounded" />
        <div className="skeleton h-5 w-40 rounded" />
      </div>

      {/* Hero */}
      <div className="rounded-xl border border-[#1e1e1e] p-6 flex flex-col sm:flex-row gap-8 items-center" style={{ background: "#111111" }}>
        <div className="skeleton rounded-full" style={{ width: 200, height: 200 }} />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-8 w-20 rounded" />
          <div className="skeleton h-4 w-48 rounded" />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-48 rounded-xl" />
        ))}
      </div>

      {/* WHOOP row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>

      {/* Chart */}
      <div className="skeleton h-64 rounded-xl" />
    </div>
  );
}

// ─── Mini WHOOP card ─────────────────────────────────────────────────────────
function WhoopCard({
  label,
  value,
  unit,
  color,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 border border-[#1e1e1e] flex flex-col gap-1"
      style={{ background: "#161616" }}
    >
      <span className="text-[10px] uppercase tracking-widest text-[#555555] font-medium">
        {label}
      </span>
      <div className="flex items-end gap-1">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: color ?? "#f0f0f0" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs text-[#8a8a8a] mb-1">{unit}</span>
        )}
      </div>
      {sub && <span className="text-[11px] text-[#555555]">{sub}</span>}
    </div>
  );
}

// ─── Detail row ──────────────────────────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
      <span className="text-sm text-[#8a8a8a]">{label}</span>
      <span className="text-sm font-medium tabular-nums text-[#f0f0f0]">
        {value}
      </span>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<PerformanceRow | null>(null);
  const [yesterday, setYesterday] = useState<PerformanceRow | null>(null);
  const [trend, setTrend] = useState<PerformanceRow[]>([]);
  const [weekRows, setWeekRows] = useState<PerformanceRow[]>([]);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchTodayAndTrend();
      setToday(result.today);
      setYesterday(result.yesterday);
      setTrend(result.trend);
      setWeekRows(result.weekRows);
      setError(null);
      setLastFetched(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  // Computed stats
  const delta =
    today?.total_score != null && yesterday?.total_score != null
      ? today.total_score - yesterday.total_score
      : null;

  const weekScores = weekRows
    .map((r) => r.total_score)
    .filter((s): s is number => s != null);
  const weekAvg =
    weekScores.length > 0
      ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length)
      : null;
  const weekBest =
    weekScores.length > 0 ? Math.max(...weekScores) : null;

  const todayDate = getBerlinDateString();

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return <SkeletonDashboard />;

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div
          className="rounded-xl border border-[#E24B4A]/30 p-8 max-w-md w-full text-center space-y-3"
          style={{ background: "#161616" }}
        >
          <div className="text-[#E24B4A] text-4xl">⚠</div>
          <p className="text-[#f0f0f0] font-medium">Failed to load data</p>
          <p className="text-sm text-[#8a8a8a]">{error}</p>
          <button
            onClick={() => { setLoading(true); load(); }}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-[#2563EB] text-white hover:bg-[#1d4ed8] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">

      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-[#f0f0f0]">
            Ultimate Performance
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-[#2563EB] border border-[#2563EB]/30 rounded px-2 py-0.5">
            Live
          </span>
        </div>
        <div className="flex flex-col sm:items-end gap-0.5">
          <span className="text-sm text-[#8a8a8a]">
            {today?.date ? fmtDate(today.date) : fmtDate(todayDate)}
          </span>
          {lastFetched && (
            <span className="text-[11px] text-[#555555] flex items-center gap-1">
              <RefreshIcon />
              Updated{" "}
              {today?.updated_at
                ? fmtUpdatedAt(today.updated_at)
                : fmtUpdatedAt(lastFetched.toISOString())}
            </span>
          )}
        </div>
      </header>

      {/* ── Hero — Life Score ── */}
      <section
        className="rounded-xl border border-[#1e1e1e] p-6"
        style={{ background: "#111111" }}
      >
        <div className="flex flex-col sm:flex-row gap-8 items-center">
          {/* Ring */}
          <div className="relative flex-shrink-0">
            <ScoreRing
              score={today?.total_score ?? null}
              size={200}
              strokeWidth={14}
              color="#2563EB"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums text-[#f0f0f0]">
                {fmt(today?.total_score)}
              </span>
              <span className="text-xs text-[#555555] mt-1 uppercase tracking-widest">
                Life Score
              </span>
              {delta != null && (
                <span
                  className="text-sm font-medium tabular-nums mt-1"
                  style={{ color: delta >= 0 ? "#1D9E75" : "#E24B4A" }}
                >
                  {deltaSign(delta)}{delta.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Stats beside ring */}
          <div className="flex flex-col sm:flex-row flex-1 gap-6 sm:gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-[#555555]">
                vs Yesterday
              </span>
              <span
                className="text-3xl font-bold tabular-nums"
                style={{
                  color:
                    delta == null ? "#555555"
                    : delta >= 0 ? "#1D9E75"
                    : "#E24B4A",
                }}
              >
                {delta == null ? "—" : `${deltaSign(delta)}${delta.toFixed(1)}`}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-[#555555]">
                7-Day Average
              </span>
              <span className="text-3xl font-bold tabular-nums text-[#f0f0f0]">
                {weekAvg ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-[#555555]">
                Best This Week
              </span>
              <span className="text-3xl font-bold tabular-nums text-[#EF9F27]">
                {weekBest ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Score Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Health */}
        <ScoreCard
          title="Health"
          weight="35%"
          score={today?.health_score ?? null}
          scoreColor="#0EA5E9"
          icon={<HeartIcon />}
          breakdown={[
            { label: "Sleep", value: fmt(today?.sleep_score), highlight: true },
            { label: "Recovery", value: fmt(today?.recovery_score) },
            { label: "Workout", value: fmt(today?.workout_score) },
            { label: "Nutrition", value: fmt(today?.nutrition_score) },
            { label: "Cycle", value: fmt(today?.cycle_score) },
          ]}
        />

        {/* Projects */}
        <ScoreCard
          title="Projects"
          weight="40%"
          score={today?.project_score ?? null}
          scoreColor="#8B5CF6"
          icon={<BriefcaseIcon />}
          breakdown={[
            {
              label: "Daily Tasks",
              value:
                today?.daily_earned != null && today?.daily_possible != null && today.daily_possible > 0
                  ? `${Math.round(today.daily_earned / today.daily_possible * 100)}%`
                  : "—",
              highlight: true,
            },
            {
              label: "Weekly Tasks",
              value:
                today?.weekly_earned != null && today?.weekly_possible != null && today.weekly_possible > 0
                  ? `${Math.round(today.weekly_earned / today.weekly_possible * 100)}%`
                  : "—",
            },
            {
              label: "Focus Hours",
              value:
                today?.focus_hours != null
                  ? `${today.focus_hours}h`
                  : "—",
            },
          ]}
        />

        {/* Body */}
        <ScoreCard
          title="Body"
          score={today?.body_score ?? null}
          scoreColor="#1D9E75"
          icon={<BodyIcon />}
          breakdown={[
            {
              label: "Current",
              value: today?.body_weight_kg != null ? `${today.body_weight_kg} kg` : "—",
              highlight: true,
            },
            {
              label: "Target",
              value: today?.body_target_kg != null ? `${today.body_target_kg} kg` : "—",
            },
            {
              label: "Difference",
              value:
                today?.body_diff_kg != null
                  ? `${today.body_diff_kg > 0 ? "+" : ""}${today.body_diff_kg} kg`
                  : "—",
            },
          ]}
        />

        {/* Learning */}
        <ScoreCard
          title="Learning"
          score={today?.learning_bonus ?? null}
          scoreColor="#EF9F27"
          prefix="+"
          icon={<BookIcon />}
          breakdown={[
            {
              label: "Pages Read",
              value: fmt(today?.learning_pages),
              highlight: true,
            },
            {
              label: "Video Minutes",
              value: fmt(today?.learning_video_minutes),
              unit: "min",
            },
          ]}
        />

        {/* Nutrition */}
        <ScoreCard
          title="Nutrition"
          score={today?.nutrition_score ?? null}
          scoreColor="#E879A0"
          icon={<NutritionIcon />}
          breakdown={[
            {
              label: "Net Deficit",
              value:
                today?.nutrition_deficit != null
                  ? `${today.nutrition_deficit > 0 ? "+" : ""}${Math.round(today.nutrition_deficit)} kcal`
                  : "—",
              valueColor:
                today?.nutrition_deficit != null
                  ? today.nutrition_deficit > 0
                    ? "#1D9E75"
                    : "#E24B4A"
                  : undefined,
            },
            {
              label: "Burned / Eaten",
              value:
                today?.nutrition_kcal_burned != null && today?.nutrition_kcal_consumed != null
                  ? `${Math.round(today.nutrition_kcal_burned)} / ${Math.round(today.nutrition_kcal_consumed)}`
                  : "—",
              unit: today?.nutrition_kcal_burned != null ? " kcal" : undefined,
            },
            {
              label: "Protein",
              value:
                today?.nutrition_protein != null
                  ? `${Math.round(today.nutrition_protein)}g / 150g`
                  : "—",
              highlight: true,
            },
            {
              label: "Carbs",
              value: today?.nutrition_carbs != null ? `${Math.round(today.nutrition_carbs)}g` : "—",
            },
            {
              label: "Fat",
              value: today?.nutrition_fat != null ? `${Math.round(today.nutrition_fat)}g` : "—",
            },
          ]}
        />
      </div>

      {/* ── WHOOP Details Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <WhoopCard
          label="Recovery Score"
          value={fmt(today?.recovery_whoop_score)}
          unit="%"
          color={recoveryColor(today?.recovery_whoop_score ?? null)}
          sub={
            today?.recovery_whoop_score != null
              ? today.recovery_whoop_score >= 70
                ? "Green — Optimal"
                : today.recovery_whoop_score >= 40
                ? "Yellow — Moderate"
                : "Red — Strain"
              : undefined
          }
        />
        <WhoopCard
          label="HRV"
          value={fmt(today?.recovery_hrv)}
          unit="ms"
          color="#0EA5E9"
        />
        <WhoopCard
          label="Day Strain"
          value={fmt(today?.cycle_strain, 1)}
          color="#8B5CF6"
          sub="Whoop Strain Score"
        />
        <WhoopCard
          label="Sleep Performance"
          value={fmt(today?.sleep_performance_pct)}
          unit="%"
          color="#1D9E75"
        />
      </div>

      {/* ── 30-Day Trend Chart ── */}
      <section
        className="rounded-xl border border-[#1e1e1e] p-5"
        style={{ background: "#111111" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#8a8a8a]">
            30-Day Trend
          </h2>
          <span className="text-xs text-[#555555]">Last {trend.length} days</span>
        </div>
        <TrendChart data={trend} />
      </section>

      {/* ── Daily Breakdown ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sleep */}
        <div
          className="rounded-xl border border-[#1e1e1e] p-5"
          style={{ background: "#111111" }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#8a8a8a] mb-4">
            Sleep Details
          </h2>
          <DetailRow label="Sleep Score" value={fmt(today?.sleep_score)} />
          <DetailRow
            label="Sleep Performance"
            value={
              today?.sleep_performance_pct != null
                ? `${today.sleep_performance_pct}%`
                : "—"
            }
          />
          <DetailRow
            label="Consistency"
            value={
              today?.sleep_consistency_pct != null
                ? `${today.sleep_consistency_pct}%`
                : "—"
            }
          />
          <DetailRow
            label="Disturbances"
            value={fmt(today?.sleep_disturbance_count)}
          />
        </div>

        {/* Workout */}
        <div
          className="rounded-xl border border-[#1e1e1e] p-5"
          style={{ background: "#111111" }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#8a8a8a] mb-4">
            Workout Details
          </h2>
          <DetailRow label="Workout Score" value={fmt(today?.workout_score)} />
          <DetailRow
            label="Zone 2/3 Minutes"
            value={
              today?.workout_zone23_minutes != null
                ? `${today.workout_zone23_minutes} min`
                : "—"
            }
          />
          <DetailRow
            label="Strength Minutes"
            value={
              today?.workout_strength_minutes != null
                ? `${today.workout_strength_minutes} min`
                : "—"
            }
          />
          <DetailRow label="Workouts Today" value={fmt(today?.workout_count)} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 text-center text-[10px] text-[#333333] uppercase tracking-widest">
        Ultimate Performance · Auto-refreshes every 5 minutes
      </footer>
    </main>
  );
}

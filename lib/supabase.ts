import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eqktiqubjzxxknfpcdya.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxa3RpcXVianp4eGtuZnBjZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODM3MzAsImV4cCI6MjA4OTY1OTczMH0.m2M0k3rg0WFiE_Dw_5FklLI7D-ID69BDxxgcXLfolYs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface PerformanceRow {
  id: number;
  date: string;
  updated_at: string;

  // Scores
  total_score: number | null;
  health_score: number | null;
  project_score: number | null;
  body_score: number | null;
  learning_bonus: number | null;

  // Health breakdown
  sleep_score: number | null;
  recovery_score: number | null;
  workout_score: number | null;
  cycle_score: number | null;

  // WHOOP
  recovery_whoop_score: number | null;
  recovery_hrv: number | null;
  cycle_strain: number | null;
  sleep_performance_pct: number | null;

  // Sleep details
  sleep_consistency_pct: number | null;
  disturbances: number | null;

  // Workout details
  workout_zone23_minutes: number | null;
  workout_strength_minutes: number | null;
  workout_count: number | null;

  // Body
  body_weight_kg: number | null;
  body_target_kg: number | null;
  body_diff_kg: number | null;

  // Learning
  pages: number | null;
  video_minutes: number | null;

  // Projects
  projectDailyWeeklyScore?: number | null;
  focusScore?: number | null;
  focus_hours?: number | null;
  daily_tasks_pct?: number | null;
  weekly_tasks_pct?: number | null;
}

/** Get Berlin-timezone date string (YYYY-MM-DD) for "today" */
export function getBerlinDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function fetchTodayAndTrend(): Promise<{
  today: PerformanceRow | null;
  yesterday: PerformanceRow | null;
  trend: PerformanceRow[];
  weekRows: PerformanceRow[];
}> {
  const todayStr = getBerlinDateString();

  // Fetch last 31 rows (today + 30 for trend)
  const { data, error } = await supabase
    .from("performance_score")
    .select("*")
    .order("date", { ascending: false })
    .limit(31);

  if (error) throw new Error(error.message);

  const rows: PerformanceRow[] = data ?? [];
  const today = rows.find((r) => r.date === todayStr) ?? rows[0] ?? null;
  const yesterday = rows.find((r) => r.date !== today?.date) ?? null;

  // Last 7 calendar days for weekly stats
  const weekRows = rows.slice(0, 7);

  // Trend: last 30 rows reversed for chronological chart
  const trend = [...rows].reverse();

  return { today, yesterday, trend, weekRows };
}

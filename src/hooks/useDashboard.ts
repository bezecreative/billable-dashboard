import { useState, useEffect, useCallback, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/data";
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export type RangePreset = "this_week" | "last_week" | "this_month" | "last_month" | "custom";

export interface Filters {
  range: RangePreset;
  customStart?: string;
  customEnd?: string;
  client?: string;
  employee?: string;
  includeHistory?: boolean;
}

export interface EmployeeRing {
  id: string;
  name: string;
  hours: number;
  utilization: number;
  baseline: number;
  breakdown: Record<string, number>;
}

export interface PacingData {
  expected: number;
  actual: number;
  delta: number;
  status: "ahead" | "behind";
  day_fraction: number;
  goal: number;
}

export interface ClientBar {
  client: string;
  hours: number;
}

export interface DailyHeatmapRow {
  date: string;
  employees: Record<string, number>;
  total: number;
}

export interface WeeklyHistoryEntry {
  week: string;
  hours: number;
  goal_met: boolean;
}

export interface DashboardData {
  total_hours: number;
  pacing: PacingData;
  employee_rings: EmployeeRing[];
  client_chart: ClientBar[];
  daily_heatmap: DailyHeatmapRow[];
  weekly_history?: WeeklyHistoryEntry[];
  filters: {
    clients: string[];
    employees: { id: string; name: string }[];
  };
  range: { start: string; end: string; preset: string };
  last_updated: string;
}

function buildUrl(filters: Filters): string {
  const params = new URLSearchParams({ range: filters.range });
  if (filters.range === "custom" && filters.customStart && filters.customEnd) {
    params.set("start", filters.customStart);
    params.set("end", filters.customEnd);
  }
  if (filters.client) params.set("client", filters.client);
  if (filters.employee) params.set("employee", filters.employee);
  if (filters.includeHistory) params.set("history", "true");
  return `${API_URL}?${params.toString()}`;
}

export function useDashboard(filters: Filters) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch_ = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl(filters));
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json: DashboardData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters.range, filters.customStart, filters.customEnd, filters.client, filters.employee, filters.includeHistory]); // eslint-disable-line

  useEffect(() => {
    fetch_();
    timerRef.current = setInterval(() => fetch_(true), REFRESH_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetch_]);

  const refresh = () => fetch_();

  return { data, loading, error, lastUpdated, refresh };
}

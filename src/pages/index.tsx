import { useState, useCallback } from "react";
import Head from "next/head";
import { useDashboard, Filters } from "@/hooks/useDashboard";
import { TopBar } from "@/components/TopBar";
import { StatCards } from "@/components/StatCards";
import { GoalTracker } from "@/components/GoalTracker";
import { EmployeeRings } from "@/components/EmployeeRings";
import { ClientChart } from "@/components/ClientChart";
import { DailyHeatmap } from "@/components/DailyHeatmap";
import { SummaryTable } from "@/components/SummaryTable";
import { DashboardSkeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";

const DEFAULT_FILTERS: Filters = {
  range: "this_week",
  includeHistory: true,
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const handleFiltersChange = useCallback((partial: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const { data, loading, error, lastUpdated, refresh } = useDashboard(filters);

  return (
    <>
      <Head>
        <title>BillTrack — Billable Hours Dashboard</title>
      </Head>

      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />

      <div className="relative min-h-screen">
        <TopBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          clients={data?.filters.clients || []}
          employees={data?.filters.employees || []}
          lastUpdated={lastUpdated}
          loading={loading}
          onRefresh={refresh}
        />

        <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">
          {/* Page header */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-3xl text-white">
                Billable Hours
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {data?.range
                  ? `${new Date(data.range.start).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })} – ${new Date(data.range.end).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`
                  : "Loading range…"}
              </p>
            </div>
            {data && (
              <div className="text-xs text-slate-500 font-mono hidden sm:block">
                {data.employee_rings.length} employees · {data.client_chart.length} clients
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && !data && <DashboardSkeleton />}

          {/* Error */}
          {error && !loading && <ErrorState message={error} onRetry={refresh} />}

          {/* Dashboard content */}
          {data && (
            <div className="space-y-6 animate-fade-up">
              {/* Stat cards */}
              <StatCards data={data} />

              {/* Goal tracker + employee rings */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-2">
                  <GoalTracker pacing={data.pacing} history={data.weekly_history} />
                </div>
                <div className="xl:col-span-3">
                  <EmployeeRings employees={data.employee_rings} />
                </div>
              </div>

              {/* Client chart */}
              <ClientChart data={data.client_chart} />

              {/* Daily heatmap */}
              <DailyHeatmap
                data={data.daily_heatmap}
                employees={data.employee_rings}
              />

              {/* Summary table */}
              <SummaryTable
                employees={data.employee_rings}
                clients={data.client_chart}
              />
            </div>
          )}

          {/* Stale data overlay hint */}
          {data && loading && (
            <div className="fixed bottom-4 right-4 glass rounded-xl px-4 py-2 border border-white/10 text-xs text-slate-400 flex items-center gap-2 z-50">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Refreshing…
            </div>
          )}
        </main>
      </div>
    </>
  );
}

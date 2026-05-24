import { RefreshCw, Clock, ChevronDown } from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";
import { Filters, RangePreset } from "@/hooks/useDashboard";

const PRESETS: { label: string; value: RangePreset }[] = [
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "Custom", value: "custom" },
];

interface TopBarProps {
  filters: Filters;
  onFiltersChange: (f: Partial<Filters>) => void;
  clients: string[];
  employees: { id: string; name: string }[];
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

export function TopBar({
  filters,
  onFiltersChange,
  clients,
  employees,
  lastUpdated,
  loading,
  onRefresh,
}: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-mono font-bold">B</span>
          </div>
          <span className="font-display text-white text-sm hidden sm:block">BillTrack</span>
        </div>

        {/* Range presets */}
        <div className="flex items-center gap-1 bg-ink-800 rounded-lg p-1 border border-white/5">
          {PRESETS.filter((p) => p.value !== "custom").map((p) => (
            <button
              key={p.value}
              onClick={() => onFiltersChange({ range: p.value })}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                filters.range === p.value
                  ? "bg-amber-400 text-ink-950 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => onFiltersChange({ range: "custom" })}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              filters.range === "custom"
                ? "bg-amber-400 text-ink-950 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            Custom
          </button>
        </div>

        {/* Custom date range */}
        {filters.range === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.customStart || ""}
              onChange={(e) => onFiltersChange({ customStart: e.target.value })}
              className="bg-ink-800 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400/50"
            />
            <span className="text-slate-500 text-xs">→</span>
            <input
              type="date"
              value={filters.customEnd || ""}
              onChange={(e) => onFiltersChange({ customEnd: e.target.value })}
              className="bg-ink-800 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400/50"
            />
          </div>
        )}

        {/* Client filter */}
        <div className="relative">
          <select
            value={filters.client || ""}
            onChange={(e) => onFiltersChange({ client: e.target.value || undefined })}
            className="appearance-none bg-ink-800 border border-white/10 text-slate-300 text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-amber-400/50 cursor-pointer"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Employee filter */}
        <div className="relative">
          <select
            value={filters.employee || ""}
            onChange={(e) => onFiltersChange({ employee: e.target.value || undefined })}
            className="appearance-none bg-ink-800 border border-white/10 text-slate-300 text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-amber-400/50 cursor-pointer"
          >
            <option value="">All Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Last updated */}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>{formatRelative(lastUpdated)}</span>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-800 border border-white/10 text-slate-300 text-xs font-medium transition-all hover:border-amber-400/40 hover:text-amber-400",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { PacingData, WeeklyHistoryEntry } from "@/hooks/useDashboard";
import { formatHours } from "@/lib/utils";

interface GoalTrackerProps {
  pacing: PacingData;
  history?: WeeklyHistoryEntry[];
}

export function GoalTracker({ pacing, history }: GoalTrackerProps) {
  const progressPct = Math.min(100, (pacing.actual / pacing.goal) * 100);
  const isAhead = pacing.status === "ahead";

  // SVG arc progress
  const R = 56;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - progressPct / 100);

  return (
    <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-slate-300">Weekly Goal Tracker</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {Math.round(progressPct)}% complete
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Arc */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            {/* Track */}
            <circle
              cx="70" cy="70" r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Expected pace marker */}
            <circle
              cx="70" cy="70" r={R}
              fill="none"
              stroke="rgba(251,191,36,0.2)"
              strokeWidth="10"
              strokeDasharray={`${CIRC * pacing.day_fraction} ${CIRC}`}
              strokeLinecap="round"
            />
            {/* Actual progress */}
            <circle
              cx="70" cy="70" r={R}
              fill="none"
              stroke={isAhead ? "#34D399" : "#FBBF24"}
              strokeWidth="10"
              strokeDasharray={`${CIRC * (progressPct / 100)} ${CIRC}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl text-white leading-none">
              {formatHours(pacing.actual)}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">of {pacing.goal}h</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Pacing badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold w-fit ${
              isAhead
                ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                : "bg-amber-400/15 border border-amber-400/25 text-amber-400 badge-pulse"
            }`}
          >
            {isAhead ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {isAhead
              ? `Ahead of Pace by ${formatHours(pacing.delta)}`
              : `⚠️ Behind Pace by ${formatHours(pacing.delta)}`}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-ink-800 rounded-xl p-3 border border-white/5">
              <div className="text-xs text-slate-500 mb-1">Expected Now</div>
              <div className="font-mono text-sm text-white font-medium">
                {formatHours(pacing.expected)}
              </div>
            </div>
            <div className="bg-ink-800 rounded-xl p-3 border border-white/5">
              <div className="text-xs text-slate-500 mb-1">Remaining</div>
              <div className="font-mono text-sm text-white font-medium">
                {formatHours(Math.max(0, pacing.goal - pacing.actual))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Progress</span>
              <span className="font-mono">{Math.round(progressPct)}%</span>
            </div>
            <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isAhead
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : "bg-gradient-to-r from-amber-600 to-amber-400"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {/* Pace marker */}
            <div
              className="relative h-0"
              style={{ marginTop: "-12px" }}
            >
              <div
                className="absolute w-0.5 h-3 bg-amber-400/60 rounded-full"
                style={{ left: `${pacing.day_fraction * 100}%`, top: "-10px" }}
                title={`Expected pace: ${formatHours(pacing.expected)}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly history log */}
      {history && history.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 mb-2 font-medium">Historical Goal Log</div>
          <div className="flex gap-2 flex-wrap">
            {history.map((w) => (
              <div
                key={w.week}
                title={`${w.week}: ${w.hours}h — ${w.goal_met ? "Goal Met ✓" : "Goal Missed"}`}
                className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl text-xs border transition-all cursor-default ${
                  w.goal_met
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-rose-400"
                }`}
              >
                <span className="font-mono font-medium">{w.goal_met ? "✓" : "✗"}</span>
                <span className="text-slate-400" style={{ fontSize: "10px" }}>{w.week}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { DailyHeatmapRow, EmployeeRing } from "@/hooks/useDashboard";
import { heatColor, dayLabel, formatHours, empColor } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

interface HeatmapProps {
  data: DailyHeatmapRow[];
  employees: EmployeeRing[];
}

export function DailyHeatmap({ data, employees }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  if (!data.length) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/5 text-center text-slate-500 text-sm">
        No daily data available.
      </div>
    );
  }

  // Collect all employee names present in data
  const empNames = Array.from(
    new Set(data.flatMap((row) => Object.keys(row.employees)))
  );

  const allValues = data.flatMap((row) =>
    Object.values(row.employees).map(Number)
  );
  const maxVal = Math.max(...allValues, 1);

  return (
    <div className="glass rounded-2xl p-6 border border-white/5 overflow-x-auto">
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-slate-300">Daily Heatmap</span>
        <span className="ml-auto text-xs text-slate-500 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: heatColor(0, 1) }} />
            <span>0h</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: heatColor(maxVal * 0.5, maxVal) }} />
            <span>{formatHours(maxVal * 0.5)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: heatColor(maxVal, maxVal) }} />
            <span>{formatHours(maxVal)}</span>
          </span>
        </span>
      </div>

      <div className="min-w-max">
        {/* Header row: dates */}
        <div className="flex items-center gap-1 mb-2">
          <div className="w-24 flex-shrink-0" />
          {data.map((row) => (
            <div
              key={row.date}
              className="w-14 text-center text-xs text-slate-500 leading-tight"
              style={{ fontSize: 10 }}
            >
              {dayLabel(row.date).split(",")[0]}
              <br />
              <span className="text-slate-600">{row.date.slice(5)}</span>
            </div>
          ))}
        </div>

        {/* Employee rows */}
        {empNames.map((name, ei) => (
          <div key={name} className="flex items-center gap-1 mb-1.5">
            {/* Employee label */}
            <div className="w-24 flex-shrink-0 flex items-center gap-2 pr-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: empColor(ei) }}
              />
              <span className="text-xs text-slate-400 truncate">{name.split(" ")[0]}</span>
            </div>
            {/* Cells */}
            {data.map((row) => {
              const h = row.employees[name] || 0;
              return (
                <div
                  key={row.date}
                  className="w-14 h-10 rounded-lg heat-cell flex items-center justify-center relative"
                  style={{ background: heatColor(h, maxVal) }}
                  onMouseEnter={(e) =>
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      content: `${name}\n${dayLabel(row.date)}\n${formatHours(h)}`,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  {h > 0 && (
                    <span className="text-white text-xs font-mono font-medium">
                      {h.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })}
            {/* Row total */}
            <div className="w-14 h-10 flex items-center justify-center ml-1">
              <span className="text-xs font-mono text-slate-500">
                {formatHours(
                  data.reduce((s, row) => s + (row.employees[name] || 0), 0)
                )}
              </span>
            </div>
          </div>
        ))}

        {/* Total row */}
        <div className="flex items-center gap-1 mt-2 border-t border-white/5 pt-2">
          <div className="w-24 flex-shrink-0 text-xs text-slate-500 font-medium pr-2">Total</div>
          {data.map((row) => (
            <div
              key={row.date}
              className="w-14 h-8 flex items-center justify-center"
            >
              <span className="text-xs font-mono text-slate-400">
                {formatHours(row.total)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 glass rounded-xl px-3 py-2 text-xs text-white border border-white/10 pointer-events-none whitespace-pre"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

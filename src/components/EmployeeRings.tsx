import { useState } from "react";
import { EmployeeRing } from "@/hooks/useDashboard";
import { formatHours, empColor, clientColor } from "@/lib/utils";

interface EmployeeRingsProps {
  employees: EmployeeRing[];
}

function Ring({ emp, index }: { emp: EmployeeRing; index: number }) {
  const [hovered, setHovered] = useState(false);
  const R = 44;
  const CIRC = 2 * Math.PI * R;
  const fill = (emp.utilization / 100) * CIRC;
  const color = empColor(index);
  const initials = emp.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const clientEntries = Object.entries(emp.breakdown).sort((a, b) => b[1] - a[1]);
  const maxClient = clientEntries[0]?.[1] || 0;

  return (
    <div
      className="glass rounded-2xl p-5 border border-white/5 flex flex-col gap-4 transition-all duration-200 hover:border-white/10 cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ring + name */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={R}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${fill} ${CIRC}`}
              style={{
                transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)",
                filter: `drop-shadow(0 0 6px ${color}60)`,
              }}
            />
          </svg>
          {/* Avatar */}
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
            >
              {initials}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate">{emp.name}</div>
          <div className="font-display text-2xl text-white mt-0.5 leading-none">
            {formatHours(emp.hours)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            of {formatHours(emp.baseline)} baseline
          </div>
          <div
            className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: `${color}20`, color }}
          >
            {emp.utilization}% utilized
          </div>
        </div>
      </div>

      {/* Client breakdown mini bars */}
      <div className="space-y-2">
        <div className="text-xs text-slate-500 font-medium">By Client</div>
        {clientEntries.slice(0, 5).map(([client, hours], i) => (
          <div key={client} className="flex items-center gap-2">
            <div className="text-xs text-slate-400 truncate w-24 flex-shrink-0" title={client}>
              {client}
            </div>
            <div className="flex-1 h-1.5 bg-ink-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(hours / maxClient) * 100}%`,
                  background: clientColor(i),
                }}
              />
            </div>
            <div className="text-xs font-mono text-slate-400 w-12 text-right flex-shrink-0">
              {formatHours(hours)}
            </div>
          </div>
        ))}
        {clientEntries.length === 0 && (
          <div className="text-xs text-slate-600 italic">No entries</div>
        )}
      </div>
    </div>
  );
}

export function EmployeeRings({ employees }: EmployeeRingsProps) {
  if (!employees.length) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/5 text-center text-slate-500 text-sm">
        No employee data for selected range.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {employees.map((emp, i) => (
        <Ring key={emp.id} emp={emp} index={i} />
      ))}
    </div>
  );
}

import { useState } from "react";
import { EmployeeRing, ClientBar } from "@/hooks/useDashboard";
import { formatHours, empColor, clientColor } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, Table2 } from "lucide-react";

interface SummaryTableProps {
  employees: EmployeeRing[];
  clients: ClientBar[];
}

type SortKey = "name" | "hours" | "utilization";
type SortDir = "asc" | "desc";

function SortIcon({ field, sort }: { field: SortKey; sort: { key: SortKey; dir: SortDir } }) {
  if (sort.key !== field) return <ArrowUpDown className="w-3 h-3 text-slate-600" />;
  return sort.dir === "asc"
    ? <ArrowUp className="w-3 h-3 text-amber-400" />
    : <ArrowDown className="w-3 h-3 text-amber-400" />;
}

export function SummaryTable({ employees, clients }: SummaryTableProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "hours",
    dir: "desc",
  });
  const [tab, setTab] = useState<"employees" | "clients">("employees");

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  };

  const sorted = [...employees].sort((a, b) => {
    const mult = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "name") return mult * a.name.localeCompare(b.name);
    if (sort.key === "hours") return mult * (a.hours - b.hours);
    return mult * (a.utilization - b.utilization);
  });

  const sortedClients = [...clients].sort((a, b) => b.hours - a.hours);

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-slate-300">Summary Breakdown</span>
        </div>
        <div className="flex bg-ink-800 rounded-lg p-1 border border-white/5">
          {(["employees", "clients"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                tab === t
                  ? "bg-amber-400 text-ink-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "employees" ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {[
                { key: "name" as SortKey, label: "Employee" },
                { key: "hours" as SortKey, label: "Billable Hours" },
                { key: "utilization" as SortKey, label: "Utilization" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="px-6 py-3 text-left text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    <SortIcon field={col.key} sort={sort} />
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs text-slate-500 font-medium">Top Clients</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((emp, i) => (
              <tr key={emp.id} className="table-row-hover border-b border-white/5 last:border-0">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: empColor(employees.indexOf(emp)) }}
                    />
                    <span className="text-sm text-white font-medium">{emp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="font-mono text-sm text-slate-200">{formatHours(emp.hours)}</span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-ink-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${emp.utilization}%`,
                          background: empColor(employees.indexOf(emp)),
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs text-slate-400">{emp.utilization}%</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(emp.breakdown)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([client, h]) => (
                        <span
                          key={client}
                          className="text-xs px-2 py-0.5 rounded-full bg-ink-700 text-slate-400 border border-white/5"
                        >
                          {client} · {formatHours(h)}
                        </span>
                      ))}
                  </div>
                </td>
              </tr>
            ))}
            {!sorted.length && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No data for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-xs text-slate-500 font-medium">Client</th>
              <th className="px-6 py-3 text-left text-xs text-slate-500 font-medium">Billable Hours</th>
              <th className="px-6 py-3 text-left text-xs text-slate-500 font-medium">Share</th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.map((c, i) => {
              const total = sortedClients.reduce((s, x) => s + x.hours, 0);
              const share = total > 0 ? (c.hours / total) * 100 : 0;
              return (
                <tr key={c.client} className="table-row-hover border-b border-white/5 last:border-0">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: clientColor(i) }}
                      />
                      <span className="text-sm text-white">{c.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-mono text-sm text-slate-200">{formatHours(c.hours)}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-ink-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${share}%`,
                            background: clientColor(i),
                          }}
                        />
                      </div>
                      <span className="font-mono text-xs text-slate-400">{share.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!sortedClients.length && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No client data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

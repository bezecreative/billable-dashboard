"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ClientBar } from "@/hooks/useDashboard";
import { formatHours, clientColor } from "@/lib/utils";
import { BarChart2 } from "lucide-react";

interface ClientChartProps {
  data: ClientBar[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 border border-white/10 text-sm">
        <div className="font-medium text-white mb-1">{label}</div>
        <div className="text-amber-400 font-mono">{formatHours(payload[0].value)}</div>
      </div>
    );
  }
  return null;
};

export function ClientChart({ data }: ClientChartProps) {
  if (!data.length) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/5 text-center text-slate-500 text-sm">
        No client data for selected range.
      </div>
    );
  }

  const maxH = Math.max(...data.map((d) => d.hours));

  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-slate-300">Billable Hours by Client</span>
        <span className="ml-auto text-xs text-slate-500">{data.length} clients</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 0, right: 4, left: 0, bottom: 0 }} barSize={28}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="client"
            tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "DM Sans" }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.client} fill={clientColor(index)} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
        {data.map((item, i) => (
          <div key={item.client} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: clientColor(i) }}
            />
            <span className="text-xs text-slate-400">{item.client}</span>
            <span className="text-xs font-mono text-slate-500">{formatHours(item.hours)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

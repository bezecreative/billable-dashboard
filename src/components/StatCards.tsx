import { Clock, Users, TrendingUp, DollarSign } from "lucide-react";
import { DashboardData } from "@/hooks/useDashboard";
import { formatHours } from "@/lib/utils";

interface StatCardsProps {
  data: DashboardData;
}

export function StatCards({ data }: StatCardsProps) {
  const totalEmployees = data.employee_rings.length;
  const avgHours = totalEmployees > 0 ? data.total_hours / totalEmployees : 0;
  const avgUtil =
    totalEmployees > 0
      ? data.employee_rings.reduce((s, e) => s + e.utilization, 0) / totalEmployees
      : 0;

  const cards = [
    {
      label: "Total Billable Hours",
      value: formatHours(data.total_hours),
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      label: "Active Employees",
      value: String(totalEmployees),
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "border-sky-400/20",
    },
    {
      label: "Avg Hours / Person",
      value: formatHours(avgHours),
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      border: "border-violet-400/20",
    },
    {
      label: "Avg Utilization",
      value: `${avgUtil.toFixed(1)}%`,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`glass rounded-2xl p-5 border ${card.border} flex flex-col gap-3`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{card.label}</span>
              <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.border} border flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className={`font-display text-3xl ${card.color} leading-none`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatHours(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

export function formatRelative(date: Date | null): string {
  if (!date) return "Never";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function heatColor(hours: number, max: number): string {
  if (hours === 0) return "rgba(255,255,255,0.04)";
  const ratio = Math.min(1, hours / max);
  if (ratio < 0.25) return "rgba(59,130,246,0.25)";
  if (ratio < 0.5) return "rgba(99,102,241,0.4)";
  if (ratio < 0.75) return "rgba(139,92,246,0.55)";
  if (ratio < 0.9) return "rgba(245,158,11,0.65)";
  return "rgba(251,191,36,0.85)";
}

// Assign consistent colors to employees
const EMP_COLORS = ["#FBBF24", "#34D399", "#38BDF8", "#A78BFA", "#FB7185", "#6EE7B7"];
export function empColor(index: number): string {
  return EMP_COLORS[index % EMP_COLORS.length];
}

// Assign consistent colors to clients
const CLIENT_COLORS = ["#38BDF8", "#A78BFA", "#34D399", "#FB7185", "#FBBF24", "#818CF8", "#F9A8D4"];
export function clientColor(index: number): string {
  return CLIENT_COLORS[index % CLIENT_COLORS.length];
}

export function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
}

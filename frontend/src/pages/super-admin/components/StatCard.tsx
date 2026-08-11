import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number | undefined;
  icon: ReactNode;
  trend?: { value: number; label: string };
  color?: "primary" | "secondary" | "success" | "warning" | "info";
};

const colorMap = {
  primary: {
    bg: "bg-maroon-50",
    iconBg: "bg-[#800000]",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-rose-600",
    border: "border-[#800000]/10",
  },
  secondary: {
    bg: "bg-blue-50",
    iconBg: "bg-[#002147]",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-rose-600",
    border: "border-[#002147]/10",
  },
  success: {
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-600",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-rose-600",
    border: "border-emerald-100",
  },
  warning: {
    bg: "bg-amber-50",
    iconBg: "bg-amber-500",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-rose-600",
    border: "border-amber-100",
  },
  info: {
    bg: "bg-sky-50",
    iconBg: "bg-sky-600",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-rose-600",
    border: "border-sky-100",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = "primary",
}: StatCardProps) {
  const c = colorMap[color];
  const displayValue = value !== undefined && value !== null ? value : "—";

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border bg-white p-6
        shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08)] transition-all duration-200
        hover:shadow-[0px_8px_16px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-0.5
        ${c.border}
      `}
    >
      {/* Subtle accent line at top */}
      <div className={`absolute inset-x-0 top-0 h-0.5 ${c.iconBg} opacity-80`} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-slate-500 truncate">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {displayValue}
          </p>
          {trend && (
            <p
              className={`mt-1.5 text-xs font-medium ${
                trend.value >= 0 ? c.trendUp : c.trendDown
              }`}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              <span className="text-slate-400 font-normal">{trend.label}</span>
            </p>
          )}
        </div>

        <div
          className={`
            flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl
            ${c.iconBg} ${c.iconText} text-xl
            shadow-sm transition-transform duration-200 group-hover:scale-110
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

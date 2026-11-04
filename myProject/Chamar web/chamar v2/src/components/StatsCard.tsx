import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  variant?: 'blue' | 'navy' | 'emerald' | 'amber' | 'slate';
  badge?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'blue',
  badge,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-white',
      border: 'border-blue-100',
      iconBg: 'bg-blue-50 text-blue-600',
      valColor: 'text-blue-900',
    },
    navy: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-900',
      valColor: 'text-slate-900',
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50 text-emerald-600',
      valColor: 'text-emerald-950',
    },
    amber: {
      bg: 'bg-white',
      border: 'border-amber-100',
      iconBg: 'bg-amber-50 text-amber-600',
      valColor: 'text-amber-950',
    },
    slate: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      valColor: 'text-slate-900',
    },
  };

  const c = colorMap[variant] || colorMap.blue;

  return (
    <div
      className={`${c.bg} ${c.border} rounded-2xl p-5 md:p-6 border shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
            {badge && (
              <span className="inline-block mt-0.5 px-2 py-0.5 text-[11px] font-medium rounded-md bg-blue-50 text-blue-700">
                {badge}
              </span>
            )}
          </div>
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
            {trend}
          </span>
        )}
      </div>

      <div>
        <div className={`text-2xl md:text-3xl font-bold tracking-tight ${c.valColor}`}>{value}</div>
        {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
      </div>
    </div>
  );
};

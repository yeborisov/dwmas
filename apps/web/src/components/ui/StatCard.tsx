import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

const toneClassMap = {
  default: 'border-[hsl(var(--border))]',
  success: 'border-emerald-500/40',
  danger: 'border-rose-500/40',
  warning: 'border-amber-500/40',
  info: 'border-sky-500/40'
} as const;

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <article className={`surface p-4 ${toneClassMap[tone]}`}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value mt-2">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">{hint}</p> : null}
    </article>
  );
}

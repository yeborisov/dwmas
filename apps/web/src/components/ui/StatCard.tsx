import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

const toneStyles = {
  default: { border: 'border-[hsl(var(--border))]', accent: 'bg-[hsl(var(--text-muted))]' },
  success: { border: 'border-emerald-500/40', accent: 'bg-emerald-500' },
  danger: { border: 'border-rose-500/40', accent: 'bg-rose-500' },
  warning: { border: 'border-amber-500/40', accent: 'bg-amber-500' },
  info: { border: 'border-sky-500/40', accent: 'bg-sky-500' }
} as const;

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  const { border, accent } = toneStyles[tone];

  return (
    <article className={`surface relative overflow-hidden p-4 ${border}`}>
      {/* Accent stripe at top */}
      <div className={`absolute left-0 right-0 top-0 h-0.5 ${accent} opacity-60`} />
      <p className="kpi-label">{label}</p>
      <p className="kpi-value mt-1.5">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">{hint}</p> : null}
    </article>
  );
}
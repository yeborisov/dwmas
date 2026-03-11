import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="state-box">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border-strong))] bg-[hsl(var(--bg-elevated))] text-sm text-[hsl(var(--text-secondary))]">
        {icon ?? '∅'}
      </div>
      <div>
        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{title}</p>
        <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">{description}</p>
      </div>
      {action}
    </div>
  );
}

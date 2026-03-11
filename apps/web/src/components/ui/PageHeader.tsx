import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, tabs, breadcrumbs, className }: PageHeaderProps) {
  return (
    <header className={cn('space-y-4 border-b border-[hsl(var(--border))] pb-4', className)}>
      {breadcrumbs ? <div className="text-xs text-[hsl(var(--text-muted))]">{breadcrumbs}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
          {description ? <p className="max-w-3xl text-sm text-[hsl(var(--text-secondary))]">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {tabs ? <div className="surface-elevated inline-flex items-center gap-1 rounded-lg p-1">{tabs}</div> : null}
    </header>
  );
}

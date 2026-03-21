import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
}

export function PageHeader({ title, description, actions, tabs }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--text-primary))] md:text-2xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {tabs ? <div className="border-b border-[hsl(var(--border))]">{tabs}</div> : null}
    </header>
  );
}
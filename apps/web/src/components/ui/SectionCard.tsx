import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, description, actions, children, className }: SectionCardProps) {
  return (
    <section className={cn('surface p-4 md:p-5', className)}>
      {title || description || actions ? (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[hsl(var(--border))] pb-3">
          <div>
            {title ? <h2 className="text-base font-semibold md:text-lg">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

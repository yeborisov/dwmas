import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, hint, error, className, children }: FormFieldProps) {
  return (
    <label className={cn('flex min-w-[160px] flex-1 flex-col gap-1.5 text-sm', className)}>
      <span className="font-medium text-[hsl(var(--text-primary))]">{label}</span>
      {children}
      {error ? <span className="text-xs text-[hsl(var(--error))]">{error}</span> : hint ? <span className="text-xs text-[hsl(var(--text-muted))]">{hint}</span> : null}
    </label>
  );
}

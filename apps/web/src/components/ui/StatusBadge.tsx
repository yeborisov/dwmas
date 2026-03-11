import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { toStatusClass, toStatusLabel } from '../../lib/status';

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
  children?: ReactNode;
}

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium capitalize tracking-wide',
        toStatusClass(status),
        className
      )}
    >
      {children ?? toStatusLabel(status)}
    </span>
  );
}

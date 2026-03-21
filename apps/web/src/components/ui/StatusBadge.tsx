import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { toStatusClass, toStatusLabel } from '../../lib/status';

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
  children?: ReactNode;
  showDot?: boolean;
}

export function StatusBadge({ status, className, children, showDot = true }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize tracking-wide',
        toStatusClass(status),
        className
      )}
    >
      {showDot && <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children ?? toStatusLabel(status)}
    </span>
  );
}
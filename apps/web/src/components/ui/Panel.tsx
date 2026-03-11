import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('surface p-4 md:p-5', className)}>{children}</div>;
}

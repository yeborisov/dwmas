import type { ReactNode } from 'react';

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="surface-elevated flex flex-wrap items-end gap-2.5 rounded-xl p-3">{children}</div>;
}

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface DataTableProps {
  columns: Array<string>;
  children: ReactNode;
  className?: string;
  caption?: string;
}

export function DataTable({ columns, children, className, caption }: DataTableProps) {
  return (
    <div className={cn('surface overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {caption && (
            <caption className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] px-4 py-2 text-left text-xs text-[hsl(var(--text-muted))]">
              {caption}
            </caption>
          )}
          <thead className="bg-[hsl(var(--bg-elevated))]">
            <tr className="border-b border-[hsl(var(--border))] text-left text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--text-muted))]">
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-2.5 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function DataTableRow({ children, className, highlight }: { children: ReactNode; className?: string; highlight?: boolean }) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-[hsl(var(--surface-muted))]',
        highlight && 'bg-cyan-500/5',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({ children, className, mono }: { children: ReactNode; className?: string; mono?: boolean }) {
  return (
    <td
      className={cn(
        'px-4 py-2.5 align-middle text-[hsl(var(--text-secondary))]',
        mono && 'font-mono text-xs',
        className
      )}
    >
      {children}
    </td>
  );
}
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface DataTableProps {
  columns: Array<string>;
  children: ReactNode;
  className?: string;
}

export function DataTable({ columns, children, className }: DataTableProps) {
  return (
    <div className={cn('surface overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[hsl(var(--bg-elevated))]">
            <tr className="border-b border-[hsl(var(--border))] text-left text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--text-muted))]">
              {columns.map((column) => (
                <th key={column} className="px-4 py-2 font-semibold">
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

export function DataTableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('hover:bg-[hsl(var(--surface-muted))]', className)}>{children}</tr>;
}

export function DataTableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-4 py-2.5 align-middle text-[hsl(var(--text-secondary))]', className)}>{children}</td>;
}

import { cn } from '../../lib/cn';

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-[hsl(var(--surface-muted))]', className)} />;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="surface overflow-hidden p-4">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

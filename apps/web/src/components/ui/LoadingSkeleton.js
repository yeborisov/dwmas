import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/cn';
export function LoadingSkeleton({ className }) {
    return _jsx("div", { className: cn('animate-pulse rounded-lg bg-[hsl(var(--surface-muted))]', className) });
}
export function TableSkeleton({ rows = 6 }) {
    return (_jsx("div", { className: "surface overflow-hidden p-4", children: _jsx("div", { className: "space-y-3", children: Array.from({ length: rows }).map((_, i) => (_jsx(LoadingSkeleton, { className: "h-10 w-full" }, i))) }) }));
}

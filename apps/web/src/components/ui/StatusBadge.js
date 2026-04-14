import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/cn';
import { toStatusClass, toStatusLabel } from '../../lib/status';
export function StatusBadge({ status, className, children, showDot = true }) {
    return (_jsxs("span", { className: cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize tracking-wide', toStatusClass(status), className), children: [showDot && _jsx("span", { className: "inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" }), children ?? toStatusLabel(status)] }));
}

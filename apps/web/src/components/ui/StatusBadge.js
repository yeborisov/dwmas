import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/cn';
import { toStatusClass, toStatusLabel } from '../../lib/status';
export function StatusBadge({ status, className, children }) {
    return (_jsx("span", { className: cn('inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium capitalize tracking-wide', toStatusClass(status), className), children: children ?? toStatusLabel(status) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/cn';
export function FormField({ label, hint, error, className, children }) {
    return (_jsxs("label", { className: cn('flex min-w-[160px] flex-1 flex-col gap-1.5 text-sm', className), children: [_jsx("span", { className: "font-medium text-[hsl(var(--text-primary))]", children: label }), children, error ? _jsx("span", { className: "text-xs text-[hsl(var(--error))]", children: error }) : hint ? _jsx("span", { className: "text-xs text-[hsl(var(--text-muted))]", children: hint }) : null] }));
}

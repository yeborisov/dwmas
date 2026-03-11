import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/cn';
export function DataTable({ columns, children, className }) {
    return (_jsx("div", { className: cn('surface overflow-hidden', className), children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-[hsl(var(--bg-elevated))]", children: _jsx("tr", { className: "border-b border-[hsl(var(--border))] text-left text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--text-muted))]", children: columns.map((column) => (_jsx("th", { className: "px-4 py-2 font-semibold", children: column }, column))) }) }), _jsx("tbody", { className: "divide-y divide-[hsl(var(--border))]", children: children })] }) }) }));
}
export function DataTableRow({ children, className }) {
    return _jsx("tr", { className: cn('hover:bg-[hsl(var(--surface-muted))]', className), children: children });
}
export function DataTableCell({ children, className }) {
    return _jsx("td", { className: cn('px-4 py-2.5 align-middle text-[hsl(var(--text-secondary))]', className), children: children });
}

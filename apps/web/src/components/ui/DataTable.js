import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/cn';
export function DataTable({ columns, children, className, caption }) {
    return (_jsx("div", { className: cn('surface overflow-hidden', className), children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [caption && (_jsx("caption", { className: "border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] px-4 py-2 text-left text-xs text-[hsl(var(--text-muted))]", children: caption })), _jsx("thead", { className: "bg-[hsl(var(--bg-elevated))]", children: _jsx("tr", { className: "border-b border-[hsl(var(--border))] text-left text-[11px] uppercase tracking-[0.08em] text-[hsl(var(--text-muted))]", children: columns.map((column) => (_jsx("th", { className: "whitespace-nowrap px-4 py-2.5 font-semibold", children: column }, column))) }) }), _jsx("tbody", { className: "divide-y divide-[hsl(var(--border))]", children: children })] }) }) }));
}
export function DataTableRow({ children, className, highlight, onClick }) {
    return (_jsx("tr", { className: cn('transition-colors hover:bg-[hsl(var(--surface-muted))]', highlight && 'bg-cyan-500/5', className), onClick: onClick, children: children }));
}
export function DataTableCell({ children, className, mono }) {
    return (_jsx("td", { className: cn('px-4 py-2.5 align-middle text-[hsl(var(--text-secondary))]', mono && 'font-mono text-xs', className), children: children }));
}

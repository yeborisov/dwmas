import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';
export function SidebarNav({ items, onNavigate }) {
    const operations = items.filter((item) => ['/repositories', '/analytics', '/reports'].includes(item.to));
    const admin = items.filter((item) => ['/users'].includes(item.to));
    const primary = items.filter((item) => !['/repositories', '/analytics', '/reports', '/users'].includes(item.to));
    const linkClass = ({ isActive }) => cn('group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50', isActive
        ? 'bg-cyan-500/12 text-[hsl(var(--text-primary))] before:absolute before:bottom-1 before:left-1 before:top-1 before:w-1 before:rounded before:bg-cyan-400'
        : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--text-primary))]');
    return (_jsxs("nav", { className: "space-y-6", "aria-label": "Primary navigation", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-muted))]", children: "Main" }), primary.map((item) => (_jsx(NavLink, { to: item.to, end: item.end, onClick: onNavigate, className: linkClass, children: item.label }, item.to)))] }), _jsxs("div", { className: "space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] p-2", children: [_jsx("p", { className: "px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-secondary))]", children: "Operations" }), operations.map((item) => (_jsx(NavLink, { to: item.to, end: item.end, onClick: onNavigate, className: linkClass, children: item.label }, item.to)))] }), admin.length ? (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-muted))]", children: "Admin" }), admin.map((item) => (_jsx(NavLink, { to: item.to, end: item.end, onClick: onNavigate, className: linkClass, children: item.label }, item.to)))] })) : null] }));
}

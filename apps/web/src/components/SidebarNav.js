import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';
const iconMap = {
    '/dashboard': '⊞',
    '/workflows': '⟳',
    '/repositories': '◉',
    '/analytics': '◎',
    '/reports': '▤',
    '/profile': '◑',
    '/users': '◫'
};
export function SidebarNav({ items, onNavigate }) {
    const operations = items.filter((item) => ['/repositories', '/analytics', '/reports'].includes(item.to));
    const admin = items.filter((item) => ['/users'].includes(item.to));
    const primary = items.filter((item) => !['/repositories', '/analytics', '/reports', '/users'].includes(item.to));
    const linkClass = ({ isActive }) => cn('group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50', isActive
        ? 'bg-cyan-500/12 text-[hsl(var(--text-primary))] before:absolute before:bottom-1 before:left-1 before:top-1 before:w-1 before:rounded before:bg-cyan-400'
        : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--text-primary))]');
    const renderLink = (item) => (_jsxs(NavLink, { to: item.to, end: item.end, onClick: onNavigate, className: linkClass, children: [_jsx("span", { className: "flex h-5 w-5 items-center justify-center text-xs opacity-60 group-hover:opacity-100", children: iconMap[item.to] ?? '○' }), item.label] }, item.to));
    return (_jsxs("nav", { className: "space-y-5", "aria-label": "Primary navigation", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-muted))]", children: "Main" }), primary.map(renderLink)] }), operations.length > 0 && (_jsxs("div", { className: "space-y-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] p-2", children: [_jsx("p", { className: "px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-secondary))]", children: "Operations" }), operations.map(renderLink)] })), admin.length > 0 && (_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-muted))]", children: "Admin" }), admin.map(renderLink)] })), _jsx("div", { className: "mt-auto border-t border-[hsl(var(--border))] pt-3", children: _jsx("p", { className: "px-3 text-[10px] text-[hsl(var(--text-muted))]", children: "DWMAS v1.0" }) })] }));
}

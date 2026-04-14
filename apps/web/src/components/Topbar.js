import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
export function Topbar({ title, subtitle, username, role, onOpenSidebar }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const setUser = useAuthStore((s) => s.setUser);
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        }
        finally {
            setUser(null);
            queryClient.clear();
            navigate('/login', { replace: true });
        }
    };
    return (_jsx("header", { className: "sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))/0.92] backdrop-blur", children: _jsxs("div", { className: "content-wrap flex h-14 items-center justify-between gap-4", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsx("button", { type: "button", onClick: onOpenSidebar, className: "btn btn-ghost h-9 w-9 flex-shrink-0 p-0 md:hidden", "aria-label": "Open navigation", children: "\u2630" }), _jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsx("span", { className: "hidden h-6 items-center rounded bg-cyan-500/15 px-1.5 text-[10px] font-bold tracking-wider text-cyan-300 sm:inline-flex", children: "DWMAS" }), _jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "truncate text-sm font-semibold text-[hsl(var(--text-primary))]", children: title }), _jsx("p", { className: "hidden truncate text-[11px] text-[hsl(var(--text-muted))] lg:block", children: subtitle })] })] })] }), _jsxs("div", { className: "flex flex-shrink-0 items-center gap-2", children: [_jsxs(Link, { to: "/profile", className: "group flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5 transition hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-muted))]", children: [_jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--surface-muted))] text-xs font-semibold text-[hsl(var(--text-primary))] group-hover:bg-cyan-500/20 group-hover:text-cyan-300", children: (username || 'G').slice(0, 1).toUpperCase() }), _jsxs("div", { className: "hidden text-right sm:block", children: [_jsx("p", { className: "text-xs font-medium text-[hsl(var(--text-primary))]", children: username || 'Guest' }), _jsx("p", { className: "text-[10px] capitalize text-[hsl(var(--text-muted))]", children: role?.toLowerCase() || 'public' })] })] }), _jsx("button", { className: "btn btn-secondary h-8 px-2.5 text-xs", onClick: () => logout(), children: "Logout" })] })] }) }));
}

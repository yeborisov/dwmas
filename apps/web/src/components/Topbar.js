import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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
    return (_jsx("header", { className: "sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))/0.92] backdrop-blur", children: _jsxs("div", { className: "content-wrap flex h-14 items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { type: "button", onClick: onOpenSidebar, className: "btn btn-ghost h-9 w-9 p-0 md:hidden", "aria-label": "Open navigation", children: "\u2630" }), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--text-muted))]", children: "DWMAS" }), _jsx("p", { className: "text-sm font-semibold text-[hsl(var(--text-primary))]", children: title })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("p", { className: "hidden text-xs text-[hsl(var(--text-muted))] lg:block", children: subtitle }), _jsxs(Link, { to: "/profile", className: "surface-muted px-3 py-1.5 text-right text-xs", children: [_jsx("p", { className: "font-semibold text-[hsl(var(--text-primary))]", children: username || 'Guest' }), _jsx("p", { className: "text-[hsl(var(--text-secondary))]", children: role || 'Public access' })] }), _jsx("button", { className: "btn btn-secondary", onClick: () => logout(), children: "Logout" })] })] }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AppShell } from './AppShell';
import { useAuthStore } from '../store/auth';
export function Layout() {
    const user = useAuthStore((s) => s.user);
    const location = useLocation();
    const isPublic = ['/', '/about', '/login'].includes(location.pathname);
    const navItems = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/workflows', label: 'Workflows' },
        { to: '/analytics', label: 'Analytics' },
        { to: '/repositories', label: 'Repositories' },
        { to: '/reports', label: 'Reports' },
        { to: '/profile', label: 'Profile' },
        ...(user?.role === 'ADMIN' ? [{ to: '/users', label: 'Users' }] : [])
    ];
    if (!isPublic) {
        return (_jsx(AppShell, { navItems: navItems, username: user?.username, role: user?.role, children: _jsx(Outlet, {}) }));
    }
    return (_jsxs("div", { className: "app-shell", children: [_jsx("header", { className: "border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))/0.95] backdrop-blur", children: _jsxs("nav", { className: "content-wrap flex h-14 items-center justify-between", children: [_jsx(Link, { to: "/", className: "text-sm font-semibold tracking-wide text-[hsl(var(--text-primary))]", children: "DWMAS" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Link, { className: "btn btn-secondary", to: "/about", children: "About" }), _jsx(Link, { className: "btn btn-primary", to: user ? '/dashboard' : '/login', children: user ? 'Open workspace' : 'Sign in' })] })] }) }), _jsx("main", { className: "content-wrap py-6 md:py-8", children: _jsx(Outlet, {}) })] }));
}

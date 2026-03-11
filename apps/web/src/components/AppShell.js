import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { Topbar } from './Topbar';
export function AppShell({ navItems, username, role, children }) {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const activeItem = useMemo(() => navItems.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))), [location.pathname, navItems]);
    return (_jsxs("div", { className: "app-shell", children: [_jsx(Topbar, { title: activeItem?.label ?? 'DevOps Workspace', subtitle: "Workflow monitoring, insights and operations", username: username, role: role, onOpenSidebar: () => setOpen(true) }), _jsxs("div", { className: "mx-auto flex w-full max-w-[1480px]", children: [_jsx("aside", { className: `fixed inset-y-14 left-0 z-30 w-64 transform border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] p-3 transition md:sticky md:top-14 md:h-[calc(100vh-56px)] md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`, children: _jsx(SidebarNav, { items: navItems, onNavigate: () => setOpen(false) }) }), open ? _jsx("button", { className: "fixed inset-0 top-14 z-20 bg-black/50 md:hidden", onClick: () => setOpen(false) }) : null, _jsx("main", { className: "w-full py-5 md:py-6", children: _jsx("div", { className: "content-wrap space-y-5", children: children }) })] })] }));
}

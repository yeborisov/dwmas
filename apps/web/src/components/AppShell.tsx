import { useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { NavItem } from './SidebarNav';
import { SidebarNav } from './SidebarNav';
import { Topbar } from './Topbar';

interface AppShellProps {
  navItems: NavItem[];
  username?: string;
  role?: string;
  children: ReactNode;
}

export function AppShell({ navItems, username, role, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const activeItem = useMemo(
    () => navItems.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))),
    [location.pathname, navItems]
  );

  return (
    <div className="app-shell">
      <Topbar
        title={activeItem?.label ?? 'DevOps Workspace'}
        subtitle="Workflow monitoring, insights and operations"
        username={username}
        role={role}
        onOpenSidebar={() => setOpen(true)}
      />
      <div className="mx-auto flex w-full max-w-[1480px]">
        <aside
          className={`fixed inset-y-14 left-0 z-30 w-64 transform border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] p-3 transition md:sticky md:top-14 md:h-[calc(100vh-56px)] md:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarNav items={navItems} onNavigate={() => setOpen(false)} />
        </aside>
        {open ? <button className="fixed inset-0 top-14 z-20 bg-black/50 md:hidden" onClick={() => setOpen(false)} /> : null}
        <main className="w-full py-5 md:py-6">
          <div className="content-wrap space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}

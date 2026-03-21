import { useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { NavItem } from './SidebarNav';
import { SidebarNav } from './SidebarNav';
import { Topbar } from './Topbar';
import { AppFooter } from './AppFooter';

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
    <div className="app-shell flex min-h-screen flex-col">
      <Topbar
        title={activeItem?.label ?? 'DevOps Workspace'}
        subtitle="Workflow monitoring, insights and operations"
        username={username}
        role={role}
        onOpenSidebar={() => setOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-[1480px] flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-14 left-0 z-30 w-64 transform overflow-y-auto border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] p-3 transition md:sticky md:top-14 md:h-[calc(100vh-56px)] md:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarNav items={navItems} onNavigate={() => setOpen(false)} />
        </aside>

        {/* Overlay for mobile sidebar */}
        {open ? (
          <button
            className="fixed inset-0 top-14 z-20 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />
        ) : null}

        {/* Main content area with footer */}
        <div className="flex w-full min-w-0 flex-col">
          <main className="flex-1 py-5 md:py-6">
            <div className="content-wrap space-y-5">{children}</div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
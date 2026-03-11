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
    return (
      <AppShell navItems={navItems} username={user?.username} role={user?.role}>
        <Outlet />
      </AppShell>
    );
  }

  return (
    <div className="app-shell">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))/0.95] backdrop-blur">
        <nav className="content-wrap flex h-14 items-center justify-between">
          <Link to="/" className="text-sm font-semibold tracking-wide text-[hsl(var(--text-primary))]">
            DWMAS
          </Link>
          <div className="flex items-center gap-2">
            <Link className="btn btn-secondary" to="/about">
              About
            </Link>
            <Link className="btn btn-primary" to={user ? '/dashboard' : '/login'}>
              {user ? 'Open workspace' : 'Sign in'}
            </Link>
          </div>
        </nav>
      </header>
      <main className="content-wrap py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}

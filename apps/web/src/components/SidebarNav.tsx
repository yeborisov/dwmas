import { NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

interface SidebarNavProps {
  items: NavItem[];
  onNavigate?: () => void;
}

export function SidebarNav({ items, onNavigate }: SidebarNavProps) {
  const operations = items.filter((item) => ['/repositories', '/analytics', '/reports'].includes(item.to));
  const admin = items.filter((item) => ['/users'].includes(item.to));
  const primary = items.filter((item) => !['/repositories', '/analytics', '/reports', '/users'].includes(item.to));

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
      isActive
        ? 'bg-cyan-500/12 text-[hsl(var(--text-primary))] before:absolute before:bottom-1 before:left-1 before:top-1 before:w-1 before:rounded before:bg-cyan-400'
        : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--text-primary))]'
    );

  return (
    <nav className="space-y-6" aria-label="Primary navigation">
      <div className="space-y-2">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-muted))]">Main</p>
        {primary.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] p-2">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-secondary))]">Operations</p>
        {operations.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </div>

      {admin.length ? (
        <div className="space-y-2">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-muted))]">Admin</p>
          {admin.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </nav>
  );
}

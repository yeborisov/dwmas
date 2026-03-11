import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

interface TopbarProps {
  title: string;
  subtitle: string;
  username?: string;
  role?: string;
  onOpenSidebar: () => void;
}

export function Topbar({ title, subtitle, username, role, onOpenSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))/0.92] backdrop-blur">
      <div className="content-wrap flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="btn btn-ghost h-9 w-9 p-0 md:hidden"
            aria-label="Open navigation"
          >
            ☰
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--text-muted))]">DWMAS</p>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-[hsl(var(--text-muted))] lg:block">{subtitle}</p>
          <Link to="/profile" className="surface-muted px-3 py-1.5 text-right text-xs">
            <p className="font-semibold text-[hsl(var(--text-primary))]">{username || 'Guest'}</p>
            <p className="text-[hsl(var(--text-secondary))]">{role || 'Public access'}</p>
          </Link>
          <button className="btn btn-secondary" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

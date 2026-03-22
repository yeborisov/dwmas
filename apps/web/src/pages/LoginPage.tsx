import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

export function LoginPage() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/login', { username, password });
      return res.data as { success: boolean; data?: { id: string; username: string; role: 'DEVELOPER' | 'DEVOPS' | 'ADMIN' } };
    },
    onSuccess: (data) => {
      setError(null);
      if (data?.data) {
        setUser({ id: data.data.id, username: data.data.username, role: data.data.role });
        navigate('/dashboard');
      }
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Login failed. Check credentials.';
      setError(message);
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    loginMutation.mutate();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--bg-base))] p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Logo / brand */}
        <div className="space-y-2">
          <span className="mx-auto inline-flex h-12 items-center rounded-lg bg-cyan-500/15 px-3 text-lg font-bold tracking-wider text-cyan-300">
            DWMAS
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--text-primary))]">Welcome back</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Sign in with GitHub or username/password.
          </p>
        </div>

        {/* Login card */}
        <div className="surface space-y-5 p-6 text-left">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Use GitHub OAuth or the seeded local credentials (e.g., <code className="rounded bg-[hsl(var(--bg))] px-1 py-0.5">tester / Password123!</code>).
          </p>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[hsl(var(--text-secondary))]" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                placeholder="tester"
                autoComplete="username"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[hsl(var(--text-secondary))]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="Password123!"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary w-full py-2.5 text-sm font-semibold"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in…' : 'Sign in with credentials'}
            </button>
          </form>

          <div className="relative py-2 text-center text-xs uppercase tracking-wide text-[hsl(var(--text-muted))]">
            <span className="bg-[hsl(var(--bg))] px-2">or</span>
            <div className="absolute left-0 top-1/2 h-px w-full bg-[hsl(var(--border))]" aria-hidden />
          </div>

          <a
            href={`${apiUrl}/auth/github`}
            className="btn btn-secondary flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Sign in with GitHub
          </a>
        </div>

        {/* Footer */}
        <p className="text-xs text-[hsl(var(--text-muted))]">
          This is an automatically generated system. If you have questions please contact{' '}
          <a href="mailto:iordan.borisov@gmail.com" className="text-[hsl(var(--accent))] hover:underline">iordan.borisov@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
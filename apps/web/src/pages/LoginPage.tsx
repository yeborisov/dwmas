export function LoginPage() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--bg-base))] p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Logo / brand */}
        <div className="space-y-2">
          <span className="mx-auto inline-flex h-12 items-center rounded-lg bg-cyan-500/15 px-3 text-lg font-bold tracking-wider text-cyan-300">
            DWMAS
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--text-primary))]">Welcome back</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            DevOps Workflow Monitoring &amp; Analytics System
          </p>
        </div>

        {/* Login card */}
        <div className="surface space-y-4 p-6">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Sign in with your GitHub account to access the platform.
          </p>
          <div className="surface-muted rounded-lg p-3 text-left text-xs text-[hsl(var(--text-muted))]">
            <p className="mb-1 font-semibold text-[hsl(var(--text-secondary))]">How roles are assigned:</p>
            <ul className="list-inside list-disc space-y-0.5">
              <li><strong>Admin</strong> — Set your GitHub username in <code className="rounded bg-[hsl(var(--bg))] px-1 py-0.5">ADMIN_GITHUB_USERNAMES</code> or your GitHub ID in <code className="rounded bg-[hsl(var(--bg))] px-1 py-0.5">ADMIN_GITHUB_IDS</code> in the server <code className="rounded bg-[hsl(var(--bg))] px-1 py-0.5">.env</code> file.</li>
              <li><strong>DevOps / Developer</strong> — Assigned automatically for other authenticated users.</li>
            </ul>
          </div>
          <a href={`${apiUrl}/auth/github`} className="btn btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold">
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
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--bg-base))] p-6">
      <div className="w-full max-w-lg space-y-8 text-center">
        {/* Brand */}
        <div className="space-y-3">
          <span className="mx-auto inline-flex h-14 items-center rounded-lg bg-cyan-500/15 px-4 text-xl font-bold tracking-wider text-cyan-300">
            DWMAS
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--text-primary))]">
            DevOps Workflow Monitoring &amp; Analytics
          </h1>
          <p className="text-base text-[hsl(var(--text-secondary))]">
            Track CI/CD pipelines, analyze workflow performance, and generate operational reports — all from one dashboard.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface space-y-1 p-4 text-center">
            <p className="text-lg">⟳</p>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Sync</p>
            <p className="text-xs text-[hsl(var(--text-muted))]">GitHub Actions data</p>
          </div>
          <div className="surface space-y-1 p-4 text-center">
            <p className="text-lg">◎</p>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Analyze</p>
            <p className="text-xs text-[hsl(var(--text-muted))]">Trends &amp; metrics</p>
          </div>
          <div className="surface space-y-1 p-4 text-center">
            <p className="text-lg">▤</p>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Report</p>
            <p className="text-xs text-[hsl(var(--text-muted))]">Templates &amp; export</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link className="btn btn-primary px-6 py-2.5 text-sm font-semibold" to="/login">
            Sign in with GitHub
          </Link>
          <Link className="btn btn-secondary px-6 py-2.5 text-sm" to="/about">
            Learn more
          </Link>
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
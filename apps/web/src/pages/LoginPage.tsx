import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';

export function LoginPage() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  return (
    <section className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
      <div className="surface p-8 md:p-10">
        <PageHeader
          title="Welcome back"
          description="Sign in with GitHub to access workflow monitoring, analytics, and repository operations."
        />
        <div className="mt-8 space-y-3">
          <a className="btn btn-primary w-full" href={`${apiUrl}/auth/github`}>
            Continue with GitHub OAuth
          </a>
          <p className="text-xs text-[hsl(var(--text-muted))]">
            Authentication is secured via GitHub OAuth Authorization Code flow and your role-based access policy.
          </p>
          <p className="text-xs text-[hsl(var(--text-secondary))]">
            Local role bootstrap: configure <code>ADMIN_GITHUB_USERNAMES</code>/<code>ADMIN_GITHUB_IDS</code> and optional
            <code> DEVOPS_GITHUB_USERNAMES</code>/<code>DEVOPS_GITHUB_IDS</code> in <code>.env</code>.
          </p>
        </div>
      </div>

      <div className="surface-muted p-8 md:p-10">
        <h2 className="text-lg font-semibold">Why DWMAS</h2>
        <ul className="mt-4 space-y-2 text-sm text-[hsl(var(--text-secondary))]">
          <li>• Unified CI/CD monitoring across repositories</li>
          <li>• Realtime run tracking and status diagnostics</li>
          <li>• Role-aware dashboards and operational analytics</li>
          <li>• Collaboration with issues and comments</li>
        </ul>
        <Link className="btn mt-6" to="/about">
          View platform overview
        </Link>
      </div>
    </section>
  );
}

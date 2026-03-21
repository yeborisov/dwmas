import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';

export function ProfilePage() {
  const { data } = useQuery({ queryKey: ['me'], queryFn: async () => (await api.get('/me')).data });
  const me = data?.data;

  if (!me) {
    return <EmptyState title="Profile unavailable" description="Could not load authenticated account metadata." icon="👤" />;
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Profile" description="Authenticated user information and access role." />

      <SectionCard title="Account details">
        <div className="flex flex-wrap items-center gap-4 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[hsl(var(--border-strong))] bg-[hsl(var(--bg-elevated))] text-lg font-semibold">
            {(me.username || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold text-[hsl(var(--text-primary))]">{me.username || '-'}</p>
            <p className="text-sm text-[hsl(var(--text-secondary))]">GitHub account</p>
          </div>
          <StatusBadge status={me.role?.toLowerCase() || 'neutral'} className="ml-auto" />
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p className="surface-muted rounded-lg p-3">Username: <span className="text-[hsl(var(--text-primary))]">{me.username || '-'}</span></p>
          <p className="surface-muted rounded-lg p-3">GitHub ID: <span className="text-[hsl(var(--text-primary))]">{me.githubId || '-'}</span></p>
        </div>
        <p className="mt-3 text-xs text-[hsl(var(--text-muted))]">
          Access summary: Developer → assigned/owned repositories only. DevOps → all repositories + sync/export.
          Admin → all platform operations + user management.
        </p>
      </SectionCard>

      <SectionCard title="How to become Admin" description="Admin role is assigned via server environment variables.">
        <div className="space-y-3 text-sm text-[hsl(var(--text-secondary))]">
          <p>
            To grant admin access, add your GitHub username or numeric GitHub ID to the server <code className="rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-xs text-[hsl(var(--text-primary))]">.env</code> file:
          </p>
          <div className="surface-muted rounded-lg p-3 font-mono text-xs text-[hsl(var(--text-primary))]">
            <p># Admin bootstrap by GitHub identity</p>
            <p>ADMIN_GITHUB_USERNAMES=yeborisov</p>
            <p>ADMIN_GITHUB_IDS=12345</p>
            <p>&nbsp;</p>
            <p># DevOps role (optional)</p>
            <p>DEVOPS_GITHUB_USERNAMES=teammate1,teammate2</p>
          </div>
          <p>
            After updating <code className="rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-xs text-[hsl(var(--text-primary))]">.env</code>, restart the API server and <strong>log out then log in again</strong> — the role is re-evaluated on each GitHub OAuth login.
          </p>
          <p className="text-xs text-[hsl(var(--text-muted))]">
            Your current GitHub ID: <code className="rounded bg-[hsl(var(--bg))] px-1 py-0.5 text-[hsl(var(--text-primary))]">{me.githubId || 'unknown'}</code> · 
            Username: <code className="rounded bg-[hsl(var(--bg))] px-1 py-0.5 text-[hsl(var(--text-primary))]">{me.username || 'unknown'}</code> · 
            Current role: <code className="rounded bg-[hsl(var(--bg))] px-1 py-0.5 text-[hsl(var(--text-primary))]">{me.role || 'unknown'}</code>
          </p>
        </div>
      </SectionCard>

      <SectionCard title="GitHub API — GraphQL optimization" description="How the system uses GraphQL to avoid rate limits.">
        <div className="space-y-3 text-sm text-[hsl(var(--text-secondary))]">
          <p>
            The backend automatically uses <strong>GitHub GraphQL API</strong> when <code className="rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-xs text-[hsl(var(--text-primary))]">GITHUB_API_TOKEN</code> is set in the server <code className="rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-xs text-[hsl(var(--text-primary))]">.env</code> file. GraphQL enables:
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs text-[hsl(var(--text-muted))]">
            <li>Fetching 100 workflow runs per request (vs 30 with REST)</li>
            <li>Batching jobs for 25 runs in a single GraphQL query</li>
            <li>2-minute response cache with ETag support</li>
            <li>Automatic retry with exponential back-off</li>
            <li>Parallel REST fallback when GraphQL is unavailable</li>
          </ul>
          <div className="surface-muted rounded-lg p-3 font-mono text-xs text-[hsl(var(--text-primary))]">
            <p># In .env — already configured ✓</p>
            <p>GITHUB_API_TOKEN=ghp_your_token_here</p>
            <p># Optional: cache TTL in milliseconds (default: 120000)</p>
            <p>GITHUB_CACHE_TTL_MS=120000</p>
          </div>
        </div>
      </SectionCard>
    </section>
  );
}

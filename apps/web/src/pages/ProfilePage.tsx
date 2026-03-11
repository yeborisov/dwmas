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
    </section>
  );
}

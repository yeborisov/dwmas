import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tabs } from '../components/ui/Tabs';

interface Repository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch?: string;
  isPrivate?: boolean;
  isActive?: boolean;
  syncStatus?: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  lastSyncedAt?: string;
  lastSuccessfulSyncAt?: string;
  syncError?: string | null;
  createdAt?: string;
}

export function RepositoriesPage() {
  const queryClient = useQueryClient();
  const [owner, setOwner] = useState('');
  const [name, setName] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['repos'],
    queryFn: async () => (await api.get('/repositories')).data
  });
  const repos: Repository[] = data?.data ?? [];

  const connectMutation = useMutation({
    mutationFn: async () =>
      api.post('/repositories', {
        owner: owner || undefined,
        name: name || undefined,
        repositoryUrl: repositoryUrl || undefined
      }),
    onSuccess: async () => {
      setOwner('');
      setName('');
      setRepositoryUrl('');
      await queryClient.invalidateQueries({ queryKey: ['repos'] });
    }
  });

  const syncMutation = useMutation({
    mutationFn: async (repoId: string) => api.post(`/repositories/${repoId}/sync`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['repos'] });
      await queryClient.invalidateQueries({ queryKey: ['workflows'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-failure-rate'] });
    }
  });

  const syncAllMutation = useMutation({
    mutationFn: async () => api.post('/repositories/sync-all'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['repos'] });
      await queryClient.invalidateQueries({ queryKey: ['workflows'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics-failure-rate'] });
    }
  });

  const connectError = (connectMutation.error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;
  const syncError = (syncMutation.error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Repositories"
        description="Connect repositories, monitor synchronization health, and manage workflow data sources."
        tabs={<Tabs items={[{ to: '/repositories', label: 'Repositories', end: true }, { to: '/analytics', label: 'Analytics' }, { to: '/reports', label: 'Reports' }]} />}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Refreshing…' : 'Refresh list'}
            </button>
            <button className="btn btn-primary" onClick={() => syncAllMutation.mutate()} disabled={syncAllMutation.isPending || !repos.length}>
              {syncAllMutation.isPending ? 'Syncing all...' : 'Sync all repositories'}
            </button>
          </div>
        }
      />

      <SectionCard title="Connect repository" description="Register a GitHub repository as a monitored CI/CD source.">
        <p className="mb-3 text-xs text-[hsl(var(--text-muted))]">
          You can add by <strong>owner + repository</strong> or paste full GitHub URL. After connecting, click <strong>Sync</strong> to import GitHub Actions runs. If the repository has no runs,
          Workflows will show an explicit empty state.
        </p>
        <div className="grid gap-3 lg:grid-cols-4">
          <FormField label="Owner" className="lg:col-span-1">
            <input className="field" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="owner" />
          </FormField>
          <FormField label="Repository" className="lg:col-span-1">
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="repo" />
          </FormField>
          <FormField label="GitHub URL (optional)" className="lg:col-span-2">
            <input
              className="field"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
            />
          </FormField>
        </div>
        <div className="mt-3 flex justify-end">
          <button className="btn btn-primary" onClick={() => connectMutation.mutate()} disabled={(!owner || !name) && !repositoryUrl}>
            {connectMutation.isPending ? 'Connecting...' : 'Connect repository'}
          </button>
        </div>
        {connectError ? <p className="mt-3 text-sm text-rose-300">{connectError}</p> : null}
      </SectionCard>

      {isLoading ? <TableSkeleton rows={4} /> : null}

      {isError ? (
        <EmptyState
          title="Could not load repositories"
          description="We couldn't retrieve repository data. Check your session and try again."
          action={
            <button className="btn btn-secondary" onClick={() => refetch()}>
              Retry
            </button>
          }
          icon="⚠"
        />
      ) : null}

      {!isLoading && !isError && !repos.length ? (
        <EmptyState title="No repositories" description="Connect your first repository to begin workflow synchronization." icon="🧩" />
      ) : null}

      {!isLoading && !isError && repos.length ? (
        <DataTable columns={['Repository', 'Branch', 'Visibility', 'Access', 'Sync status', 'Last synced', 'Actions']}>
          {repos.map((repo) => (
            <DataTableRow key={repo.id}>
              <DataTableCell>
                <div>
                  <p className="font-medium text-[hsl(var(--text-primary))]">{repo.fullName}</p>
                  <p className="text-xs text-[hsl(var(--text-muted))]">owner: {repo.owner || repo.fullName.split('/')[0]}</p>
                </div>
              </DataTableCell>
              <DataTableCell>{repo.defaultBranch || '-'}</DataTableCell>
              <DataTableCell>
                <StatusBadge status={repo.isPrivate ? 'failure' : 'success'}>
                  {repo.isPrivate ? 'Private' : 'Public'}
                </StatusBadge>
              </DataTableCell>
              <DataTableCell>
                <StatusBadge status={repo.isActive ? 'active' : 'inactive'} />
              </DataTableCell>
              <DataTableCell>
                <div className="space-y-1">
                  <StatusBadge status={(repo.syncStatus || 'IDLE').toLowerCase()}>{repo.syncStatus || 'IDLE'}</StatusBadge>
                  {repo.syncError ? <p className="text-xs text-rose-300">{repo.syncError}</p> : null}
                </div>
              </DataTableCell>
              <DataTableCell>{repo.lastSuccessfulSyncAt ? new Date(repo.lastSuccessfulSyncAt).toLocaleString() : 'Never'}</DataTableCell>
              <DataTableCell>
                <div className="flex items-center gap-2">
                  <Link className="btn btn-secondary" to="/workflows">
                    View runs
                  </Link>
                  <button className="btn" onClick={() => syncMutation.mutate(repo.id)} disabled={syncMutation.isPending}>
                    {syncMutation.isPending ? 'Syncing runs...' : 'Sync runs'}
                  </button>
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      ) : null}

      {syncMutation.isSuccess ? (
        <p className="text-sm text-emerald-300">Repository sync completed. Open Workflows to review imported runs.</p>
      ) : null}
      {syncAllMutation.isSuccess ? (
        <p className="text-sm text-emerald-300">
          {(syncAllMutation.data as { data?: { message?: string } } | undefined)?.data?.message || 'Bulk repository sync completed.'}
        </p>
      ) : null}
      {syncError ? <p className="text-sm text-rose-300">{syncError}</p> : null}
      {(syncAllMutation.error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message ? (
        <p className="text-sm text-rose-300">
          {(syncAllMutation.error as { response?: { data?: { message?: string } } }).response?.data?.message}
        </p>
      ) : null}
    </section>
  );
}

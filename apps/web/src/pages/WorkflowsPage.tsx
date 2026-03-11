import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { FilterBar } from '../components/ui/FilterBar';
import { FormField } from '../components/ui/FormField';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { Tabs } from '../components/ui/Tabs';

interface WorkflowRun {
  id: string;
  workflowName: string;
  status: string;
  conclusion?: string | null;
  actor?: string | null;
  branch?: string | null;
  startedAt?: string | null;
  repository?: {
    id: string;
    fullName: string;
  };
}

export function WorkflowsPage() {
  const [status, setStatus] = useState('');
  const [actor, setActor] = useState('');
  const [branch, setBranch] = useState('');
  const [repositoryId, setRepositoryId] = useState('');
  const [refreshFromGithub, setRefreshFromGithub] = useState(false);

  const reposQuery = useQuery({ queryKey: ['repos'], queryFn: async () => (await api.get('/repositories')).data });
  const repos: Array<{ id: string; fullName: string }> = reposQuery.data?.data ?? [];

  const { data, refetch, isLoading, isError, error } = useQuery({
    queryKey: ['workflows', status, actor, branch, repositoryId, refreshFromGithub],
    queryFn: async () =>
      (
        await api.get('/workflows', {
          params: {
            status: status || undefined,
            actor: actor || undefined,
            branch: branch || undefined,
            repositoryId: repositoryId || undefined,
            refresh: refreshFromGithub ? 'true' : undefined
          }
        })
      ).data
  });

  const runs = useMemo<WorkflowRun[]>(() => data?.data ?? [], [data]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Workflows"
        description="CI/CD execution feed with filters for repository, branch, actor, and runtime state."
        tabs={<Tabs items={[{ to: '/repositories', label: 'Repositories' }, { to: '/analytics', label: 'Analytics' }, { to: '/reports', label: 'Reports' }]} />}
      />

      <FilterBar>
        <FormField label="Status">
          <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="queued">queued</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
          </select>
        </FormField>
        <FormField label="Actor">
          <input className="field" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="e.g. octocat" />
        </FormField>
        <FormField label="Branch">
          <input className="field" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. main" />
        </FormField>
        <FormField label="Repository">
          <select className="field" value={repositoryId} onChange={(e) => setRepositoryId(e.target.value)}>
            <option value="">All repositories</option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.fullName}
              </option>
            ))}
          </select>
        </FormField>
        <label className="flex h-10 items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] px-3 text-xs text-[hsl(var(--text-secondary))]">
          <input type="checkbox" checked={refreshFromGithub} onChange={(e) => setRefreshFromGithub(e.target.checked)} />
          Refresh from GitHub on apply
        </label>
        <button className="btn btn-primary" onClick={() => refetch()}>
          Apply filters
        </button>
      </FilterBar>

      {isLoading ? <TableSkeleton /> : null}

      {isError ? (
        <EmptyState
          title="Unable to load workflows"
          description={
            ((error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message ??
              'Workflow query failed. Check repository access and sync status.')
          }
          action={
            <button className="btn btn-secondary" onClick={() => refetch()}>
              Retry
            </button>
          }
          icon="⚠"
        />
      ) : null}

      {data && !isError && runs.length === 0 ? (
        <EmptyState
          title="No workflow runs"
          description="No runs match current filters. Connect a repository, click Sync runs, then refresh this page."
          icon="🛰"
        />
      ) : null}

      {runs.length ? (
        <DataTable columns={['Workflow', 'Repository', 'Branch', 'Status', 'Conclusion', 'Actor', 'Started', 'Details']}>
          {runs.map((run) => (
            <DataTableRow key={run.id}>
              <DataTableCell className="font-medium text-[hsl(var(--text-primary))]">{run.workflowName}</DataTableCell>
              <DataTableCell>{run.repository?.fullName || '-'}</DataTableCell>
              <DataTableCell>{run.branch || '-'}</DataTableCell>
              <DataTableCell>
                <StatusBadge status={run.status} />
              </DataTableCell>
              <DataTableCell>
                <StatusBadge status={run.conclusion || 'neutral'} />
              </DataTableCell>
              <DataTableCell>{run.actor || '-'}</DataTableCell>
              <DataTableCell>{run.startedAt ? new Date(run.startedAt).toLocaleString() : '-'}</DataTableCell>
              <DataTableCell>
                <div className="flex flex-wrap gap-2">
                <Link className="btn btn-secondary" to={`/workflows/${run.id}`}>
                  Open
                </Link>
                {(run.conclusion || '').toLowerCase() === 'failure' ? (
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      const result = await api.post(`/workflows/${run.id}/issues`);
                      const issueId = result.data?.data?.id;
                      if (issueId) {
                        window.location.href = `/repository/issues/${issueId}`;
                      }
                    }}
                  >
                    Create Issue
                  </button>
                ) : null}
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      ) : null}
    </section>
  );
}

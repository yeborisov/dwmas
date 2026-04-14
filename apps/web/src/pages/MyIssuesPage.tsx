import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';

interface IssueRow {
  id: string;
  title: string;
  status: 'OPEN' | 'CLOSED';
  updatedAt?: string;
  githubIssueUrl?: string | null;
  repository?: { fullName: string };
}

const STORAGE_KEY = 'dwmas_issue_last_seen';

function readLastSeen(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function writeLastSeen(data: Record<string, string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function MyIssuesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-issues'],
    queryFn: async () => (await api.get('/issues/mine')).data
  });

  const issues: IssueRow[] = data?.data ?? [];
  const lastSeen = useMemo(() => readLastSeen(), []);

  useEffect(() => {
    const next = { ...lastSeen };
    for (const issue of issues) {
      if (!next[issue.id] && issue.updatedAt) {
        next[issue.id] = issue.updatedAt;
      }
    }
    writeLastSeen(next);
  }, [issues, lastSeen]);

  return (
    <section className="space-y-6">
      <PageHeader title="My Issues" description="Issues you created or commented on." />

      <SectionCard title="Tracked issues" description="Updates are highlighted when status or comments change.">
        {!issues.length && !isLoading ? (
          <EmptyState title="No issues yet" description="Create or comment on an issue to see it here." icon="🧾" />
        ) : (
          <DataTable columns={['Issue', 'Repository', 'Status', 'Updated', 'Actions']}>
            {issues.map((issue) => {
              const last = lastSeen[issue.id];
              const isUpdated = Boolean(issue.updatedAt && (!last || new Date(issue.updatedAt) > new Date(last)));
              return (
                <DataTableRow key={issue.id} highlight={isUpdated}>
                  <DataTableCell className="font-medium text-[hsl(var(--text-primary))]">
                    {issue.title}
                  </DataTableCell>
                  <DataTableCell>{issue.repository?.fullName || '-'}</DataTableCell>
                  <DataTableCell>
                    <StatusBadge status={issue.status.toLowerCase()}>{issue.status}</StatusBadge>
                  </DataTableCell>
                  <DataTableCell>{issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : '-'}</DataTableCell>
                  <DataTableCell>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="btn btn-secondary"
                        to={`/repository/issues/${issue.id}`}
                        onClick={() => {
                          const next = readLastSeen();
                          if (issue.updatedAt) next[issue.id] = issue.updatedAt;
                          writeLastSeen(next);
                        }}
                      >
                        View
                      </Link>
                      {issue.githubIssueUrl ? (
                        <a className="btn btn-secondary" href={issue.githubIssueUrl} target="_blank" rel="noreferrer">
                          GitHub
                        </a>
                      ) : null}
                      {isUpdated ? <span className="text-[10px] uppercase text-amber-200">Updated</span> : null}
                    </div>
                  </DataTableCell>
                </DataTableRow>
              );
            })}
          </DataTable>
        )}
      </SectionCard>
    </section>
  );
}

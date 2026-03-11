import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

interface WorkflowJob {
  id: string;
  name: string;
  status: string;
  conclusion?: string | null;
  durationMs?: number | null;
  runnerName?: string | null;
}

interface WorkflowRun {
  id: string;
  workflowName: string;
  status: string;
  conclusion?: string | null;
  branch?: string | null;
  event?: string | null;
  actor?: string | null;
  commitSha?: string | null;
  htmlUrl?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number | null;
  repository?: { fullName: string };
  jobs?: WorkflowJob[];
}

export function WorkflowDetailsPage() {
  const { id } = useParams();
  const { data } = useQuery({ queryKey: ['workflow', id], queryFn: async () => (await api.get(`/workflows/${id}`)).data });
  const run: WorkflowRun | undefined = data?.data;

  if (!data) {
    return <TableSkeleton rows={4} />;
  }

  if (!run) {
    return <EmptyState title="Workflow not found" description="The requested workflow run does not exist." icon="🔎" />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={run.workflowName}
        description={`Run #${run.id.slice(-6)} in ${run.repository?.fullName || 'unknown repository'}`}
        actions={
          <>
            <StatusBadge status={run.status} />
            <StatusBadge status={run.conclusion || 'neutral'} />
          </>
        }
      />

      <SectionCard title="Run metadata" description="Execution context and traceability fields">
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <p className="surface-muted rounded-lg p-3">Branch: <span className="text-[hsl(var(--text-primary))]">{run.branch || '-'}</span></p>
          <p className="surface-muted rounded-lg p-3">Event: <span className="text-[hsl(var(--text-primary))]">{run.event || '-'}</span></p>
          <p className="surface-muted rounded-lg p-3">Actor: <span className="text-[hsl(var(--text-primary))]">{run.actor || '-'}</span></p>
          <p className="surface-muted rounded-lg p-3">Commit: <span className="text-[hsl(var(--text-primary))]">{run.commitSha || '-'}</span></p>
          <p className="surface-muted rounded-lg p-3">Started: <span className="text-[hsl(var(--text-primary))]">{run.startedAt ? new Date(run.startedAt).toLocaleString() : '-'}</span></p>
          <p className="surface-muted rounded-lg p-3">Duration: <span className="text-[hsl(var(--text-primary))]">{run.durationMs ? `${Math.round(run.durationMs / 1000)}s` : '-'}</span></p>
        </div>
        {run.htmlUrl ? (
          <a className="btn btn-secondary mt-4" href={run.htmlUrl} target="_blank" rel="noreferrer">
            Open in GitHub
          </a>
        ) : null}
      </SectionCard>

      <SectionCard title="Jobs" description="Job-level execution results for this run">
        {!run.jobs?.length ? (
          <EmptyState title="No jobs found" description="This run has no stored job records." icon="🧱" />
        ) : (
          <DataTable columns={['Job', 'Status', 'Conclusion', 'Runner', 'Duration']}>
            {run.jobs.map((job) => (
              <DataTableRow key={job.id}>
                <DataTableCell className="font-medium text-[hsl(var(--text-primary))]">{job.name}</DataTableCell>
                <DataTableCell><StatusBadge status={job.status} /></DataTableCell>
                <DataTableCell><StatusBadge status={job.conclusion || 'neutral'} /></DataTableCell>
                <DataTableCell>{job.runnerName || '-'}</DataTableCell>
                <DataTableCell>{job.durationMs ? `${Math.round(job.durationMs / 1000)}s` : '-'}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        )}
      </SectionCard>

      <Link className="btn btn-secondary" to="/workflows">
        Back to workflows
      </Link>
    </section>
  );
}

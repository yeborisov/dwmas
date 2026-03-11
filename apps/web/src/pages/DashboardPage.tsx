import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { MetricGrid } from '../components/ui/MetricGrid';
import { StatCard } from '../components/ui/StatCard';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface ActiveRun {
  id: string;
  workflowName: string;
}

export function DashboardPage() {
  const { data } = useQuery({ queryKey: ['summary'], queryFn: async () => (await api.get('/analytics')).data });
  const [activeRuns, setActiveRuns] = useState<ActiveRun[]>([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_WS_URL || 'http://localhost:4000', { withCredentials: true });
    socket.on('active-runs:updated', (runs: ActiveRun[]) => setActiveRuns(runs));
    return () => {
      socket.disconnect();
    };
  }, []);

  const cards = useMemo(
    () => [
      ['Total', data?.data?.totalRuns ?? 0],
      ['Success', data?.data?.successfulRuns ?? 0],
      ['Failed', data?.data?.failedRuns ?? 0],
      ['In-progress', data?.data?.inProgressRuns ?? 0]
    ],
    [data]
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live CI/CD health snapshot across all repositories you have access to."
      />

      <MetricGrid>
        {cards.map(([label, value]) => (
          <StatCard
            key={String(label)}
            label={String(label)}
            value={String(value)}
            tone={label === 'Success' ? 'success' : label === 'Failed' ? 'danger' : label === 'In-progress' ? 'info' : 'default'}
          />
        ))}
      </MetricGrid>

      <SectionCard
        title="Active workflow runs"
        description="Realtime stream from WebSocket channel active-runs:updated"
        actions={<StatusBadge status={activeRuns.length ? 'in_progress' : 'queued'} className="text-[11px]" />}
      >
        {activeRuns.length === 0 ? (
          <EmptyState title="No active runs" description="No workflows are currently executing." icon="⏱" />
        ) : (
          <ul className="space-y-2 text-sm">
            {activeRuns.map((run) => (
              <li key={run.id} className="surface-muted flex items-center justify-between rounded-lg p-3">
                <span className="font-medium text-[hsl(var(--text-primary))]">{run.workflowName}</span>
                <StatusBadge status="in_progress" />
              </li>
            ))}
          </ul>
        )}

        {!data ? <LoadingSkeleton className="mt-4 h-10 w-full" /> : null}
      </SectionCard>
    </section>
  );
}

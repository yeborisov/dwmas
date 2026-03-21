import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
  const { data, isLoading } = useQuery({ queryKey: ['summary'], queryFn: async () => (await api.get('/analytics')).data });
  const [activeRuns, setActiveRuns] = useState<ActiveRun[]>([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_WS_URL || 'http://localhost:4000', { withCredentials: true });
    socket.on('active-runs:updated', (runs: ActiveRun[]) => setActiveRuns(runs));
    return () => {
      socket.disconnect();
    };
  }, []);

  const totalRuns = data?.data?.totalRuns ?? 0;
  const successRuns = data?.data?.successfulRuns ?? 0;
  const failedRuns = data?.data?.failedRuns ?? 0;
  const inProgressRuns = data?.data?.inProgressRuns ?? 0;
  const avgDuration = data?.data?.averageDurationMs ?? 0;
  const successRate = totalRuns > 0 ? ((successRuns / totalRuns) * 100).toFixed(1) : '0.0';

  const cards = useMemo(
    () => [
      { label: 'Total Runs', value: totalRuns, tone: 'default' as const, hint: 'All tracked runs' },
      { label: 'Successful', value: successRuns, tone: 'success' as const, hint: `${successRate}% success rate` },
      { label: 'Failed', value: failedRuns, tone: 'danger' as const, hint: 'Requires attention' },
      { label: 'In Progress', value: inProgressRuns, tone: 'info' as const, hint: 'Currently executing' }
    ],
    [totalRuns, successRuns, failedRuns, inProgressRuns, successRate]
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live CI/CD health snapshot across all repositories you have access to."
        actions={
          <div className="flex items-center gap-2">
            <Link className="btn btn-secondary" to="/workflows">
              View all workflows
            </Link>
            <Link className="btn btn-primary" to="/repositories">
              Manage repositories
            </Link>
          </div>
        }
      />

      {/* KPI metrics */}
      {isLoading ? (
        <MetricGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-24 w-full" />
          ))}
        </MetricGrid>
      ) : (
        <MetricGrid>
          {cards.map((card) => (
            <StatCard key={card.label} label={card.label} value={String(card.value)} tone={card.tone} hint={card.hint} />
          ))}
        </MetricGrid>
      )}

      {/* Two-column layout: active runs + quick stats */}
      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Active workflow runs"
          description="Realtime stream via WebSocket"
          className="xl:col-span-2"
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
        </SectionCard>

        <SectionCard title="Quick overview" description="At-a-glance health indicators">
          <div className="space-y-3">
            <div className="surface-muted flex items-center justify-between rounded-lg p-3 text-sm">
              <span className="text-[hsl(var(--text-secondary))]">Success rate</span>
              <span className="font-semibold text-emerald-300">{successRate}%</span>
            </div>
            <div className="surface-muted flex items-center justify-between rounded-lg p-3 text-sm">
              <span className="text-[hsl(var(--text-secondary))]">Avg. duration</span>
              <span className="font-semibold text-[hsl(var(--text-primary))]">
                {avgDuration > 0 ? `${Math.round(avgDuration / 1000)}s` : '—'}
              </span>
            </div>
            <div className="surface-muted flex items-center justify-between rounded-lg p-3 text-sm">
              <span className="text-[hsl(var(--text-secondary))]">Active runs</span>
              <span className="font-semibold text-sky-300">{activeRuns.length}</span>
            </div>
            <div className="surface-muted flex items-center justify-between rounded-lg p-3 text-sm">
              <span className="text-[hsl(var(--text-secondary))]">Total tracked</span>
              <span className="font-semibold text-[hsl(var(--text-primary))]">{totalRuns}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
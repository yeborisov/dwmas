import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Bar } from 'recharts';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { MetricGrid } from '../components/ui/MetricGrid';
import { StatCard } from '../components/ui/StatCard';
import { SectionCard } from '../components/ui/SectionCard';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';

interface FailureRateRow {
  repository: string;
  failureRate: number;
}

export function AnalyticsPage() {
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => (await api.get('/analytics')).data
  });
  const { data: repos, isLoading: isReposLoading } = useQuery({
    queryKey: ['analytics-failure-rate'],
    queryFn: async () => (await api.get('/analytics/failure-rate')).data
  });

  const pieData = [
    { name: 'Success', value: summary?.data?.successfulRuns ?? 0 },
    { name: 'Failed', value: summary?.data?.failedRuns ?? 0 }
  ];
  const totalRuns = summary?.data?.totalRuns ?? 0;
  const failureRows: FailureRateRow[] = repos?.data ?? [];
  const isLoading = isSummaryLoading || isReposLoading;
  const hasAnalyticsData = totalRuns > 0;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Observability overview for delivery reliability, throughput, and repository instability."
        tabs={<Tabs items={[{ to: '/repositories', label: 'Repositories' }, { to: '/analytics', label: 'Analytics', end: true }, { to: '/reports', label: 'Reports' }]} />}
      />

      <MetricGrid>
        <StatCard label="Total Runs" value={summary?.data?.totalRuns ?? 0} />
        <StatCard label="Successful" value={summary?.data?.successfulRuns ?? 0} tone="success" />
        <StatCard label="Failed" value={summary?.data?.failedRuns ?? 0} tone="danger" />
        <StatCard
          label="Failure Rate"
          value={`${(((summary?.data?.failedRuns ?? 0) / Math.max(summary?.data?.totalRuns ?? 1, 1)) * 100).toFixed(1)}%`}
          tone="warning"
        />
      </MetricGrid>

      {isLoading ? <TableSkeleton rows={5} /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Delivery outcome ratio" description="Success vs failure from workflow summary">
          <div className="h-80">
            {!hasAnalyticsData ? (
              <EmptyState title="No workflow runs yet" description="Sync repositories to generate observability metrics." icon="📉" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={110}>
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Failure rate by repository" description="Percent of failed runs per repository">
          <div className="h-80">
            {!failureRows.length ? (
              <EmptyState title="No repository failures" description="Failure rate data appears after completed workflow executions." icon="✅" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failureRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="repository" hide />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip />
                  <Bar dataKey="failureRate" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top unstable repositories" description="Highest failure rates in descending order">
        <div className="space-y-2">
          {!failureRows.length ? (
            <div className="surface-muted rounded-lg p-3 text-sm text-[hsl(var(--text-secondary))]">No unstable repositories yet.</div>
          ) : (
            [...failureRows]
              .sort((a, b) => b.failureRate - a.failureRate)
              .slice(0, 5)
              .map((row) => (
                <div key={row.repository} className="surface-muted flex items-center justify-between rounded-lg p-3 text-sm">
                  <span className="font-medium text-[hsl(var(--text-primary))]">{row.repository}</span>
                  <span className="text-rose-300">{row.failureRate.toFixed(2)}%</span>
                </div>
              ))
          )}
        </div>
      </SectionCard>
    </section>
  );
}

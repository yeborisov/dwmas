import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { MetricGrid } from '../components/ui/MetricGrid';
import { StatCard } from '../components/ui/StatCard';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({
    queryKey: ['public-summary'],
    queryFn: async () => (await api.get('/analytics/summary')).data
  });

  return (
    <section className="space-y-6">
      <div className="surface relative overflow-hidden p-6 md:p-10">
        <div className="relative max-w-2xl space-y-4">
          <PageHeader
            title="DevOps Workflow Monitoring & Analytics System"
            description="Centralized observability for CI/CD performance, failures, and execution flow across your repositories."
          />
          <div className="flex flex-wrap items-center gap-3">
            <Link className="btn btn-primary" to={user ? '/dashboard' : '/login'}>
              {user ? 'Open Dashboard' : 'Sign in with GitHub'}
            </Link>
            <Link className="btn" to="/about">
              Learn more
            </Link>
          </div>
        </div>
      </div>

      <MetricGrid>
        <StatCard label="Total Runs" value={data?.data?.totalRuns ?? 0} hint="All tracked workflow runs" />
        <StatCard
          label="Successful Runs"
          value={data?.data?.successfulRuns ?? 0}
          hint="Healthy delivery rate"
          tone="success"
        />
        <StatCard label="Failed Runs" value={data?.data?.failedRuns ?? 0} hint="Investigate failures" tone="danger" />
        <StatCard
          label="In Progress"
          value={data?.data?.inProgressRuns ?? 0}
          hint="Currently executing"
          tone="info"
        />
      </MetricGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Platform Highlights"
          description="Built for engineering teams that need operational confidence."
          className="lg:col-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Realtime active run monitoring',
              'Repository-level failure analytics',
              'RBAC access for dev, devops, admin roles',
              'Issue and comment collaboration workflow'
            ].map((feature) => (
              <div key={feature} className="surface-muted rounded-lg p-3 text-sm text-slate-300">
                {feature}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Public Summary" description="Snapshot from analytics service">
          <div className="space-y-2 text-sm text-[hsl(var(--text-secondary))]">
            {data ? (
              <>
                <p>Success ratio: {((data.data.successfulRuns / Math.max(data.data.totalRuns, 1)) * 100).toFixed(1)}%</p>
                <p>Failure ratio: {((data.data.failedRuns / Math.max(data.data.totalRuns, 1)) * 100).toFixed(1)}%</p>
                <p>Run health score: {Math.max(0, 100 - data.data.failedRuns)} / 100</p>
              </>
            ) : (
              <LoadingSkeleton className="h-24 w-full" />
            )}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}

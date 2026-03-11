import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const failureRows = repos?.data ?? [];
    const isLoading = isSummaryLoading || isReposLoading;
    const hasAnalyticsData = totalRuns > 0;
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Analytics", description: "Observability overview for delivery reliability, throughput, and repository instability.", tabs: _jsx(Tabs, { items: [{ to: '/repositories', label: 'Repositories' }, { to: '/analytics', label: 'Analytics', end: true }, { to: '/reports', label: 'Reports' }] }) }), _jsxs(MetricGrid, { children: [_jsx(StatCard, { label: "Total Runs", value: summary?.data?.totalRuns ?? 0 }), _jsx(StatCard, { label: "Successful", value: summary?.data?.successfulRuns ?? 0, tone: "success" }), _jsx(StatCard, { label: "Failed", value: summary?.data?.failedRuns ?? 0, tone: "danger" }), _jsx(StatCard, { label: "Failure Rate", value: `${(((summary?.data?.failedRuns ?? 0) / Math.max(summary?.data?.totalRuns ?? 1, 1)) * 100).toFixed(1)}%`, tone: "warning" })] }), isLoading ? _jsx(TableSkeleton, { rows: 5 }) : null, _jsxs("div", { className: "grid gap-4 xl:grid-cols-2", children: [_jsx(SectionCard, { title: "Delivery outcome ratio", description: "Success vs failure from workflow summary", children: _jsx("div", { className: "h-80", children: !hasAnalyticsData ? (_jsx(EmptyState, { title: "No workflow runs yet", description: "Sync repositories to generate observability metrics.", icon: "\uD83D\uDCC9" })) : (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsxs(Pie, { data: pieData, dataKey: "value", outerRadius: 110, children: [_jsx(Cell, { fill: "#22c55e" }), _jsx(Cell, { fill: "#ef4444" })] }), _jsx(Tooltip, {})] }) })) }) }), _jsx(SectionCard, { title: "Failure rate by repository", description: "Percent of failed runs per repository", children: _jsx("div", { className: "h-80", children: !failureRows.length ? (_jsx(EmptyState, { title: "No repository failures", description: "Failure rate data appears after completed workflow executions.", icon: "\u2705" })) : (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: failureRows, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e293b" }), _jsx(XAxis, { dataKey: "repository", hide: true }), _jsx(YAxis, { tick: { fill: '#94a3b8' } }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "failureRate", fill: "#0ea5e9" })] }) })) }) })] }), _jsx(SectionCard, { title: "Top unstable repositories", description: "Highest failure rates in descending order", children: _jsx("div", { className: "space-y-2", children: !failureRows.length ? (_jsx("div", { className: "surface-muted rounded-lg p-3 text-sm text-[hsl(var(--text-secondary))]", children: "No unstable repositories yet." })) : ([...failureRows]
                        .sort((a, b) => b.failureRate - a.failureRate)
                        .slice(0, 5)
                        .map((row) => (_jsxs("div", { className: "surface-muted flex items-center justify-between rounded-lg p-3 text-sm", children: [_jsx("span", { className: "font-medium text-[hsl(var(--text-primary))]", children: row.repository }), _jsxs("span", { className: "text-rose-300", children: [row.failureRate.toFixed(2), "%"] })] }, row.repository)))) }) })] }));
}

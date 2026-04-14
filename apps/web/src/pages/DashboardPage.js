import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export function DashboardPage() {
    const { data, isLoading } = useQuery({ queryKey: ['summary'], queryFn: async () => (await api.get('/analytics')).data });
    const [activeRuns, setActiveRuns] = useState([]);
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_WS_URL || 'http://localhost:4000', { withCredentials: true });
        socket.on('active-runs:updated', (runs) => setActiveRuns(runs));
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
    const cards = useMemo(() => [
        { label: 'Total Runs', value: totalRuns, tone: 'default', hint: 'All tracked runs' },
        { label: 'Successful', value: successRuns, tone: 'success', hint: `${successRate}% success rate` },
        { label: 'Failed', value: failedRuns, tone: 'danger', hint: 'Requires attention' },
        { label: 'In Progress', value: inProgressRuns, tone: 'info', hint: 'Currently executing' }
    ], [totalRuns, successRuns, failedRuns, inProgressRuns, successRate]);
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Dashboard", description: "Live CI/CD health snapshot across all repositories you have access to.", actions: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Link, { className: "btn btn-secondary", to: "/workflows", children: "View all workflows" }), _jsx(Link, { className: "btn btn-primary", to: "/repositories", children: "Manage repositories" })] }) }), isLoading ? (_jsx(MetricGrid, { children: Array.from({ length: 4 }).map((_, i) => (_jsx(LoadingSkeleton, { className: "h-24 w-full" }, i))) })) : (_jsx(MetricGrid, { children: cards.map((card) => (_jsx(StatCard, { label: card.label, value: String(card.value), tone: card.tone, hint: card.hint }, card.label))) })), _jsxs("div", { className: "grid gap-4 xl:grid-cols-3", children: [_jsx(SectionCard, { title: "Active workflow runs", description: "Realtime stream via WebSocket", className: "xl:col-span-2", actions: _jsx(StatusBadge, { status: activeRuns.length ? 'in_progress' : 'queued', className: "text-[11px]" }), children: activeRuns.length === 0 ? (_jsx(EmptyState, { title: "No active runs", description: "No workflows are currently executing.", icon: "\u23F1" })) : (_jsx("ul", { className: "space-y-2 text-sm", children: activeRuns.map((run) => (_jsxs("li", { className: "surface-muted flex items-center justify-between rounded-lg p-3", children: [_jsx("span", { className: "font-medium text-[hsl(var(--text-primary))]", children: run.workflowName }), _jsx(StatusBadge, { status: "in_progress" })] }, run.id))) })) }), _jsx(SectionCard, { title: "Quick overview", description: "At-a-glance health indicators", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "surface-muted flex items-center justify-between rounded-lg p-3 text-sm", children: [_jsx("span", { className: "text-[hsl(var(--text-secondary))]", children: "Success rate" }), _jsxs("span", { className: "font-semibold text-emerald-300", children: [successRate, "%"] })] }), _jsxs("div", { className: "surface-muted flex items-center justify-between rounded-lg p-3 text-sm", children: [_jsx("span", { className: "text-[hsl(var(--text-secondary))]", children: "Avg. duration" }), _jsx("span", { className: "font-semibold text-[hsl(var(--text-primary))]", children: avgDuration > 0 ? `${Math.round(avgDuration / 1000)}s` : '—' })] }), _jsxs("div", { className: "surface-muted flex items-center justify-between rounded-lg p-3 text-sm", children: [_jsx("span", { className: "text-[hsl(var(--text-secondary))]", children: "Active runs" }), _jsx("span", { className: "font-semibold text-sky-300", children: activeRuns.length })] }), _jsxs("div", { className: "surface-muted flex items-center justify-between rounded-lg p-3 text-sm", children: [_jsx("span", { className: "text-[hsl(var(--text-secondary))]", children: "Total tracked" }), _jsx("span", { className: "font-semibold text-[hsl(var(--text-primary))]", children: totalRuns })] })] }) })] })] }));
}

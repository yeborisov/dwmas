import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export function DashboardPage() {
    const { data } = useQuery({ queryKey: ['summary'], queryFn: async () => (await api.get('/analytics')).data });
    const [activeRuns, setActiveRuns] = useState([]);
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_WS_URL || 'http://localhost:4000', { withCredentials: true });
        socket.on('active-runs:updated', (runs) => setActiveRuns(runs));
        return () => {
            socket.disconnect();
        };
    }, []);
    const cards = useMemo(() => [
        ['Total', data?.data?.totalRuns ?? 0],
        ['Success', data?.data?.successfulRuns ?? 0],
        ['Failed', data?.data?.failedRuns ?? 0],
        ['In-progress', data?.data?.inProgressRuns ?? 0]
    ], [data]);
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Dashboard", description: "Live CI/CD health snapshot across all repositories you have access to." }), _jsx(MetricGrid, { children: cards.map(([label, value]) => (_jsx(StatCard, { label: String(label), value: String(value), tone: label === 'Success' ? 'success' : label === 'Failed' ? 'danger' : label === 'In-progress' ? 'info' : 'default' }, String(label)))) }), _jsxs(SectionCard, { title: "Active workflow runs", description: "Realtime stream from WebSocket channel active-runs:updated", actions: _jsx(StatusBadge, { status: activeRuns.length ? 'in_progress' : 'queued', className: "text-[11px]" }), children: [activeRuns.length === 0 ? (_jsx(EmptyState, { title: "No active runs", description: "No workflows are currently executing.", icon: "\u23F1" })) : (_jsx("ul", { className: "space-y-2 text-sm", children: activeRuns.map((run) => (_jsxs("li", { className: "surface-muted flex items-center justify-between rounded-lg p-3", children: [_jsx("span", { className: "font-medium text-[hsl(var(--text-primary))]", children: run.workflowName }), _jsx(StatusBadge, { status: "in_progress" })] }, run.id))) })), !data ? _jsx(LoadingSkeleton, { className: "mt-4 h-10 w-full" }) : null] })] }));
}

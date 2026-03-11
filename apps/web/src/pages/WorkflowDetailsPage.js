import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
export function WorkflowDetailsPage() {
    const { id } = useParams();
    const { data } = useQuery({ queryKey: ['workflow', id], queryFn: async () => (await api.get(`/workflows/${id}`)).data });
    const run = data?.data;
    if (!data) {
        return _jsx(TableSkeleton, { rows: 4 });
    }
    if (!run) {
        return _jsx(EmptyState, { title: "Workflow not found", description: "The requested workflow run does not exist.", icon: "\uD83D\uDD0E" });
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: run.workflowName, description: `Run #${run.id.slice(-6)} in ${run.repository?.fullName || 'unknown repository'}`, actions: _jsxs(_Fragment, { children: [_jsx(StatusBadge, { status: run.status }), _jsx(StatusBadge, { status: run.conclusion || 'neutral' })] }) }), _jsxs(SectionCard, { title: "Run metadata", description: "Execution context and traceability fields", children: [_jsxs("div", { className: "grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3", children: [_jsxs("p", { className: "surface-muted rounded-lg p-3", children: ["Branch: ", _jsx("span", { className: "text-[hsl(var(--text-primary))]", children: run.branch || '-' })] }), _jsxs("p", { className: "surface-muted rounded-lg p-3", children: ["Event: ", _jsx("span", { className: "text-[hsl(var(--text-primary))]", children: run.event || '-' })] }), _jsxs("p", { className: "surface-muted rounded-lg p-3", children: ["Actor: ", _jsx("span", { className: "text-[hsl(var(--text-primary))]", children: run.actor || '-' })] }), _jsxs("p", { className: "surface-muted rounded-lg p-3", children: ["Commit: ", _jsx("span", { className: "text-[hsl(var(--text-primary))]", children: run.commitSha || '-' })] }), _jsxs("p", { className: "surface-muted rounded-lg p-3", children: ["Started: ", _jsx("span", { className: "text-[hsl(var(--text-primary))]", children: run.startedAt ? new Date(run.startedAt).toLocaleString() : '-' })] }), _jsxs("p", { className: "surface-muted rounded-lg p-3", children: ["Duration: ", _jsx("span", { className: "text-[hsl(var(--text-primary))]", children: run.durationMs ? `${Math.round(run.durationMs / 1000)}s` : '-' })] })] }), run.htmlUrl ? (_jsx("a", { className: "btn btn-secondary mt-4", href: run.htmlUrl, target: "_blank", rel: "noreferrer", children: "Open in GitHub" })) : null] }), _jsx(SectionCard, { title: "Jobs", description: "Job-level execution results for this run", children: !run.jobs?.length ? (_jsx(EmptyState, { title: "No jobs found", description: "This run has no stored job records.", icon: "\uD83E\uDDF1" })) : (_jsx(DataTable, { columns: ['Job', 'Status', 'Conclusion', 'Runner', 'Duration'], children: run.jobs.map((job) => (_jsxs(DataTableRow, { children: [_jsx(DataTableCell, { className: "font-medium text-[hsl(var(--text-primary))]", children: job.name }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: job.status }) }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: job.conclusion || 'neutral' }) }), _jsx(DataTableCell, { children: job.runnerName || '-' }), _jsx(DataTableCell, { children: job.durationMs ? `${Math.round(job.durationMs / 1000)}s` : '-' })] }, job.id))) })) }), _jsx(Link, { className: "btn btn-secondary", to: "/workflows", children: "Back to workflows" })] }));
}

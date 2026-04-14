import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { FilterBar } from '../components/ui/FilterBar';
import { FormField } from '../components/ui/FormField';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { Tabs } from '../components/ui/Tabs';
export function WorkflowsPage() {
    const [status, setStatus] = useState('');
    const [actor, setActor] = useState('');
    const [branch, setBranch] = useState('');
    const [repositoryId, setRepositoryId] = useState('');
    const [refreshFromGithub, setRefreshFromGithub] = useState(false);
    const reposQuery = useQuery({ queryKey: ['repos'], queryFn: async () => (await api.get('/repositories')).data });
    const repos = reposQuery.data?.data ?? [];
    const { data, refetch, isLoading, isError, error } = useQuery({
        queryKey: ['workflows', status, actor, branch, repositoryId, refreshFromGithub],
        queryFn: async () => (await api.get('/workflows', {
            params: {
                status: status || undefined,
                actor: actor || undefined,
                branch: branch || undefined,
                repositoryId: repositoryId || undefined,
                refresh: refreshFromGithub ? 'true' : undefined
            }
        })).data
    });
    const runs = useMemo(() => data?.data ?? [], [data]);
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Workflows", description: "CI/CD execution feed with filters for repository, branch, actor, and runtime state.", tabs: _jsx(Tabs, { items: [{ to: '/repositories', label: 'Repositories' }, { to: '/analytics', label: 'Analytics' }, { to: '/reports', label: 'Reports' }] }) }), _jsxs(FilterBar, { children: [_jsx(FormField, { label: "Status", children: _jsxs("select", { className: "field", value: status, onChange: (e) => setStatus(e.target.value), children: [_jsx("option", { value: "", children: "All status" }), _jsx("option", { value: "queued", children: "queued" }), _jsx("option", { value: "in_progress", children: "in_progress" }), _jsx("option", { value: "completed", children: "completed" })] }) }), _jsx(FormField, { label: "Actor", children: _jsx("input", { className: "field", value: actor, onChange: (e) => setActor(e.target.value), placeholder: "e.g. octocat" }) }), _jsx(FormField, { label: "Branch", children: _jsx("input", { className: "field", value: branch, onChange: (e) => setBranch(e.target.value), placeholder: "e.g. main" }) }), _jsx(FormField, { label: "Repository", children: _jsxs("select", { className: "field", value: repositoryId, onChange: (e) => setRepositoryId(e.target.value), children: [_jsx("option", { value: "", children: "All repositories" }), repos.map((repo) => (_jsx("option", { value: repo.id, children: repo.fullName }, repo.id)))] }) }), _jsxs("label", { className: "flex h-10 items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] px-3 text-xs text-[hsl(var(--text-secondary))]", children: [_jsx("input", { type: "checkbox", checked: refreshFromGithub, onChange: (e) => setRefreshFromGithub(e.target.checked) }), "Refresh from GitHub on apply"] }), _jsx("button", { className: "btn btn-primary", onClick: () => refetch(), children: "Apply filters" })] }), isLoading ? _jsx(TableSkeleton, {}) : null, isError ? (_jsx(EmptyState, { title: "Unable to load workflows", description: (error?.response?.data?.message ??
                    'Workflow query failed. Check repository access and sync status.'), action: _jsx("button", { className: "btn btn-secondary", onClick: () => refetch(), children: "Retry" }), icon: "\u26A0" })) : null, data && !isError && runs.length === 0 ? (_jsx(EmptyState, { title: "No workflow runs", description: "No runs match current filters. Connect a repository, click Sync runs, then refresh this page.", icon: "\uD83D\uDEF0" })) : null, runs.length ? (_jsx(DataTable, { columns: ['Workflow', 'Repository', 'Branch', 'Status', 'Conclusion', 'Actor', 'Started', 'Details'], children: runs.map((run) => (_jsxs(DataTableRow, { children: [_jsx(DataTableCell, { className: "font-medium text-[hsl(var(--text-primary))]", children: run.workflowName }), _jsx(DataTableCell, { children: run.repository?.fullName || '-' }), _jsx(DataTableCell, { children: run.branch || '-' }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: run.status }) }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: run.conclusion || 'neutral' }) }), _jsx(DataTableCell, { children: run.actor || '-' }), _jsx(DataTableCell, { children: run.startedAt ? new Date(run.startedAt).toLocaleString() : '-' }), _jsx(DataTableCell, { children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Link, { className: "btn btn-secondary", to: `/workflows/${run.id}`, children: "Open" }), (run.conclusion || '').toLowerCase() === 'failure' ? (_jsx("button", { className: "btn btn-danger", onClick: async () => {
                                            const result = await api.post(`/workflows/${run.id}/issues`);
                                            const issueId = result.data?.data?.id;
                                            if (issueId) {
                                                window.location.href = `/repository/issues/${issueId}`;
                                            }
                                        }, children: "Create Issue" })) : null] }) })] }, run.id))) })) : null] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tabs } from '../components/ui/Tabs';
export function RepositoriesPage() {
    const queryClient = useQueryClient();
    const [owner, setOwner] = useState('');
    const [name, setName] = useState('');
    const [repositoryUrl, setRepositoryUrl] = useState('');
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['repos'],
        queryFn: async () => (await api.get('/repositories')).data,
        staleTime: 30000
    });
    const repos = data?.data ?? [];
    const connectMutation = useMutation({
        mutationFn: async () => api.post('/repositories', {
            owner: owner || undefined,
            name: name || undefined,
            repositoryUrl: repositoryUrl || undefined
        }),
        onSuccess: async () => {
            setOwner('');
            setName('');
            setRepositoryUrl('');
            await queryClient.invalidateQueries({ queryKey: ['repos'] });
        }
    });
    const syncMutation = useMutation({
        mutationFn: async (repoId) => api.post(`/repositories/${repoId}/sync`),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['repos'] });
            await queryClient.invalidateQueries({ queryKey: ['workflows'] });
            await queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
            await queryClient.invalidateQueries({ queryKey: ['analytics-failure-rate'] });
        }
    });
    const syncAllMutation = useMutation({
        mutationFn: async () => api.post('/repositories/sync-all'),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['repos'] });
            await queryClient.invalidateQueries({ queryKey: ['workflows'] });
            await queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
            await queryClient.invalidateQueries({ queryKey: ['analytics-failure-rate'] });
        }
    });
    const connectError = connectMutation.error?.response?.data?.message;
    const syncError = syncMutation.error?.response?.data?.message;
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Repositories", description: "Connect repositories, monitor synchronization health, and manage workflow data sources.", tabs: _jsx(Tabs, { items: [{ to: '/repositories', label: 'Repositories', end: true }, { to: '/analytics', label: 'Analytics' }, { to: '/reports', label: 'Reports' }] }), actions: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "btn btn-secondary", onClick: () => refetch(), children: "Refresh list" }), _jsx("button", { className: "btn btn-primary", onClick: () => syncAllMutation.mutate(), disabled: syncAllMutation.isPending || !repos.length, children: syncAllMutation.isPending ? 'Syncing all...' : 'Sync all repositories' })] }) }), _jsxs(SectionCard, { title: "Connect repository", description: "Register a GitHub repository as a monitored CI/CD source.", children: [_jsxs("p", { className: "mb-3 text-xs text-[hsl(var(--text-muted))]", children: ["You can add by ", _jsx("strong", { children: "owner + repository" }), " or paste full GitHub URL. After connecting, click ", _jsx("strong", { children: "Sync" }), " to import GitHub Actions runs. If the repository has no runs, Workflows will show an explicit empty state."] }), _jsxs("div", { className: "grid gap-3 lg:grid-cols-4", children: [_jsx(FormField, { label: "Owner", className: "lg:col-span-1", children: _jsx("input", { className: "field", value: owner, onChange: (e) => setOwner(e.target.value), placeholder: "owner" }) }), _jsx(FormField, { label: "Repository", className: "lg:col-span-1", children: _jsx("input", { className: "field", value: name, onChange: (e) => setName(e.target.value), placeholder: "repo" }) }), _jsx(FormField, { label: "GitHub URL (optional)", className: "lg:col-span-2", children: _jsx("input", { className: "field", value: repositoryUrl, onChange: (e) => setRepositoryUrl(e.target.value), placeholder: "https://github.com/owner/repository" }) })] }), _jsx("div", { className: "mt-3 flex justify-end", children: _jsx("button", { className: "btn btn-primary", onClick: () => connectMutation.mutate(), disabled: (!owner || !name) && !repositoryUrl, children: connectMutation.isPending ? 'Connecting...' : 'Connect repository' }) }), connectError ? _jsx("p", { className: "mt-3 text-sm text-rose-300", children: connectError }) : null] }), isLoading ? _jsx(TableSkeleton, { rows: 4 }) : null, isError ? (_jsx(EmptyState, { title: "Could not load repositories", description: "We couldn't retrieve repository data. Check your session and try again.", action: _jsx("button", { className: "btn btn-secondary", onClick: () => refetch(), children: "Retry" }), icon: "\u26A0" })) : null, !isLoading && !isError && !repos.length ? (_jsx(EmptyState, { title: "No repositories", description: "Connect your first repository to begin workflow synchronization.", icon: "\uD83E\uDDE9" })) : null, !isLoading && !isError && repos.length ? (_jsx(DataTable, { columns: ['Repository', 'Branch', 'Visibility', 'Access', 'Sync status', 'Last synced', 'Actions'], children: repos.map((repo) => (_jsxs(DataTableRow, { children: [_jsx(DataTableCell, { children: _jsxs("div", { children: [_jsx("p", { className: "font-medium text-[hsl(var(--text-primary))]", children: repo.fullName }), _jsxs("p", { className: "text-xs text-[hsl(var(--text-muted))]", children: ["owner: ", repo.owner || repo.fullName.split('/')[0]] })] }) }), _jsx(DataTableCell, { children: repo.defaultBranch || '-' }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: repo.isPrivate ? 'failure' : 'success', children: repo.isPrivate ? 'Private' : 'Public' }) }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: repo.isActive ? 'active' : 'inactive' }) }), _jsx(DataTableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx(StatusBadge, { status: (repo.syncStatus || 'IDLE').toLowerCase(), children: repo.syncStatus || 'IDLE' }), repo.syncError ? _jsx("p", { className: "text-xs text-rose-300", children: repo.syncError }) : null] }) }), _jsx(DataTableCell, { children: repo.lastSuccessfulSyncAt ? new Date(repo.lastSuccessfulSyncAt).toLocaleString() : 'Never' }), _jsx(DataTableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Link, { className: "btn btn-secondary", to: "/workflows", children: "View runs" }), _jsx("button", { className: "btn", onClick: () => syncMutation.mutate(repo.id), disabled: syncMutation.isPending, children: syncMutation.isPending ? 'Syncing runs...' : 'Sync runs' })] }) })] }, repo.id))) })) : null, syncMutation.isSuccess ? (_jsx("p", { className: "text-sm text-emerald-300", children: "Repository sync completed. Open Workflows to review imported runs." })) : null, syncAllMutation.isSuccess ? (_jsx("p", { className: "text-sm text-emerald-300", children: syncAllMutation.data?.data?.message || 'Bulk repository sync completed.' })) : null, syncError ? _jsx("p", { className: "text-sm text-rose-300", children: syncError }) : null, syncAllMutation.error?.response?.data?.message ? (_jsx("p", { className: "text-sm text-rose-300", children: syncAllMutation.error.response?.data?.message })) : null] }));
}

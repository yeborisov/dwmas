import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
const STORAGE_KEY = 'dwmas_issue_last_seen';
function readLastSeen() {
    if (typeof window === 'undefined')
        return {};
    try {
        return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    }
    catch {
        return {};
    }
}
function writeLastSeen(data) {
    if (typeof window === 'undefined')
        return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
export function MyIssuesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['my-issues'],
        queryFn: async () => (await api.get('/issues/mine')).data
    });
    const issues = data?.data ?? [];
    const lastSeen = useMemo(() => readLastSeen(), []);
    useEffect(() => {
        const next = { ...lastSeen };
        for (const issue of issues) {
            if (!next[issue.id] && issue.updatedAt) {
                next[issue.id] = issue.updatedAt;
            }
        }
        writeLastSeen(next);
    }, [issues, lastSeen]);
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "My Issues", description: "Issues you created or commented on." }), _jsx(SectionCard, { title: "Tracked issues", description: "Updates are highlighted when status or comments change.", children: !issues.length && !isLoading ? (_jsx(EmptyState, { title: "No issues yet", description: "Create or comment on an issue to see it here.", icon: "\uD83E\uDDFE" })) : (_jsx(DataTable, { columns: ['Issue', 'Repository', 'Status', 'Updated', 'Actions'], children: issues.map((issue) => {
                        const last = lastSeen[issue.id];
                        const isUpdated = Boolean(issue.updatedAt && (!last || new Date(issue.updatedAt) > new Date(last)));
                        return (_jsxs(DataTableRow, { highlight: isUpdated, children: [_jsx(DataTableCell, { className: "font-medium text-[hsl(var(--text-primary))]", children: issue.title }), _jsx(DataTableCell, { children: issue.repository?.fullName || '-' }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: issue.status.toLowerCase(), children: issue.status }) }), _jsx(DataTableCell, { children: issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : '-' }), _jsx(DataTableCell, { children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Link, { className: "btn btn-secondary", to: `/repository/issues/${issue.id}`, onClick: () => {
                                                    const next = readLastSeen();
                                                    if (issue.updatedAt)
                                                        next[issue.id] = issue.updatedAt;
                                                    writeLastSeen(next);
                                                }, children: "View" }), issue.githubIssueUrl ? (_jsx("a", { className: "btn btn-secondary", href: issue.githubIssueUrl, target: "_blank", rel: "noreferrer", children: "GitHub" })) : null, isUpdated ? _jsx("span", { className: "text-[10px] uppercase text-amber-200", children: "Updated" }) : null] }) })] }, issue.id));
                    }) })) })] }));
}

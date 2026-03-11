import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useState } from 'react';
import { FormField } from '../components/ui/FormField';
export function UsersPage() {
    const queryClient = useQueryClient();
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRole, setSelectedRole] = useState('DEVELOPER');
    const [selectedRepoIds, setSelectedRepoIds] = useState([]);
    const { data } = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/users')).data });
    const reposQuery = useQuery({ queryKey: ['repos'], queryFn: async () => (await api.get('/repositories')).data });
    const users = data?.data ?? [];
    const repos = reposQuery.data?.data ?? [];
    const updateUserMutation = useMutation({
        mutationFn: async () => api.put(`/users/${selectedUserId}`, {
            role: selectedRole,
            repositoryIds: selectedRepoIds
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
    const selectedUser = users.find((u) => u.id === selectedUserId);
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Users", description: "Administrative view of platform users, role assignments, and repository access." }), _jsxs("div", { className: "surface p-4 space-y-3", children: [_jsxs("p", { className: "text-sm text-[hsl(var(--text-secondary))]", children: ["Role guide: ", _jsx("strong", { className: "text-[hsl(var(--text-primary))]", children: "Developer" }), " sees only assigned/owned repositories,", _jsx("strong", { className: "text-[hsl(var(--text-primary))]", children: " DevOps" }), " sees all repositories and can sync/export, and", _jsx("strong", { className: "text-[hsl(var(--text-primary))]", children: " Admin" }), " manages users and all resources."] }), _jsxs("div", { className: "grid gap-3 lg:grid-cols-4", children: [_jsx(FormField, { label: "User", children: _jsxs("select", { className: "field", value: selectedUserId, onChange: (e) => {
                                        const user = users.find((u) => u.id === e.target.value);
                                        setSelectedUserId(e.target.value);
                                        setSelectedRole(user?.role ?? 'DEVELOPER');
                                        setSelectedRepoIds((user?.assignments ?? []).map((a) => a.repositoryId));
                                    }, children: [_jsx("option", { value: "", children: "Select user" }), users.map((user) => (_jsx("option", { value: user.id, children: user.username }, user.id)))] }) }), _jsx(FormField, { label: "Role", children: _jsxs("select", { className: "field", value: selectedRole, onChange: (e) => setSelectedRole(e.target.value), children: [_jsx("option", { value: "DEVELOPER", children: "Developer" }), _jsx("option", { value: "DEVOPS", children: "DevOps" }), _jsx("option", { value: "ADMIN", children: "Admin" })] }) }), _jsx(FormField, { label: "Repository assignments", children: _jsx("select", { multiple: true, className: "field min-h-[110px]", value: selectedRepoIds, onChange: (e) => {
                                        const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                                        setSelectedRepoIds(values);
                                    }, children: repos.map((repo) => (_jsx("option", { value: repo.id, children: repo.fullName }, repo.id))) }) }), _jsx("div", { className: "flex items-end", children: _jsx("button", { className: "btn btn-primary w-full", disabled: !selectedUserId, onClick: () => updateUserMutation.mutate(), children: updateUserMutation.isPending ? 'Saving...' : 'Save role & assignments' }) })] }), selectedUser ? (_jsxs("p", { className: "text-xs text-[hsl(var(--text-muted))]", children: ["Current assignments: ", selectedUser.assignments.map((a) => a.repository.fullName).join(', ') || 'None'] })) : null] }), !users.length ? (_jsx(EmptyState, { title: "No users found", description: "No user accounts are available.", icon: "\uD83D\uDC65" })) : (_jsx(DataTable, { columns: ['Username', 'Role', 'Status', 'Assigned Repositories'], children: users.map((user) => (_jsxs(DataTableRow, { children: [_jsx(DataTableCell, { className: "font-medium text-[hsl(var(--text-primary))]", children: user.username }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: user.role.toLowerCase() }) }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: user.isActive ? 'success' : 'failure' }) }), _jsx(DataTableCell, { children: user.assignments.map((a) => a.repository.fullName).join(', ') || 'None' })] }, user.id))) }))] }));
}

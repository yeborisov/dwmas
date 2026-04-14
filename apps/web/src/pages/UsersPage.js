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
    const [selectedPassword, setSelectedPassword] = useState('');
    const [resetNotice, setResetNotice] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('DEVELOPER');
    const [newRepoIds, setNewRepoIds] = useState([]);
    const { data } = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/users')).data });
    const reposQuery = useQuery({ queryKey: ['repos'], queryFn: async () => (await api.get('/repositories')).data });
    const users = data?.data ?? [];
    const repos = reposQuery.data?.data ?? [];
    const updateUserMutation = useMutation({
        mutationFn: async () => api.put(`/users/${selectedUserId}`, {
            role: selectedRole,
            repositoryIds: selectedRepoIds,
            password: selectedPassword || undefined
        }),
        onSuccess: async () => {
            setSelectedPassword('');
            setResetNotice(null);
            await queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
    const createUserMutation = useMutation({
        mutationFn: async () => api.post('/users', {
            username: newUsername,
            password: newPassword,
            role: newRole,
            repositoryIds: newRepoIds
        }),
        onSuccess: async () => {
            setNewUsername('');
            setNewPassword('');
            setNewRole('DEVELOPER');
            setNewRepoIds([]);
            await queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
    const deleteUserMutation = useMutation({
        mutationFn: async () => api.delete(`/users/${selectedUserId}`),
        onSuccess: async () => {
            setSelectedUserId('');
            setSelectedRepoIds([]);
            setSelectedPassword('');
            setResetNotice(null);
            await queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
    const hardDeleteUserMutation = useMutation({
        mutationFn: async () => api.delete(`/users/${selectedUserId}/hard`),
        onSuccess: async () => {
            setSelectedUserId('');
            setSelectedRepoIds([]);
            setSelectedPassword('');
            setResetNotice(null);
            await queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
    const resetPasswordMutation = useMutation({
        mutationFn: async () => api.post(`/users/${selectedUserId}/reset-password`),
        onSuccess: async (response) => {
            const tempPassword = response.data?.data?.tempPassword;
            const username = response.data?.data?.username;
            if (tempPassword && username) {
                setResetNotice({ username, tempPassword });
            }
            await queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
    const selectedUser = users.find((u) => u.id === selectedUserId);
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Users", description: "Administrative view of platform users, role assignments, and repository access." }), _jsxs("div", { className: "surface p-4 space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("p", { className: "text-sm text-[hsl(var(--text-secondary))]", children: ["Role guide: ", _jsx("strong", { className: "text-[hsl(var(--text-primary))]", children: "Developer" }), " sees only assigned/owned repositories,", _jsx("strong", { className: "text-[hsl(var(--text-primary))]", children: " DevOps" }), " sees all repositories and can sync/export, and", _jsx("strong", { className: "text-[hsl(var(--text-primary))]", children: " Admin" }), " manages users and all resources."] }), _jsx("button", { className: "btn btn-primary", onClick: () => setIsCreateModalOpen(true), children: "Create user" })] }), _jsxs("div", { className: "grid gap-3 lg:grid-cols-4", children: [_jsx(FormField, { label: "User", children: _jsxs("select", { className: "field", value: selectedUserId, onChange: (e) => {
                                        const user = users.find((u) => u.id === e.target.value);
                                        setSelectedUserId(e.target.value);
                                        setSelectedRole(user?.role ?? 'DEVELOPER');
                                        setSelectedRepoIds((user?.assignments ?? []).map((a) => a.repositoryId));
                                        setResetNotice(null);
                                    }, children: [_jsx("option", { value: "", children: "Select user" }), users.map((user) => (_jsx("option", { value: user.id, children: user.username }, user.id)))] }) }), _jsx(FormField, { label: "Role", children: _jsxs("select", { className: "field", value: selectedRole, onChange: (e) => setSelectedRole(e.target.value), children: [_jsx("option", { value: "DEVELOPER", children: "Developer" }), _jsx("option", { value: "DEVOPS", children: "DevOps" }), _jsx("option", { value: "ADMIN", children: "Admin" })] }) }), _jsx(FormField, { label: "Repository assignments", children: _jsx("select", { multiple: true, className: "field min-h-[110px]", value: selectedRepoIds, onChange: (e) => {
                                        const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                                        setSelectedRepoIds(values);
                                    }, children: repos.map((repo) => (_jsx("option", { value: repo.id, children: repo.fullName }, repo.id))) }) }), _jsx("div", { className: "flex items-end", children: _jsx("button", { className: "btn btn-primary w-full", disabled: !selectedUserId, onClick: () => updateUserMutation.mutate(), children: updateUserMutation.isPending ? 'Saving...' : 'Modify user' }) })] }), selectedUser ? (_jsxs("p", { className: "text-xs text-[hsl(var(--text-muted))]", children: ["Current assignments: ", selectedUser.assignments.map((a) => a.repository.fullName).join(', ') || 'None'] })) : null] }), !users.length ? (_jsx(EmptyState, { title: "No users found", description: "No user accounts are available.", icon: "\uD83D\uDC65" })) : (_jsx(DataTable, { columns: ['Username', 'Role', 'Status', 'Assigned Repositories'], children: users.map((user) => (_jsxs(DataTableRow, { onClick: () => {
                        setSelectedUserId(user.id);
                        setSelectedRole(user.role);
                        setSelectedRepoIds(user.assignments.map((assignment) => assignment.repositoryId));
                        setResetNotice(null);
                    }, highlight: selectedUserId === user.id, className: "cursor-pointer hover:bg-[hsl(var(--surface-hover))]", children: [_jsx(DataTableCell, { className: "font-medium text-[hsl(var(--text-primary))]", children: user.username }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: user.role.toLowerCase() }) }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: user.isActive ? 'success' : 'failure' }) }), _jsx(DataTableCell, { children: user.assignments.map((a) => a.repository.fullName).join(', ') || 'None' })] }, user.id))) })), selectedUser ? (_jsxs("div", { className: "surface p-4 space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-[hsl(var(--text-muted))]", children: "Selected user" }), _jsx("p", { className: "text-base font-semibold text-[hsl(var(--text-primary))]", children: selectedUser.username })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { className: "btn btn-secondary", disabled: !selectedUserId || resetPasswordMutation.isPending, onClick: () => resetPasswordMutation.mutate(), children: resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password' }), _jsx("button", { className: "btn btn-danger", disabled: !selectedUserId || deleteUserMutation.isPending, onClick: () => {
                                            if (window.confirm(`Deactivate ${selectedUser.username}?`)) {
                                                deleteUserMutation.mutate();
                                            }
                                        }, children: deleteUserMutation.isPending ? 'Deactivating...' : 'Deactivate user' }), _jsx("button", { className: "btn btn-danger", disabled: !selectedUserId || hardDeleteUserMutation.isPending, onClick: () => {
                                            if (window.confirm(`Permanently delete ${selectedUser.username}? This cannot be undone.`)) {
                                                hardDeleteUserMutation.mutate();
                                            }
                                        }, children: hardDeleteUserMutation.isPending ? 'Deleting...' : 'Delete user' })] })] }), _jsx(FormField, { label: "Set new password (optional)", children: _jsx("input", { className: "field", type: "password", value: selectedPassword, onChange: (e) => setSelectedPassword(e.target.value), placeholder: "leave blank to keep current" }) }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { className: "btn btn-primary", disabled: !selectedUserId, onClick: () => updateUserMutation.mutate(), children: updateUserMutation.isPending ? 'Saving...' : 'Modify user' }), _jsx("button", { className: "btn btn-secondary", disabled: !selectedUserId, onClick: () => setSelectedPassword(''), children: "Clear password" })] }), _jsx("p", { className: "text-xs text-[hsl(var(--text-muted))]", children: "Resetting will generate a new temporary password. Deactivating will set the user inactive." }), resetNotice ? (_jsxs("div", { className: "rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100", children: ["Temporary password for ", _jsx("span", { className: "font-semibold", children: resetNotice.username }), ": ", ' ', _jsx("span", { className: "font-mono text-[11px]", children: resetNotice.tempPassword })] })) : null] })) : null, isCreateModalOpen ? (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4", children: _jsxs("div", { className: "surface w-full max-w-2xl rounded-xl p-5 shadow-xl", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-[hsl(var(--text-primary))]", children: "Create user" }), _jsx("p", { className: "text-sm text-[hsl(var(--text-muted))]", children: "Set credentials, role, and repository access." })] }), _jsx("button", { className: "btn btn-ghost", onClick: () => setIsCreateModalOpen(false), children: "Close" })] }), _jsxs("div", { className: "mt-4 grid gap-3 lg:grid-cols-2", children: [_jsx(FormField, { label: "Username", children: _jsx("input", { className: "field", value: newUsername, onChange: (e) => setNewUsername(e.target.value), placeholder: "username" }) }), _jsx(FormField, { label: "Password", children: _jsx("input", { className: "field", type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), placeholder: "set a password" }) }), _jsx(FormField, { label: "Role", children: _jsxs("select", { className: "field", value: newRole, onChange: (e) => setNewRole(e.target.value), children: [_jsx("option", { value: "DEVELOPER", children: "Developer" }), _jsx("option", { value: "DEVOPS", children: "DevOps" }), _jsx("option", { value: "ADMIN", children: "Admin" })] }) }), _jsx(FormField, { label: "Repositories (optional)", children: _jsx("select", { multiple: true, className: "field min-h-[110px]", value: newRepoIds, onChange: (e) => {
                                            const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                                            setNewRepoIds(values);
                                        }, children: repos.map((repo) => (_jsx("option", { value: repo.id, children: repo.fullName }, repo.id))) }) })] }), _jsxs("div", { className: "mt-4 flex flex-wrap justify-end gap-2", children: [_jsx("button", { className: "btn btn-secondary", onClick: () => setIsCreateModalOpen(false), children: "Cancel" }), _jsx("button", { className: "btn btn-primary", disabled: !newUsername || !newPassword, onClick: () => {
                                        createUserMutation.mutate();
                                        setIsCreateModalOpen(false);
                                    }, children: createUserMutation.isPending ? 'Creating...' : 'Create user' })] })] }) })) : null] }));
}

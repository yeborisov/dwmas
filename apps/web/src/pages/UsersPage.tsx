import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useState } from 'react';
import { FormField } from '../components/ui/FormField';

interface UserRow {
  id: string;
  username: string;
  role: 'DEVELOPER' | 'DEVOPS' | 'ADMIN';
  isActive: boolean;
  assignments: Array<{ repositoryId: string; repository: { id: string; fullName: string } }>;
}

export function UsersPage() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'DEVELOPER' | 'DEVOPS' | 'ADMIN'>('DEVELOPER');
  const [selectedRepoIds, setSelectedRepoIds] = useState<string[]>([]);
  const [selectedPassword, setSelectedPassword] = useState('');
  const [resetNotice, setResetNotice] = useState<{ username: string; tempPassword: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'DEVELOPER' | 'DEVOPS' | 'ADMIN'>('DEVELOPER');
  const [newRepoIds, setNewRepoIds] = useState<string[]>([]);

  const { data } = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/users')).data });
  const reposQuery = useQuery({ queryKey: ['repos'], queryFn: async () => (await api.get('/repositories')).data });
  const users: UserRow[] = data?.data ?? [];
  const repos: Array<{ id: string; fullName: string }> = reposQuery.data?.data ?? [];

  const updateUserMutation = useMutation({
    mutationFn: async () =>
      api.put(`/users/${selectedUserId}`, {
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
    mutationFn: async () =>
      api.post('/users', {
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

  return (
    <section className="space-y-6">
      <PageHeader
        title="Users"
        description="Administrative view of platform users, role assignments, and repository access."
      />

      <div className="surface p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Role guide: <strong className="text-[hsl(var(--text-primary))]">Developer</strong> sees only assigned/owned repositories,
            <strong className="text-[hsl(var(--text-primary))]"> DevOps</strong> sees all repositories and can sync/export, and
            <strong className="text-[hsl(var(--text-primary))]"> Admin</strong> manages users and all resources.
          </p>
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            Create user
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-4">
          <FormField label="User">
            <select
              className="field"
              value={selectedUserId}
              onChange={(e) => {
                const user = users.find((u) => u.id === e.target.value);
                setSelectedUserId(e.target.value);
                setSelectedRole(user?.role ?? 'DEVELOPER');
                setSelectedRepoIds((user?.assignments ?? []).map((a) => a.repositoryId));
                setResetNotice(null);
              }}
            >
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Role">
            <select className="field" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRow['role'])}>
              <option value="DEVELOPER">Developer</option>
              <option value="DEVOPS">DevOps</option>
              <option value="ADMIN">Admin</option>
            </select>
          </FormField>

          <FormField label="Repository assignments">
            <select
              multiple
              className="field min-h-[110px]"
              value={selectedRepoIds}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                setSelectedRepoIds(values);
              }}
            >
              {repos.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.fullName}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex items-end">
            <button className="btn btn-primary w-full" disabled={!selectedUserId} onClick={() => updateUserMutation.mutate()}>
              {updateUserMutation.isPending ? 'Saving...' : 'Modify user'}
            </button>
          </div>
        </div>
        {selectedUser ? (
          <p className="text-xs text-[hsl(var(--text-muted))]">
            Current assignments: {selectedUser.assignments.map((a) => a.repository.fullName).join(', ') || 'None'}
          </p>
        ) : null}
      </div>

      {!users.length ? (
        <EmptyState title="No users found" description="No user accounts are available." icon="👥" />
      ) : (
        <DataTable columns={['Username', 'Role', 'Status', 'Assigned Repositories']}>
          {users.map((user) => (
            <DataTableRow
              key={user.id}
              onClick={() => {
                setSelectedUserId(user.id);
                setSelectedRole(user.role);
                setSelectedRepoIds(user.assignments.map((assignment) => assignment.repositoryId));
                setResetNotice(null);
              }}
              highlight={selectedUserId === user.id}
              className="cursor-pointer hover:bg-[hsl(var(--surface-hover))]"
            >
              <DataTableCell className="font-medium text-[hsl(var(--text-primary))]">{user.username}</DataTableCell>
              <DataTableCell>
                <StatusBadge status={user.role.toLowerCase()} />
              </DataTableCell>
              <DataTableCell>
                <StatusBadge status={user.isActive ? 'success' : 'failure'} />
              </DataTableCell>
              <DataTableCell>{user.assignments.map((a) => a.repository.fullName).join(', ') || 'None'}</DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      )}

      {selectedUser ? (
        <div className="surface p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-[hsl(var(--text-muted))]">Selected user</p>
              <p className="text-base font-semibold text-[hsl(var(--text-primary))]">{selectedUser.username}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-secondary"
                disabled={!selectedUserId || resetPasswordMutation.isPending}
                onClick={() => resetPasswordMutation.mutate()}
              >
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
              </button>
              <button
                className="btn btn-danger"
                disabled={!selectedUserId || deleteUserMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Deactivate ${selectedUser.username}?`)) {
                    deleteUserMutation.mutate();
                  }
                }}
              >
                {deleteUserMutation.isPending ? 'Deactivating...' : 'Deactivate user'}
              </button>
              <button
                className="btn btn-danger"
                disabled={!selectedUserId || hardDeleteUserMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Permanently delete ${selectedUser.username}? This cannot be undone.`)) {
                    hardDeleteUserMutation.mutate();
                  }
                }}
              >
                {hardDeleteUserMutation.isPending ? 'Deleting...' : 'Delete user'}
              </button>
            </div>
          </div>
          <FormField label="Set new password (optional)">
            <input
              className="field"
              type="password"
              value={selectedPassword}
              onChange={(e) => setSelectedPassword(e.target.value)}
              placeholder="leave blank to keep current"
            />
          </FormField>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" disabled={!selectedUserId} onClick={() => updateUserMutation.mutate()}>
              {updateUserMutation.isPending ? 'Saving...' : 'Modify user'}
            </button>
            <button
              className="btn btn-secondary"
              disabled={!selectedUserId}
              onClick={() => setSelectedPassword('')}
            >
              Clear password
            </button>
          </div>
          <p className="text-xs text-[hsl(var(--text-muted))]">
            Resetting will generate a new temporary password. Deactivating will set the user inactive.
          </p>
          {resetNotice ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Temporary password for <span className="font-semibold">{resetNotice.username}</span>: {' '}
              <span className="font-mono text-[11px]">{resetNotice.tempPassword}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="surface w-full max-w-2xl rounded-xl p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Create user</h3>
                <p className="text-sm text-[hsl(var(--text-muted))]">Set credentials, role, and repository access.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <FormField label="Username">
                <input className="field" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="username" />
              </FormField>
              <FormField label="Password">
                <input
                  className="field"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="set a password"
                />
              </FormField>
              <FormField label="Role">
                <select className="field" value={newRole} onChange={(e) => setNewRole(e.target.value as UserRow['role'])}>
                  <option value="DEVELOPER">Developer</option>
                  <option value="DEVOPS">DevOps</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </FormField>
              <FormField label="Repositories (optional)">
                <select
                  multiple
                  className="field min-h-[110px]"
                  value={newRepoIds}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                    setNewRepoIds(values);
                  }}
                >
                  {repos.map((repo) => (
                    <option key={repo.id} value={repo.id}>
                      {repo.fullName}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!newUsername || !newPassword}
                onClick={() => {
                  createUserMutation.mutate();
                  setIsCreateModalOpen(false);
                }}
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create user'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

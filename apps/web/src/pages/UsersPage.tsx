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

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Users"
        description="Administrative view of platform users, role assignments, and repository access."
      />

      <div className="surface p-4 space-y-3">
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          Role guide: <strong className="text-[hsl(var(--text-primary))]">Developer</strong> sees only assigned/owned repositories,
          <strong className="text-[hsl(var(--text-primary))]"> DevOps</strong> sees all repositories and can sync/export, and
          <strong className="text-[hsl(var(--text-primary))]"> Admin</strong> manages users and all resources.
        </p>
        <div className="grid gap-3 lg:grid-cols-4">
          <FormField label="New user">
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
          <FormField label="Set new password (optional)">
            <input
              className="field"
              type="password"
              value={selectedPassword}
              onChange={(e) => setSelectedPassword(e.target.value)}
              placeholder="leave blank to keep current"
            />
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
          <div className="flex items-end">
            <button
              className="btn btn-primary w-full"
              disabled={!newUsername || !newPassword}
              onClick={() => createUserMutation.mutate()}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create user'}
            </button>
          </div>
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
              {updateUserMutation.isPending ? 'Saving...' : 'Save role & assignments'}
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
            <DataTableRow key={user.id}>
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
    </section>
  );
}

import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './lib/api';
import { useAuthStore } from './store/auth';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { WorkflowDetailsPage } from './pages/WorkflowDetailsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { ProfilePage } from './pages/ProfilePage';
import { UsersPage } from './pages/UsersPage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { MyIssuesPage } from './pages/MyIssuesPage';
import { ReportsPage } from './pages/ReportsPage';

function AuthRedirect({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  if (isBootstrapping) return children;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export function AppRouter() {
  const setUser = useAuthStore((s) => s.setUser);
  const setBootstrapping = useAuthStore((s) => s.setBootstrapping);
  const meQuery = useQuery({
    queryKey: ['me-bootstrap'],
    queryFn: async () => (await api.get('/me')).data,
    retry: false
  });

  useEffect(() => {
    if (meQuery.data?.data) {
      setUser({
        id: meQuery.data.data.id,
        username: meQuery.data.data.username,
        role: meQuery.data.data.role
      });
      setBootstrapping(false);
      return;
    }

    if (meQuery.isSuccess && !meQuery.data?.data) {
      setUser(null);
      setBootstrapping(false);
      return;
    }

    if (meQuery.isError) {
      setUser(null);
      setBootstrapping(false);
    }
  }, [meQuery.data, meQuery.isError, meQuery.isSuccess, setBootstrapping, setUser]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AuthRedirect><HomePage /></AuthRedirect>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workflows"
          element={
            <ProtectedRoute>
              <WorkflowsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workflows/:id"
          element={
            <ProtectedRoute>
              <WorkflowDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repositories"
          element={
            <ProtectedRoute>
              <RepositoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repository/issues/:id"
          element={
            <ProtectedRoute>
              <IssueDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repository/issues/:issueId/comments/:commentId"
          element={
            <ProtectedRoute>
              <IssueDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issues"
          element={
            <ProtectedRoute>
              <MyIssuesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

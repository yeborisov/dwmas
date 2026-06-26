import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
function AuthRedirect({ children }) {
    const user = useAuthStore((s) => s.user);
    const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
    if (isBootstrapping)
        return children;
    if (user)
        return _jsx(Navigate, { to: "/dashboard", replace: true });
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
    return (_jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { path: "/", element: _jsx(AuthRedirect, { children: _jsx(HomePage, {}) }) }), _jsx(Route, { path: "/about", element: _jsx(AboutPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(AuthRedirect, { children: _jsx(LoginPage, {}) }) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/workflows", element: _jsx(ProtectedRoute, { children: _jsx(WorkflowsPage, {}) }) }), _jsx(Route, { path: "/workflows/:id", element: _jsx(ProtectedRoute, { children: _jsx(WorkflowDetailsPage, {}) }) }), _jsx(Route, { path: "/analytics", element: _jsx(ProtectedRoute, { children: _jsx(AnalyticsPage, {}) }) }), _jsx(Route, { path: "/repositories", element: _jsx(ProtectedRoute, { children: _jsx(RepositoriesPage, {}) }) }), _jsx(Route, { path: "/repository/issues/:id", element: _jsx(ProtectedRoute, { children: _jsx(IssueDetailsPage, {}) }) }), _jsx(Route, { path: "/repository/issues/:issueId/comments/:commentId", element: _jsx(ProtectedRoute, { children: _jsx(IssueDetailsPage, {}) }) }), _jsx(Route, { path: "/issues", element: _jsx(ProtectedRoute, { children: _jsx(MyIssuesPage, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/reports", element: _jsx(ProtectedRoute, { children: _jsx(ReportsPage, {}) }) }), _jsx(Route, { path: "/users", element: _jsx(ProtectedRoute, { roles: ['ADMIN'], children: _jsx(UsersPage, {}) }) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}

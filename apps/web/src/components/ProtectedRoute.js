import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { TableSkeleton } from './ui/LoadingSkeleton';
export function ProtectedRoute({ children, roles }) {
    const user = useAuthStore((s) => s.user);
    const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
    if (isBootstrapping) {
        return (_jsx("div", { className: "space-y-4", children: _jsx(TableSkeleton, { rows: 4 }) }));
    }
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (roles && !roles.includes(user.role))
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    return children;
}

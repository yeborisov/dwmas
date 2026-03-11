import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { TableSkeleton } from './ui/LoadingSkeleton';

interface Props {
  children: JSX.Element;
  roles?: Array<'DEVELOPER' | 'DEVOPS' | 'ADMIN'>;
}

export function ProtectedRoute({ children, roles }: Props) {
  const user = useAuthStore((s) => s.user);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  if (isBootstrapping) {
    return (
      <div className="space-y-4">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

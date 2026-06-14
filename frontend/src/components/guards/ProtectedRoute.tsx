import { Navigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import type { Permission } from '../../types';
import { canAccessRoute } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
}

export default function ProtectedRoute({ children, requiredPermissions }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions && !canAccessRoute(user?.role ?? null, requiredPermissions)) {
    const dashboardMap = {
      admin: '/admin/dashboard',
      hr: '/hr/dashboard',
      manager: '/manager/dashboard',
      employee: '/employee/dashboard',
    } as const;
    const redirectPath = user?.role ? dashboardMap[user.role] : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

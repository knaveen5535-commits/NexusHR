import { Navigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import type { Permission, UserRole } from '../../types';
import { canAccessRoute } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
}

export default function ProtectedRoute({ children, requiredPermissions, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = !requiredRoles || (user?.role && requiredRoles.includes(user.role));
  const hasPermission = !requiredPermissions || canAccessRoute(user?.role ?? null, requiredPermissions);

  if (!hasRole || !hasPermission) {
    const dashboardMap = {
      admin: '/admin/dashboard',
      hr: '/hr/dashboard',
      manager: '/manager/dashboard',
      employee: '/employee/dashboard',
    } as const;
    
    // Redirect to their own dashboard if they lack permission/role for the current route
    const redirectPath = user?.role ? dashboardMap[user.role] : '/login';
    
    // Prevent infinite redirect loops if they somehow don't even have access to their own dashboard
    if (window.location.pathname === redirectPath) {
      return <Navigate to="/login" replace />;
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

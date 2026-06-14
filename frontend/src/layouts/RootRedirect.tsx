import { Navigate } from 'react-router';
import { useAuthStore } from '../store/authStore';

const ROLE_LOGIN_MAP = {
  admin: '/admin/dashboard',
  hr: '/hr/dashboard',
  manager: '/manager/dashboard',
  employee: '/employee/dashboard',
} as const;

export default function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const target = user?.role ? ROLE_LOGIN_MAP[user.role as keyof typeof ROLE_LOGIN_MAP] : '/login';
  return <Navigate to={target} replace />;
}

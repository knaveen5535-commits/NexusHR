import { useAuthStore } from '../store/authStore';
import type { Permission } from '../types';
import { hasPermission, hasAnyPermission } from '../utils/permissions';

export function useRole() {
  const user = useAuthStore((s) => s.user);
  return {
    role: user?.role ?? null,
    user,
    isAdmin: user?.role === 'admin',
    isHR: user?.role === 'hr',
    isManager: user?.role === 'manager',
    isEmployee: user?.role === 'employee',
  };
}

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  return {
    can: (permission: Permission) => {
      if (!user?.role) return false;
      return hasPermission(user.role, permission);
    },
    canAny: (permissions: Permission[]) => {
      if (!user?.role) return false;
      return hasAnyPermission(user.role, permissions);
    },
  };
}

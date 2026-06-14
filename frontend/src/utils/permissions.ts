import type { Permission, UserRole } from '../types';

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'manage:users', 'manage:hrs', 'manage:managers', 'manage:employees',
    'view:analytics', 'view:attendance', 'view:payroll',
    'configure:system', 'manage:permissions', 'access:ai-insights', 'view:audit-logs',
    'manage:leave', 'manage:onboarding', 'assign:managers',
    'view:performance', 'approve:leave', 'manage:goals', 'generate:reports',
    'chat:ai',
  ],
  hr: [
    'manage:employees', 'manage:leave', 'manage:onboarding',
    'assign:managers', 'view:attendance', 'view:payroll',
    'view:performance', 'view:analytics', 'access:ai-insights',
    'generate:reports', 'approve:leave', 'chat:ai',
  ],
  manager: [
    'access:team', 'approve:leave', 'view:performance',
    'manage:goals', 'view:attendance', 'generate:reports',
    'view:analytics', 'chat:ai',
  ],
  employee: [
    'view:own-profile', 'apply:leave', 'view:own-payroll',
    'view:attendance', 'view:performance', 'chat:ai',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

export function canAccessRoute(role: UserRole | null, requiredPermissions?: Permission[]): boolean {
  if (!role) return false;
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return hasAnyPermission(role, requiredPermissions);
}

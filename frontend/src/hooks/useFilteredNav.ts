import { useMemo } from 'react';
import type { Permission, NavItem, UserRole } from '../types';
import { hasAnyPermission } from '../utils/permissions';

export function useFilteredNav(navItems: NavItem[], role: string | null): NavItem[] {
  return useMemo(() => {
    if (!role) return [];
    const userRole = role as UserRole;
    return navItems
      .filter((item) => {
        if (!item.permissions || item.permissions.length === 0) return true;
        return hasAnyPermission(userRole, item.permissions as Permission[]);
      })
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) => {
              if (!child.permissions || child.permissions.length === 0) return true;
              return hasAnyPermission(userRole, child.permissions as Permission[]);
            }),
          };
        }
        return item;
      });
  }, [navItems, role]);
}

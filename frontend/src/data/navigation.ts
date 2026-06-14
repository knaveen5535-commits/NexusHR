import type { NavItem } from '../types';

export const adminNav: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { name: 'Employees', href: '/admin/employees', icon: 'Users', permissions: ['manage:employees'] },
  { name: 'HR Managers', href: '/admin/hr-managers', icon: 'UserCheck', permissions: ['manage:hrs'] },
  { name: 'Managers', href: '/admin/managers', icon: 'UserCog', permissions: ['manage:managers'] },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: 'BarChart3',
    permissions: ['view:analytics'],
    children: [
      { name: 'Attendance', href: '/admin/analytics/attendance', icon: 'CalendarCheck' },
      { name: 'Payroll', href: '/admin/analytics/payroll', icon: 'DollarSign' },
      { name: 'Performance', href: '/admin/analytics/performance', icon: 'TrendingUp' },
    ],
  },
  { name: 'Attendance', href: '/admin/attendance', icon: 'Calendar', permissions: ['view:attendance'] },
  { name: 'Payroll', href: '/admin/payroll', icon: 'DollarSign', permissions: ['view:payroll'] },
  { name: 'AI Insights', href: '/admin/ai-insights', icon: 'Sparkles', permissions: ['access:ai-insights'], badge: 'AI' },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: 'ScrollText', permissions: ['view:audit-logs'] },
  { name: 'Settings', href: '/admin/settings', icon: 'Settings', permissions: ['configure:system'] },
];

export const hrNav: NavItem[] = [
  { name: 'Dashboard', href: '/hr/dashboard', icon: 'LayoutDashboard' },
  { name: 'Employees', href: '/hr/employees', icon: 'Users', permissions: ['manage:employees'] },
  { name: 'Attendance', href: '/hr/attendance', icon: 'Calendar', permissions: ['view:attendance'] },
  { name: 'Leave Management', href: '/hr/leave', icon: 'FileText', permissions: ['manage:leave'] },
  { name: 'Payroll', href: '/hr/payroll', icon: 'DollarSign', permissions: ['view:payroll'] },
  { name: 'Performance', href: '/hr/performance', icon: 'TrendingUp', permissions: ['view:performance'] },
  { name: 'Onboarding', href: '/hr/onboarding', icon: 'UserPlus', permissions: ['manage:onboarding'] },
  { name: 'AI Reports', href: '/hr/ai-reports', icon: 'Sparkles', permissions: ['access:ai-insights'], badge: 'AI' },
];

export const managerNav: NavItem[] = [
  { name: 'Dashboard', href: '/manager/dashboard', icon: 'LayoutDashboard' },
  { name: 'My Team', href: '/manager/team', icon: 'Users', permissions: ['access:team'] },
  { name: 'Attendance', href: '/manager/attendance', icon: 'Calendar', permissions: ['view:attendance'] },
  { name: 'Performance', href: '/manager/performance', icon: 'TrendingUp', permissions: ['view:performance'] },
  { name: 'Leave Approvals', href: '/manager/leave-approvals', icon: 'FileCheck', permissions: ['approve:leave'], badge: '3' },
  { name: 'Reports', href: '/manager/reports', icon: 'BarChart3', permissions: ['generate:reports'] },
  { name: 'Team AI', href: '/manager/ai-insights', icon: 'Sparkles', permissions: ['chat:ai'], badge: 'AI' },
];

export const employeeNav: NavItem[] = [
  { name: 'Dashboard', href: '/employee/dashboard', icon: 'LayoutDashboard' },
  { name: 'My Profile', href: '/employee/profile', icon: 'User', permissions: ['view:own-profile'] },
  { name: 'Attendance', href: '/employee/attendance', icon: 'Calendar', permissions: ['view:attendance'] },
  { name: 'Apply Leave', href: '/employee/leave', icon: 'FileText', permissions: ['apply:leave'] },
  { name: 'Payroll', href: '/employee/payroll', icon: 'DollarSign', permissions: ['view:own-payroll'] },
  { name: 'Performance', href: '/employee/performance', icon: 'TrendingUp', permissions: ['view:performance'] },
  { name: 'AI Assistant', href: '/employee/ai-assistant', icon: 'Sparkles', permissions: ['chat:ai'], badge: 'AI' },
];

export function getNavForRole(role: string | undefined): NavItem[] {
  switch (role) {
    case 'admin': return adminNav;
    case 'hr': return hrNav;
    case 'manager': return managerNav;
    case 'employee': return employeeNav;
    default: return [];
  }
}

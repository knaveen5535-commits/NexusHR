import type { NavItem } from '../types';

export const adminNav: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { name: 'Employee Management', href: '/admin/employees', icon: 'Users', permissions: ['manage:employees'] },
  { name: 'Department Management', href: '/admin/departments', icon: 'Building', permissions: ['view:analytics'] },
  { name: 'Designation Management', href: '/admin/designations', icon: 'Badge', permissions: ['view:analytics'] },
  { name: 'Role Management', href: '/admin/roles', icon: 'Shield', permissions: ['view:analytics'] },
  { name: 'Performance Admin', href: '/admin/performance', icon: 'TrendingUp', permissions: ['view:analytics'] },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: 'FileText',
    permissions: ['view:analytics'],
    children: [
      { name: 'Employee Report', href: '/admin/reports/employees', icon: 'Users' },
      { name: 'Payroll Report', href: '/admin/reports/payroll', icon: 'DollarSign' },
      { name: 'Attendance Report', href: '/admin/reports/attendance', icon: 'CalendarCheck' },
      { name: 'Performance Report', href: '/admin/reports/performance', icon: 'TrendingUp' },
      { name: 'AI Insights', href: '/admin/reports/ai', icon: 'Brain', badge: 'AI' },
    ],
  },
  { name: 'System Settings', href: '/admin/settings', icon: 'Settings', permissions: ['configure:system'] },
  { name: 'Resignations', href: '/admin/resignations', icon: 'UserMinus', permissions: ['manage:employees'] },
  { name: 'Profile Approvals', href: '/admin/profile-requests', icon: 'UserCheck', permissions: ['manage:employees'] },
  { name: 'Document Approvals', href: '/admin/document-approvals', icon: 'FileCheck', permissions: ['manage:employees'] },
];

export const hrNav: NavItem[] = [
  { name: 'Dashboard', href: '/hr/dashboard', icon: 'LayoutDashboard' },
  { name: 'My Profile', href: '/hr/profile', icon: 'User', permissions: ['view:own-profile'] },
  { name: 'Employees', href: '/hr/employees', icon: 'Users', permissions: ['manage:employees'] },
  { name: 'Resignations', href: '/hr/resignations', icon: 'UserMinus', permissions: ['manage:employees'] },
  { name: 'Document Approvals', href: '/hr/document-approvals', icon: 'FileCheck', permissions: ['manage:employees'] },
  { name: 'Attendance', href: '/hr/attendance', icon: 'Calendar', permissions: ['view:attendance'] },
  { name: 'Leave Management', href: '/hr/leave', icon: 'FileText', permissions: ['manage:leave'] },
  { name: 'Payroll', href: '/hr/payroll', icon: 'DollarSign', permissions: ['view:payroll'] },
  { name: 'Performance', href: '/hr/performance', icon: 'TrendingUp', permissions: ['view:performance'] },
  { name: 'Onboarding', href: '/hr/onboarding', icon: 'UserPlus', permissions: ['manage:onboarding'] },
  {
    name: 'Reports',
    href: '/hr/reports',
    icon: 'FileText',
    permissions: ['view:analytics'],
    children: [
      { name: 'Employee Report', href: '/hr/reports/employees', icon: 'Users' },
      { name: 'Payroll Report', href: '/hr/reports/payroll', icon: 'DollarSign' },
      { name: 'Attendance Report', href: '/hr/reports/attendance', icon: 'CalendarCheck' },
      { name: 'Performance Report', href: '/hr/reports/performance', icon: 'TrendingUp' },
      { name: 'AI Insights', href: '/hr/reports/ai', icon: 'Brain', badge: 'AI' },
    ],
  },
  { name: 'AI Assistant', href: '/hr/ai-reports', icon: 'Sparkles', permissions: ['access:ai-insights'], badge: 'AI' },
];

export const managerNav: NavItem[] = [
  { name: 'Dashboard', href: '/manager/dashboard', icon: 'LayoutDashboard' },
  { name: 'My Profile', href: '/manager/profile', icon: 'User', permissions: ['view:own-profile'] },
  { name: 'My Team', href: '/manager/team', icon: 'Users', permissions: ['access:team'] },
  {
    name: 'Attendance',
    href: '/manager/attendance',
    icon: 'Calendar',
    permissions: ['view:attendance'],
    children: [
      { name: 'My Attendance', href: '/manager/my-attendance', icon: 'Clock' },
      { name: 'Team Attendance', href: '/manager/team-attendance', icon: 'Users' },
    ],
  },
  {
    name: 'Performance',
    href: '/manager/performance',
    icon: 'TrendingUp',
    permissions: ['view:performance'],
    children: [
      { name: 'My Performance', href: '/manager/my-performance', icon: 'User' },
      { name: 'Team Performance', href: '/manager/team-performance', icon: 'Users' },
    ],
  },
  { name: 'Leave Approvals', href: '/manager/leave-approvals', icon: 'FileCheck', permissions: ['approve:leave'], badge: '3' },
  { name: 'Profile Approvals', href: '/manager/profile-requests', icon: 'UserCheck', permissions: ['access:team'] },

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
  switch (role?.toLowerCase()) {
    case 'admin': return adminNav;
    case 'hr': return hrNav;
    case 'manager': return managerNav;
    case 'employee': return employeeNav;
    default: return [];
  }
}

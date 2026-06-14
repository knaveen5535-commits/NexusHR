export type UserRole = 'admin' | 'hr' | 'manager' | 'employee';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export type Permission =
  | 'manage:users'
  | 'manage:hrs'
  | 'manage:managers'
  | 'manage:employees'
  | 'view:analytics'
  | 'view:attendance'
  | 'view:payroll'
  | 'configure:system'
  | 'manage:permissions'
  | 'access:ai-insights'
  | 'view:audit-logs'
  | 'manage:leave'
  | 'manage:onboarding'
  | 'assign:managers'
  | 'view:performance'
  | 'access:team'
  | 'approve:leave'
  | 'manage:goals'
  | 'generate:reports'
  | 'view:own-profile'
  | 'apply:leave'
  | 'view:own-payroll'
  | 'chat:ai';

export interface NavItem {
  name: string;
  href?: string;
  icon: string;
  permissions?: Permission[];
  children?: NavItem[];
  badge?: string;
}

export interface KpiCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'onboarding' | 'offboarding';
  joinDate: string;
  salary: number;
  manager?: string;
  avatar?: string;
  location?: string;
  skills?: string[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday';
  hours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  appliedOn: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'paid' | 'pending' | 'processing';
  paidOn?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewer: string;
  rating: number;
  strengths: string[];
  improvements: string[];
  goals: string[];
  period: string;
  status: 'draft' | 'submitted' | 'completed';
}

export type Theme = 'dark' | 'light';

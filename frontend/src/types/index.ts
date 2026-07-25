export type UserRole = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'NONE';

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

export type DocumentVerificationStatus = 'PENDING_HR_APPROVAL' | 'PENDING_ADMIN_APPROVAL' | 'DOCUMENT_VERIFIED' | 'DOCUMENT_REJECTED';

export interface EmployeeDocument {
  id: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  uploadDate: string;
  status?: DocumentVerificationStatus;
  hrReviewedBy?: number;
  hrReviewedAt?: string;
  hrDecision?: string;
  hrComments?: string;
  adminReviewedBy?: number;
  adminReviewedAt?: string;
  adminDecision?: string;
  adminComments?: string;
  employee?: EmployeeBasicResponse;
}

export type ProfileVerificationStatus = 'PENDING_MANAGER_APPROVAL' | 'PENDING_ADMIN_APPROVAL' | 'PROFILE_VERIFIED' | 'PROFILE_REJECTED';

export interface EmployeeBasicResponse {
  id: number;
  firstName: string;
  lastName: string;
}

export interface ProfileUpdateRequest {
  id: number;
  employee: EmployeeBasicResponse;
  requestedPhone?: string;
  requestedAddress?: string;
  requestedDateOfBirth?: string;
  requestedGender?: string;
  requestedBloodGroup?: string;
  requestedEmergencyContactName?: string;
  requestedEmergencyContactNumber?: string;
  requestedProfilePhotoUrl?: string;
  status: ProfileVerificationStatus;
  rejectionReason?: string;
  reviewerComment?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: EmployeeBasicResponse;
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salary: number;
  departmentName: string;
  designation: string;
  managerId?: number;
  managerName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'ONBOARDING';
  role: UserRole;
  joiningDate: string;
  leaveDate?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  employmentType?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  profilePhotoUrl?: string;
  documents?: EmployeeDocument[];
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

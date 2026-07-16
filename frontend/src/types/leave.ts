export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LeaveAction = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN' | 'CANCELLED';

export interface LeaveType {
  id: number;
  name: string;
  description: string;
  defaultDays: number;
}

export interface LeaveBalance {
  id: number;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveApprovalHistory {
  id: number;
  actionByUserId: number;
  actionByUserName: string;
  actionByRole: string;
  action: LeaveAction;
  comments: string;
  actionDate: string;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  designationName: string;
  managerId: number;
  managerName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  attachmentUrl?: string;
  emergencyContact?: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
  approvalHistories: LeaveApprovalHistory[];
}

export interface LeaveRequestSubmit {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl?: string;
  emergencyContact?: string;
}

export interface LeaveApproval {
  comments: string;
}

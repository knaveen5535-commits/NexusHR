import api from './api';
import type { LeaveRequest, LeaveRequestSubmit, LeaveApproval, LeaveBalance } from '../types/leave';

export const leaveService = {
  submitLeaveRequest: async (data: LeaveRequestSubmit): Promise<LeaveRequest> => {
    const response = await api.post('/employees/leaves', data);
    return response.data;
  },

  editLeaveRequest: async (id: number, data: LeaveRequestSubmit): Promise<LeaveRequest> => {
    const response = await api.put(`/employees/leaves/${id}`, data);
    return response.data;
  },

  cancelLeaveRequest: async (id: number): Promise<LeaveRequest> => {
    const response = await api.post(`/employees/leaves/${id}/cancel`);
    return response.data;
  },

  approveLeaveRequest: async (id: number, data: LeaveApproval): Promise<LeaveRequest> => {
    const response = await api.post(`/employees/leaves/${id}/approve`, data);
    return response.data;
  },

  rejectLeaveRequest: async (id: number, data: LeaveApproval): Promise<LeaveRequest> => {
    const response = await api.post(`/employees/leaves/${id}/reject`, data);
    return response.data;
  },

  getMyRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/employees/leaves/my-requests');
    return response.data;
  },

  getMyBalances: async (year?: number): Promise<LeaveBalance[]> => {
    const url = year ? `/employees/leaves/my-balances?year=${year}` : '/employees/leaves/my-balances';
    const response = await api.get(url);
    return response.data;
  },

  getEmployeeBalances: async (employeeId: number, year?: number): Promise<LeaveBalance[]> => {
    const url = year ? `/employees/leaves/employee/${employeeId}/balances?year=${year}` : `/employees/leaves/employee/${employeeId}/balances`;
    const response = await api.get(url);
    return response.data;
  },

  getTeamRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/employees/leaves/team');
    return response.data;
  },

  getAllRequests: async (): Promise<LeaveRequest[]> => {
    const response = await api.get('/employees/leaves/all');
    return response.data;
  }
};

import api from './api';

export interface Resignation {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  reason: string;
  expectedLeaveDate: string;
  approvedLeaveDate: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface ResignationRequest {
  reason: string;
  expectedLeaveDate: string;
}

export interface ApproveResignationRequest {
  approvedLeaveDate: string;
}

export const submitResignation = async (request: ResignationRequest): Promise<Resignation> => {
  const response = await api.post('/resignations', request);
  return response.data;
};

export const getMyResignations = async (): Promise<Resignation[]> => {
  const response = await api.get('/resignations/my');
  return response.data;
};

export const getAllResignations = async (): Promise<Resignation[]> => {
  const response = await api.get('/resignations');
  return response.data;
};

export const approveResignation = async (id: number, request: ApproveResignationRequest): Promise<Resignation> => {
  const response = await api.put(`/resignations/${id}/approve`, request);
  return response.data;
};

export const rejectResignation = async (id: number): Promise<Resignation> => {
  const response = await api.put(`/resignations/${id}/reject`);
  return response.data;
};

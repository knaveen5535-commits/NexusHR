import api from './api';
import type { Employee, DocumentVerificationStatus, ProfileVerificationStatus } from '../types';

export interface EmployeeBasic {
  id: number;
  firstName: string;
  lastName: string;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salary: number;
  departmentId: number;
  designationId: number;
  role: 'HR' | 'MANAGER' | 'EMPLOYEE' | 'ADMIN' | 'NONE';
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salary: number;
  departmentId: number;
  designationId: number;
  managerId?: number;
  role: 'HR' | 'MANAGER' | 'EMPLOYEE' | 'ADMIN' | 'NONE';
}

export interface TransferEmployeeRequest {
  departmentId: number;
  designationId: number;
  managerId?: number;
}

export interface AssignManagerRequest {
  managerId?: number;
}

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get('/employees');
  return response.data;
};

export const getTeamMembers = async (): Promise<Employee[]> => {
  const response = await api.get('/employees/manager/team');
  return response.data;
};

export const createEmployee = async (employeeData: CreateEmployeeRequest): Promise<Employee> => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (id: number, employeeData: UpdateEmployeeRequest): Promise<Employee> => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

export const transferEmployee = async (id: number, transferData: TransferEmployeeRequest): Promise<Employee> => {
  const response = await api.put(`/employees/${id}/transfer`, transferData);
  return response.data;
};

export const assignManager = async (id: number, managerData: AssignManagerRequest): Promise<Employee> => {
  const response = await api.put(`/employees/${id}/manager`, managerData);
  return response.data;
};

export const updateRole = async (id: number, role: string): Promise<Employee> => {
  const response = await api.put(`/employees/${id}/role`, { role });
  return response.data;
};

export const getManagers = async (): Promise<EmployeeBasic[]> => {
  const response = await api.get('/employees/managers');
  return response.data;
};

export const getManagersByDepartment = async (departmentId: number): Promise<EmployeeBasic[]> => {
  const response = await api.get(`/employees/department/${departmentId}/managers`);
  return response.data;
};

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departmentsCount: number;
  managersCount: number;
  hrStaffCount: number;
  monthlyPayrollCost: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/employees/dashboard');
  return response.data;
};

export const verifyProfile = async (id: number, status: ProfileVerificationStatus, rejectionReason?: string): Promise<Employee> => {
  const response = await api.put(`/employees/${id}/verify-profile`, { status, rejectionReason });
  return response.data;
};

export const uploadDocument = async (id: number, data: { documentType: string; documentName: string; documentUrl: string; }): Promise<Employee> => {
  const response = await api.post(`/employees/${id}/documents`, data);
  return response.data;
};

export const verifyDocument = async (docId: number, status: DocumentVerificationStatus, rejectionReason?: string): Promise<Employee> => {
  const response = await api.put(`/employees/documents/${docId}/verify`, { status, rejectionReason });
  return response.data;
};

export const deleteDocument = async (docId: number): Promise<Employee> => {
  const response = await api.delete(`/employees/documents/${docId}`);
  return response.data;
};

import api from './api';

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  status: string;
  role: string;
}

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
  role: 'HR' | 'MANAGER' | 'EMPLOYEE';
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
  role: 'HR' | 'MANAGER' | 'EMPLOYEE';
}

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get('/employees');
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

export const getManagers = async (): Promise<EmployeeBasic[]> => {
  const response = await api.get('/employees/managers');
  return response.data;
};

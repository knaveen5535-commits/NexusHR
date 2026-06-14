import api from './api';

export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
}

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get('/employees');
  return response.data;
};

export const createEmployee = async (employeeData: Omit<Employee, 'id' | 'employeeId'>) => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

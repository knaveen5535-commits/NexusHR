import api from './api';

export interface Department {
  id: number;
  departmentName: string;
  budget?: string;
  head?: string;
  count?: number;
}

export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get('/departments');
  return response.data;
};

export const createDepartment = async (data: { departmentName: string; budget?: string }): Promise<Department> => {
  const response = await api.post('/departments', data);
  return response.data;
};

export const updateDepartment = async (id: number, data: { departmentName?: string; budget?: string }): Promise<Department> => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await api.delete(`/departments/${id}`);
};

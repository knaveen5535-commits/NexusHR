import api from './api';

export interface Designation {
  id: number;
  designationName: string;
  departmentId: number;
  designationType: 'HR' | 'MANAGER' | 'EMPLOYEE';
  active: boolean;
}

export const getDesignations = async (departmentId?: number, type?: string): Promise<Designation[]> => {
  const params: any = {};
  if (departmentId) params.departmentId = departmentId;
  if (type) params.type = type;
  
  const response = await api.get('/designations', { params });
  return response.data;
};

export const createDesignation = async (data: Omit<Designation, 'id' | 'active'>): Promise<Designation> => {
  const response = await api.post('/designations', data);
  return response.data;
};

export const updateDesignation = async (id: number, data: Partial<Omit<Designation, 'id' | 'active'>>): Promise<Designation> => {
  const response = await api.put(`/designations/${id}`, data);
  return response.data;
};

export const toggleDesignationStatus = async (id: number): Promise<Designation> => {
  const response = await api.patch(`/designations/${id}/status`);
  return response.data;
};

export const deleteDesignation = async (id: number): Promise<void> => {
  await api.delete(`/designations/${id}`);
};

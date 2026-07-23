import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
  expectedRole?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerAdmin = async (data: Record<string, string>) => {
  const response = await api.post('/auth/register-admin', data);
  return response.data;
};

export const register = async (userData: RegisterData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: Record<string, string>) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const changePassword = async (data: Record<string, string>) => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};

export const validateResetToken = async (token: string): Promise<boolean> => {
  const response = await api.get('/auth/validate-reset-token', { params: { token } });
  return response.data;
};

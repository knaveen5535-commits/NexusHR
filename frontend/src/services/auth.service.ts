import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
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

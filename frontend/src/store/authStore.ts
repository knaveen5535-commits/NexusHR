import { create } from 'zustand';
import type { AuthState } from '../types';

const getInitialToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getInitialToken(),
  user: getInitialUser(),
  isAuthenticated: !!getInitialToken(),
  setAuth: (token, user) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save auth to localStorage:', e);
    }
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.warn('Failed to remove auth from localStorage:', e);
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

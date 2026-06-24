import { create } from 'zustand';
import type { AuthState } from '../types';

const DEMO_USERS = [
  { id: '1', username: 'admin', email: 'admin@nexushr.com', role: 'admin' as const, firstName: 'Admin', lastName: 'User', employeeId: 'ADM001' },
  { id: '2', username: 'hr', email: 'hr@nexushr.com', role: 'hr' as const, firstName: 'Sarah', lastName: 'Johnson', employeeId: 'HR001' },
  { id: '3', username: 'manager', email: 'manager@nexushr.com', role: 'manager' as const, firstName: 'Mike', lastName: 'Chen', employeeId: 'MGR001' },
  { id: '4', username: 'employee', email: 'employee@nexushr.com', role: 'employee' as const, firstName: 'John', lastName: 'Doe', employeeId: 'EMP001' },
];

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
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

export function demoLogin(role: 'admin' | 'hr' | 'manager' | 'employee') {
  const user = DEMO_USERS.find((u) => u.role === role);
  if (!user) return;
  const token = `demo-token-${role}-${Date.now()}`;
  useAuthStore.getState().setAuth(token, user);
  return user;
}

export { DEMO_USERS };

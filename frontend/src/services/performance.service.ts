import api from './api';
import type { 
  PerformanceConfiguration, 
  PerformanceRecord, 
  PerformanceGenerateRequest, 
  PerformanceReport 
} from '../types/performance.types';

export const performanceService = {
  // Config
  getConfiguration: () => api.get<PerformanceConfiguration>('/employees/performance/configuration'),
  updateConfiguration: (data: PerformanceConfiguration) => api.put<PerformanceConfiguration>('/employees/performance/configuration', data),

  // Actions
  generatePerformance: (request: PerformanceGenerateRequest) => api.post<string>('/employees/performance/generate', request),
  publishPerformance: (request: PerformanceGenerateRequest) => api.post<string>('/employees/performance/publish', request),
  lockPerformance: (request: PerformanceGenerateRequest) => api.post<string>('/employees/performance/lock', request),

  // Queries
  getMyPerformance: (year: number, month: number) => api.get<PerformanceRecord>(`/employees/performance/me?year=${year}&month=${month}`),
  getMyPerformanceHistory: () => api.get<PerformanceRecord[]>('/employees/performance/history/me'),
  getTeamPerformance: (year: number, month: number) => api.get<PerformanceRecord[]>(`/employees/performance/team?year=${year}&month=${month}`),
  getAllPerformance: (year: number, month: number) => api.get<PerformanceRecord[]>(`/employees/performance/all?year=${year}&month=${month}`),
  getEmployeePerformanceHistory: (employeeId: number) => api.get<PerformanceRecord[]>(`/employees/performance/history/${employeeId}`),
  getPerformanceReport: (year: number, month: number) => api.get<PerformanceReport>(`/employees/performance/report?year=${year}&month=${month}`),
  getGeneratedMonths: () => api.get<string[]>('/employees/performance/generated-months')
};

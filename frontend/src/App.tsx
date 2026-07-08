import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useThemeStore } from './hooks/useTheme';
import Login from './pages/auth/Login';
import RegisterAdmin from './pages/auth/RegisterAdmin';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import EmployeeList from './pages/admin/employees/EmployeeList';
import HrDashboard from './pages/hr/dashboard/HrDashboard';
import ManagerDashboard from './pages/manager/dashboard/ManagerDashboard';
import EmployeeDashboard from './pages/employee/dashboard/EmployeeDashboard';
import AiAssistant from './components/ai/AiAssistant';
import DashboardLayout from './layouts/DashboardLayout';
import RootRedirect from './layouts/RootRedirect';
import ProtectedRoute from './components/guards/ProtectedRoute';

// New Admin Pages
import DepartmentManagement from './pages/admin/departments/DepartmentManagement';
import DesignationManagement from './pages/admin/designations/DesignationManagement';
import RoleManagement from './pages/admin/roles/RoleManagement';
import Reports from './pages/admin/reports/Reports';
import SystemSettings from './pages/admin/settings/SystemSettings';

const queryClient = new QueryClient();

function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeSync />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterAdmin />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={['admin']} requiredPermissions={['view:analytics']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route
              path="employees"
              element={
                <ProtectedRoute requiredPermissions={['manage:employees']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="designations" element={<DesignationManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="reports/*" element={<Reports />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="ai-insights" element={<AiAssistant />} />
          </Route>

          {/* HR Routes */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute requiredRoles={['hr']} requiredPermissions={['view:analytics']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HrDashboard />} />
            <Route path="attendance" element={<HrDashboard />} />
            <Route path="leave" element={<HrDashboard />} />
            <Route path="payroll" element={<HrDashboard />} />
            <Route path="performance" element={<HrDashboard />} />
            <Route path="onboarding" element={<HrDashboard />} />
            <Route path="reports/*" element={<Reports />} />
            <Route
              path="employees"
              element={
                <ProtectedRoute requiredPermissions={['manage:employees']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route path="ai-reports" element={<AiAssistant />} />
          </Route>

          {/* Manager Routes */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute requiredRoles={['manager']} requiredPermissions={['view:analytics']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="attendance" element={<ManagerDashboard />} />
            <Route path="performance" element={<ManagerDashboard />} />
            <Route path="leave-approvals" element={<ManagerDashboard />} />
            <Route path="reports/*" element={<Reports />} />
            <Route
              path="team"
              element={
                <ProtectedRoute requiredPermissions={['access:team']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route path="ai-insights" element={<AiAssistant />} />
          </Route>

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute requiredRoles={['employee']} requiredPermissions={['view:own-profile']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="profile" element={<EmployeeDashboard />} />
            <Route path="attendance" element={<EmployeeDashboard />} />
            <Route path="leave" element={<EmployeeDashboard />} />
            <Route path="payroll" element={<EmployeeDashboard />} />
            <Route path="performance" element={<EmployeeDashboard />} />
            <Route path="ai-assistant" element={<AiAssistant />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#f4f4f5',
            borderRadius: '0.75rem',
          },
        }}
      />
    </QueryClientProvider>
  );
}


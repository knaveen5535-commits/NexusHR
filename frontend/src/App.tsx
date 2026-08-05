import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useThemeStore } from './hooks/useTheme';
import Login from './pages/auth/Login';
import RegisterAdmin from './pages/auth/RegisterAdmin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import EmployeeList from './pages/admin/employees/EmployeeList';
import HrDashboard from './pages/hr/dashboard/HrDashboard';
import ManagerDashboard from './pages/manager/dashboard/ManagerDashboard';
import ManagerProfileRequests from './pages/manager/employees/ManagerProfileRequests';
import EmployeeDashboard from './pages/employee/dashboard/EmployeeDashboard';
import ResignationManagement from './pages/admin/employees/ResignationManagement';
import AdminProfileRequests from './pages/admin/employees/AdminProfileRequests';
import AdminDocumentApprovals from './pages/admin/employees/AdminDocumentApprovals';
import HrDocumentApprovals from './pages/hr/employees/HrDocumentApprovals';
import DashboardLayout from './layouts/DashboardLayout';
import RootRedirect from './layouts/RootRedirect';
import ProtectedRoute from './components/guards/ProtectedRoute';
import PayrollList from './pages/payroll/PayrollList';

// New Admin Pages
import DepartmentManagement from './pages/admin/departments/DepartmentManagement';
import DesignationManagement from './pages/admin/designations/DesignationManagement';
import RoleManagement from './pages/admin/roles/RoleManagement';
import Reports from './pages/admin/reports/Reports';
import SystemSettings from './pages/admin/settings/SystemSettings';

// Performance Pages
import AdminPerformanceDashboard from './pages/performance/AdminPerformanceDashboard';
import HrPerformanceReports from './pages/performance/HrPerformanceReports';
import ManagerTeamPerformance from './pages/performance/ManagerTeamPerformance';
import EmployeeMyPerformance from './pages/performance/EmployeeMyPerformance';

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
          <Route path="/login/:role?" element={<Login />} />
          <Route path="/register" element={<RegisterAdmin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']} requiredPermissions={['view:analytics']}>
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
            <Route path="resignations" element={<ResignationManagement />} />
            <Route path="profile-requests" element={<AdminProfileRequests />} />
            <Route path="document-approvals" element={<AdminDocumentApprovals />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="payroll" element={<PayrollList />} />
            <Route path="reports/*" element={<Reports />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="performance" element={<AdminPerformanceDashboard />} />
          </Route>

          {/* HR Routes */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute requiredRoles={['HR']} requiredPermissions={['manage:employees']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HrDashboard />} />
            <Route path="profile" element={<HrDashboard />} />
            <Route path="attendance" element={<Navigate to="my-attendance" replace />} />
            <Route path="my-attendance" element={<HrDashboard />} />
            <Route path="company-attendance" element={<HrDashboard />} />
            <Route path="leave" element={<HrDashboard />} />
            <Route path="payroll" element={<Navigate to="company-payroll" replace />} />
            <Route path="my-payslips" element={<HrDashboard />} />
            <Route path="company-payroll" element={<HrDashboard />} />
            <Route path="performance" element={<HrPerformanceReports />} />
            <Route path="onboarding" element={<HrDashboard />} />
            <Route path="profile-requests" element={<HrDashboard />} />
            <Route path="reports/*" element={<Reports />} />
            <Route
              path="employees"
              element={
                <ProtectedRoute requiredPermissions={['manage:employees']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route path="resignations" element={<ResignationManagement />} />
            <Route path="document-approvals" element={<HrDocumentApprovals />} />
          </Route>

          {/* Manager Routes */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute requiredRoles={['MANAGER']} requiredPermissions={['access:team']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="profile" element={<ManagerDashboard />} />
            <Route path="attendance" element={<Navigate to="my-attendance" replace />} />
            <Route path="my-attendance" element={<ManagerDashboard />} />
            <Route path="team-attendance" element={<ManagerDashboard />} />
            <Route path="payroll" element={<Navigate to="my-payslips" replace />} />
            <Route path="my-payslips" element={<ManagerDashboard />} />
            <Route path="team-payslips" element={<ManagerDashboard />} />
            <Route path="performance" element={<Navigate to="my-performance" replace />} />
            <Route path="my-performance" element={<EmployeeMyPerformance />} />
            <Route path="team-performance" element={<ManagerTeamPerformance />} />
            <Route path="leave-approvals" element={<ManagerDashboard />} />
            <Route path="profile-requests" element={<ManagerProfileRequests />} />
            <Route path="reports/*" element={<Reports />} />
            <Route
              path="team"
              element={
                <ProtectedRoute requiredPermissions={['access:team']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute requiredRoles={['EMPLOYEE']} requiredPermissions={['view:own-profile']}>
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
            <Route path="performance" element={<EmployeeMyPerformance />} />
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


import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, ChevronLeft, ChevronRight,
  Mail, Phone, Calendar, CheckSquare,
  Square, UserPlus, ArrowUpDown, X, Edit2, Trash2,
  Building, UserCheck, PowerOff
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../../components/ui/EmptyState';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import type { Employee } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { getEmployees, getTeamMembers, transferEmployee, assignManager, getManagersByDepartment } from '../../../services/employee.service';
import { getDepartments } from '../../../services/department.service';
import { getDesignations } from '../../../services/designation.service';
import { useAuthStore } from '../../../store/authStore';
import { useLocation } from 'react-router';

const MOCK_EMPLOYEES: Employee[] = []; // fallback removed

type SortField = 'firstName' | 'department' | 'designation' | 'joinDate' | 'status' | 'manager';
type SortDir = 'asc' | 'desc';

const STATUSES = ['active', 'inactive', 'onboarding'] as const;

const ModalWrapper = ({ isOpen, onClose, title, children }: any) => {
  const { isDark } = useTheme();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function exportCSV(employees: Employee[]) {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Manager', 'Status', 'Join Date', 'Location'];
  const rows = employees.map((e) => [
    e.employeeId,
    `${e.firstName} ${e.lastName}`,
    e.email,
    e.phone,
    e.department,
    e.designation,
    e.manager || 'None',
    e.status,
    e.joinDate,
    e.location || '',
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV exported successfully');
}

export default function EmployeeList() {
  const { isDark } = useTheme();
  const user = useAuthStore(s => s.user);
  const location = useLocation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('firstName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{ department?: string; status?: string; role?: string; designation?: string; manager?: string }>({});
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 10;

  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [eligibleManagers, setEligibleManagers] = useState<any[]>([]);
  const [transferForm, setTransferForm] = useState({ departmentId: '', designationId: '', managerId: '' });
  const [managerForm, setManagerForm] = useState({ managerId: '' });

  const filtered = useMemo(() => {
    let result = [...employees];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase().includes(q) ||
          (e.email || '').toLowerCase().includes(q) ||
          (e.employeeId || '').toLowerCase().includes(q) ||
          (e.department || '').toLowerCase().includes(q) ||
          (e.manager || '').toLowerCase().includes(q)
      );
    }
    if (filters.department) {
      result = result.filter((e) => e.department === filters.department);
    }
    if (filters.status) {
      result = result.filter((e) => e.status === filters.status);
    }
    if (filters.role) {
      result = result.filter((e) => e.role?.toLowerCase() === filters.role?.toLowerCase());
    }
    if (filters.designation) {
      result = result.filter((e) => e.designation === filters.designation);
    }
    if (filters.manager) {
      result = result.filter((e) => e.manager === filters.manager);
    }

    result.sort((a, b) => {
      const aVal = String(a[sortField] || '');
      const bVal = String(b[sortField] || '');
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return result;
  }, [employees, search, filters, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((e) => e.id)));
    }
  };


  useEffect(() => {
    fetchEmployees();
    getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const isManagerTeamView = user?.role === 'manager' && location.pathname.includes('/manager/team');
      const data = isManagerTeamView ? await getTeamMembers() : await getEmployees();
      const mapped = data.map((e: any) => ({
        id: String(e.id),
        employeeId: e.employeeCode || `EMP${String(e.id).padStart(4, '0')}`,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        phone: e.phone || '',
        department: e.departmentName || '',
        designation: e.designation || '',
        role: e.role?.toLowerCase() || 'employee',
        status: e.status?.toLowerCase() || 'active',
        joinDate: e.joinDate || new Date().toISOString().split('T')[0],
        salary: e.salary || 0,
        manager: e.managerName || undefined,
        location: e.location || '',
      }));
      setEmployees(mapped as any);
    } catch (error) {
      toast.error('Failed to load employees');
      setEmployees(MOCK_EMPLOYEES); 
    } finally {
      setIsLoading(false);
    }
  };


  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [assigningDept, setAssigningDept] = useState<any>(null);
  const [assigningMgr, setAssigningMgr] = useState<any>(null);
  const [togglingStatus, setTogglingStatus] = useState<any>(null);
  const [deletingEmp, setDeletingEmp] = useState<any>(null);



  const handleOpenTransfer = (emp: any) => {
    setAssigningDept(emp);
    setTransferForm({ departmentId: '', designationId: '', managerId: '' });
    setDesignations([]);
    setEligibleManagers([]);
  };

  const handleDepartmentChange = async (deptId: string) => {
    setTransferForm({ ...transferForm, departmentId: deptId, designationId: '', managerId: '' });
    if (deptId) {
      const [desigs, mgrs] = await Promise.all([
        getDesignations(Number(deptId)),
        getManagersByDepartment(Number(deptId))
      ]);
      setDesignations(desigs);
      setEligibleManagers(mgrs.filter(m => m.id !== Number(assigningDept?.id)));
    } else {
      setDesignations([]);
      setEligibleManagers([]);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!transferForm.departmentId || !transferForm.designationId) {
      return toast.error('Department and Designation are required');
    }
    try {
      await transferEmployee(Number(assigningDept.id), {
        departmentId: Number(transferForm.departmentId),
        designationId: Number(transferForm.designationId),
        managerId: transferForm.managerId ? Number(transferForm.managerId) : undefined
      });
      toast.success('Employee transferred successfully');
      setAssigningDept(null);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to transfer employee');
    }
  };

  const handleOpenAssignManager = async (emp: any) => {
    setAssigningMgr(emp);
    setManagerForm({ managerId: '' });
    // find employee's department ID to load managers
    const dept = departments.find(d => d.departmentName === emp.department);
    if (dept) {
      const mgrs = await getManagersByDepartment(dept.id);
      setEligibleManagers(mgrs.filter(m => m.id !== Number(emp.id)));
    }
  };

  const handleConfirmAssignManager = async () => {
    try {
      await assignManager(Number(assigningMgr.id), {
        managerId: managerForm.managerId ? Number(managerForm.managerId) : undefined
      });
      toast.success('Manager assigned successfully');
      setAssigningMgr(null);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to assign manager');
    }
  };


  const DEPARTMENTS = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));
  const ROLES = Array.from(new Set(employees.map(e => e.role).filter(Boolean)));
  const DESIGNATIONS = Array.from(new Set(employees.map(e => e.designation).filter(Boolean)));
  const MANAGERS = Array.from(new Set(employees.map(e => e.manager).filter(Boolean)));

  return (
    <div className={`p-4 sm:p-8 space-y-6 min-h-full transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Employee Management</h1>
        <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Manage your workforce, update profiles, and assign roles.</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, email, department..."
              className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                isDark ? 'border-zinc-800 bg-zinc-950/50 text-white placeholder-zinc-500 focus:ring-blue-500' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-blue-500 shadow-sm'
              }`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors ${
              showFilters || filters.department || filters.status
                ? isDark ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
                : isDark ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selected.size > 0 && (
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${isDark ? 'bg-blue-600/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
              <span className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{selected.size} selected</span>
              <button onClick={() => setSelected(new Set())} className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <button onClick={() => exportCSV(filtered)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors ${isDark ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => setIsAddOpen(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg ${isDark ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
            <UserPlus className="h-4 w-4" /> Add Employee
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Department</label>
                <select
                  value={filters.department || ''}
                  onChange={(e) => { setFilters((f) => ({ ...f, department: e.target.value || undefined })); setPage(1); }}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value || undefined })); setPage(1); }}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Role</label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => { setFilters((f) => ({ ...f, role: e.target.value || undefined })); setPage(1); }}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Roles</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Designation</label>
                <select
                  value={filters.designation || ''}
                  onChange={(e) => { setFilters((f) => ({ ...f, designation: e.target.value || undefined })); setPage(1); }}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Designations</option>
                  {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Manager</label>
                <select
                  value={filters.manager || ''}
                  onChange={(e) => { setFilters((f) => ({ ...f, manager: e.target.value || undefined })); setPage(1); }}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Managers</option>
                  {MANAGERS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {(filters.department || filters.status || filters.role || filters.designation || filters.manager) && (
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({})}
                    className="px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`rounded-3xl border overflow-hidden transition-all ${isDark ? 'border-white/5 bg-zinc-900/40 backdrop-blur-xl' : 'border-slate-200 bg-white/60 backdrop-blur-xl shadow-md'}`}>
        {!isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="h-8 w-8 text-zinc-500" />}
            title={search || filters.department || filters.status ? 'No employees match your filters' : (user?.role === 'manager' ? 'No Team Members Assigned' : 'No employees found')}
            description={search || filters.department || filters.status ? 'Try adjusting your search or filter criteria.' : (user?.role === 'manager' ? 'You currently do not have any employees reporting to you.' : 'Add your first employee to get started.')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-800/30' : 'border-slate-200 bg-slate-50'}`}>
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-zinc-400 hover:text-white">
                      {selected.size === paginated.length && paginated.length > 0
                        ? <CheckSquare className="h-4 w-4 text-blue-400" />
                        : <Square className="h-4 w-4" />
                      }
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button onClick={() => toggleSort('firstName')} className="flex items-center gap-1 text-xs font-medium uppercase text-zinc-400 hover:text-white">
                      Employee <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase text-zinc-400">Contact</th>
                  <th className="px-4 py-3">
                    <button onClick={() => toggleSort('department')} className="flex items-center gap-1 text-xs font-medium uppercase text-zinc-400 hover:text-white">
                      Department <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button onClick={() => toggleSort('manager')} className="flex items-center gap-1 text-xs font-medium uppercase text-zinc-400 hover:text-white">
                      Manager <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button onClick={() => toggleSort('designation')} className="flex items-center gap-1 text-xs font-medium uppercase text-zinc-400 hover:text-white">
                      Designation <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button onClick={() => toggleSort('role')} className="flex items-center gap-1 text-xs font-medium uppercase text-zinc-400 hover:text-white">
                      Role <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button onClick={() => toggleSort('status')} className="flex items-center gap-1 text-xs font-medium uppercase text-zinc-400 hover:text-white">
                      Status <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-slate-200'}`}>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600"></div>
                        <p className="text-zinc-500 font-medium">Loading employees...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((emp, i) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group transition-colors ${isDark ? 'hover:bg-zinc-800/20' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(emp.id)} className={`${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                        {selected.has(emp.id)
                          ? <CheckSquare className="h-4 w-4 text-blue-400" />
                          : <Square className="h-4 w-4" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${isDark ? 'bg-blue-600/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                          <span className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            {emp.firstName?.[0] || ''}{emp.lastName?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className={`font-bold transition-colors ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className={`text-xs font-semibold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5 text-zinc-400 text-xs">
                          <Mail className="h-3 w-3 text-zinc-500" /> {emp.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-zinc-500 text-xs">
                          <Phone className="h-3 w-3 text-zinc-500" /> {emp.phone || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-500/20">
                        {emp.department || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400">
                        <UserCheck className="h-3 w-3" />
                        {emp.manager || 'No Manager'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs font-medium">{emp.designation}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                        emp.role === 'admin' || emp.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20' :
                        emp.role === 'hr' || emp.role === 'HR' ? 'bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-500/20' :
                        emp.role === 'manager' || emp.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20' :
                        emp.role === 'none' || emp.role === 'NONE' ? 'bg-zinc-500/10 text-zinc-500 ring-1 ring-inset ring-zinc-500/20' :
                        'bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                        emp.status === 'inactive' ? 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20' :
                        'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button onClick={() => setEditingEmp(emp)} title="Edit Employee" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleOpenTransfer(emp)} title="Transfer Employee" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-purple-500/20 text-zinc-400 hover:text-purple-400' : 'hover:bg-purple-50 text-slate-500 hover:text-purple-600'}`}>
                          <Building className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleOpenAssignManager(emp)} title="Assign Manager" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400' : 'hover:bg-blue-50 text-slate-500 hover:text-blue-600'}`}>
                          <UserCheck className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeletingEmp(emp)} title="Delete Employee" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-zinc-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const num = start + i;
              if (num > totalPages) return null;
              return (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    page === num
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {num}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          fetchEmployees();
        }}
      />

      <EditUserModal
        isOpen={!!editingEmp}
        employee={editingEmp}
        onClose={() => setEditingEmp(null)}
        onSuccess={() => {
          fetchEmployees();
        }}
      />

      <ModalWrapper isOpen={!!assigningDept} onClose={() => setAssigningDept(null)} title="Transfer Employee">
        <div>
          <p className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Transferring <strong>{assigningDept?.firstName} {assigningDept?.lastName}</strong> to a new department.
          </p>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>New Department</label>
              <select value={transferForm.departmentId} onChange={(e) => handleDepartmentChange(e.target.value)} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <option value="">Select a department...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>New Designation</label>
              <select value={transferForm.designationId} onChange={(e) => setTransferForm({...transferForm, designationId: e.target.value})} disabled={!transferForm.departmentId} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white disabled:opacity-50' : 'bg-white border-slate-200 text-slate-900 disabled:opacity-50'}`}>
                <option value="">{designations.length === 0 ? 'Select a department first...' : 'Select a designation...'}</option>
                {designations.map(d => <option key={d.id} value={d.id}>{d.designationName}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>New Manager (Optional)</label>
              <select value={transferForm.managerId} onChange={(e) => setTransferForm({...transferForm, managerId: e.target.value})} disabled={!transferForm.departmentId} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white disabled:opacity-50' : 'bg-white border-slate-200 text-slate-900 disabled:opacity-50'}`}>
                <option value="">{eligibleManagers.length === 0 ? 'No managers available...' : 'Select a manager...'}</option>
                {eligibleManagers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <button onClick={handleConfirmTransfer} className={`w-full mt-2 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${isDark ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'}`}>
              Confirm Transfer
            </button>
          </div>
        </div>
      </ModalWrapper>

      <ModalWrapper isOpen={!!assigningMgr} onClose={() => setAssigningMgr(null)} title="Assign Manager">
        <div>
          <p className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Assign a manager for <strong>{assigningMgr?.firstName} {assigningMgr?.lastName}</strong> ({assigningMgr?.department}).
          </p>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Select Manager</label>
              <select value={managerForm.managerId} onChange={(e) => setManagerForm({ managerId: e.target.value })} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <option value="">{eligibleManagers.length === 0 ? 'No eligible managers found...' : 'Select a manager...'}</option>
                <option value="">None (Remove Manager)</option>
                {eligibleManagers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <button onClick={handleConfirmAssignManager} className={`w-full mt-2 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${isDark ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
              Confirm Manager
            </button>
          </div>
        </div>
      </ModalWrapper>

      <ModalWrapper isOpen={!!deletingEmp} onClose={() => setDeletingEmp(null)} title="Delete Employee">
        <div>
          <p className={`text-sm mb-4 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
            Are you sure you want to delete <strong>{deletingEmp?.firstName} {deletingEmp?.lastName}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeletingEmp(null)} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              Cancel
            </button>
            <button onClick={() => setDeletingEmp(null)} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
              Delete Employee
            </button>
          </div>
        </div>
      </ModalWrapper>

    </div>
  );
}

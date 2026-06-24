import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, ChevronLeft, ChevronRight,
  MoreHorizontal, Mail, Phone, Calendar, CheckSquare,
  Square, UserPlus, ArrowUpDown, X, Edit2, Trash2, Shield,
  Building, UserCheck, PowerOff
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../../components/ui/EmptyState';
import type { Employee } from '../../../types';
import { useRole } from '../../../hooks/useRole';
import { useTheme } from '../../../hooks/useTheme';

const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
  firstName: ['John', 'Jane', 'Mike', 'Sarah', 'Alex', 'Emily', 'David', 'Lisa', 'James', 'Emma'][i % 10],
  lastName: ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson'][i % 10],
  email: `employee${i + 1}@nexushr.com`,
  phone: `+1 (555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).slice(0, 4)}`,
  department: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Design', 'Operations', 'Legal'][i % 8],
  designation: ['Software Engineer', 'Product Manager', 'Designer', 'Data Analyst', 'DevOps', 'QA Engineer', 'UX Designer', 'Marketing Lead'][i % 8],
  role: i === 0 ? 'admin' : i < 3 ? 'manager' : i < 6 ? 'hr' : 'employee',
  status: i % 7 === 0 ? 'inactive' : i % 11 === 0 ? 'onboarding' : 'active',
  joinDate: `202${i % 5}-${String((i % 12) + 1).padStart(2, '0')}-01`,
  salary: 50000 + (i * 1500),
  manager: i < 3 ? undefined : ['John Doe', 'Jane Smith', 'Mike Johnson'][i % 3],
  avatar: undefined,
  location: ['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle'][i % 5],
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'].slice(0, (i % 5) + 2),
}));

type SortField = 'firstName' | 'department' | 'designation' | 'joinDate' | 'status';
type SortDir = 'asc' | 'desc';

const DEPARTMENTS = [...new Set(MOCK_EMPLOYEES.map((e) => e.department))];
const STATUSES = ['active', 'inactive', 'onboarding'] as const;

function exportCSV(employees: Employee[]) {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Status', 'Join Date', 'Location'];
  const rows = employees.map((e) => [
    e.employeeId,
    `${e.firstName} ${e.lastName}`,
    e.email,
    e.phone,
    e.department,
    e.designation,
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
  const { role } = useRole();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('firstName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{ department?: string; status?: string }>({});
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 10;

  const filtered = useMemo(() => {
    let result = [...MOCK_EMPLOYEES];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }
    if (filters.department) {
      result = result.filter((e) => e.department === filters.department);
    }
    if (filters.status) {
      result = result.filter((e) => e.status === filters.status);
    }

    result.sort((a, b) => {
      const aVal = String(a[sortField] || '');
      const bVal = String(b[sortField] || '');
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return result;
  }, [search, filters, sortField, sortDir]);

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



  const { isDark } = useTheme();

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [assigningDept, setAssigningDept] = useState<any>(null);
  const [assigningMgr, setAssigningMgr] = useState<any>(null);
  const [togglingStatus, setTogglingStatus] = useState<any>(null);
  const [deletingEmp, setDeletingEmp] = useState<any>(null);

  const ModalWrapper = ({ isOpen, onClose, title, children }: any) => (
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
              {(filters.department || filters.status) && (
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
                  <button onClick={() => toggleSort('designation')} className="flex items-center gap-1 text-xs font-medium uppercase text-zinc-400 hover:text-white">
                    Designation <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => toggleSort('status')} className="flex items-center gap-1 text-xs font-medium uppercase text-zinc-400 hover:text-white">
                    Status <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => toggleSort('joinDate')} className="flex items-center gap-1 text-xs font-medium uppercase text-zinc-400 hover:text-white">
                    Joined <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-slate-200'}`}>
              {paginated.map((emp, i) => (
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
                          {emp.firstName[0]}{emp.lastName[0]}
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
                      <p className="flex items-center gap-1.5 text-zinc-300">
                        <Mail className="h-3 w-3 text-zinc-500" /> {emp.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-zinc-400 text-xs">
                        <Phone className="h-3 w-3 text-zinc-500" /> {emp.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{emp.designation}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                      emp.status === 'inactive' ? 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20' :
                      'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {emp.joinDate}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button onClick={() => setEditingEmp(emp)} title="Edit Employee" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setAssigningDept(emp)} title="Assign Department" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-purple-500/20 text-zinc-400 hover:text-purple-400' : 'hover:bg-purple-50 text-slate-500 hover:text-purple-600'}`}>
                        <Building className="h-4 w-4" />
                      </button>
                      <button onClick={() => setAssigningMgr(emp)} title="Assign Manager" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400' : 'hover:bg-blue-50 text-slate-500 hover:text-blue-600'}`}>
                        <UserCheck className="h-4 w-4" />
                      </button>
                      <button onClick={() => setTogglingStatus(emp)} title="Activate/Deactivate" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400' : 'hover:bg-amber-50 text-slate-500 hover:text-amber-600'}`}>
                        <PowerOff className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeletingEmp(emp)} title="Delete Employee" className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-zinc-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <EmptyState
            icon={<Search className="h-8 w-8 text-zinc-500" />}
            title={search || filters.department || filters.status ? 'No employees match your filters' : 'No employees found'}
            description={search || filters.department || filters.status ? 'Try adjusting your search or filter criteria.' : 'Add your first employee to get started.'}
          />
        )}
      </div>

      {totalPages > 1 && (
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
      <ModalWrapper isOpen={isAddOpen || !!editingEmp} onClose={() => { setIsAddOpen(false); setEditingEmp(null); }} title={editingEmp ? 'Edit Employee' : 'Add New Employee'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>First Name</label>
            <input type="text" defaultValue={editingEmp?.firstName || ''} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Last Name</label>
            <input type="text" defaultValue={editingEmp?.lastName || ''} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
          </div>
          <div className="col-span-2">
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Email Address</label>
            <input type="email" defaultValue={editingEmp?.email || ''} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
          </div>
          <button onClick={() => { setIsAddOpen(false); setEditingEmp(null); }} className={`col-span-2 mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
            Save Employee
          </button>
        </div>
      </ModalWrapper>

      <ModalWrapper isOpen={!!assigningDept} onClose={() => setAssigningDept(null)} title="Assign Department">
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Select Department for {assigningDept?.firstName}</label>
          <select className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <button onClick={() => setAssigningDept(null)} className={`w-full mt-6 py-3 rounded-xl text-sm font-bold text-white transition-all ${isDark ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'}`}>
            Confirm Assignment
          </button>
        </div>
      </ModalWrapper>

      <ModalWrapper isOpen={!!assigningMgr} onClose={() => setAssigningMgr(null)} title="Assign Manager">
        <div>
          <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Select Manager for {assigningMgr?.firstName}</label>
          <select className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <option>John Doe</option>
            <option>Sarah Smith</option>
          </select>
          <button onClick={() => setAssigningMgr(null)} className={`w-full mt-6 py-3 rounded-xl text-sm font-bold text-white transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
            Confirm Manager
          </button>
        </div>
      </ModalWrapper>

      <ModalWrapper isOpen={!!togglingStatus} onClose={() => setTogglingStatus(null)} title="Change Status">
        <div>
          <p className={`text-sm mb-4 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
            Are you sure you want to change the status of <strong>{togglingStatus?.firstName} {togglingStatus?.lastName}</strong>?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setTogglingStatus(null)} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              Cancel
            </button>
            <button onClick={() => setTogglingStatus(null)} className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all ${isDark ? 'bg-amber-600 hover:bg-amber-500' : 'bg-amber-600 hover:bg-amber-700'}`}>
              Yes, Toggle Status
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

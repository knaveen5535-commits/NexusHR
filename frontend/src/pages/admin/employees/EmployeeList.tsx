import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, ChevronLeft, ChevronRight,
  MoreHorizontal, Mail, Phone, Calendar, CheckSquare,
  Square, UserPlus, ArrowUpDown, X,
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../../components/ui/EmptyState';
import type { Employee } from '../../../types';
import { useRole } from '../../../hooks/useRole';

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



  return (
    <div className="p-4 sm:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Employees</h1>
        <p className="text-zinc-400 text-sm mt-1">{role === 'admin' ? 'Manage all employees across the organization' : 'View and manage employee information'}</p>
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
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-lg border transition-colors ${
              showFilters || filters.department || filters.status
                ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selected.size > 0 && (
            <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-lg px-3 py-1.5">
              <span className="text-sm text-blue-400 font-medium">{selected.size} selected</span>
              <button onClick={() => setSelected(new Set())} className="text-blue-400 hover:text-blue-300">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-medium transition-colors">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
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

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
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
            <tbody className="divide-y divide-zinc-800">
              {paginated.map((emp, i) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-zinc-800/20 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(emp.id)} className="text-zinc-400 hover:text-white">
                      {selected.has(emp.id)
                        ? <CheckSquare className="h-4 w-4 text-blue-400" />
                        : <Square className="h-4 w-4" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-blue-400">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-zinc-500">{emp.employeeId}</p>
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
                    <button className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
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
    </div>
  );
}

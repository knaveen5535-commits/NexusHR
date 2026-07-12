import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { Building, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, type Department } from '../../../services/department.service';
import { getManagersByDepartment, type EmployeeBasic } from '../../../services/employee.service';

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
            className={`relative w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function DepartmentManagement() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  
  // Form State
  const [deptForm, setDeptForm] = useState({ departmentName: '', budget: '', departmentHeadId: '' as string | number });
  const [eligibleManagers, setEligibleManagers] = useState<EmployeeBasic[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const depts = await getDepartments();
      setDepartments(depts);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDept = async () => {
    if (!deptForm.departmentName) return toast.error('Department name is required');
    try {
      const payload: any = { 
        departmentName: deptForm.departmentName, 
        budget: deptForm.budget 
      };
      
      if (deptForm.departmentHeadId) {
        payload.departmentHeadId = Number(deptForm.departmentHeadId);
      } else if (deptForm.departmentHeadId === '' && editingDept?.departmentHeadId) {
        payload.departmentHeadId = -1; // -1 to clear the head in backend
      }

      if (editingDept) {
        await updateDepartment(editingDept.id, payload);
        toast.success('Department updated successfully');
      } else {
        await createDepartment(payload);
        toast.success('Department created successfully');
      }
      setIsCreateOpen(false);
      setEditingDept(null);
      setDeptForm({ departmentName: '', budget: '', departmentHeadId: '' });
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingDept) return;
    try {
      await deleteDepartment(deletingDept.id);
      toast.success('Department deleted successfully');
      setDeletingDept(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  const openCreateModal = () => {
    setDeptForm({ departmentName: '', budget: '', departmentHeadId: '' });
    setEligibleManagers([]);
    setIsCreateOpen(true);
  };

  const openEditModal = async (dept: Department) => {
    setDeptForm({ 
      departmentName: dept.departmentName, 
      budget: dept.budget || '',
      departmentHeadId: dept.departmentHeadId || ''
    });
    setEditingDept(dept);
    
    // Fetch eligible managers for this department
    try {
      const mgrs = await getManagersByDepartment(dept.id);
      setEligibleManagers(mgrs);
    } catch (err) {
      toast.error('Failed to load eligible managers');
    }
  };



  return (
    <div className={`min-h-full w-full p-4 sm:p-8 transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Building className={`h-8 w-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              Department Management
            </h1>
            <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Create and organize departments, and assign department heads.
            </p>
          </div>
          <button 
            onClick={openCreateModal}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
              isDark ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
            }`}
          >
            <Plus className="h-4 w-4" />
            Create Department
          </button>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments..."
              className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                isDark ? 'border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500 focus:ring-purple-500' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-purple-500 shadow-sm'
              }`}
            />
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-zinc-500">Loading departments...</div>
          ) : departments.filter(d => d.departmentName.toLowerCase().includes(search.toLowerCase())).map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isDark ? 'border-white/5 bg-zinc-900/40 backdrop-blur-xl' : 'border-slate-200 bg-white/60 backdrop-blur-xl shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'
                }`}>
                  <Building className="h-6 w-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(dept)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingDept(dept)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-zinc-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className={`text-xl font-extrabold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{dept.departmentName}</h3>
              <p className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Head: <span className={isDark ? 'text-zinc-200' : 'text-slate-800'}>{dept.head || 'Unassigned'}</span>
              </p>

              <div className={`mt-6 grid grid-cols-2 gap-4 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div>
                  <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Employees</p>
                  <p className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{dept.count || 0}</p>
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Budget</p>
                  <p className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{dept.budget || 'Not Allocated'}</p>
                </div>
              </div>

            </motion.div>
          ))}
          {!isLoading && departments.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500">No departments found.</div>
          )}
        </div>

        {/* Create / Edit Department Modal */}
        <ModalWrapper 
          isOpen={isCreateOpen || !!editingDept} 
          onClose={() => { setIsCreateOpen(false); setEditingDept(null); }} 
          title={editingDept ? 'Update Department' : 'Create Department'}
        >
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Department Name</label>
              <input type="text" value={deptForm.departmentName} onChange={e => setDeptForm({...deptForm, departmentName: e.target.value})} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                isDark ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900'
              }`} placeholder="e.g. Design" />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Allocated Budget</label>
              <input type="text" value={deptForm.budget} onChange={e => setDeptForm({...deptForm, budget: e.target.value})} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                isDark ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900'
              }`} placeholder="e.g. $500K" />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Department Head</label>
              <select 
                value={deptForm.departmentHeadId} 
                onChange={e => setDeptForm({...deptForm, departmentHeadId: e.target.value})} 
                disabled={!editingDept}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                  isDark ? 'bg-zinc-900/50 border-zinc-800 text-white disabled:opacity-50' : 'bg-white border-slate-200 text-slate-900 disabled:opacity-50'
                }`}
              >
                <option value="">{editingDept && eligibleManagers.length === 0 ? 'No Manager Available' : 'Select a manager...'}</option>
                {eligibleManagers.map(m => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
              {!editingDept && (
                <p className={`mt-1.5 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  Save department first to assign employees as managers.
                </p>
              )}
            </div>
            <button onClick={handleSaveDept} className={`w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all ${
              isDark ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'
            }`}>
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </ModalWrapper>

        {/* Delete Confirmation Modal */}
        <ModalWrapper isOpen={!!deletingDept} onClose={() => setDeletingDept(null)} title="Delete Department">
          <div className="space-y-4">
            <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
              Are you sure you want to delete the <strong>{deletingDept?.departmentName}</strong> department? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setDeletingDept(null)} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                Delete Department
              </button>
            </div>
          </div>
        </ModalWrapper>

      </div>
    </div>
  );
}

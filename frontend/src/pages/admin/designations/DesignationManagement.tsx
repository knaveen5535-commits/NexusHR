import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { Badge, Plus, Edit2, Trash2, Search, X, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { getDesignations, createDesignation, updateDesignation, toggleDesignationStatus, deleteDesignation, type Designation } from '../../../services/designation.service';
import { getDepartments, type Department } from '../../../services/department.service';

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

export default function DesignationManagement() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState<Designation | null>(null);
  const [deletingDesig, setDeletingDesig] = useState<Designation | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<Designation | null>(null);
  
  // Form State
  const [form, setForm] = useState({ designationName: '', departmentId: '', designationType: 'EMPLOYEE' as 'EMPLOYEE'|'MANAGER'|'HR' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [desigs, depts] = await Promise.all([getDesignations(), getDepartments()]);
      setDesignations(desigs);
      setDepartments(depts);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.designationName || !form.departmentId || !form.designationType) return toast.error('All fields are required');
    try {
      const payload = {
        designationName: form.designationName,
        departmentId: Number(form.departmentId),
        designationType: form.designationType
      };
      
      if (editingDesig) {
        await updateDesignation(editingDesig.id, payload);
        toast.success('Designation updated successfully');
      } else {
        await createDesignation(payload);
        toast.success('Designation created successfully');
      }
      setIsCreateOpen(false);
      setEditingDesig(null);
      setForm({ designationName: '', departmentId: '', designationType: 'EMPLOYEE' });
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingDesig) return;
    try {
      await deleteDesignation(deletingDesig.id);
      toast.success('Designation deleted successfully');
      setDeletingDesig(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete designation');
    }
  };
  
  const handleToggleStatus = async () => {
    if (!togglingStatus) return;
    try {
      await toggleDesignationStatus(togglingStatus.id);
      toast.success('Status updated successfully');
      setTogglingStatus(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openCreateModal = () => {
    setForm({ designationName: '', departmentId: '', designationType: 'EMPLOYEE' });
    setIsCreateOpen(true);
  };

  const openEditModal = (desig: Designation) => {
    setForm({ designationName: desig.designationName, departmentId: String(desig.departmentId), designationType: desig.designationType });
    setEditingDesig(desig);
  };



  return (
    <div className={`min-h-full w-full p-4 sm:p-8 transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Badge className={`h-8 w-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              Designation Management
            </h1>
            <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Create and manage job designations across departments.
            </p>
          </div>
          <button 
            onClick={openCreateModal}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
              isDark ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
            }`}
          >
            <Plus className="h-4 w-4" />
            Create Designation
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
              placeholder="Search designations..."
              className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                isDark ? 'border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500 focus:ring-purple-500' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-purple-500 shadow-sm'
              }`}
            />
          </div>
        </div>

        {/* Designations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-zinc-500">Loading designations...</div>
          ) : designations.filter(d => d.designationName.toLowerCase().includes(search.toLowerCase())).map((desig, i) => {
            const dept = departments.find(d => d.id === desig.departmentId);
            return (
            <motion.div
              key={desig.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isDark ? 'border-white/5 bg-zinc-900/40 backdrop-blur-xl' : 'border-slate-200 bg-white/60 backdrop-blur-xl shadow-md'
              } ${!desig.active ? 'opacity-70' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'
                }`}>
                  <Badge className="h-6 w-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setTogglingStatus(desig)} title={desig.active ? "Deactivate" : "Activate"} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400' : 'hover:bg-amber-50 text-slate-500 hover:text-amber-600'}`}>
                    <PowerOff className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEditModal(desig)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingDesig(desig)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-zinc-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className={`text-xl font-extrabold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{desig.designationName}</h3>
              <p className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Department: <span className={isDark ? 'text-zinc-200' : 'text-slate-800'}>{dept?.departmentName || 'Unknown'}</span>
              </p>

              <div className={`mt-6 grid grid-cols-2 gap-4 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <div>
                  <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Role Type</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                    desig.designationType === 'HR' ? 'bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-500/20' :
                    desig.designationType === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20'
                  }`}>
                    {desig.designationType}
                  </span>
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Status</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    desig.active ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                    'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20'
                  }`}>
                    {desig.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </motion.div>
          )})}
          {!isLoading && designations.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500">No designations found.</div>
          )}
        </div>

        {/* Create / Edit Designation Modal */}
        <ModalWrapper 
          isOpen={isCreateOpen || !!editingDesig} 
          onClose={() => { setIsCreateOpen(false); setEditingDesig(null); }} 
          title={editingDesig ? 'Update Designation' : 'Create Designation'}
        >
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Designation Name</label>
              <input type="text" value={form.designationName} onChange={e => setForm({...form, designationName: e.target.value})} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                isDark ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900'
              }`} placeholder="e.g. Senior Developer" />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Department</label>
              <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.departmentName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Role Type</label>
              <select value={form.designationType} onChange={e => setForm({...form, designationType: e.target.value as any})} className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <button onClick={handleSave} className={`w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all ${
              isDark ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'
            }`}>
              {editingDesig ? 'Save Changes' : 'Create Designation'}
            </button>
          </div>
        </ModalWrapper>

        {/* Status Confirmation Modal */}
        <ModalWrapper isOpen={!!togglingStatus} onClose={() => setTogglingStatus(null)} title="Change Status">
          <div className="space-y-4">
            <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
              Are you sure you want to {togglingStatus?.active ? 'deactivate' : 'activate'} the <strong>{togglingStatus?.designationName}</strong> designation?
            </p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setTogglingStatus(null)} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
                Cancel
              </button>
              <button onClick={handleToggleStatus} className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                togglingStatus?.active ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}>
                Yes, Change Status
              </button>
            </div>
          </div>
        </ModalWrapper>

        {/* Delete Confirmation Modal */}
        <ModalWrapper isOpen={!!deletingDesig} onClose={() => setDeletingDesig(null)} title="Delete Designation">
          <div className="space-y-4">
            <p className={`text-sm ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
              Are you sure you want to delete the <strong>{deletingDesig?.designationName}</strong> designation? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setDeletingDesig(null)} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                Delete Designation
              </button>
            </div>
          </div>
        </ModalWrapper>

      </div>
    </div>
  );
}

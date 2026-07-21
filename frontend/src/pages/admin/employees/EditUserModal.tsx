import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateEmployee } from '../../../services/employee.service';
import { getDepartments, type Department } from '../../../services/department.service';
import { getDesignations, type Designation } from '../../../services/designation.service';
import { useTheme } from '../../../hooks/useTheme';
import type { Employee } from '../../../types';

interface EditUserModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({ isOpen, employee, onClose, onSuccess }: EditUserModalProps) {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    salary: '0', // Adjust if salary is in employee type
    departmentId: '',
    designationId: '',
    managerId: '',
    role: 'EMPLOYEE' as 'HR' | 'MANAGER' | 'EMPLOYEE',
    employmentType: '',
  });

  useEffect(() => {
    if (isOpen && employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: (employee as any).phone || '',
        salary: (employee as any).salary ? (employee as any).salary.toString() : '0', 
        departmentId: '', 
        designationId: '', 
        managerId: '',
        role: (employee.role?.toUpperCase() as 'HR' | 'MANAGER' | 'EMPLOYEE') || 'EMPLOYEE',
        employmentType: employee.employmentType || '',
      });
      getDepartments().then(depts => {
        setDepartments(depts);
        if (employee.departmentName) {
          const match = depts.find(d => d.departmentName === employee.departmentName);
          if (match) setFormData(prev => ({ ...prev, departmentId: match.id.toString() }));
        }
      }).catch(console.error);
    }
  }, [isOpen, employee]);

  useEffect(() => {
    if (formData.departmentId && formData.role) {
      getDesignations(Number(formData.departmentId), formData.role).then((res) => {
        const activeDesignations = res.filter(d => d.active);
        setDesignations(activeDesignations);
        const existing = activeDesignations.find(d => d.designationName === employee?.designation);
        if (existing) {
          setFormData(prev => ({ ...prev, designationId: existing.id.toString() }));
        } else if (activeDesignations.length > 0 && !activeDesignations.find(d => d.id.toString() === formData.designationId)) {
          setFormData(prev => ({ ...prev, designationId: activeDesignations[0].id.toString() }));
        } else if (activeDesignations.length === 0) {
          setFormData(prev => ({ ...prev, designationId: '' }));
        }
      }).catch(console.error);
    }
  }, [formData.departmentId, formData.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'role') {
        if (value === 'HR') {
          const hrDept = departments.find(d => d.departmentName.toLowerCase().includes('human resources') || d.departmentName.toLowerCase().includes('hr'));
          if (hrDept) next.departmentId = hrDept.id.toString();
          next.managerId = '';
        } else if (value === 'MANAGER') {
          next.managerId = '';
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address containing "@"');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    setIsLoading(true);
    try {
      await updateEmployee(Number(employee.id), {
        ...formData,
        salary: Number(formData.salary) || 0,
        departmentId: Number(formData.departmentId),
        designationId: Number(formData.designationId),
      });
      toast.success('User updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data || 'Failed to update user.';
      toast.error(typeof msg === 'string' ? msg : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && employee && (
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
            className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  <Edit2 className="h-5 w-5" />
                </div>
                <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Edit User
                </h2>
              </div>
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="edit-user-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                
                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>First Name *</label>
                  <input
                    required name="firstName" value={formData.firstName} onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Last Name *</label>
                  <input
                    required name="lastName" value={formData.lastName} onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Email *</label>
                  <input
                    required type="email" name="email" value={formData.email} onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Phone *</label>
                  <input
                    required type="text" name="phone" value={formData.phone} onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Role *</label>
                  <select
                    required name="role" value={formData.role} onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR">HR</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Salary *</label>
                  <input
                    required type="number" name="salary" value={formData.salary} onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Employment Type</label>
                  <select
                    name="employmentType" value={formData.employmentType} onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  >
                    <option value="">Select Type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Department *</label>
                  <select
                    required name="departmentId" value={formData.departmentId} onChange={handleChange}
                    disabled={formData.role === 'HR'}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Designation *</label>
                  <select
                    required name="designationId" value={formData.designationId} onChange={handleChange}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  >
                    <option value="" disabled>Select Designation</option>
                    {designations.map((desig) => (
                      <option key={desig.id} value={desig.id}>{desig.designationName}</option>
                    ))}
                  </select>
                </div>

              </form>
            </div>

            <div className={`p-6 border-t flex justify-end gap-3 ${isDark ? 'border-zinc-800 bg-zinc-950/80' : 'border-slate-200 bg-slate-50'}`}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all ${isDark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-white'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-user-form"
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${isDark ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'} disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { Shield, Plus, Key, Lock, Users, X, CheckSquare, Square } from 'lucide-react';

const MOCK_ROLES = [
  { id: 1, name: 'Administrator', users: 4, permissions: ['Manage Employees', 'System Config', 'Manage Roles', 'Analytics'] },
  { id: 2, name: 'HR Manager', users: 12, permissions: ['Manage Employees', 'Payroll', 'Reports', 'Leave Approvals'] },
  { id: 3, name: 'Team Manager', users: 84, permissions: ['View Team', 'Approve Leave', 'Performance Reviews'] },
  { id: 4, name: 'Employee', users: 1147, permissions: ['View Profile', 'Apply Leave', 'View Payslips'] },
];

const ALL_PERMISSIONS = [
  'Manage Employees', 'System Config', 'Manage Roles', 'Analytics',
  'Payroll', 'Reports', 'Leave Approvals', 'View Team', 'Approve Leave',
  'Performance Reviews', 'View Profile', 'Apply Leave', 'View Payslips'
];

export default function RoleManagement() {
  const { isDark } = useTheme();

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [managingPermsRole, setManagingPermsRole] = useState<any>(null);
  const [viewingUsersRole, setViewingUsersRole] = useState<any>(null);

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
            <div className="p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`min-h-full w-full p-4 sm:p-8 transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Shield className={`h-8 w-8 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              Role Management
            </h1>
            <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Define roles, assign permissions, and manage user access control.
            </p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
              isDark ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
            }`}
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_ROLES.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-xl ${
                isDark ? 'border-white/5 bg-zinc-900/40 backdrop-blur-xl' : 'border-slate-200 bg-white/60 backdrop-blur-xl shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <Key className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{role.name}</h3>
                    <p className={`text-sm flex items-center gap-1 font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                      <Users className="h-4 w-4" /> {role.users} Active Users
                    </p>
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <p className={`text-xs uppercase tracking-wider font-bold mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Key Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm, idx) => (
                    <span key={idx} className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                      isDark ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setManagingPermsRole(role)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border ${
                    isDark ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Lock className="h-4 w-4" /> Permissions
                </button>
                <button 
                  onClick={() => setViewingUsersRole(role)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border ${
                    isDark ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users className="h-4 w-4" /> Users
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Role Modal */}
        <ModalWrapper isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Role">
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Role Name</label>
              <input type="text" className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                isDark ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`} placeholder="e.g. Guest" />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-3 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Select Initial Permissions</label>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl border ${isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-200 bg-slate-50'}`}>
                {ALL_PERMISSIONS.slice(0, 6).map(perm => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                      isDark ? 'border-zinc-700 bg-zinc-800 group-hover:border-amber-500' : 'border-slate-300 bg-white group-hover:border-amber-500'
                    }`}>
                      {/* Check icon would go here if selected */}
                    </div>
                    <span className={`text-sm ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={() => setIsCreateOpen(false)} className={`w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all ${
              isDark ? 'bg-amber-600 hover:bg-amber-500' : 'bg-amber-600 hover:bg-amber-700'
            }`}>
              Save Role
            </button>
          </div>
        </ModalWrapper>

        {/* Manage Permissions Modal */}
        <ModalWrapper isOpen={!!managingPermsRole} onClose={() => setManagingPermsRole(null)} title={`Permissions for ${managingPermsRole?.name}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_PERMISSIONS.map((perm) => {
                const hasPerm = managingPermsRole?.permissions.includes(perm);
                return (
                  <label key={perm} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    hasPerm 
                      ? isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                      : isDark ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}>
                    {hasPerm ? (
                      <CheckSquare className={`h-5 w-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    ) : (
                      <Square className={`h-5 w-5 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
                    )}
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{perm}</span>
                  </label>
                );
              })}
            </div>
            <button onClick={() => setManagingPermsRole(null)} className={`w-full mt-4 py-3 rounded-xl text-sm font-bold text-white transition-all ${
              isDark ? 'bg-amber-600 hover:bg-amber-500' : 'bg-amber-600 hover:bg-amber-700'
            }`}>
              Update Permissions
            </button>
          </div>
        </ModalWrapper>

        {/* View Users Modal */}
        <ModalWrapper isOpen={!!viewingUsersRole} onClose={() => setViewingUsersRole(null)} title={`Users with ${viewingUsersRole?.name} Role`}>
          <div className="space-y-3">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>JD</div>
                <div>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>John Doe</p>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>john@nexushr.com</p>
                </div>
              </div>
              <button className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                Revoke Role
              </button>
            </div>
            {/* Dummy user 2 */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>SS</div>
                <div>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Sarah Smith</p>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>sarah@nexushr.com</p>
                </div>
              </div>
              <button className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                Revoke Role
              </button>
            </div>
            
            <button className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-dashed transition-colors ${
              isDark ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}>
              <Plus className="h-4 w-4" /> Add User to Role
            </button>
          </div>
        </ModalWrapper>

      </div>
    </div>
  );
}

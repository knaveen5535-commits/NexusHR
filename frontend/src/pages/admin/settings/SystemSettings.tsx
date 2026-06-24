import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { Settings, Building2, Calendar, FileText, DollarSign, Bell, ChevronRight, X, Check } from 'lucide-react';

const SETTING_MODULES = [
  { id: 'profile', name: 'Company Profile', desc: 'Manage legal entity details and branding.', icon: Building2 },
  { id: 'holidays', name: 'Holiday Calendar', desc: 'Configure regional public holidays.', icon: Calendar },
  { id: 'leave', name: 'Leave Policies', desc: 'Set accruals, carry-overs, and approvals.', icon: FileText },
  { id: 'payroll', name: 'Payroll Settings', desc: 'Tax rules, pay cycles, and bank details.', icon: DollarSign },
  { id: 'notif', name: 'Notification Settings', desc: 'Email/SMS triggers and templates.', icon: Bell },
];

export default function SystemSettings() {
  const { isDark } = useTheme();
  const [activeSetting, setActiveSetting] = useState<string | null>(null);

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
            className={`relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              {children}
            </div>
            <div className={`p-6 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'} flex justify-end gap-3`}>
              <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                isDark ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
                Cancel
              </button>
              <button onClick={onClose} className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                isDark ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}>
                Save Configuration
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`min-h-full w-full p-4 sm:p-8 transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Settings className={`h-8 w-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            System Settings
          </h1>
          <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Configure global platform parameters and enterprise policies.
          </p>
        </motion.div>

        <div className="space-y-4">
          {SETTING_MODULES.map((setting, i) => {
            const Icon = setting.icon;
            return (
              <motion.div
                key={setting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                onClick={() => setActiveSetting(setting.id)}
                className={`group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  isDark ? 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{setting.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{setting.desc}</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Company Profile Form Modal */}
        <ModalWrapper isOpen={activeSetting === 'profile'} onClose={() => setActiveSetting(null)} title="Company Profile">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Legal Entity Name</label>
            <input type="text" defaultValue="NexusHR Corporation" className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Tax ID / EIN</label>
            <input type="text" defaultValue="12-3456789" className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Corporate Address</label>
            <textarea rows={3} defaultValue="123 Innovation Drive, Tech City, CA 94043" className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
          </div>
        </ModalWrapper>

        {/* Holiday Calendar Form Modal */}
        <ModalWrapper isOpen={activeSetting === 'holidays'} onClose={() => setActiveSetting(null)} title="Holiday Calendar">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'} flex justify-between items-center`}>
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>New Year's Day</p>
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>January 1, 2024</p>
            </div>
            <button className={`text-sm text-red-500 hover:text-red-400`}>Remove</button>
          </div>
          <button className={`w-full mt-2 py-2.5 rounded-xl text-sm font-bold border border-dashed transition-colors flex justify-center items-center gap-2 ${
            isDark ? 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500' : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400'
          }`}>
            <span className="text-lg">+</span> Add Holiday
          </button>
        </ModalWrapper>

        {/* Leave Policies Form Modal */}
        <ModalWrapper isOpen={activeSetting === 'leave'} onClose={() => setActiveSetting(null)} title="Leave Policies">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Annual Paid Leave Days</span>
            <input type="number" defaultValue={21} className={`w-24 rounded-xl border px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Sick Leave Days</span>
            <input type="number" defaultValue={10} className={`w-24 rounded-xl border px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer mt-4">
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Allow Unused Leave Carry-over</span>
          </label>
        </ModalWrapper>

        {/* Payroll Settings Form Modal */}
        <ModalWrapper isOpen={activeSetting === 'payroll'} onClose={() => setActiveSetting(null)} title="Payroll Settings">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Pay Cycle Frequency</label>
            <select className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <option>Bi-Weekly</option>
              <option>Monthly</option>
              <option>Semi-Monthly</option>
            </select>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Default Overtime Rate (Multiplier)</span>
            <input type="number" step="0.5" defaultValue={1.5} className={`w-24 rounded-xl border px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
          </div>
        </ModalWrapper>

        {/* Notification Settings Form Modal */}
        <ModalWrapper isOpen={activeSetting === 'notif'} onClose={() => setActiveSetting(null)} title="Notification Settings">
          <div className="space-y-4">
            {['Email Alerts for Leave Requests', 'SMS Alerts for Payroll Execution', 'Weekly Digest for Managers'].map((item, idx) => (
              <label key={idx} className="flex items-center justify-between cursor-pointer">
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item}</span>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${idx !== 1 ? (isDark ? 'bg-blue-600' : 'bg-blue-600') : (isDark ? 'bg-zinc-700' : 'bg-slate-300')}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${idx !== 1 ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>
            ))}
          </div>
        </ModalWrapper>

      </div>
    </div>
  );
}

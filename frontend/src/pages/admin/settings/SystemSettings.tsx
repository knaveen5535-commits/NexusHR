import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { Settings, TrendingUp, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { performanceService } from '../../../services/performance.service';
import type { PerformanceConfiguration } from '../../../types/performance.types';

const SETTING_MODULES = [
  { id: 'perf', name: 'Performance Settings', desc: 'Review cycles, feedback windows, and goals.', icon: TrendingUp },
];

const ModalWrapper = ({ isOpen, onClose, title, children, customSaveAction, isLoading }: any) => {
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
              <button 
                disabled={isLoading}
                onClick={() => {
                  if (customSaveAction) customSaveAction();
                  else onClose();
                }} 
                className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                  isDark ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function SystemSettings() {
  const { isDark } = useTheme();
  const [activeSetting, setActiveSetting] = useState<string | null>(null);
  
  const [config, setConfig] = useState<PerformanceConfiguration>({
    attendanceWeight: 30.0,
    selfWeight: 8.0,
    peerWeight: 12.0,
    managerWeight: 50.0,
    reviewWindowStartDay: 1,
    reviewWindowEndDay: 5,
    minimumAttendanceRequired: 0.0,
    performanceEnabled: true
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await performanceService.getConfiguration();
        if (response.data) {
          setConfig(response.data);
        }
      } catch (error) {
        console.error('Failed to load performance configuration:', error);
        toast.error('Failed to load performance configuration');
      }
    };
    fetchConfig();
  }, []);

  const handleSavePerfSettings = async () => {
    setIsLoading(true);
    try {
      const response = await performanceService.updateConfiguration(config);
      if (response.data) {
        setConfig(response.data);
      }
      toast.success('Performance Settings Saved!');
      setActiveSetting(null);
    } catch (error) {
      console.error('Failed to save performance configuration:', error);
      toast.error('Failed to save performance configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (field: keyof PerformanceConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

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

        {/* Performance Settings Form Modal */}
        <ModalWrapper 
          isOpen={activeSetting === 'perf'} 
          onClose={() => setActiveSetting(null)} 
          title="Performance Settings"
          customSaveAction={handleSavePerfSettings}
          isLoading={isLoading}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Attendance Weight (%)</label>
                <input 
                  type="number" 
                  value={config.attendanceWeight} 
                  onChange={(e) => handleConfigChange('attendanceWeight', parseFloat(e.target.value))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Self Review Weight (%)</label>
                <input 
                  type="number" 
                  value={config.selfWeight} 
                  onChange={(e) => handleConfigChange('selfWeight', parseFloat(e.target.value))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Peer Review Weight (%)</label>
                <input 
                  type="number" 
                  value={config.peerWeight} 
                  onChange={(e) => handleConfigChange('peerWeight', parseFloat(e.target.value))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Manager Review Weight (%)</label>
                <input 
                  type="number" 
                  value={config.managerWeight} 
                  onChange={(e) => handleConfigChange('managerWeight', parseFloat(e.target.value))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
                />
              </div>
            </div>
            
            <hr className={`my-4 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Review Window Start Day</label>
                <input 
                  type="number" 
                  value={config.reviewWindowStartDay} 
                  onChange={(e) => handleConfigChange('reviewWindowStartDay', parseInt(e.target.value))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Review Window End Day</label>
                <input 
                  type="number" 
                  value={config.reviewWindowEndDay} 
                  onChange={(e) => handleConfigChange('reviewWindowEndDay', parseInt(e.target.value))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Minimum Attendance Required (%)</label>
              <input 
                type="number" 
                value={config.minimumAttendanceRequired} 
                onChange={(e) => handleConfigChange('minimumAttendanceRequired', parseFloat(e.target.value))}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer mt-4">
              <input 
                type="checkbox" 
                checked={config.performanceEnabled} 
                onChange={(e) => handleConfigChange('performanceEnabled', e.target.checked)}
                className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" 
              />
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Enable Performance Generation</span>
            </label>
          </div>
        </ModalWrapper>

      </div>
    </div>
  );
}

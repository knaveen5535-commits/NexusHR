import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { FileText, Download, TrendingUp, Users, DollarSign, CalendarCheck, Brain, X } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'emp', name: 'Employee Report', desc: 'Headcount, diversity, and turnover metrics.', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'pay', name: 'Payroll Report', desc: 'Salary distributions, tax deductions, and bonuses.', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'att', name: 'Attendance Report', desc: 'Absenteeism, overtime, and leave balances.', icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'perf', name: 'Performance Report', desc: 'Review scores, goal completion, and feedback.', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'ai', name: 'AI Insights Report', desc: 'Predictive analytics for attrition and engagement.', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export default function Reports() {
  const { isDark } = useTheme();
  const [generatingReport, setGeneratingReport] = useState<any>(null);

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
            className={`relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Download className="h-5 w-5" />
                {title}
              </h2>
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {children}
            </div>
            <div className={`p-6 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'} flex justify-end gap-3`}>
              <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                isDark ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
                Cancel
              </button>
              <button onClick={onClose} className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center gap-2 ${
                isDark ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}>
                <Download className="h-4 w-4" /> Download PDF
              </button>
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
              <FileText className={`h-8 w-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              Reports & Analytics
            </h1>
            <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Generate and export comprehensive operational insights.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORT_TYPES.map((report, i) => {
            const Icon = report.icon;
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col ${
                  isDark ? 'border-white/5 bg-zinc-900/40 backdrop-blur-xl' : 'border-slate-200 bg-white/60 backdrop-blur-xl shadow-md'
                }`}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${report.bg}`}>
                  <Icon className={`h-6 w-6 ${report.color}`} />
                </div>
                
                <h3 className={`text-xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{report.name}</h3>
                <p className={`text-sm font-medium mb-6 flex-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{report.desc}</p>
                
                <button 
                  onClick={() => setGeneratingReport(report)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border mt-auto ${
                    isDark ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Download className="h-4 w-4" /> Configure & Generate
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Generate Report Modal */}
        <ModalWrapper isOpen={!!generatingReport} onClose={() => setGeneratingReport(null)} title={`Generate ${generatingReport?.name}`}>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Date Range</label>
            <select className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
              isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Department Filter</label>
            <select className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
              isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Sales</option>
              <option>HR</option>
            </select>
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Export Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="format" defaultChecked className="text-emerald-600 focus:ring-emerald-500" />
                <span className={`text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>PDF</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="format" className="text-emerald-600 focus:ring-emerald-500" />
                <span className={`text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Excel (CSV)</span>
              </label>
            </div>
          </div>
        </ModalWrapper>

      </div>
    </div>
  );
}

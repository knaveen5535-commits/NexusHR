import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { exportDashboardPdf } from '../../../utils/exportPdf';
import { getDashboardStats, type DashboardStats } from '../../../services/employee.service';
import { 
  Users, UserCheck, Building, Briefcase,
  DollarSign, Activity, Brain, UserCog, Calendar, 
  ShieldCheck, Download
} from 'lucide-react';


export default function AdminDashboard() {
  const { isDark } = useTheme();
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const dynamicKpis = [
    { label: 'Total Employees', value: isLoading ? '...' : stats?.totalEmployees.toString() || '0', icon: Users, color: 'text-blue-500', glow: 'shadow-blue-500/20', bg: 'bg-blue-500/10' },
    { label: 'Active Employees', value: isLoading ? '...' : stats?.activeEmployees.toString() || '0', icon: UserCheck, color: 'text-emerald-500', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' },
    { label: 'Departments Count', value: isLoading ? '...' : stats?.departmentsCount.toString() || '0', icon: Building, color: 'text-purple-500', glow: 'shadow-purple-500/20', bg: 'bg-purple-500/10' },
    { label: 'Managers Count', value: isLoading ? '...' : stats?.managersCount.toString() || '0', icon: Briefcase, color: 'text-amber-500', glow: 'shadow-amber-500/20', bg: 'bg-amber-500/10' },
    { label: 'HR Staff Count', value: isLoading ? '...' : stats?.hrStaffCount.toString() || '0', icon: UserCog, color: 'text-rose-500', glow: 'shadow-rose-500/20', bg: 'bg-rose-500/10' },
    { label: 'Monthly Payroll Cost', value: isLoading ? '...' : `$${(stats?.monthlyPayrollCost || 0).toLocaleString()}`, icon: DollarSign, color: 'text-cyan-500', glow: 'shadow-cyan-500/20', bg: 'bg-cyan-500/10' },
  ];

  const handleDownloadReport = async () => {
    if (!reportRef.current || downloading) return;
    setDownloading(true);
    try {
      await exportDashboardPdf(reportRef.current, 'admin-dashboard-report');
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className={`min-h-full w-full p-4 sm:p-6 lg:p-8 transition-colors duration-500 overflow-hidden relative ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full mix-blend-screen filter blur-[120px] opacity-50"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(255,255,255,0) 70%)' }}
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -30, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full mix-blend-screen filter blur-[120px] opacity-40"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(255,255,255,0) 70%)' }}
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 40, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div ref={reportRef} className="relative z-10 max-w-[1600px] mx-auto space-y-8">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-transparent"
        >
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2 ${isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Administration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight flex items-center gap-3">
              Command Center
            </h1>
            <p className={`text-base sm:text-lg max-w-2xl font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Complete overview of enterprise workforce metrics and core management operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadReport}
              disabled={downloading}
              className={`group relative flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden
                ${isDark 
                  ? 'bg-zinc-800/50 text-white border border-white/10 hover:border-blue-500/50 hover:bg-zinc-800' 
                  : 'bg-white text-slate-900 border border-slate-200 hover:border-blue-500/30 hover:bg-slate-50 hover:shadow-xl'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <Download className={`h-4 w-4 relative z-10 transition-transform group-hover:-translate-y-0.5 ${downloading ? 'animate-bounce text-blue-500' : ''}`} />
              <span className="relative z-10">{downloading ? 'Generating Report...' : 'Export PDF'}</span>
            </button>
          </div>
        </motion.div>

        {/* Dashboard Overview - KPI Grid */}
        <div className="pt-4">
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Overview Statistics</h2>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5"
          >
            {dynamicKpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`group relative overflow-hidden flex flex-col p-6 rounded-3xl border transition-all duration-300 ${
                    isDark 
                      ? 'bg-[#111116]/80 border-white/5 shadow-xl shadow-black/20 hover:border-white/10 hover:shadow-2xl hover:bg-[#16161e]' 
                      : 'bg-white border-slate-200/60 shadow-lg shadow-slate-200/40 hover:border-slate-300 hover:shadow-xl'
                  }`}
                >
                  {/* Subtle gradient background on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent ${isDark ? 'to-white/[0.02]' : 'to-slate-900/[0.02]'}`} />
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${kpi.bg} ${kpi.glow} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300`}>
                      <Icon className={`h-7 w-7 ${kpi.color}`} />
                    </div>
                  </div>
                  
                  <div className="mt-6 relative z-10">
                    <h3 className={`text-sm font-semibold tracking-wide ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {kpi.label}
                    </h3>
                    <p className={`text-3xl font-black mt-2 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {kpi.value}
                    </p>
                  </div>

                  {/* Decorative corner accent */}
                  <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${kpi.bg}`} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { 
  Users, UserCheck, Building, Briefcase, FileText, Settings, 
  DollarSign, Activity, Brain, Shield, UserCog, Calendar, 
  ShieldCheck, Download, ChevronRight
} from 'lucide-react';

// Overview KPIs
const kpis = [
  { label: 'Total Employees', value: '1,247', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Active Employees', value: '1,180', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Departments Count', value: '12', icon: Building, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { label: 'Managers Count', value: '84', icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'HR Staff Count', value: '12', icon: UserCog, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { label: 'Monthly Payroll Cost', value: '$4.2M', icon: DollarSign, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { label: 'Attendance %', value: '94.7%', icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { label: 'Attrition Rate', value: '4.2%', icon: Activity, color: 'text-red-500', bg: 'bg-red-500/10' },
  { label: 'AI Workforce Score', value: '88/100', icon: Brain, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
];

// Management Modules
const managementModules = [
  {
    title: 'Employee Management',
    desc: 'Manage the complete employee lifecycle and profile status.',
    icon: Users,
    gradient: 'from-blue-600 to-blue-400',
    glow: 'rgba(59,130,246,0.2)',
    actions: [
      'Add Employee', 'Edit Employee', 'Delete Employee', 
      'Assign Department', 'Assign Manager', 'Activate/Deactivate Employee'
    ]
  },
  {
    title: 'Department Management',
    desc: 'Structure your organization and manage departmental hierarchies.',
    icon: Building,
    gradient: 'from-purple-600 to-purple-400',
    glow: 'rgba(168,85,247,0.2)',
    actions: [
      'Create Department', 'Update Department', 
      'Delete Department', 'Department Head Assignment'
    ]
  },
  {
    title: 'Role Management',
    desc: 'Define security access and system permissions for users.',
    icon: Shield,
    gradient: 'from-amber-600 to-amber-400',
    glow: 'rgba(245,158,11,0.2)',
    actions: [
      'Create Roles', 'Assign Permissions', 'User Access Control'
    ]
  },
  {
    title: 'Reports & Analytics',
    desc: 'Generate comprehensive insights across all workforce operations.',
    icon: FileText,
    gradient: 'from-emerald-600 to-emerald-400',
    glow: 'rgba(16,185,129,0.2)',
    actions: [
      'Employee Report', 'Payroll Report', 'Attendance Report', 
      'Performance Report', 'AI Insights Report'
    ]
  },
  {
    title: 'System Settings',
    desc: 'Configure global platform parameters and enterprise policies.',
    icon: Settings,
    gradient: 'from-slate-600 to-slate-400',
    glow: 'rgba(100,116,139,0.2)',
    actions: [
      'Company Profile', 'Holiday Calendar', 'Leave Policies', 
      'Payroll Settings', 'Notification Settings'
    ]
  }
];

export default function AdminDashboard() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-full w-full p-4 sm:p-8 transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Premium Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.15)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 -left-20 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: isDark ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.15)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <ShieldCheck className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              Admin Command Center
            </h1>
            <p className={`mt-2 text-sm sm:text-base max-w-2xl font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Complete overview of enterprise workforce metrics and core management modules.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm ${
              isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}>
              <Download className="h-4 w-4" />
              Download Full Report
            </button>
          </div>
        </motion.div>

        {/* Dashboard Overview - KPI Grid */}
        <div>
          <h2 className={`text-xl font-extrabold mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`flex items-center p-4 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg ${
                    isDark ? 'bg-zinc-900/50 border-white/5 backdrop-blur-xl hover:bg-zinc-800/80' : 'bg-white/80 border-slate-200 backdrop-blur-xl hover:bg-white'
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bg} mr-4`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                      {kpi.label}
                    </p>
                    <p className={`text-2xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {kpi.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Management & Configuration Modules */}
        <div>
          <h2 className={`text-xl font-extrabold mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Administrative Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {managementModules.map((module, index) => {
              const Icon = module.icon;
              // Make Employee Management span 2 columns on large screens to balance grid if desired,
              // or keep standard grid. Standard grid looks cleaner for long lists.
              const isLarge = index === 0; 
              
              return (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className={`group relative overflow-hidden flex flex-col rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${
                    isLarge ? 'md:col-span-2 xl:col-span-2 flex-row gap-6' : ''
                  } ${
                    isDark 
                      ? 'border-white/5 bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-xl' 
                      : 'border-slate-200 bg-white/60 hover:bg-white backdrop-blur-xl shadow-md hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
                  }`}
                >
                  {/* Premium Glow Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, ${module.glow}, transparent 70%)` }}
                  />

                  {/* Header / Icon */}
                  <div className={`flex flex-col mb-5 ${isLarge ? 'md:w-1/3 md:mb-0 justify-center' : ''}`}>
                    <div className="relative mb-4 inline-block self-start">
                      <div className={`absolute inset-0 blur-xl opacity-40 bg-gradient-to-br ${module.gradient} group-hover:opacity-80 transition-opacity`} />
                      <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${module.gradient} shadow-lg`}>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 rounded-2xl" />
                        <Icon className="h-6 w-6 text-white relative z-10" />
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {module.title}
                      </h3>
                      <p className={`text-sm font-medium mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {module.desc}
                      </p>
                    </div>
                  </div>

                  {/* Actions List */}
                  <div className={`flex-1 flex flex-col justify-center ${isLarge ? 'md:w-2/3 md:pl-6 md:border-l md:border-zinc-800/50' : ''}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
                      {module.actions.map((action, i) => (
                        <button 
                          key={i}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-bold transition-all group/btn ${
                            isDark 
                              ? 'bg-zinc-950/50 border-white/5 hover:border-white/10 hover:bg-zinc-800 text-zinc-300 hover:text-white' 
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate pr-2">{action}</span>
                          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform group-hover/btn:translate-x-1 ${
                            isDark ? 'text-zinc-600 group-hover/btn:text-zinc-400' : 'text-slate-400 group-hover/btn:text-slate-600'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

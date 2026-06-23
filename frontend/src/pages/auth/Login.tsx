import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useAuthStore, demoLogin } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { Shield, Users, UserCog, User, ArrowRight, Sparkles, Mail, Lock, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const demoRoles = [
  {
    id: 'admin' as const,
    label: 'Admin',
    desc: 'Full system access & analytics',
    Icon: Shield,
    gradient: 'from-blue-600 to-blue-400',
    glow: 'rgba(59,130,246,0.35)',
    color: '#3b82f6',
    email: 'admin@nexushr.com',
  },
  {
    id: 'hr' as const,
    label: 'HR Manager',
    desc: 'Employee management & payroll',
    Icon: Users,
    gradient: 'from-purple-600 to-purple-400',
    glow: 'rgba(168,85,247,0.35)',
    color: '#a855f7',
    email: 'hr@nexushr.com',
  },
  {
    id: 'manager' as const,
    label: 'Team Manager',
    desc: 'Team oversight & performance',
    Icon: UserCog,
    gradient: 'from-amber-600 to-amber-400',
    glow: 'rgba(245,158,11,0.35)',
    color: '#f59e0b',
    email: 'manager@nexushr.com',
  },
  {
    id: 'employee' as const,
    label: 'Employee',
    desc: 'Self-service & profile portal',
    Icon: User,
    gradient: 'from-emerald-600 to-emerald-400',
    glow: 'rgba(16,185,129,0.35)',
    color: '#10b981',
    email: 'employee@nexushr.com',
  },
];

/* ── Floating geometric shape ── */
function Shape({
  className,
  style,
  delay = 0,
  duration = 6,
}: {
  className: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={style}
      animate={{ y: [0, -18, 0], rotate: [0, 6, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export default function Login() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { isDark, toggle } = useTheme();

  const [selectedRole, setSelectedRole] = useState<(typeof demoRoles)[0]['id'] | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = (roleId: (typeof demoRoles)[0]['id']) => {
    setSelectedRole(roleId);
    const role = demoRoles.find((r) => r.id === roleId);
    if (role) {
      setEmail(role.email);
      setPassword('password123');
    }
  };

  if (isAuthenticated && user?.role) {
    const path =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'hr'
        ? '/hr/dashboard'
        : user.role === 'manager'
        ? '/manager/dashboard'
        : '/employee/dashboard';
    return <Navigate to={path} replace />;
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setIsLoading(true);
    
    // Simulate network delay for effect
    setTimeout(() => {
      demoLogin(selectedRole);
      const path =
        selectedRole === 'admin'
          ? '/admin/dashboard'
          : selectedRole === 'hr'
          ? '/hr/dashboard'
          : selectedRole === 'manager'
          ? '/manager/dashboard'
          : '/employee/dashboard';
      navigate(path, { replace: true });
    }, 800);
  };

  const activeRoleData = demoRoles.find(r => r.id === selectedRole);

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}
      aria-label="Login page"
    >
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggle}
          className={`relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-500 ease-in-out ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-300 border-slate-200'
          } border`}
          aria-label="Toggle theme"
        >
          <motion.div
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
            animate={{
              x: isDark ? 32 : 0,
              rotate: isDark ? 360 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {isDark ? (
              <Moon className="h-3 w-3 text-zinc-800" />
            ) : (
              <Sun className="h-3 w-3 text-amber-500" />
            )}
          </motion.div>
        </button>
      </div>

      {/* Page-level background blobs matching dashboard vibe */}
      <motion.div
        className="pointer-events-none fixed -top-40 -right-40 h-96 w-96 rounded-full blur-[120px]"
        style={{ background: 'rgba(59,130,246,0.15)' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none fixed -bottom-40 -left-40 h-96 w-96 rounded-full blur-[120px]"
        style={{ background: 'rgba(168,85,247,0.12)' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* ── Auth card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full overflow-hidden flex flex-col md:flex-row shadow-2xl transition-colors duration-500"
        style={{
          maxWidth: 1000,
          borderRadius: 24,
          boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)' : '0 32px 80px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: isDark ? 'rgba(24,24,27,0.6)' : 'rgba(255,255,255,0.8)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
          minHeight: 580,
        }}
        role="main"
      >
        {/* ════════════════════════════════════
            LEFT PANEL – gradient + shapes
            ════════════════════════════════════ */}
        <div
          className={`relative flex flex-col justify-between overflow-hidden p-10 md:w-[40%] border-b md:border-b-0 md:border-r transition-colors duration-500 ${isDark ? 'border-white/10' : 'border-slate-200'}`}
          style={{
            background: isDark 
              ? 'linear-gradient(145deg, rgba(24,24,27,0.9) 0%, rgba(9,9,11,1) 100%)'
              : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,1) 100%)',
            minHeight: 260,
          }}
          aria-hidden="true"
        >
          {/* Geometric floating shapes (blue/purple) */}
          <Shape
            className="rounded-3xl"
            style={{ width: 140, height: 140, top: -30, right: -40, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', backdropFilter: 'blur(8px)' }}
            delay={0} duration={7}
          />
          <Shape
            className="rounded-full"
            style={{ width: 90, height: 90, top: 80, left: -20, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}
            delay={1.5} duration={8}
          />
          <Shape
            className="rounded-2xl rotate-12"
            style={{ width: 110, height: 110, bottom: 100, right: 20, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}
            delay={0.8} duration={9}
          />
          <Shape
            className="rounded-full"
            style={{ width: 60, height: 60, bottom: 40, left: 30, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }}
            delay={2} duration={6}
          />

          {/* Glow orb */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ background: 'radial-gradient(circle at 30% 50%, rgba(59,130,246,0.15) 0%, transparent 65%)' }}
          />

          {/* Logo / brand */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative z-10 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-lg font-bold tracking-wide text-white">NexusHR</span>
          </motion.div>

          {/* Welcome text */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="relative z-10 mt-auto">
            <h1 className={`text-4xl font-extrabold leading-tight drop-shadow-sm md:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome<br />Back
            </h1>
            <p className={`mt-3 max-w-xs text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Sign in to continue accessing your enterprise dashboard.
            </p>

            {/* Decorative pill badges */}
            {/* <div className="mt-8 flex flex-wrap gap-2">
              {['Analytics', 'Payroll', 'HR Tools', 'AI Insights'].map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wide backdrop-blur-md border transition-colors ${
                    isDark 
                      ? 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300 shadow-sm' 
                      : 'bg-white/90 border-slate-200/80 text-slate-700 shadow-sm'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div> */}
          </motion.div>
        </div>

        {/* ════════════════════════════════════
            CENTER TABS / ROLE SWITCHERS
            ════════════════════════════════════ */}
        <div className="absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-3 items-center">
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="tabs"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                <button className={`px-6 py-3.5 rounded-[2rem] font-extrabold w-36 text-sm tracking-widest flex justify-center items-center transition-transform hover:scale-105 shadow-lg ${
                  isDark ? 'bg-white text-zinc-950 shadow-[0_8px_30px_rgba(255,255,255,0.15)]' : 'bg-slate-900 text-white shadow-[0_8px_30px_rgba(0,0,0,0.15)]'
                }`}>
                  LOGIN
                </button>
                {/* <button className={`px-6 py-3.5 rounded-[2rem] font-extrabold transition-all border w-36 text-sm tracking-widest backdrop-blur-md flex justify-center items-center hover:scale-105 shadow-lg ${
                  isDark ? 'bg-zinc-800/90 text-zinc-400 hover:bg-zinc-700/90 hover:text-white border-white/10' : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border-slate-200'
                }`}>
                  SIGN UP
                </button> */}
              </motion.div>
            ) : (
              <motion.div
                key="roles"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col gap-3 backdrop-blur-md p-3 rounded-[2rem] border shadow-2xl transition-colors duration-500 ${
                  isDark ? 'bg-zinc-900/80 border-white/10' : 'bg-white/80 border-slate-200'
                }`}
              >
                {demoRoles.map((role) => {
                  if (role.id === selectedRole) return null;
                  const RoleIcon = role.Icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role.id)}
                      className="relative group flex h-14 w-14 items-center justify-center rounded-2xl hover:scale-110 transition-all duration-300 shadow-md hover:shadow-xl"
                    >
                      {/* Premium Gradient Background */}
                      <div className={`absolute inset-0 rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${role.gradient}`} />
                      {/* Glass overlay for AI effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent opacity-50 pointer-events-none" />
                      
                      <RoleIcon className="h-6 w-6 text-white drop-shadow-md relative z-10" strokeWidth={2.5} />
                      
                      <span className={`absolute left-16 rounded-xl px-3 py-1.5 text-xs font-bold tracking-wide opacity-0 transition-all duration-300 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-xl ${
                        isDark ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white text-slate-900 border border-slate-200'
                      }`}>
                        {role.label}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ════════════════════════════════════
            RIGHT AREA
            ════════════════════════════════════ */}
        <div className={`flex flex-1 relative transition-colors duration-500 ${isDark ? 'bg-zinc-950/50' : 'bg-slate-50/50'}`}>

          {/* Right Panel Content */}
          <div className="flex-1 flex flex-col justify-center p-8 md:p-12 relative overflow-y-auto">
            
            {!selectedRole ? (
              // ── STATE 1: ROLE SELECTION LIST ──
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="mb-8 text-center md:text-left">
                  <h2 className={`text-3xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Select Role</h2>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Choose your role to continue</p>
                </div>
                
                <div className="space-y-3" role="list">
                  {demoRoles.map((role) => {
                    const RoleIcon = role.Icon;
                    return (
                      <motion.button
                        key={role.id}
                        role="listitem"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectRole(role.id)}
                        className={`group relative w-full overflow-hidden rounded-[1.25rem] border p-4 text-left transition-all duration-300 ${
                          isDark 
                            ? 'border-white/5 bg-zinc-900/40 hover:bg-white/5 hover:border-white/10' 
                            : 'border-slate-200/80 bg-white hover:bg-slate-50/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
                        }`}
                      >
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                        
                        <div className="relative flex items-center gap-5">
                          {/* AI-Style Professional Icon */}
                          <div className="relative">
                            <div className={`absolute inset-0 blur-xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 bg-gradient-to-br ${role.gradient}`} />
                            <div
                              className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} transition-transform duration-500 group-hover:scale-110 overflow-hidden`}
                              style={{ 
                                boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 14px ${role.glow}` 
                              }}
                            >
                              {/* Glass overlay */}
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                              <RoleIcon className="h-6 w-6 text-white drop-shadow-md relative z-10" strokeWidth={2.5} />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-lg font-extrabold tracking-tight leading-tight transition-colors ${isDark ? 'text-zinc-100 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-950'}`}>
                              {role.label}
                            </p>
                            <p className={`mt-1 truncate text-xs font-semibold tracking-wider uppercase ${isDark ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-slate-500 group-hover:text-slate-600'}`}>
                              {role.desc}
                            </p>
                          </div>
                          
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-110 ${
                            isDark ? 'bg-white/5 group-hover:bg-white/15' : 'bg-slate-100 group-hover:bg-slate-200'
                          }`}>
                            <ArrowRight className={`h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 ${isDark ? 'text-zinc-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              // ── STATE 2: LOGIN FORM ──
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-sm mx-auto"
              >
                {/* Mobile back button & role display */}
                <div className="mb-8 flex items-center md:hidden gap-3">
                   <button 
                     onClick={() => setSelectedRole(null)}
                     className={`p-2 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'}`}
                   >
                     <ArrowRight className="h-4 w-4 rotate-180" />
                   </button>
                   {activeRoleData && (
                     <div className="flex items-center gap-2">
                       <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${activeRoleData.gradient}`}>
                         <activeRoleData.Icon className="h-4 w-4 text-white" />
                       </div>
                       <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeRoleData.label}</span>
                     </div>
                   )}
                </div>

                <div className="text-center md:text-left mb-8 hidden md:block">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6 relative inline-flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl"
                  >
                    <div className={`absolute inset-0 rounded-2xl opacity-80 bg-gradient-to-br ${activeRoleData?.gradient}`} />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent opacity-50 pointer-events-none" />
                    <div className={`absolute inset-0 blur-xl opacity-50 bg-gradient-to-br ${activeRoleData?.gradient}`} />
                    
                    {activeRoleData && <activeRoleData.Icon className="h-10 w-10 text-white drop-shadow-md relative z-10" strokeWidth={2.5} />}
                  </motion.div>
                  <h2 className={`text-3xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sign In</h2>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Log in as <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeRoleData?.label}</span></p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          isDark ? 'border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm'
                        }`}
                        style={{ '--tw-ring-color': activeRoleData?.color } as React.CSSProperties}
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          isDark ? 'border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm'
                        }`}
                        style={{ '--tw-ring-color': activeRoleData?.color } as React.CSSProperties}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className={`h-4 w-4 rounded focus:ring-2 ${isDark ? 'border-zinc-700 bg-zinc-900 focus:ring-offset-zinc-950' : 'border-slate-300 bg-white focus:ring-offset-slate-50'}`}
                        style={{ '--tw-ring-color': activeRoleData?.color } as React.CSSProperties}
                        defaultChecked
                      />
                      <label htmlFor="remember-me" className={`ml-2 block text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <a href="#" className={`font-medium transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`} style={{ color: activeRoleData?.color }}>
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-extrabold tracking-wider uppercase text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden ${isDark ? 'focus:ring-offset-zinc-950' : 'focus:ring-offset-slate-50'}`}
                    style={{ 
                      '--tw-ring-color': activeRoleData?.color
                    } as React.CSSProperties}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${activeRoleData?.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                    
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Secure Sign In'
                      )}
                    </span>
                  </button>
                </form>

                {/* Back button for desktop */}
                <div className="mt-6 text-center hidden md:block">
                  <button 
                    onClick={() => setSelectedRole(null)}
                    className={`text-sm transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    &larr; Back to roles
                  </button>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className={`absolute bottom-6 left-0 right-0 text-center text-xs ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}
            >
              © {new Date().getFullYear()} NexusHR Enterprise. All rights reserved.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

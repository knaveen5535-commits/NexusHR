import { useState } from 'react';
import { useNavigate } from 'react-router';
import { registerAdmin } from '../../services/auth.service';
import { useTheme } from '../../hooks/useTheme';
import { Shield, Sparkles, Mail, Lock, Eye, EyeOff, Moon, Sun, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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

export default function RegisterAdmin() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Styling properties from Admin role in Login.tsx
  const gradient = 'from-blue-600 to-blue-400';
  const color = '#3b82f6';

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (!secretCode.trim()) {
      toast.error("Secret Registration Code is required");
      return;
    }

    setIsLoading(true);

    try {
      await registerAdmin({
        email,
        password,
        role: 'ADMIN',
        secretCode // Sending this to backend for validation later
      });
      
      toast.success('Admin Registration Successful!');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed', error);
      const err = error as any;
      const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to register admin. Please try again.';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Server error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}
      aria-label="Register Admin page"
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

      {/* Page-level background blobs */}
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
              Admin<br />Registration
            </h1>
            <p className={`mt-3 max-w-xs text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Create a new administrative account for system management.
            </p>
          </motion.div>
        </div>

        {/* ════════════════════════════════════
            RIGHT AREA (FORM)
            ════════════════════════════════════ */}
        <div className={`flex flex-1 relative transition-colors duration-500 ${isDark ? 'bg-zinc-950/50' : 'bg-slate-50/50'}`}>
          <div className="flex-1 flex flex-col justify-center p-8 md:p-12 relative overflow-y-auto">
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-sm mx-auto"
            >
              <div className="text-center md:text-left mb-8">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6 relative inline-flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl"
                >
                  <div className={`absolute inset-0 rounded-2xl opacity-80 bg-gradient-to-br ${gradient}`} />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent opacity-50 pointer-events-none" />
                  <div className={`absolute inset-0 blur-xl opacity-50 bg-gradient-to-br ${gradient}`} />
                  
                  <Shield className="h-10 w-10 text-white drop-shadow-md relative z-10" strokeWidth={2.5} />
                </motion.div>
                <h2 className={`text-3xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Register</h2>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  System configuration & management
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
                      style={{ '--tw-ring-color': color } as React.CSSProperties}
                      placeholder="admin@nexushr.com"
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
                      style={{ '--tw-ring-color': color } as React.CSSProperties}
                      placeholder="••••••••"
                      required
                      minLength={6}
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

                <div className="space-y-1.5">
                  <label className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        isDark ? 'border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm'
                      }`}
                      style={{ '--tw-ring-color': color } as React.CSSProperties}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Secret Registration Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className={`h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                    </div>
                    <input
                      type="password"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        isDark ? 'border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm'
                      }`}
                      style={{ '--tw-ring-color': color } as React.CSSProperties}
                      placeholder="Enter project secret"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-extrabold tracking-wider uppercase text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden ${isDark ? 'focus:ring-offset-zinc-950' : 'focus:ring-offset-slate-50'}`}
                    style={{ '--tw-ring-color': color } as React.CSSProperties}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                    
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Register Admin'
                      )}
                    </span>
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => navigate('/login')}
                  className={`text-sm font-medium transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </motion.div>

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

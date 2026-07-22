import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles, Moon, Sun, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { resetPassword, validateResetToken } from '../../services/auth.service';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { isDark, toggle } = useTheme();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      navigate('/forgot-password');
      return;
    }

    const checkToken = async () => {
      try {
        setIsValidating(true);
        const valid = await validateResetToken(token);
        setIsTokenValid(valid);
      } catch (err) {
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_\-]).{8,64}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, newPassword: password, confirmPassword });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error: any) {
      console.error('Reset password failed', error);
      let errorMsg = 'Failed to reset password. The token may be expired or invalid.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (typeof error.response.data === 'object') {
          const values = Object.values(error.response.data);
          if (values.length > 0) {
            errorMsg = values.join(', ');
          }
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}
    >
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggle}
          className={`relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-500 ease-in-out ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-300 border-slate-200'
          } border`}
        >
          <motion.div
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
            animate={{ x: isDark ? 32 : 0, rotate: isDark ? 360 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {isDark ? <Moon className="h-3 w-3 text-zinc-800" /> : <Sun className="h-3 w-3 text-amber-500" />}
          </motion.div>
        </button>
      </div>

      <motion.div
        className="pointer-events-none fixed -top-40 -right-40 h-96 w-96 rounded-full blur-[120px]"
        style={{ background: 'rgba(16,185,129,0.15)' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none fixed -bottom-40 -left-40 h-96 w-96 rounded-full blur-[120px]"
        style={{ background: 'rgba(59,130,246,0.12)' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full overflow-hidden flex flex-col md:flex-row shadow-2xl transition-colors duration-500 max-w-4xl"
        style={{
          borderRadius: 24,
          boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)' : '0 32px 80px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(20px)',
          background: isDark ? 'rgba(24,24,27,0.6)' : 'rgba(255,255,255,0.8)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
          minHeight: 580,
        }}
      >
        <div
          className={`relative flex flex-col justify-between overflow-hidden p-10 md:w-1/2 border-b md:border-b-0 md:border-r transition-colors duration-500 ${isDark ? 'border-white/10' : 'border-slate-200'}`}
          style={{
            background: isDark 
              ? 'linear-gradient(145deg, rgba(24,24,27,0.9) 0%, rgba(9,9,11,1) 100%)'
              : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,1) 100%)',
          }}
        >
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative z-10 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold tracking-wide text-white">NexusHR</span>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="relative z-10 mt-auto">
            <h1 className={`text-4xl font-extrabold leading-tight drop-shadow-sm md:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              New<br />Password
            </h1>
            <p className={`mt-3 max-w-xs text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Secure your account by creating a strong new password.
            </p>
          </motion.div>
        </div>

        <div className={`flex flex-1 relative transition-colors duration-500 ${isDark ? 'bg-zinc-950/50' : 'bg-slate-50/50'} p-8 md:p-12 items-center justify-center`}>
          <div className="w-full max-w-sm">
            {isValidating ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                <p className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Validating password reset link...</p>
              </div>
            ) : !isTokenValid ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDark ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Link Expired or Invalid</h2>
                <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Password reset links are valid for <strong>15 minutes</strong>. This link has expired or has already been used. Please request a new link.
                </p>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Request New Reset Link
                </button>
              </motion.div>
            ) : isSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Success!</h2>
                <p className={`text-sm mb-8 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                >
                  Go to Login
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Reset Password</h2>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Enter your new password below.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                          isDark ? 'border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm'
                        }`}
                        placeholder="••••••••"
                        required
                        minLength={8}
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
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                          isDark ? 'border-zinc-800 bg-zinc-900/50 text-white placeholder-zinc-500' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg text-sm font-extrabold tracking-wider disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Sparkles, Moon, Sun, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../../services/auth.service';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent to your email.');
    } catch (error: any) {
      console.error('Forgot password failed', error);
      toast.error(error.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}
    >
      {/* Theme toggle */}
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
            animate={{ x: isDark ? 32 : 0, rotate: isDark ? 360 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {isDark ? <Moon className="h-3 w-3 text-zinc-800" /> : <Sun className="h-3 w-3 text-amber-500" />}
          </motion.div>
        </button>
      </div>

      {/* Background blobs */}
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

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full overflow-hidden flex flex-col md:flex-row shadow-2xl transition-colors duration-500 max-w-4xl"
        style={{
          borderRadius: 24,
          boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)' : '0 32px 80px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: isDark ? 'rgba(24,24,27,0.6)' : 'rgba(255,255,255,0.8)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
          minHeight: 580,
        }}
      >
        {/* Left Panel */}
        <div
          className={`relative flex flex-col justify-between overflow-hidden p-10 md:w-1/2 border-b md:border-b-0 md:border-r transition-colors duration-500 ${isDark ? 'border-white/10' : 'border-slate-200'}`}
          style={{
            background: isDark 
              ? 'linear-gradient(145deg, rgba(24,24,27,0.9) 0%, rgba(9,9,11,1) 100%)'
              : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,1) 100%)',
          }}
        >
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative z-10 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-lg font-bold tracking-wide text-white">NexusHR</span>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="relative z-10 mt-auto">
            <h1 className={`text-4xl font-extrabold leading-tight drop-shadow-sm md:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Account<br />Recovery
            </h1>
            <p className={`mt-3 max-w-xs text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Enter your email to receive a secure link to reset your password.
            </p>
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className={`flex flex-1 relative transition-colors duration-500 ${isDark ? 'bg-zinc-950/50' : 'bg-slate-50/50'} p-8 md:p-12 items-center justify-center`}>
          <div className="w-full max-w-sm">
            <button 
              onClick={() => navigate('/login')}
              className={`mb-8 flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <ArrowLeft className="h-4 w-4" /> Back to login
            </button>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Check your email</h2>
                <p className={`text-sm mb-8 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  If an account exists with that email, we've sent instructions to reset your password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                >
                  Return to Login
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Forgot Password</h2>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>No worries, we'll send you reset instructions.</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        emailError
                          ? 'border-red-500 focus:ring-red-500 bg-red-50/10'
                          : isDark 
                            ? 'border-zinc-800 bg-zinc-900/50 focus:ring-blue-500 text-white placeholder-zinc-500' 
                            : 'border-slate-300 bg-white focus:ring-blue-500 text-slate-900 placeholder-slate-400 shadow-sm'
                      }`}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  {emailError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-red-500 text-xs mt-1 ml-1 font-medium"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg text-sm font-extrabold tracking-wider disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

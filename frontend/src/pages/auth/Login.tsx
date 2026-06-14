import { useNavigate, Navigate } from 'react-router';
import { useAuthStore, demoLogin } from '../../store/authStore';
import { LogIn, Shield, Users, UserCog, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const demoRoles = [
  { id: 'admin' as const, label: 'Admin', desc: 'Full system access', Icon: Shield, color: 'from-blue-600 to-purple-600' },
  { id: 'hr' as const, label: 'HR', desc: 'Employee management', Icon: Users, color: 'from-emerald-600 to-teal-600' },
  { id: 'manager' as const, label: 'Manager', desc: 'Team management', Icon: UserCog, color: 'from-amber-600 to-orange-600' },
  { id: 'employee' as const, label: 'Employee', desc: 'Self-service portal', Icon: User, color: 'from-violet-600 to-indigo-600' },
];

export default function Login() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated && user?.role) {
    const path = user.role === 'admin' ? '/admin/dashboard' :
                 user.role === 'hr' ? '/hr/dashboard' :
                 user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard';
    return <Navigate to={path} replace />;
  }

  const handleLogin = (role: typeof demoRoles[0]['id']) => {
    demoLogin(role);
    const path = role === 'admin' ? '/admin/dashboard' :
                 role === 'hr' ? '/hr/dashboard' :
                 role === 'manager' ? '/manager/dashboard' : '/employee/dashboard';
    navigate(path, { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[100px]" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/5 bg-zinc-900/40 p-8 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10"
        >
          <div className="mb-10 text-center">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              <LogIn className="h-8 w-8 text-blue-400" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-extrabold tracking-tight text-white mb-3"
            >
              Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">HR</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-zinc-400 font-medium"
            >
              Select a role to access the enterprise portal
            </motion.p>
          </div>

          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } }
            }}
          >
            {demoRoles.map((role) => {
              const RoleIcon = role.Icon;
              return (
                <motion.button
                  key={role.id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(39, 39, 42, 0.8)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLogin(role.id)}
                  className="w-full group relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50 p-4 transition-all text-left flex items-center gap-5 hover:border-white/10 hover:shadow-lg"
                >
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shrink-0 shadow-inner ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300`}>
                    <RoleIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 transition-all duration-300">{role.label}</h3>
                    <p className="text-sm text-zinc-400 font-medium mt-0.5">{role.desc}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm font-medium text-zinc-500 mt-8"
        >
          &copy; {new Date().getFullYear()} NexusHR Enterprise. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}

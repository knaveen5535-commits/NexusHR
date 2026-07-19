import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import ProfileApprovalsList from '../../../components/profile/ProfileApprovalsList';
import { useTheme } from '../../../hooks/useTheme';

export default function ManagerProfileRequests() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-full w-full p-4 sm:p-6 lg:p-8 transition-colors duration-500 overflow-hidden relative ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-transparent"
        >
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2 ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-600'}`}>
              <UserCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">My Team</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight flex items-center gap-3">
              Profile Approvals
            </h1>
            <p className={`text-base sm:text-lg max-w-2xl font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Review and approve profile modifications requested by your direct reports.
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProfileApprovalsList />
        </motion.div>
      </div>
    </div>
  );
}

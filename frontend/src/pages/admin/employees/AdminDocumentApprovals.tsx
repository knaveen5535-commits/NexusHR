import { motion } from 'framer-motion';
import { FileCheck } from 'lucide-react';
import DocumentApprovalsList from '../../../components/profile/DocumentApprovalsList';
import { useTheme } from '../../../hooks/useTheme';

export default function AdminDocumentApprovals() {
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
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2 ${isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
              <FileCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Administration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight flex items-center gap-3">
              Document Approvals
            </h1>
            <p className={`text-base sm:text-lg max-w-2xl font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Review and approve document modifications requested by Employees.
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DocumentApprovalsList />
        </motion.div>
      </div>
    </div>
  );
}

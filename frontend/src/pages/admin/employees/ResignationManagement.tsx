import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { getAllResignations, approveResignation, rejectResignation } from '../../../services/resignation.service';
import type { Resignation } from '../../../services/resignation.service';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, UserMinus, Calendar } from 'lucide-react';
import EmptyState from '../../../components/ui/EmptyState';

export default function ResignationManagement() {
  const { isDark } = useTheme();
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResignation, setSelectedResignation] = useState<Resignation | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'APPROVE' | 'REJECT', id: number } | null>(null);

  const fetchResignations = async () => {
    setIsLoading(true);
    try {
      const data = await getAllResignations();
      setResignations(data);
    } catch (err) {
      toast.error('Failed to load resignations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, []);

  const handleApprove = async () => {
    if (!selectedResignation) return;
    try {
      await approveResignation(selectedResignation.id, { approvedLeaveDate: selectedResignation.expectedLeaveDate });
      toast.success('Resignation approved successfully');
      setSelectedResignation(null);
      setConfirmAction(null);
      fetchResignations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectResignation(id);
      toast.success('Resignation rejected');
      setSelectedResignation(null);
      setConfirmAction(null);
      fetchResignations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div className={`p-4 sm:p-8 space-y-6 min-h-full transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight">Resignation Requests</h1>
        <p className={`mt-2 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Review and manage employee resignation requests.</p>
      </motion.div>

      <div className={`rounded-3xl border overflow-hidden transition-all ${isDark ? 'border-white/5 bg-zinc-900/40 backdrop-blur-xl' : 'border-slate-200 bg-white/60 backdrop-blur-xl shadow-md'}`}>
        {!isLoading && resignations.length === 0 ? (
          <EmptyState
            icon={<UserMinus className="h-8 w-8 text-zinc-500" />}
            title="No Resignation Requests"
            description="There are currently no resignation requests to review."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-800/30' : 'border-slate-200 bg-slate-50'}`}>
                  <th className="px-6 py-4 font-bold text-xs uppercase text-zinc-500">Employee</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase text-zinc-500">Department</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase text-zinc-500">Expected Date</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase text-zinc-500">Status</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-slate-200'}`}>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : (
                  resignations.map((resig) => (
                    <tr key={resig.id} className={`group transition-colors ${isDark ? 'hover:bg-zinc-800/20' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold">{resig.employeeName}</p>
                        <p className="text-xs text-zinc-500">{resig.employeeCode}</p>
                      </td>
                      <td className="px-6 py-4">{resig.departmentName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          <span>{resig.expectedLeaveDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          resig.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          resig.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {resig.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {resig.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setSelectedResignation(resig)} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold hover:bg-blue-500/20 transition-colors border border-blue-500/20 flex items-center gap-1">
                              View Details
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedResignation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedResignation(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-2">Review Resignation</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Employee <strong>{selectedResignation.employeeName}</strong> requested to leave on {selectedResignation.expectedLeaveDate}.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted border border-border rounded-xl">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Reason provided:</p>
                  <p className="text-sm">{selectedResignation.reason}</p>
                </div>

                <div className="p-4 bg-muted border border-border rounded-xl">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Expected Last Working Day:</p>
                  <p className="text-sm font-semibold">{selectedResignation.expectedLeaveDate}</p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setSelectedResignation(null)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:bg-muted">Cancel</button>
                  <button onClick={() => setConfirmAction({ type: 'REJECT', id: selectedResignation.id })} className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20">Reject</button>
                  <button onClick={() => setConfirmAction({ type: 'APPROVE', id: selectedResignation.id })} className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">Approve</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-sm flex flex-col rounded-3xl shadow-2xl border p-6 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                confirmAction.type === 'APPROVE' ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-100') : (isDark ? 'bg-red-500/10' : 'bg-red-100')
              } mb-4`}>
                {confirmAction.type === 'APPROVE' ? (
                  <CheckCircle className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                ) : (
                  <XCircle className={`h-6 w-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                )}
              </div>
              <h2 className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {confirmAction.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </h2>
              <p className={`text-sm text-center mb-6 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Are you sure you want to {confirmAction.type.toLowerCase()} this resignation request?
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>Cancel</button>
                <button onClick={() => {
                  if (confirmAction.type === 'APPROVE') handleApprove();
                  else handleReject(confirmAction.id);
                }} className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 shadow-lg ${
                  confirmAction.type === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}>
                  Yes, {confirmAction.type === 'APPROVE' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

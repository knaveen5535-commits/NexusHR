import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { DollarSign, Download, Search, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import SalaryStructureManager from './SalaryStructureManager';

interface PayrollRecord {
  id: number;
  employeeName: string;
  position: string;
  grossSalary: number;
  totalDeductions: number;
  totalTaxes: number;
  netSalary: number;
  status: string;
  remarks?: string;
}

export default function PayrollList() {
  const [search, setSearch] = useState('');
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showManager, setShowManager] = useState(false);
  
  // Generation state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatePeriod, setGeneratePeriod] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<{year: number, month: number, label: string, key: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuthStore();
  const canGenerate = user?.role === 'ADMIN' || user?.role === 'HR';
  const isAdmin = user?.role === 'ADMIN';

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [isPayingAll, setIsPayingAll] = useState(false);
  const [showBulkPayModal, setShowBulkPayModal] = useState(false);
  const location = useLocation();
  const isStandalone = location.pathname.includes('/admin/payroll');

  useEffect(() => {
    fetchPayrolls();
  }, []);

  useEffect(() => {
    const generatedMonths = new Set(payrollData.map(p => `${p.payrollYear}-${p.payrollMonth}`));
    const available = [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Look back up to 24 months
    for (let i = 1; i <= 24; i++) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      
      const key = `${y}-${m}`;
      if (!generatedMonths.has(key)) {
        const dateObj = new Date(y, m - 1, 1);
        available.push({
          year: y,
          month: m,
          label: dateObj.toLocaleString('default', { month: 'long', year: 'numeric' }),
          key
        });
      }
    }
    setAvailableMonths(available);
    if (available.length > 0) {
      setGeneratePeriod(available[0].key);
    } else {
      setGeneratePeriod('');
    }
  }, [payrollData]);

  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/payrolls');
      setPayrollData(response.data);
    } catch (error) {
      console.error('Failed to fetch payroll records', error);
      toast.error('Failed to load payrolls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!generatePeriod) return;
    const [year, month] = generatePeriod.split('-');

    try {
      setIsGenerating(true);
      const res = await api.post(`/payrolls/generate/bulk?month=${month}&year=${year}`);
      const data = res.data;
      
      if (data.processed > 0) {
        toast.success(`Payroll generated successfully.\n\nGenerated: ${data.processed}\nSkipped: ${data.skipped} (inactive employees)`, { duration: 5000 });
      } else {
        toast.info(`No new payrolls generated.\n\nGenerated: 0\nSkipped: ${data.skipped} (already generated or inactive employees)`, { duration: 5000 });
      }

      setIsGenerateModalOpen(false);
      fetchPayrolls();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to generate payroll');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviewAction = async (action: 'approve' | 'reject') => {
    if (!selectedPayroll) return;
    setIsSubmittingReview(true);
    try {
      await api.put(`/payrolls/${selectedPayroll.id}/${action}?remarks=${encodeURIComponent(reviewRemarks)}`);
      toast.success(`Payroll successfully ${action === 'approve' ? 'approved' : 'rejected'}`);
      setReviewModalOpen(false);
      fetchPayrolls();
    } catch (error: any) {
      toast.error(error.response?.data || `Failed to ${action} payroll`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await api.put(`/payrolls/${id}/mark-paid`);
      toast.success('Payroll marked as paid');
      fetchPayrolls();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to mark as paid');
    }
  };

  const handleApproveAllClick = () => {
    const pendingPayrolls = payrollData.filter(p => p.status === 'generated' || p.status === 'under_review');
    if (pendingPayrolls.length === 0) {
      toast.info('No pending payrolls to approve');
      return;
    }
    setShowBulkApproveModal(true);
  };

  const confirmApproveAll = async () => {
    const pendingPayrolls = payrollData.filter(p => p.status === 'generated' || p.status === 'under_review');
    setIsApprovingAll(true);
    let successCount = 0;
    try {
      await Promise.all(
        pendingPayrolls.map(async (p) => {
          await api.put(`/payrolls/${p.id}/approve?remarks=Bulk%20Approved`);
          successCount++;
        })
      );
      toast.success(`Successfully approved ${successCount} payrolls`);
    } catch (error: any) {
      toast.error(`Bulk approval incomplete. Processed ${successCount}/${pendingPayrolls.length}`);
    } finally {
      setIsApprovingAll(false);
      setShowBulkApproveModal(false);
      fetchPayrolls();
    }
  };

  const handlePayAllClick = () => {
    const approvedPayrolls = payrollData.filter(p => p.status === 'approved');
    if (approvedPayrolls.length === 0) {
      toast.info('No approved payrolls to mark as paid');
      return;
    }
    setShowBulkPayModal(true);
  };

  const confirmPayAll = async () => {
    const approvedPayrolls = payrollData.filter(p => p.status === 'approved');
    setIsPayingAll(true);
    let successCount = 0;
    try {
      await Promise.all(
        approvedPayrolls.map(async (p) => {
          await api.put(`/payrolls/${p.id}/mark-paid`);
          successCount++;
        })
      );
      toast.success(`Successfully marked ${successCount} payrolls as paid`);
    } catch (error: any) {
      toast.error(`Bulk pay incomplete. Processed ${successCount}/${approvedPayrolls.length}`);
    } finally {
      setIsPayingAll(false);
      setShowBulkPayModal(false);
      fetchPayrolls();
    }
  };

  const filtered = payrollData.filter(emp =>
    emp.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = payrollData.reduce((sum, e) => sum + e.netSalary, 0);
  const paidPayroll = payrollData.filter(e => e.status.toLowerCase() === 'paid').reduce((sum, e) => sum + e.netSalary, 0);
  const pendingPayroll = payrollData.filter(e => e.status.toLowerCase() === 'pending').reduce((sum, e) => sum + e.netSalary, 0);
  const processingPayroll = payrollData.filter(e => e.status.toLowerCase() === 'processing').reduce((sum, e) => sum + e.netSalary, 0);

  if (showManager) {
    return <SalaryStructureManager onClose={() => setShowManager(false)} />;
  }

  return (
    <div className={`space-y-6 ${isStandalone ? 'p-4 sm:p-8 max-w-7xl mx-auto' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage employee salaries and payments</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canGenerate && (
            <>
              <button 
                onClick={() => setShowManager(true)}
                className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              >
                <Settings className="h-4 w-4" />
                Manage Salaries
              </button>
              {isAdmin && (
                <button 
                  onClick={handleApproveAllClick}
                  disabled={isApprovingAll || isPayingAll}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 whitespace-nowrap"
                >
                  {isApprovingAll ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <DollarSign className="h-4 w-4" />
                  )}
                  Approve All
                </button>
              )}
              {canGenerate && (
                <button 
                  onClick={handlePayAllClick}
                  disabled={isPayingAll || isApprovingAll}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 whitespace-nowrap"
                >
                  {isPayingAll ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <DollarSign className="h-4 w-4" />
                  )}
                  Mark All Paid
                </button>
              )}
              <button 
                onClick={() => setIsGenerateModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
              >
                <DollarSign className="h-4 w-4" />
                Generate Payroll
              </button>
            </>
          )}
          <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-zinc-900/20">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card/50 border border-border rounded-xl p-5 backdrop-blur-xl hover:border-border transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Payroll</p>
              <p className="text-2xl font-bold text-foreground mt-1">${(totalPayroll / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        {[
          { label: 'Paid', value: `$${(paidPayroll / 1000).toFixed(1)}K`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending', value: `$${(pendingPayroll / 1000).toFixed(1)}K`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Processing', value: `$${(processingPayroll / 1000).toFixed(1)}K`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card/50 border border-border rounded-xl p-5 backdrop-blur-xl hover:border-border transition-all">
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card/50 border border-border rounded-xl backdrop-blur-xl">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-lg border border-border bg-zinc-950/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Gross Salary</th>
                <th className="px-6 py-4">Taxes</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Pay</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                      <p className="text-muted-foreground mt-2">Loading payroll records...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No payroll records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{emp.employeeName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{emp.position}</td>
                    <td className="px-6 py-4">${emp.grossSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-400">-${emp.totalTaxes.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-400">-${emp.totalDeductions.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">${emp.netSalary.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize whitespace-nowrap ${
                          emp.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                          emp.status === 'approved' ? 'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20' :
                          emp.status === 'rejected' ? 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20' :
                          'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20'
                        }`}>
                          {emp.status === 'approved' ? 'Approved • Payment Pending' : emp.status}
                        </span>
                        {emp.status === 'rejected' && emp.remarks && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={emp.remarks}>
                            {emp.remarks}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {isAdmin && (emp.status === 'generated' || emp.status === 'under_review') && (
                          <button 
                            onClick={() => { setSelectedPayroll(emp); setReviewRemarks(''); setReviewModalOpen(true); }}
                            className="text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20 whitespace-nowrap"
                          >
                            Review
                          </button>
                        )}
                        {canGenerate && emp.status === 'approved' && (
                          <button 
                            onClick={() => handleMarkPaid(emp.id)}
                            className="text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20 whitespace-nowrap"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGenerateModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Generate Bulk Payroll</h2>
                  <p className="text-sm text-muted-foreground mt-1">Process salaries for all active employees.</p>
                </div>
                <button onClick={() => setIsGenerateModalOpen(false)} className="p-2 bg-muted rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Select Month</label>
                    {availableMonths.length > 0 ? (
                      <select 
                        value={generatePeriod}
                        onChange={(e) => setGeneratePeriod(e.target.value)}
                        className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableMonths.map(am => (
                          <option key={am.key} value={am.key}>{am.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full rounded-xl border px-4 py-2 text-sm bg-muted text-muted-foreground border-border flex items-center h-[38px]">
                        No eligible months available for generation.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || availableMonths.length === 0}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Start Generation'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Review Modal */}
        {reviewModalOpen && selectedPayroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmittingReview && setReviewModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Review Payroll</h2>
                  <p className="text-sm text-muted-foreground mt-1">Approve or reject payroll for {selectedPayroll.employeeName}</p>
                </div>
                <button onClick={() => !isSubmittingReview && setReviewModalOpen(false)} className="p-2 bg-muted rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Gross Salary</p>
                    <p className="font-semibold text-foreground">${selectedPayroll.grossSalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net Pay</p>
                    <p className="font-semibold text-emerald-400">${selectedPayroll.netSalary.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Remarks / Comments</label>
                  <textarea
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    rows={3}
                    placeholder="Add comments (required for rejection)"
                    className="w-full rounded-xl border px-4 py-3 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => handleReviewAction('reject')}
                  disabled={isSubmittingReview || reviewRemarks.trim() === ''}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleReviewAction('approve')}
                  disabled={isSubmittingReview}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingReview ? 'Processing...' : 'Publish (Approve)'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bulk Approve Modal */}
        {showBulkApproveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isApprovingAll && setShowBulkApproveModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 mb-4">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Approve All Payrolls</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to approve all {payrollData.filter(p => p.status === 'generated' || p.status === 'under_review').length} pending payrolls? They will be locked and ready for payment.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowBulkApproveModal(false)}
                  disabled={isApprovingAll}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors border-border text-foreground hover:bg-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmApproveAll}
                  disabled={isApprovingAll}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isApprovingAll ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Approving...
                    </>
                  ) : (
                    'Yes, Approve All'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bulk Pay Modal */}
        {showBulkPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPayingAll && setShowBulkPayModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Mark All as Paid</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to mark all {payrollData.filter(p => p.status === 'approved').length} approved payrolls as paid? This assumes the bank transfers have been completed.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowBulkPayModal(false)}
                  disabled={isPayingAll}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors border-border text-foreground hover:bg-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmPayAll}
                  disabled={isPayingAll}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isPayingAll ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Yes, Mark Paid'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

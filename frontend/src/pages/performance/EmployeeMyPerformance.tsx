import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { performanceService } from '../../services/performance.service';
import type { PerformanceRecord } from '../../types/performance.types';
import { toast } from 'sonner';
import { Award, Target, TrendingUp, AlertCircle } from 'lucide-react';
import FeedbackDashboard from './feedback/FeedbackDashboard';

export default function EmployeeMyPerformance() {
  const { isDark } = useTheme();
  const [history, setHistory] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await performanceService.getMyPerformanceHistory();
      setHistory(res.data.filter(r => r.published)); // Only show published to employee
    } catch (error) {
      toast.error('Failed to load performance history');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Outstanding': return 'text-purple-500 border-purple-500/20 bg-purple-500/10';
      case 'Excellent': return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
      case 'Very Good': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
      case 'Good': return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
      case 'Average': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
      default: return 'text-rose-500 border-rose-500/20 bg-rose-500/10';
    }
  };

  return (
    <div className={`min-h-full w-full p-4 sm:p-6 transition-colors duration-500 relative ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My Performance</h1>
          <p className="text-muted-foreground mt-1">Review your past performance appraisals.</p>
        </div>

        <div className="flex gap-4 mb-6">
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className={`border rounded-lg px-4 py-2 text-sm font-medium ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'}`}>
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
          </select>
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className={`border rounded-lg px-4 py-2 text-sm font-medium ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'}`}>
            {Array.from({length: 12}).map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading performance data...</div>
        ) : history.filter(r => r.performanceYear === selectedYear && r.performanceMonth === selectedMonth).length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'}`}>
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Performance Records</h3>
            <p className="text-muted-foreground">You don't have any published performance records for this selected period.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.filter(r => r.performanceYear === selectedYear && r.performanceMonth === selectedMonth).map(r => (
              <div key={r.id} className={`p-6 rounded-3xl border ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'} shadow-xl`}>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-border pb-6">
                  <div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {new Date(r.performanceYear, r.performanceMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-4xl font-black">{r.finalScore} <span className="text-xl text-muted-foreground font-medium">/ 100</span></div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border font-bold text-lg ${getGradeColor(r.grade)}`}>
                    {r.grade}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><Target className="w-3 h-3"/> Manager Review</div>
                    <div className="text-xl font-bold">{r.managerReviewScore}% <span className="text-xs text-muted-foreground font-normal">(Wt: {r.managerWeight}%)</span></div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Self Review</div>
                    <div className="text-xl font-bold">{r.selfReviewScore}% <span className="text-xs text-muted-foreground font-normal">(Wt: {r.selfWeight}%)</span></div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><Target className="w-3 h-3"/> Peer Review</div>
                    <div className="text-xl font-bold">{r.peerReviewScore}% <span className="text-xs text-muted-foreground font-normal">(Wt: {r.peerWeight}%)</span></div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><Target className="w-3 h-3"/> Attendance</div>
                    <div className="text-xl font-bold">{r.attendanceScore?.toFixed(0)}% <span className="text-xs text-muted-foreground font-normal">(Wt: {r.attendanceWeight}%)</span></div>
                  </div>
                </div>

                {r.remarks && (
                  <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{r.remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Feedback Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <FeedbackDashboard hideManagerReview={true} mode="my" />
        </div>
      </div>
    </div>
  );
}

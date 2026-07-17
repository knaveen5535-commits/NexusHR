import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { performanceService } from '../../services/performance.service';
import type { PerformanceRecord } from '../../types/performance.types';
import { toast } from 'sonner';
import FeedbackDashboard from './feedback/FeedbackDashboard';

export default function ManagerTeamPerformance() {
  const { isDark } = useTheme();
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); 

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await performanceService.getTeamPerformance(selectedYear, selectedMonth);
      setRecords(res.data);
    } catch (error) {
      toast.error('Failed to load team performance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-full w-full p-4 sm:p-6 transition-colors duration-500 relative ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Team Performance</h1>
          <p className="text-muted-foreground mt-1">Review your direct reports' monthly performance.</p>
        </div>

        <div className="flex gap-4 mb-6">
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-background border border-border rounded-lg px-4 py-2 text-sm font-medium">
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
          </select>
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-background border border-border rounded-lg px-4 py-2 text-sm font-medium">
            {Array.from({length: 12}).map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>

        <div className={`rounded-2xl border ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Employee</th>
                  <th className="p-4 font-medium text-center">Attendance</th>
                  <th className="p-4 font-medium text-center">Self Review</th>
                  <th className="p-4 font-medium text-center">Peer Avg</th>
                  <th className="p-4 font-medium text-center">Manager</th>
                  <th className="p-4 font-medium text-right">Final Score</th>
                  <th className="p-4 font-medium text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading team data...</td></tr>
                ) : records.length > 0 ? records.map(r => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-bold">{r.employee.firstName} {r.employee.lastName}</td>
                    <td className="p-4 text-center">{r.attendanceScore?.toFixed(0)}%</td>
                    <td className="p-4 text-center">{r.selfReviewScore}%</td>
                    <td className="p-4 text-center">{r.peerReviewScore}%</td>
                    <td className="p-4 text-center">{r.managerReviewScore}%</td>
                    <td className="p-4 text-right font-black text-blue-500">{r.finalScore}</td>
                    <td className="p-4 text-center">
                       <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">{r.grade}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No performance records found for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <FeedbackDashboard hideSelfPeer={true} mode="team" />
        </div>
      </div>
    </div>
  );
}

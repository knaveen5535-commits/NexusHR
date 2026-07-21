import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { performanceService } from '../../services/performance.service';
import type { PerformanceReport, PerformanceRecord } from '../../types/performance.types';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import FeedbackDashboard from './feedback/FeedbackDashboard';

export default function HrPerformanceReports() {
  const { isDark } = useTheme();
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [allRecords, setAllRecords] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); 
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repRes, allRes] = await Promise.all([
        performanceService.getPerformanceReport(selectedYear, selectedMonth),
        performanceService.getAllPerformance(selectedYear, selectedMonth)
      ]);
      setReport(repRes.data);
      setAllRecords(allRes.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-full w-full p-4 sm:p-6 transition-colors duration-500 relative ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Performance Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics and organization-wide performance distribution.</p>
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

        {loading || !report ? (
          <div className="text-center py-20 text-muted-foreground font-medium">Loading analytics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'} col-span-full lg:col-span-1`}>
              <h3 className="text-lg font-bold mb-4">Grade Distribution</h3>
              <div className="space-y-4 text-sm font-medium">
                <div onClick={() => report.outstandingCount > 0 && setSelectedGrade("Outstanding")} className={`flex justify-between items-center p-2 rounded-lg transition-colors ${report.outstandingCount > 0 ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}`}><span className="text-emerald-400">Outstanding</span> <span>{report.outstandingCount}</span></div>
                <div onClick={() => report.excellentCount > 0 && setSelectedGrade("Excellent")} className={`flex justify-between items-center p-2 rounded-lg transition-colors ${report.excellentCount > 0 ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}`}><span className="text-emerald-500">Excellent</span> <span>{report.excellentCount}</span></div>
                <div onClick={() => report.veryGoodCount > 0 && setSelectedGrade("Very Good")} className={`flex justify-between items-center p-2 rounded-lg transition-colors ${report.veryGoodCount > 0 ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}`}><span className="text-blue-500">Very Good</span> <span>{report.veryGoodCount}</span></div>
                <div onClick={() => report.goodCount > 0 && setSelectedGrade("Good")} className={`flex justify-between items-center p-2 rounded-lg transition-colors ${report.goodCount > 0 ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}`}><span className="text-blue-400">Good</span> <span>{report.goodCount}</span></div>
                <div onClick={() => report.averageCount > 0 && setSelectedGrade("Average")} className={`flex justify-between items-center p-2 rounded-lg transition-colors ${report.averageCount > 0 ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}`}><span className="text-amber-500">Average</span> <span>{report.averageCount}</span></div>
                <div onClick={() => report.needsImprovementCount > 0 && setSelectedGrade("Needs Improvement")} className={`flex justify-between items-center p-2 rounded-lg transition-colors ${report.needsImprovementCount > 0 ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}`}><span className="text-rose-500">Needs Improvement</span> <span>{report.needsImprovementCount}</span></div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'} col-span-full lg:col-span-2 space-y-8`}>
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Top Employees</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border text-muted-foreground">
                      <tr>
                        <th className="pb-3 font-medium">Employee</th>
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium text-right">Score</th>
                        <th className="pb-3 font-medium text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {report.topPerformers.filter(p => p.employee.role === 'EMPLOYEE' && p.finalScore > 0).slice(0, 5).map(p => (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 font-medium">{p.employee.firstName} {p.employee.lastName}</td>
                          <td className="py-4 text-muted-foreground">{p.employee.departmentName || '--'}</td>
                          <td className="py-4 text-right font-bold text-emerald-500">{p.finalScore}</td>
                          <td className="py-4 text-center"><span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-500/10 text-emerald-500">{p.grade}</span></td>
                        </tr>
                      ))}
                      {report.topPerformers.filter(p => p.employee.role === 'EMPLOYEE' && p.finalScore > 0).length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No top performers found with a score greater than 0.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Top Managers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border text-muted-foreground">
                      <tr>
                        <th className="pb-3 font-medium">Manager</th>
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium text-right">Score</th>
                        <th className="pb-3 font-medium text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {report.topPerformers.filter(p => p.employee.role === 'MANAGER' && p.finalScore > 0).slice(0, 5).map(p => (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 font-medium">{p.employee.firstName} {p.employee.lastName}</td>
                          <td className="py-4 text-muted-foreground">{p.employee.departmentName || '--'}</td>
                          <td className="py-4 text-right font-bold text-emerald-500">{p.finalScore}</td>
                          <td className="py-4 text-center"><span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-500/10 text-emerald-500">{p.grade}</span></td>
                        </tr>
                      ))}
                      {report.topPerformers.filter(p => p.employee.role === 'MANAGER' && p.finalScore > 0).length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No top performing managers found with a score greater than 0.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Grade Modal */}
        {selectedGrade && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-xl ${isDark ? 'bg-[#111116] border border-white/10' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-tight">Grade: {selectedGrade}</h2>
                <button onClick={() => setSelectedGrade(null)} className="p-2 rounded-full hover:bg-muted/50 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {allRecords
                  .filter(r => r.grade === selectedGrade)
                  .sort((a, b) => b.finalScore - a.finalScore)
                  .map(record => (
                  <div key={record.id} className="flex justify-between items-center p-4 mb-3 rounded-xl bg-muted/20 border border-border">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {record.employee.firstName} {record.employee.lastName}
                        {record.employee.role && (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-md bg-blue-500/10 text-blue-500">
                            {record.employee.role}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{record.employee.email}</div>
                      {record.employee.managerName && (
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Reports to: <span className="font-medium text-foreground">{record.employee.managerName}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-lg">{record.finalScore}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <FeedbackDashboard />
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { performanceService } from '../../services/performance.service';
import type { PerformanceConfiguration, PerformanceReport } from '../../types/performance.types';
import { toast } from 'sonner';
import { Settings, Play, FileText, CheckCircle } from 'lucide-react';

export default function AdminPerformanceDashboard() {
  const { isDark } = useTheme();
  const [config, setConfig] = useState<PerformanceConfiguration | null>(null);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [generatePeriod, setGeneratePeriod] = useState<string>('');
  const [viewPeriod, setViewPeriod] = useState<string>('');
  const [availableGenerateMonths, setAvailableGenerateMonths] = useState<{year: number, month: number, label: string, key: string}[]>([]);
  const [availablePublishMonths, setAvailablePublishMonths] = useState<{year: number, month: number, label: string, key: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadInitialMonths = async (newViewPeriod?: string) => {
    try {
      const genRes = await performanceService.getGeneratedMonths();
      const genMonths = new Set(genRes.data);
      
      const availGen: {year: number, month: number, label: string, key: string}[] = [];
      const availPub: {year: number, month: number, label: string, key: string}[] = [];
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      for (let i = 1; i <= 24; i++) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m <= 0) {
          m += 12;
          y -= 1;
        }
        const key = `${y}-${m}`;
        const dateObj = new Date(y, m - 1, 1);
        const label = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!genMonths.has(key)) {
          availGen.push({ year: y, month: m, label, key });
        } else {
          availPub.push({ year: y, month: m, label, key });
        }
      }
      setAvailableGenerateMonths(availGen);
      setAvailablePublishMonths(availPub);
      
      if (availGen.length > 0) {
        setGeneratePeriod(prev => availGen.find(m => m.key === prev) ? prev : availGen[0].key);
      } else {
        setGeneratePeriod('');
      }
      
      let targetViewPeriod = newViewPeriod || viewPeriod;
      if (!targetViewPeriod && availPub.length > 0) {
        targetViewPeriod = availPub[0].key;
        setViewPeriod(targetViewPeriod);
      } else if (newViewPeriod) {
        setViewPeriod(newViewPeriod);
      }
      return targetViewPeriod;
    } catch (e) {
      console.error("Failed to load initial months", e);
      return null;
    }
  };

  useEffect(() => {
    loadInitialMonths().then(vp => {
      if (vp) fetchData(vp);
    });
  }, []);

  useEffect(() => {
    if (viewPeriod) fetchData(viewPeriod);
  }, [viewPeriod]);

  const fetchData = async (vp?: string) => {
    try {
      setLoading(true);
      const targetView = vp || viewPeriod;
      
      const confRes = await performanceService.getConfiguration();
      setConfig(confRes.data);

      if (targetView) {
        const [vYear, vMonth] = targetView.split('-');
        const [repRes, allRes] = await Promise.all([
          performanceService.getPerformanceReport(Number(vYear), Number(vMonth)),
          performanceService.getAllPerformance(Number(vYear), Number(vMonth))
        ]);
        setReport(repRes.data);
        setAllRecords(allRes.data);
      } else {
        setReport(null);
        setAllRecords([]);
      }
    } catch (error) {
      console.error('Failed to load performance data', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!generatePeriod) return;
    const [year, month] = generatePeriod.split('-');
    try {
      setIsGenerating(true);
      await performanceService.generatePerformance({ year: Number(year), month: Number(month) });
      toast.success('Performance generated successfully');
      await loadInitialMonths(generatePeriod);

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate performance');
    } finally {
      setIsGenerating(false);
    }
  };



  const handlePublish = async () => {
    if (!viewPeriod) return;
    const [year, month] = viewPeriod.split('-');
    if (!window.confirm('Are you sure you want to publish? This will permanently lock this cycle and no further edits will be allowed. This action is irreversible.')) return;
    try {
      await performanceService.publishPerformance({ year: Number(year), month: Number(month) });
      toast.success('Performance published successfully');
      fetchData(viewPeriod);
    } catch (error: any) {
      toast.error('Failed to publish performance');
    }
  };



  const categorizePerformers = (role: string) => {
    const roleRecords = allRecords.filter(r => r.employee.role === role && r.finalScore != null);
    roleRecords.sort((a, b) => b.finalScore - a.finalScore); // Sort descending
    
    let top = roleRecords.filter(r => r.finalScore >= 50);
    let lowest = roleRecords.filter(r => r.finalScore < 50);
    
    if (top.length === 0 && lowest.length > 0) {
      const maxScore = lowest[0].finalScore;
      if (maxScore > 0) {
        const topTies = lowest.filter(r => r.finalScore === maxScore);
        top.push(...topTies);
        lowest = lowest.filter(r => r.finalScore !== maxScore);
      }
    }
    
    // Sort both descending
    top.sort((a, b) => b.finalScore - a.finalScore);
    lowest.sort((a, b) => b.finalScore - a.finalScore);
    
    return {
      top: top.slice(0, 5),
      lowest: lowest.slice(0, 5)
    };
  };

  const { top: topEmp, lowest: lowestEmp } = categorizePerformers('EMPLOYEE');
  const { top: topMgr, lowest: lowestMgr } = categorizePerformers('MANAGER');

  return (
    <div className={`min-h-full w-full p-4 sm:p-6 transition-colors duration-500 overflow-hidden relative ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Performance Administration</h1>
            <p className={`mt-2 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Manage system-wide performance cycles and configurations.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 space-y-6">
            {/* Controls Panel */}
            <div className={`rounded-2xl border p-6 ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'}`}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-blue-500"/> Cycle Management</h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Select Month to Generate</label>
                  {availableGenerateMonths.length > 0 ? (
                    <select 
                      value={generatePeriod} 
                      onChange={e => setGeneratePeriod(e.target.value)} 
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      {availableGenerateMonths.map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground flex items-center h-[38px]">
                      No eligible months available for generation.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || availableGenerateMonths.length === 0} 
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4"/> {isGenerating ? 'Generating...' : 'Generate Performance'}
                </button>
              </div>
              
              <div className="mt-6 border-t border-border pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">View/Publish Cycle</label>
                  {availablePublishMonths.length > 0 ? (
                    <select 
                      value={viewPeriod} 
                      onChange={e => setViewPeriod(e.target.value)} 
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      {availablePublishMonths.map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground flex items-center h-[38px]">
                      No generated cycles available.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={handlePublish} 
                    disabled={!viewPeriod}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4"/> Publish Performance (Locks Cycle)
                  </button>
                </div>
              </div>
            </div>

            {/* Configuration Overview */}
            <div className={`rounded-2xl border p-6 ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'}`}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-500"/> Weight Configuration</h3>
              {loading || !config ? (
                <div className="text-sm text-muted-foreground text-center py-4">Loading config...</div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-2 rounded-lg bg-muted/50 border border-border">
                    <span className="text-muted-foreground font-medium">Manager Review</span>
                    <span className="font-bold">{config.managerWeight}%</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-muted/50 border border-border">
                    <span className="text-muted-foreground font-medium">Attendance</span>
                    <span className="font-bold">{config.attendanceWeight}%</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-muted/50 border border-border">
                    <span className="text-muted-foreground font-medium">Peer Feedback</span>
                    <span className="font-bold">{config.peerWeight}%</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-muted/50 border border-border">
                    <span className="text-muted-foreground font-medium">Self Review</span>
                    <span className="font-bold">{config.selfWeight}%</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-1">Review Window</div>
                    <div className="font-medium text-foreground">Day {config.reviewWindowStartDay} to Day {config.reviewWindowEndDay} of Month</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className={`rounded-2xl border p-6 ${isDark ? 'bg-[#111116]/80 border-white/5' : 'bg-white border-slate-200'}`}>
              <h3 className="text-lg font-bold mb-6">Cycle Overview {viewPeriod && `(${new Date(Number(viewPeriod.split('-')[0]), Number(viewPeriod.split('-')[1]) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })})`}</h3>
              
              {loading || !report ? (
                 <div className="text-sm text-muted-foreground text-center py-12">Loading reports...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                      <div className="text-3xl font-black text-blue-500 mb-1">{report.generatedCount} / {report.totalEmployees}</div>
                      <div className="text-xs font-semibold text-muted-foreground">Records Generated</div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <div className="text-3xl font-black text-emerald-500 mb-1">{report.averageOverallScore.toFixed(1)}</div>
                      <div className="text-xs font-semibold text-muted-foreground">Avg Overall Score</div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                      <div className="text-3xl font-black text-purple-500 mb-1">{report.outstandingCount + report.excellentCount}</div>
                      <div className="text-xs font-semibold text-muted-foreground">Top Performers</div>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                      <div className="text-3xl font-black text-rose-500 mb-1">{report.needsImprovementCount}</div>
                      <div className="text-xs font-semibold text-muted-foreground">Needs Improvement</div>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Employees Box */}
                    <div className="bg-muted/10 border border-border p-4 rounded-xl">
                      <h4 className="text-md font-bold mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Employees</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-xs font-semibold mb-3 text-emerald-500 uppercase tracking-wider">Top Performers</h5>
                          <div className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {topEmp.length > 0 ? 
                              topEmp.map(p => (
                              <div key={p.id} className="flex justify-between items-center p-3 mb-2 rounded-lg bg-muted/30 border border-border">
                                <span className="font-medium text-sm">{p.employee.firstName} {p.employee.lastName}</span>
                                <span className="text-emerald-500 font-bold">{p.finalScore} - {p.grade}</span>
                              </div>
                            )) : <p className="text-xs text-muted-foreground">No data available.</p>}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold mb-3 text-rose-500 uppercase tracking-wider">Lowest Performers</h5>
                          <div className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {lowestEmp.length > 0 ? 
                              lowestEmp.map(p => (
                              <div key={p.id} className="flex justify-between items-center p-3 mb-2 rounded-lg bg-muted/30 border border-border">
                                <span className="font-medium text-sm">{p.employee.firstName} {p.employee.lastName}</span>
                                <span className="text-rose-500 font-bold">{p.finalScore} - {p.grade}</span>
                              </div>
                            )) : <p className="text-xs text-muted-foreground">No data available.</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Managers Box */}
                    <div className="bg-muted/10 border border-border p-4 rounded-xl">
                      <h4 className="text-md font-bold mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Managers</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-xs font-semibold mb-3 text-emerald-500 uppercase tracking-wider">Top Performers</h5>
                          <div className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {topMgr.length > 0 ? 
                              topMgr.map(p => (
                              <div key={p.id} className="flex justify-between items-center p-3 mb-2 rounded-lg bg-muted/30 border border-border">
                                <span className="font-medium text-sm">{p.employee.firstName} {p.employee.lastName}</span>
                                <span className="text-emerald-500 font-bold">{p.finalScore} - {p.grade}</span>
                              </div>
                            )) : <p className="text-xs text-muted-foreground">No data available.</p>}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold mb-3 text-rose-500 uppercase tracking-wider">Lowest Performers</h5>
                          <div className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {lowestMgr.length > 0 ? 
                              lowestMgr.map(p => (
                              <div key={p.id} className="flex justify-between items-center p-3 mb-2 rounded-lg bg-muted/30 border border-border">
                                <span className="font-medium text-sm">{p.employee.firstName} {p.employee.lastName}</span>
                                <span className="text-rose-500 font-bold">{p.finalScore} - {p.grade}</span>
                              </div>
                            )) : <p className="text-xs text-muted-foreground">No data available.</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

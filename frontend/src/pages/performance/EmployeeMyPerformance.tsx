import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { performanceService } from '../../services/performance.service';
import type { PerformanceRecord } from '../../types/performance.types';
import { toast } from 'sonner';
import { Award, Target, TrendingUp, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackService } from '../../services/feedback.service';
import type { FeedbackResponse } from '../../services/feedback.service';
import FeedbackDashboard from './feedback/FeedbackDashboard';

export default function EmployeeMyPerformance() {
  const { isDark } = useTheme();
  const [history, setHistory] = useState<PerformanceRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [perfRes, feedRes] = await Promise.all([
        performanceService.getMyPerformanceHistory(),
        feedbackService.getMyFeedbacks()
      ]);
      setHistory(perfRes.data.filter(r => r.published)); // Only show published to employee
      setFeedbacks(feedRes);
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

  const handleOpenFeedback = (year: number, month: number, type: 'MANAGER_REVIEW' | 'SELF_REVIEW') => {
    const feedback = feedbacks.find(f => f.reviewYear === year && f.reviewMonth === month && f.type === type && f.status === 'SUBMITTED');
    if (feedback) {
      setSelectedFeedback(feedback);
    } else {
      toast.info(`No detailed ${type.replace('_', ' ').toLowerCase()} found for this period.`);
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
                  <div 
                    onClick={() => handleOpenFeedback(r.performanceYear, r.performanceMonth, 'MANAGER_REVIEW')}
                    className="p-4 rounded-xl bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors group"
                  >
                    <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1 group-hover:text-primary transition-colors"><Target className="w-3 h-3"/> Manager Review</div>
                    <div className="text-xl font-bold">{r.managerReviewScore}% <span className="text-xs text-muted-foreground font-normal">(Wt: {r.managerWeight}%)</span></div>
                    <div className="text-[10px] text-primary/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click for details →</div>
                  </div>
                  <div 
                    onClick={() => handleOpenFeedback(r.performanceYear, r.performanceMonth, 'SELF_REVIEW')}
                    className="p-4 rounded-xl bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors group"
                  >
                    <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1 group-hover:text-primary transition-colors"><TrendingUp className="w-3 h-3"/> Self Review</div>
                    <div className="text-xl font-bold">{r.selfReviewScore}% <span className="text-xs text-muted-foreground font-normal">(Wt: {r.selfWeight}%)</span></div>
                    <div className="text-[10px] text-primary/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click for details →</div>
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

      <AnimatePresence>
        {selectedFeedback && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedFeedback(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1 capitalize">
                    {selectedFeedback.type.replace('_', ' ').toLowerCase()} Details
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedFeedback.reviewYear, selectedFeedback.reviewMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => setSelectedFeedback(null)} className="p-2 hover:bg-muted text-muted-foreground rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Reviewer</span>
                    <span className="text-sm font-semibold text-foreground">{selectedFeedback.reviewer?.firstName} {selectedFeedback.reviewer?.lastName}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Overall Rating</span>
                    <span className="text-sm font-bold text-amber-500">{selectedFeedback.overallRating} / 5</span>
                  </div>
                </div>

                {selectedFeedback.type === 'SELF_REVIEW' && (
                  <div className="space-y-4">
                    {selectedFeedback.achievements && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Achievements</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedFeedback.achievements}</p>
                      </div>
                    )}
                    {selectedFeedback.challenges && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Challenges</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedFeedback.challenges}</p>
                      </div>
                    )}
                    {selectedFeedback.skillsLearned && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Skills Learned</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedFeedback.skillsLearned}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedFeedback.type === 'MANAGER_REVIEW' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div><span className="block text-xs text-muted-foreground">Technical</span><span className="text-sm font-semibold text-foreground">{selectedFeedback.technicalSkillsRating} / 5</span></div>
                      <div><span className="block text-xs text-muted-foreground">Communication</span><span className="text-sm font-semibold text-foreground">{selectedFeedback.communicationRating} / 5</span></div>
                      <div><span className="block text-xs text-muted-foreground">Productivity</span><span className="text-sm font-semibold text-foreground">{selectedFeedback.productivityRating} / 5</span></div>
                      <div><span className="block text-xs text-muted-foreground">Teamwork</span><span className="text-sm font-semibold text-foreground">{selectedFeedback.teamworkRating} / 5</span></div>
                    </div>
                    {selectedFeedback.recommendation && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Recommendation</h4>
                        <p className="text-sm text-muted-foreground capitalize">{selectedFeedback.recommendation.replace(/_/g, ' ').toLowerCase()}</p>
                      </div>
                    )}
                  </div>
                )}

                {(selectedFeedback.comments || selectedFeedback.additionalComments) && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Comments</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap p-4 bg-muted/10 rounded-lg border border-border/30">{selectedFeedback.comments || selectedFeedback.additionalComments}</p>
                  </div>
                )}

                {selectedFeedback.strengths && selectedFeedback.strengths.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Strengths</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFeedback.strengths.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-md border border-emerald-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFeedback.needsImprovement && selectedFeedback.needsImprovement.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Needs Improvement</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFeedback.needsImprovement.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded-md border border-amber-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

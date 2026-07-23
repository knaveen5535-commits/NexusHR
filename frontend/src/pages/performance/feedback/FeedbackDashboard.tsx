import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackService, FeedbackType, FeedbackStatus } from '../../../services/feedback.service';
import type { FeedbackResponse } from '../../../services/feedback.service';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';
import SelfReviewModal from './SelfReviewModal';
import ManagerReviewModal from './ManagerReviewModal';
import PeerFeedbackModal from './PeerFeedbackModal';

export default function FeedbackDashboard({ 
  hideManagerReview = false,
  hideSelfPeer = false,
  mode = 'all'
}: { 
  hideManagerReview?: boolean;
  hideSelfPeer?: boolean;
  mode?: 'my' | 'team' | 'all';
}) {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isSelfReviewOpen, setIsSelfReviewOpen] = useState(false);
  const [isManagerReviewOpen, setIsManagerReviewOpen] = useState(false);
  const [isPeerFeedbackOpen, setIsPeerFeedbackOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackResponse | null>(null);
  
  const user = useAuthStore(s => s.user);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      let data: FeedbackResponse[] = [];
      if (user?.role === 'HR' || user?.role === 'ADMIN') {
        data = await feedbackService.getAllFeedbacks();
      } else if (user?.role === 'MANAGER') {
        if (mode === 'my') {
          const myData = await feedbackService.getMyFeedbacks();
          const submittedData = await feedbackService.getSubmittedFeedbacks();
          const merged = [...myData, ...submittedData];
          data = Array.from(new Map(merged.map(item => [item.id, item])).values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (mode === 'team') {
          data = await feedbackService.getTeamFeedbacks();
        } else {
          const myData = await feedbackService.getMyFeedbacks();
          const teamData = await feedbackService.getTeamFeedbacks();
          const submittedData = await feedbackService.getSubmittedFeedbacks();
          const merged = [...myData, ...teamData, ...submittedData];
          data = Array.from(new Map(merged.map(item => [item.id, item])).values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } else {
        const myData = await feedbackService.getMyFeedbacks();
        const submittedData = await feedbackService.getSubmittedFeedbacks();
        const merged = [...myData, ...submittedData];
        data = Array.from(new Map(merged.map(item => [item.id, item])).values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      setFeedbacks(data);
    } catch (err: any) {
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading feedback...</div>;
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const hasSelfReviewThisMonth = feedbacks.some(f => 
    f.type === FeedbackType.SELF_REVIEW && 
    f.reviewYear === currentYear && 
    f.reviewMonth === currentMonth &&
    f.reviewer.email === user?.email
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-sm font-semibold text-foreground">Feedback & Reviews</h3>
        <div className="flex items-center gap-2">
          {!hideSelfPeer && (user?.role === 'EMPLOYEE' || user?.role === 'MANAGER') && (
            <>
              {!hasSelfReviewThisMonth && (
                <button 
                  onClick={() => setIsSelfReviewOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                  Submit Self Review
                </button>
              )}
              
              <button 
                onClick={() => setIsPeerFeedbackOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20">
                Submit Peer Feedback
              </button>
            </>
          )}

          {!hideManagerReview && user?.role === 'MANAGER' && (
            <button 
              onClick={() => setIsManagerReviewOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
              Submit Manager Review
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {feedbacks.length > 0 ? feedbacks.map((feedback) => (
          <div 
            key={feedback.id} 
            onClick={() => setSelectedFeedback(feedback)}
            className="bg-card/50 border border-border rounded-xl p-5 backdrop-blur-xl cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase border ${
                feedback.type === FeedbackType.SELF_REVIEW ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                feedback.type === FeedbackType.MANAGER_REVIEW ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                'bg-purple-500/10 text-purple-500 border-purple-500/20'
              }`}>
                {feedback.type.replace('_', ' ')}
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                feedback.status === FeedbackStatus.DRAFT ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {feedback.status}
              </span>
            </div>
            <p className="text-sm text-foreground mt-2 mb-1">
              {new Date(feedback.reviewYear, feedback.reviewMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 pt-3 border-t border-border/50">
              <div className="text-xs text-muted-foreground flex flex-col gap-1">
                <div className="flex gap-1 items-center">
                  <span className="w-16">Reviewer:</span> 
                  <span className="font-bold text-foreground truncate max-w-[150px]">{feedback.reviewer?.firstName} {feedback.reviewer?.lastName}</span>
                </div>
                {feedback.type !== 'SELF_REVIEW' && (
                  <div className="flex gap-1 items-center">
                    <span className="w-16">Reviewee:</span> 
                    <span className="font-bold text-foreground truncate max-w-[150px]">{feedback.reviewee?.firstName} {feedback.reviewee?.lastName}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 bg-amber-500/10 px-2 py-1 rounded-md">
                <div className="text-[10px] font-bold text-amber-500/70 uppercase">Rating</div>
                <div className="text-sm font-black text-amber-500">{feedback.overallRating || '--'} <span className="text-amber-500/50 text-xs">/ 5</span></div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            No feedback found.
          </div>
        )}
      </div>

      <SelfReviewModal
        isOpen={isSelfReviewOpen}
        onClose={() => setIsSelfReviewOpen(false)}
        onSuccess={fetchFeedbacks}
      />

      <ManagerReviewModal
        isOpen={isManagerReviewOpen}
        onClose={() => setIsManagerReviewOpen(false)}
        onSuccess={fetchFeedbacks}
      />

      <PeerFeedbackModal
        isOpen={isPeerFeedbackOpen}
        onClose={() => setIsPeerFeedbackOpen(false)}
        onSuccess={fetchFeedbacks}
      />

      <AnimatePresence>
        {selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Reviewer</span>
                    <span className="text-sm font-semibold text-foreground">{selectedFeedback.reviewer?.firstName} {selectedFeedback.reviewer?.lastName}</span>
                  </div>
                  {selectedFeedback.type !== 'SELF_REVIEW' && (
                    <div>
                      <span className="block text-xs text-muted-foreground mb-1">Reviewee</span>
                      <span className="text-sm font-semibold text-foreground">{selectedFeedback.reviewee?.firstName} {selectedFeedback.reviewee?.lastName}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Overall Rating</span>
                    <span className="text-sm font-bold text-amber-500">{selectedFeedback.overallRating} / 5</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Status</span>
                    <span className="text-sm font-semibold text-foreground">{selectedFeedback.status}</span>
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

                {selectedFeedback.type === 'PEER_FEEDBACK' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div><span className="block text-xs text-muted-foreground">Communication</span><span className="text-sm font-semibold text-foreground">{selectedFeedback.communicationRating} / 5</span></div>
                      <div><span className="block text-xs text-muted-foreground">Teamwork</span><span className="text-sm font-semibold text-foreground">{selectedFeedback.teamworkRating} / 5</span></div>
                      <div><span className="block text-xs text-muted-foreground">Knowledge Sharing</span><span className="text-sm font-semibold text-foreground">{selectedFeedback.knowledgeSharingRating} / 5</span></div>
                    </div>
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

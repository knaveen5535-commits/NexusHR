import { useState, useEffect } from 'react';
import { feedbackService, FeedbackType, FeedbackStatus } from '../../../services/feedback.service';
import type { FeedbackResponse } from '../../../services/feedback.service';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';
import SelfReviewModal from './SelfReviewModal';
import ManagerReviewModal from './ManagerReviewModal';
import PeerFeedbackModal from './PeerFeedbackModal';

export default function FeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isSelfReviewOpen, setIsSelfReviewOpen] = useState(false);
  const [isManagerReviewOpen, setIsManagerReviewOpen] = useState(false);
  const [isPeerFeedbackOpen, setIsPeerFeedbackOpen] = useState(false);
  
  const user = useAuthStore(s => s.user);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      let data: FeedbackResponse[] = [];
      if (user?.role === 'HR' || user?.role === 'ADMIN') {
        data = await feedbackService.getAllFeedbacks();
      } else if (user?.role === 'MANAGER') {
        // Fetch both my feedbacks and team feedbacks for managers
        const myData = await feedbackService.getMyFeedbacks();
        const teamData = await feedbackService.getTeamFeedbacks();
        data = [...myData, ...teamData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        data = await feedbackService.getMyFeedbacks();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-sm font-semibold text-foreground">Feedback & Reviews</h3>
        <div className="flex items-center gap-2">
          {(user?.role === 'EMPLOYEE') && (
            <>
              <button 
                onClick={() => setIsSelfReviewOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                Submit Self Review
              </button>
              
              <button 
                onClick={() => setIsPeerFeedbackOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20">
                Submit Peer Feedback
              </button>
            </>
          )}

          {user?.role === 'MANAGER' && (
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
          <div key={feedback.id} className="bg-card/50 border border-border rounded-xl p-5 backdrop-blur-xl">
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
              <div className="text-xs text-muted-foreground flex gap-1 items-center">
                Reviewer: <span className="font-bold text-foreground truncate max-w-[120px]">{feedback.reviewer?.firstName} {feedback.reviewer?.lastName}</span>
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
    </div>
  );
}

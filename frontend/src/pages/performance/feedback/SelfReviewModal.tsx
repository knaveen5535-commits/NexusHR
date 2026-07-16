import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { X, Save, Send } from 'lucide-react';
import { feedbackService, FeedbackStatus } from '../../../services/feedback.service';
import { toast } from 'sonner';

interface SelfReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SelfReviewModal({ isOpen, onClose, onSuccess }: SelfReviewModalProps) {
  const { isDark } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reviewYear: new Date().getFullYear(),
    reviewMonth: new Date().getMonth() + 1,
    overallRating: 3,
    achievements: '',
    challenges: '',
    skillsLearned: '',
    additionalComments: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reviewYear' || name === 'reviewMonth' || name === 'overallRating' 
        ? Number(value) 
        : value
    }));
  };

  const windowDays = parseInt(localStorage.getItem('feedbackWindowDays') || '5', 10);
  const deadlineDate = new Date(formData.reviewYear, formData.reviewMonth, windowDays, 23, 59, 59); // reviewMonth is 1-12, so it correctly rolls over to next month in JS Date
  const isPastDeadline = new Date() > deadlineDate;

  const handleSubmit = async (status: FeedbackStatus) => {
    try {
      setLoading(true);
      await feedbackService.submitSelfReview({
        ...formData,
        status
      });
      toast.success(status === FeedbackStatus.DRAFT ? 'Draft saved successfully' : 'Self review submitted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Submit Self Review
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Year
                  </label>
                  <select
                    name="reviewYear"
                    value={formData.reviewYear}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                      isDark 
                        ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                  >
                    {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Month
                  </label>
                  <select
                    name="reviewMonth"
                    value={formData.reviewMonth}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                      isDark 
                        ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                  >
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Overall Rating (1-5)
                </label>
                <input
                  type="number"
                  name="overallRating"
                  min="1"
                  max="5"
                  value={formData.overallRating}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                    isDark 
                      ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Key Achievements
                </label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all resize-none ${
                    isDark 
                      ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                  placeholder="List your major accomplishments this month..."
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Challenges Faced
                </label>
                <textarea
                  name="challenges"
                  value={formData.challenges}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all resize-none ${
                    isDark 
                      ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                  placeholder="What roadblocks did you encounter?"
                />
              </div>
              
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Skills Learned
                </label>
                <textarea
                  name="skillsLearned"
                  value={formData.skillsLearned}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all resize-none ${
                    isDark 
                      ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                  placeholder="Any new skills or knowledge acquired?"
                />
              </div>
            </div>

              {isPastDeadline && (
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-3 text-xs font-bold text-center mb-4">
                  Submission window closed! The deadline for this month's review was {deadlineDate.toLocaleDateString()}.
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2 p-6 border-t">
                <button 
                  type="button"
                  onClick={() => handleSubmit(FeedbackStatus.DRAFT)}
                  disabled={loading || isPastDeadline}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                <Save className="w-4 h-4" /> Save as Draft
                </button>
                <button 
                  type="button"
                  onClick={() => handleSubmit(FeedbackStatus.SUBMITTED)}
                  disabled={loading || isPastDeadline}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

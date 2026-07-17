import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { X, Save, Send } from 'lucide-react';
import { feedbackService, FeedbackStatus, ManagerRecommendation } from '../../../services/feedback.service';
import { getTeamMembers, getEmployees } from '../../../services/employee.service';
import type { Employee } from '../../../services/employee.service';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';

interface ManagerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManagerReviewModal({ isOpen, onClose, onSuccess }: ManagerReviewModalProps) {
  const { isDark } = useTheme();
  const user = useAuthStore(s => s.user);
  
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    revieweeId: 0,
    reviewYear: new Date().getFullYear(),
    reviewMonth: new Date().getMonth() + 1,
    technicalSkillsRating: 3,
    communicationRating: 3,
    productivityRating: 3,
    workQualityRating: 3,
    teamworkRating: 3,
    overallRating: 3,
    comments: '',
    recommendation: ManagerRecommendation.MEETS_EXPECTATIONS,
    strengths: '',
    needsImprovement: ''
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      let data: Employee[] = [];
      if (user?.role === 'HR') {
        const all = await getEmployees();
        data = all.filter(emp => emp.role === 'MANAGER' && emp.status === 'ACTIVE');
      } else {
        const team = await getTeamMembers();
        data = team.filter(emp => emp.status === 'ACTIVE');
      }
      setTeamMembers(data);
      if (data.length > 0 && formData.revieweeId === 0) {
        setFormData(prev => ({ ...prev, revieweeId: data[0].id }));
      }
    } catch (error) {
      toast.error('Failed to load team members');
    }
  };

  const windowDays = parseInt(localStorage.getItem('feedbackWindowDays') || '5', 10);
  const deadlineDate = new Date(formData.reviewYear, formData.reviewMonth, windowDays, 23, 59, 59);
  const isPastDeadline = new Date() > deadlineDate;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['revieweeId', 'reviewYear', 'reviewMonth', 'overallRating', 'technicalSkillsRating', 'communicationRating', 'productivityRating', 'workQualityRating', 'teamworkRating'].includes(name)
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (status: FeedbackStatus) => {
    if (formData.revieweeId === 0) {
      toast.error('Please select a team member');
      return;
    }
    
    try {
      setLoading(true);
      await feedbackService.submitManagerReview({
        ...formData,
        strengths: formData.strengths.split(',').map(s => s.trim()).filter(Boolean),
        needsImprovement: formData.needsImprovement.split(',').map(s => s.trim()).filter(Boolean),
        status
      });
      toast.success(status === FeedbackStatus.DRAFT ? 'Draft saved successfully' : 'Manager review submitted successfully');
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
            className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Submit Manager Review
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Select Team Member
                  </label>
                  <select
                    name="revieweeId"
                    value={formData.revieweeId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                      isDark 
                        ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                  >
                    <option value={0} disabled>Select an employee...</option>
                    {teamMembers.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
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
                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Recommendation
                  </label>
                  <select
                    name="recommendation"
                    value={formData.recommendation}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                      isDark 
                        ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                  >
                    {Object.values(ManagerRecommendation).map(r => (
                      <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t pt-6 border-slate-200 dark:border-zinc-800">
                {[
                  { key: 'overallRating', label: 'Overall Rating' },
                  { key: 'technicalSkillsRating', label: 'Technical Skills' },
                  { key: 'communicationRating', label: 'Communication' },
                  { key: 'productivityRating', label: 'Productivity' },
                  { key: 'workQualityRating', label: 'Work Quality' },
                  { key: 'teamworkRating', label: 'Teamwork' }
                ].map((field) => (
                  <div key={field.key}>
                    <label className={`block text-[10px] font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {field.label} (1-5)
                    </label>
                    <input
                      type="number"
                      name={field.key}
                      min="1"
                      max="5"
                      value={(formData as any)[field.key]}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-xl border font-medium outline-none transition-all ${
                        isDark 
                          ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-emerald-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Strengths (Comma Separated)
                </label>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all resize-none ${
                    isDark 
                      ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-emerald-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                  placeholder="e.g. Reliable, Good code quality, Team player"
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Needs Improvement (Comma Separated)
                </label>
                <textarea
                  name="needsImprovement"
                  value={formData.needsImprovement}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all resize-none ${
                    isDark 
                      ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-emerald-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                  placeholder="e.g. Needs to speak up in meetings, Time management"
                />
              </div>
              
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Additional Comments
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all resize-none ${
                    isDark 
                      ? 'bg-zinc-900/50 border-zinc-800 text-white focus:border-emerald-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                  placeholder="Any extra feedback..."
                />
              </div>
            </div>

            {isPastDeadline && (
              <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-3 text-xs font-bold text-center mb-4 mx-6">
                Submission window closed! The deadline for this month's review was {deadlineDate.toLocaleDateString()}.
              </div>
            )}

            <div className={`p-6 border-t flex gap-4 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <button
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
                onClick={() => handleSubmit(FeedbackStatus.SUBMITTED)}
                disabled={loading || isPastDeadline}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
              >
                <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Manager Review'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

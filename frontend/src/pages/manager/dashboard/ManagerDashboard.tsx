import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { 
  Users, FileText, CheckCircle, XCircle, X,
  Brain, AlertTriangle, Target, UserPlus, Star
} from 'lucide-react';
import KpiCard from '../../../components/common/KpiCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import type { KpiCard as KpiCardType } from '../../../types';
import { useState, useEffect } from 'react';
import { getTeamMembers } from '../../../services/employee.service';
import { useAuthStore } from '../../../store/authStore';
import type { LeaveBalance } from '../../../types/leave';
import api from '../../../services/api';
import AttendanceList from '../../attendance/AttendanceList';
import { leaveService } from '../../../services/leave.service';
import type { LeaveRequest } from '../../../types/leave';
import { toast } from 'sonner';

// kpiData moved inside OverviewTab to be dynamic
const teamAttendance = [
  { name: 'Mon', value: 12, value2: 11 },
  { name: 'Tue', value: 11, value2: 10 },
  { name: 'Wed', value: 12, value2: 12 },
  { name: 'Thu', value: 10, value2: 9 },
  { name: 'Fri', value: 11, value2: 10 },
];

const teamPerformance = [
  { name: 'Alice W.', value: 4.8 },
  { name: 'Bob K.', value: 4.5 },
  { name: 'Carol D.', value: 4.2 },
  { name: 'David L.', value: 4.9 },
  { name: 'Eva M.', value: 4.6 },
];

const teamMembers = [
  { name: 'Alice Wang', role: 'Frontend Developer', status: 'Online', tasks: 5, rating: 4.8 },
  { name: 'Bob Kim', role: 'Backend Developer', status: 'On Leave', tasks: 0, rating: 4.5 },
  { name: 'Carol Davis', role: 'UX Designer', status: 'In Meeting', tasks: 2, rating: 4.2 },
  { name: 'David Lee', role: 'DevOps Engineer', status: 'Online', tasks: 8, rating: 4.9 },
];

const pendingApprovals = [
  { id: 1, employee: 'Alice Wang', type: 'Annual Leave', dates: 'Aug 12 - Aug 15', days: 4, status: 'pending' },
  { id: 2, employee: 'David Lee', type: 'Sick Leave', dates: 'Jul 28', days: 1, status: 'pending' },
  { id: 3, employee: 'Eva Martinez', type: 'Personal Leave', dates: 'Aug 02 - Aug 03', days: 2, status: 'pending' },
];



function OverviewTab() {
  const user = useAuthStore(s => s.user);
  const [teamCount, setTeamCount] = useState<number | string>('--');

  useEffect(() => {
    if (user?.id) {
      getTeamMembers().then(data => {
        setTeamCount(data.length);
      }).catch(() => {
        setTeamCount('--');
      });
    }
  }, [user]);

  const kpiData: KpiCardType[] = [
    { label: 'Team Members', value: String(teamCount), trend: 'neutral', icon: 'Users', color: 'blue-500' },
    { label: 'Team Attendance', value: '--', trend: 'neutral', icon: 'Calendar', color: 'emerald-500' },
    { label: 'Pending Approvals', value: '--', trend: 'neutral', icon: 'FileText', color: 'amber-500' },
    { label: 'Team Performance', value: '--', trend: 'neutral', icon: 'TrendingUp', color: 'purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={kpi.label} data={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard
          title="Team Attendance (This Week)"
          data={teamAttendance}
          areas={[
            { key: 'value', color: '#3b82f6', label: 'Total Present' },
            { key: 'value2', color: '#10b981', label: 'On Time' },
          ]}
        />
        <BarChartCard
          title="Top Performers (Current Quarter)"
          data={teamPerformance}
          bars={[{ key: 'value', color: '#8b5cf6', label: 'Rating' }]}
        />
      </div>
    </div>
  );
}

function TeamTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Team Roster</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-foreground text-sm font-medium hover:bg-blue-500 transition-colors">
          <UserPlus size={16} />
          Assign Tasks
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {teamMembers.map((member, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-xl hover:border-border transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                <Users size={20} className="text-foreground" />
              </div>
              <span className={`px-2 py-1 text-xs rounded-full border ${
                member.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                member.status === 'On Leave' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {member.status}
              </span>
            </div>
            <h4 className="text-base font-semibold text-foreground">{member.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">{member.role}</p>
            <div className="flex justify-between items-center pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="text-sm text-foreground font-medium">{member.tasks}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <p className="text-sm text-foreground font-medium">{member.rating}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaveTab() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModal, setCommentModal] = useState<{isOpen: boolean, reqId: number | null, action: 'approve' | 'reject'}>({isOpen: false, reqId: null, action: 'approve'});
  const [infoModal, setInfoModal] = useState<{isOpen: boolean, req: LeaveRequest | null, balances: LeaveBalance[] | null, attendanceScore: number | null, loadingBalances: boolean}>({isOpen: false, req: null, balances: null, attendanceScore: null, loadingBalances: false});
  const [comments, setComments] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getTeamRequests();
      setRequests(data);
    } catch (err: any) {
      toast.error('Failed to load team requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openInfoModal = async (leave: LeaveRequest) => {
    setInfoModal({ isOpen: true, req: leave, balances: null, attendanceScore: null, loadingBalances: true });
    try {
      const [balances, attendanceRes] = await Promise.all([
        leaveService.getEmployeeBalances(leave.employeeId).catch(() => null),
        api.get(`/attendance/employee/${leave.employeeId}`).catch(() => ({ data: [] }))
      ]);

      const attendanceHistory = attendanceRes?.data || [];
      const totalDays = attendanceHistory.length;
      let presentDays = 0;
      attendanceHistory.forEach((r: any) => {
        if (r.status === 'present' || r.status === 'late') presentDays++;
      });
      const attendanceScore = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      setInfoModal(prev => ({ ...prev, balances, attendanceScore, loadingBalances: false }));
    } catch (err) {
      toast.error('Failed to load employee details');
      setInfoModal(prev => ({ ...prev, loadingBalances: false }));
    }
  };

  const handleAction = async () => {
    if (!commentModal.reqId) return;
    try {
      if (commentModal.action === 'approve') {
        await leaveService.approveLeaveRequest(commentModal.reqId, { comments });
        toast.success('Leave request approved');
      } else {
        await leaveService.rejectLeaveRequest(commentModal.reqId, { comments });
        toast.success('Leave request rejected');
      }
      setCommentModal({isOpen: false, reqId: null, action: 'approve'});
      setComments('');
      fetchRequests();
      window.dispatchEvent(new Event('leave-requests-updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading leave requests...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-foreground mb-6">Team Leave Requests</h3>
        <div className="space-y-4">
          {requests.length > 0 ? requests.map((leave) => (
            <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted border border-border gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                  leave.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                  'bg-secondary text-blue-400'
                }`}>
                  <FileText size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground">{leave.employeeName}</h4>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
                      leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      leave.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      leave.status === 'CANCELLED' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{leave.leaveType.name} • {leave.startDate} to {leave.endDate} ({leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'})</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{leave.reason}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {leave.status === 'PENDING' && (
                  <button onClick={() => openInfoModal(leave)} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                    <FileText size={16} /> Info
                  </button>
                )}
                {leave.approvalHistories && leave.approvalHistories.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {leave.approvalHistories[leave.approvalHistories.length - 1].action} by {leave.approvalHistories[leave.approvalHistories.length - 1].actionByUserName}
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              No team leave requests found.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {infoModal.isOpen && infoModal.req && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInfoModal({isOpen: false, req: null, balances: null, attendanceScore: null, loadingBalances: false})} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{infoModal.req.employeeName}'s Request</h2>
                  <p className="text-sm text-muted-foreground">{infoModal.req.leaveType.name} Leave</p>
                </div>
                <button onClick={() => setInfoModal({isOpen: false, req: null, balances: null, attendanceScore: null, loadingBalances: false})} className="p-2 bg-muted rounded-full hover:bg-secondary"><X size={16}/></button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-muted border border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Request Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Dates:</span> <br/><span className="font-semibold text-foreground">{infoModal.req.startDate} to {infoModal.req.endDate}</span></div>
                    <div><span className="text-muted-foreground">Duration:</span> <br/><span className="font-semibold text-foreground">{infoModal.req.numberOfDays} {infoModal.req.numberOfDays === 1 ? 'day' : 'days'}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Reason:</span> <br/><span className="text-foreground">{infoModal.req.reason}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted border border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Employee Context</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Remaining Balances:</span> <br/>
                      {infoModal.loadingBalances ? (
                        <span className="font-semibold text-foreground">Loading...</span>
                      ) : infoModal.balances ? (
                        <div className="flex flex-col gap-1 mt-1">
                          {infoModal.balances.map(b => (
                            <span key={b.id} className="text-xs font-medium bg-background px-2 py-1 rounded border border-border">
                              {b.leaveType.name}: {b.remainingDays} left
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-semibold text-foreground">N/A</span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Attendance Score:</span> <br/>
                      {infoModal.loadingBalances ? (
                        <span className="font-semibold text-foreground">Loading...</span>
                      ) : infoModal.attendanceScore !== null ? (
                        <span className={`font-semibold ${infoModal.attendanceScore >= 90 ? 'text-emerald-500' : infoModal.attendanceScore >= 75 ? 'text-amber-500' : 'text-red-500'}`}>
                          {infoModal.attendanceScore >= 90 ? 'Excellent' : infoModal.attendanceScore >= 75 ? 'Good' : 'Needs Improvement'} ({infoModal.attendanceScore}%)
                        </span>
                      ) : (
                        <span className="font-semibold text-foreground">No records</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setInfoModal({isOpen: false, req: null, balances: null, attendanceScore: null, loadingBalances: false}); setCommentModal({isOpen: true, reqId: infoModal.req!.id, action: 'reject'}) }} 
                  className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 border border-red-500/20 transition-colors"
                >Reject</button>
                <button 
                  onClick={() => { setInfoModal({isOpen: false, req: null, balances: null, attendanceScore: null, loadingBalances: false}); setCommentModal({isOpen: true, reqId: infoModal.req!.id, action: 'approve'}) }} 
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors"
                >Approve</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commentModal.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCommentModal({isOpen: false, reqId: null, action: 'approve'})} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <h2 className={`text-xl font-bold mb-4 ${commentModal.action === 'approve' ? 'text-emerald-500' : 'text-red-500'}`}>
                {commentModal.action === 'approve' ? 'Approve' : 'Reject'} Leave Request
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Comments (Optional)</label>
                  <textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add a comment..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setCommentModal({isOpen: false, reqId: null, action: 'approve'})} className="flex-1 py-2 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={handleAction} className={`flex-1 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition-colors ${
                    commentModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                  }`}>
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-foreground mb-6">Team KPIs (Q3)</h3>
        <div className="space-y-5">
          {[
            { metric: 'Feature Deliveries', value: '85%', target: '90%', color: 'blue' },
            { metric: 'Code Quality (Bugs/PR)', value: '1.2', target: '< 2.0', color: 'emerald' },
            { metric: 'Sprint Velocity', value: '42 pts', target: '40 pts', color: 'purple' },
          ].map((kpi, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">{kpi.metric}</span>
                <span className="text-foreground font-medium">{kpi.value} <span className="text-muted-foreground text-xs">/ {kpi.target}</span></span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 bg-${kpi.color}-500`} 
                  style={{ width: '85%' }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-foreground mb-6">Quarterly Reviews Actionable</h3>
        <div className="space-y-4">
          {[
            { name: 'Carol Davis', status: 'Needs Review', due: 'In 2 days' },
            { name: 'Bob Kim', status: 'In Progress', due: 'In 5 days' },
          ].map((review, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{review.name}</p>
                <p className="text-xs text-amber-400 mt-0.5">Due: {review.due}</p>
              </div>
              <button className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs hover:bg-secondary transition-colors">
                Start Review
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIInsightsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Attrition Prediction</h3>
          </div>
          <p className="text-sm text-foreground mb-4">AI models indicate a <span className="text-red-400 font-bold">High Risk</span> of attrition for <span className="text-foreground font-medium">Carol Davis</span> due to prolonged stagnation in the current role and recent overtime patterns.</p>
          <button className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors">View Retention Strategy</button>
        </div>

        <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <Target size={24} className="text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-400">Skill Gap Analysis</h3>
          </div>
          <p className="text-sm text-foreground mb-4">The team is lacking proficiency in <span className="text-amber-400 font-medium">Next.js 14 App Router</span>. Recommending targeted upskilling for the frontend sub-team.</p>
          <button className="w-full py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors">Assign Training Module</button>
        </div>

        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <Brain size={24} className="text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-400">Workload Balance</h3>
          </div>
          <p className="text-sm text-foreground mb-4">David Lee is currently handling <span className="text-emerald-400 font-medium">35% more tasks</span> than average. Consider redistributing 2 tasks to Bob Kim to balance load.</p>
          <button className="w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors">Auto-Redistribute Tasks</button>
        </div>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  let activeTab = currentPath === 'dashboard' ? 'overview' : currentPath || 'overview';
  
  if (activeTab === 'leave-approvals') activeTab = 'leave';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'team': return <TeamTab />;
      case 'leave': return <LeaveTab />;
      case 'performance': return <PerformanceTab />;
      case 'ai': return <AIInsightsTab />;
      case 'attendance': return <div className="-m-8"><AttendanceList /></div>;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Manager Workspace</h1>
        <p className="text-muted-foreground text-sm mt-1">Oversee team performance, approvals, and AI insights.</p>
      </motion.div>



      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

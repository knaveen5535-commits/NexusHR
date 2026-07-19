import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { getDashboardStats, type DashboardStats } from '../../../services/employee.service';
import { 
  Calendar, UserPlus, CheckCircle, DollarSign,
  FileText, Upload, Shield, Heart, UserMinus
} from 'lucide-react';
import KpiCard from '../../../components/common/KpiCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import type { KpiCard as KpiCardType } from '../../../types';
import AttendanceList from '../../attendance/AttendanceList';
import PayrollList from '../../payroll/PayrollList';
import { leaveService } from '../../../services/leave.service';
import type { LeaveRequest } from '../../../types/leave';
import { toast } from 'sonner';
import api from '../../../services/api';
import ProfileTab from '../../../components/profile/ProfileTab';

// Mock data removed in favor of real data fetching


function OverviewTab({ stats, isLoading }: { stats: DashboardStats | null, isLoading: boolean }) {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoadingCharts(true);
        // Fetch last 7 days of attendance
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 7);
        const res = await api.get(`/attendance?startDate=${start.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`);
        
        // Aggregate by day of week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const grouped = [
          { name: 'Mon', value: 0, value2: 0 },
          { name: 'Tue', value: 0, value2: 0 },
          { name: 'Wed', value: 0, value2: 0 },
          { name: 'Thu', value: 0, value2: 0 },
          { name: 'Fri', value: 0, value2: 0 },
        ];

        res.data.forEach((record: any) => {
          const date = new Date(record.attendanceDate);
          const dayName = days[date.getDay()];
          const group = grouped.find(g => g.name === dayName);
          if (group) {
            if (record.status === 'present' || record.status === 'late') {
              group.value += 1;
            } else if (record.status === 'absent') {
              group.value2 += 1;
            }
          }
        });
        
        setAttendanceData(grouped);
      } catch (err) {
        console.error('Failed to fetch attendance for charts', err);
      } finally {
        setLoadingCharts(false);
      }
    };
    fetchAttendance();
  }, []);

  const kpiData: KpiCardType[] = [
    { label: 'Total Employees', value: isLoading ? '...' : stats?.totalEmployees.toString() || '0', change: '', trend: 'up', icon: 'Users', color: 'blue-500' },
    { label: 'Active Employees', value: isLoading ? '...' : stats?.activeEmployees.toString() || '0', change: '', trend: 'up', icon: 'UserCheck', color: 'emerald-500' },
    { label: 'Departments Count', value: isLoading ? '...' : stats?.departmentsCount.toString() || '0', change: '', trend: 'up', icon: 'Building', color: 'purple-500' },
    { label: 'Monthly Payroll', value: isLoading ? '...' : `$${(stats?.monthlyPayrollCost || 0).toLocaleString()}`, change: '', trend: 'up', icon: 'DollarSign', color: 'teal-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={kpi.label} data={kpi} index={i} />
        ))}
        {/* Additional KPIs */}
        <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <CheckCircle size={24} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
            <p className="text-xl font-bold text-foreground">45</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
            <DollarSign size={24} className="text-teal-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payroll Status</p>
            <p className="text-xl font-bold text-foreground">Processed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          {loadingCharts && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Loading chart data...</span>
            </div>
          )}
          <AreaChartCard
            title="Weekly Attendance Overview"
            data={attendanceData}
            areas={[
              { key: 'value', color: '#10b981', label: 'Present' },
              { key: 'value2', color: '#ef4444', label: 'Absent' },
            ]}
          />
        </div>
        <div className="relative h-full">
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl border border-dashed border-border flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">Recruitment Funnel</span>
            <span className="text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 uppercase tracking-wider">Coming Soon</span>
          </div>
          <div className="opacity-30 pointer-events-none">
            <BarChartCard
              title="Recruitment Funnel"
              data={[]}
              bars={[{ key: 'value', color: '#3b82f6', label: 'Candidates' }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LifecycleTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding */}
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <UserPlus size={20} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Onboarding Portal</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">Initiate new hire onboarding processes and collect required documents.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted border border-dashed border-border hover:bg-muted hover:border-blue-500/50 transition-colors gap-2">
                <Upload size={20} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Offer Letter</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted border border-dashed border-border hover:bg-muted hover:border-blue-500/50 transition-colors gap-2">
                <Shield size={20} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">ID Proof Upload</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted border border-dashed border-border hover:bg-muted hover:border-blue-500/50 transition-colors gap-2">
                <FileText size={20} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Resume Upload</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors gap-2">
                <UserPlus size={20} className="text-foreground" />
                <span className="text-sm font-medium text-foreground">Create Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Offboarding */}
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-500/10">
              <UserMinus size={20} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Offboarding Portal</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Review Resignation Requests', count: 3 },
              { label: 'Schedule Exit Interviews', count: 2 },
              { label: 'Clearance Status', count: '1 Pending' },
              { label: 'Final Settlement Processing', count: 1 },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                <span className="text-sm text-foreground">{task.label}</span>
                <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md text-foreground">{task.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



function LeaveTab() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModal, setCommentModal] = useState<{isOpen: boolean, reqId: number | null, action: 'approve' | 'reject'}>({isOpen: false, reqId: null, action: 'approve'});
  const [comments, setComments] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getAllRequests();
      setRequests(data);
    } catch (err: any) {
      toast.error('Failed to load company leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async () => {
    if (!commentModal.reqId) return;
    try {
      if (commentModal.action === 'approve') {
        await leaveService.approveLeaveRequest(commentModal.reqId, { comments });
        toast.success('Leave request approved (HR Override)');
      } else {
        await leaveService.rejectLeaveRequest(commentModal.reqId, { comments });
        toast.success('Leave request rejected (HR Override)');
      }
      setCommentModal({isOpen: false, reqId: null, action: 'approve'});
      setComments('');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading company leave data...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Company Leave Applications</h3>
          <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">{pendingCount} Pending</span>
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {requests.length > 0 ? requests.map((leave) => (
            <div key={leave.id} className="flex flex-col p-4 rounded-lg bg-muted border border-border gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-foreground">{leave.employeeName}</p>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
                      leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      leave.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      leave.status === 'CANCELLED' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{leave.leaveType.name} Leave - {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}</p>
                  <p className="text-xs text-muted-foreground">{leave.startDate} to {leave.endDate}</p>
                  <p className="text-xs text-foreground mt-2 line-clamp-2">{leave.reason}</p>
                </div>
                {leave.status === 'PENDING' && (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setCommentModal({isOpen: true, reqId: leave.id, action: 'approve'})} className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">Override Approve</button>
                    <button onClick={() => setCommentModal({isOpen: true, reqId: leave.id, action: 'reject'})} className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors border border-red-500/20">Override Reject</button>
                  </div>
                )}
              </div>
              {leave.approvalHistories && leave.approvalHistories.length > 0 && (
                <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground space-y-1">
                  {leave.approvalHistories.map((h, idx) => (
                    <div key={idx}>
                      <span className="font-semibold">{h.actionByUserName}</span> ({h.actionByRole}): {h.action}
                      {h.comments && <span className="italic"> - "{h.comments}"</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )) : (
            <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              No leave requests found in the system.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl h-fit">
        <h3 className="text-lg font-semibold text-foreground mb-6">Leave Balance Overview</h3>
        <p className="text-sm text-muted-foreground mb-6">Monitor organizational liability and upcoming mass leaves.</p>
        <div className="space-y-4">
          {[
            { label: 'Annual Leave Liability', value: '4,250 days', color: 'blue' },
            { label: 'Sick Leave Utilization', value: '42%', color: 'emerald' },
            { label: 'Upcoming Holidays (Q3)', value: '3 days', color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
              <span className="text-sm text-foreground">{stat.label}</span>
              <span className={`text-sm font-bold text-${stat.color}-400`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {commentModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCommentModal({isOpen: false, reqId: null, action: 'approve'})} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <h2 className={`text-xl font-bold mb-4 ${commentModal.action === 'approve' ? 'text-emerald-500' : 'text-red-500'}`}>
                {commentModal.action === 'approve' ? 'Approve' : 'Reject'} Leave Request (HR Override)
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
                    Confirm Override
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



function NotificationsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Company Announcements</h3>
          <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-foreground text-xs font-medium hover:bg-blue-500 transition-colors">New Announcement</button>
        </div>
        <div className="space-y-4">
          {[
            { title: 'Q3 Townhall Meeting', date: 'Jul 15, 2026', desc: 'Join the executive team for the Q3 kickoff and company updates.' },
            { title: 'New Health Benefits', date: 'Jul 01, 2026', desc: 'Updated health insurance policies are now active.' },
          ].map((ann, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted border border-border">
              <h4 className="text-sm font-medium text-foreground">{ann.title}</h4>
              <p className="text-xs text-blue-400 mt-1 mb-2">{ann.date}</p>
              <p className="text-sm text-muted-foreground">{ann.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-foreground mb-6">Automated Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
            <div className="p-2 rounded-full bg-indigo-500/10">
              <Heart size={20} className="text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-indigo-400">Upcoming Birthdays</h4>
              <p className="text-sm text-foreground">5 employees have birthdays this week.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-teal-500/5 border border-teal-500/20">
            <div className="p-2 rounded-full bg-teal-500/10">
              <Calendar size={20} className="text-teal-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-teal-400">Holiday Notifications</h4>
              <p className="text-sm text-foreground">Independence Day (Aug 15) alert scheduled.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HrDashboard() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  let activeTab = currentPath === 'dashboard' ? 'overview' : currentPath || 'overview';
  
  if (activeTab === 'onboarding') activeTab = 'lifecycle';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab stats={stats} isLoading={isLoading} />;
      case 'lifecycle': return <LifecycleTab />;
      case 'attendance': return <div className="-m-8"><AttendanceList /></div>;
      case 'leave': return <LeaveTab />;
      case 'payroll': return <div className="-m-8"><PayrollList /></div>;
      case 'notifications': return <NotificationsTab />;
      case 'profile': return <ProfileTab />;
      case 'performance': return <div className="p-6 text-center text-muted-foreground">Performance management module coming soon.</div>;
      default: return <OverviewTab stats={stats} isLoading={isLoading} />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">HR Central</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage workforce lifecycle, attendance, payroll, and core operations.</p>
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

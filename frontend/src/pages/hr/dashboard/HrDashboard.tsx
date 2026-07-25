import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { getDashboardStats, getPendingProfileRequests, getPendingDocuments, type DashboardStats } from '../../../services/employee.service';
import { 
  Calendar, UserPlus, CheckCircle, DollarSign,
  FileText, Upload, Shield, Heart, UserMinus, Clock, Download
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
import { useAuthStore } from '../../../store/authStore';
import ProfileTab from '../../../components/profile/ProfileTab';
import ProfileApprovalsList from '../../../components/profile/ProfileApprovalsList';
import EmployeeOnboardingTab from './EmployeeOnboardingTab';

function ProfileApprovalsTab() {
  return (
    <div className="space-y-6 relative">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-foreground mb-2">Profile Approvals</h3>
        <p className="text-sm text-muted-foreground mb-6">Review and verify submitted profiles from employees.</p>
        <ProfileApprovalsList />
      </div>
    </div>
  );
}

// Mock data removed in favor of real data fetching

function AttendanceTab() {
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = useAuthStore(s => s.user);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      setFetchingHistory(true);
      const empId = user?.id || 1;
      const res = await api.get(`/attendance/employee/${empId}`);
      
      const actualRecords = res.data;
      
      // Sort history descending by date
      actualRecords.sort((a: any, b: any) => b.attendanceDate.localeCompare(a.attendanceDate));
      setAttendanceHistory(actualRecords);
    } catch (err) {
      console.error('Failed to fetch attendance history', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const timer = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utc + (3600000 * 5.5));
      setCurrentTime(istTime);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      
      await api.post('/attendance/check-in', {
        employeeId: user?.id || 1, // fallback for demo
        checkInTime: new Date().toISOString(), // This will be ignored by backend
        source: 'WEB'
      });
      toast.success('Successfully checked in!');
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await api.post('/attendance/check-out', {
        employeeId: user?.id || 1, // fallback for demo
        checkOutTime: new Date().toISOString(), // This will be ignored by backend
        remarks: 'Standard checkout'
      });
      toast.success('Successfully checked out!');
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  // Check if current time is within allowed window (05:00 AM - 03:00 PM)
  const isWithinTimeWindow = currentTime.getHours() >= 5 && currentTime.getHours() < 15;

  // Find today's record in local time
  const year = currentTime.getFullYear();
  const month = String(currentTime.getMonth() + 1).padStart(2, '0');
  const day = String(currentTime.getDate()).padStart(2, '0');
  const localTodayStr = `${year}-${month}-${day}`;
  
  const todayRecord = attendanceHistory.find(r => r.attendanceDate === localTodayStr);
  const hasCheckedInToday = todayRecord && todayRecord.checkInTime !== '--';
  const hasCheckedOutToday = todayRecord && todayRecord.checkOutTime !== '--';

  const isCheckInAllowed = isWithinTimeWindow && !hasCheckedInToday;
  const isCheckOutAllowed = hasCheckedInToday && !hasCheckedOutToday;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl text-center">
          <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 mx-auto mb-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
            <Clock size={24} className="text-blue-400 mb-2 z-10" />
            <span className="text-2xl font-bold text-foreground z-10">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={handleCheckIn} disabled={loading || !isCheckInAllowed} className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-foreground text-sm font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {hasCheckedInToday ? 'Checked In' : 'Check In'}
            </button>
            <button onClick={handleCheckOut} disabled={loading || !isCheckOutAllowed} className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary transition-colors border border-border disabled:opacity-50 disabled:cursor-not-allowed">
              {hasCheckedOutToday ? 'Checked Out' : 'Check Out'}
            </button>
          </div>
          {!isWithinTimeWindow && !hasCheckedInToday && <p className="text-xs text-amber-500 mt-2 font-medium">Check-in is only available between 05:00 AM and 03:00 PM</p>}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">My Recent Attendance History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b border-border">
                <tr>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Check In</th>
                  <th className="pb-3 font-medium">Check Out</th>
                  <th className="pb-3 font-medium">Total Hours</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {fetchingHistory ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                        <p className="text-muted-foreground text-sm mt-2">Loading attendance records...</p>
                      </div>
                    </td>
                  </tr>
                ) : attendanceHistory.length > 0 ? attendanceHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-muted transition-colors">
                    <td className="py-3">{row.attendanceDate}</td>
                    <td className="py-3">{row.checkInTime}</td>
                    <td className="py-3">{row.checkOutTime}</td>
                    <td className="py-3">{row.totalHours}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                        row.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        row.status === 'late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      } capitalize`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


function OverviewTab({ stats, isLoading }: { stats: DashboardStats | null, isLoading: boolean }) {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number | string>('...');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoadingCharts(true);
        // Fetch current week of attendance
        const today = new Date();
        const start = new Date();
        const currentDay = start.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        start.setDate(today.getDate() + diffToMonday);
        start.setHours(0, 0, 0, 0);
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
    
    const fetchPendingApprovals = async () => {
      try {
        const [leaves, profiles, docs] = await Promise.all([
          leaveService.getAllRequests().catch(() => []),
          getPendingProfileRequests().catch(() => []),
          getPendingDocuments().catch(() => [])
        ]);
        const pendingLeaves = leaves.filter((r: any) => r.status === 'PENDING').length;
        const pendingProfiles = profiles.length;
        const pendingDocs = docs.length;
        setPendingApprovalsCount(pendingLeaves + pendingProfiles + pendingDocs);
      } catch (err) {
        setPendingApprovalsCount(0);
      }
    };

    fetchAttendance();
    fetchPendingApprovals();
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
            <p className="text-xl font-bold text-foreground">{pendingApprovalsCount}</p>
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

function MyPayslipsTab() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const res = await api.get('/payrolls/me');
          setPayrolls(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch payrolls", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleDownloadPayslip = async (id: number, number: string) => {
    try {
      const response = await api.get(`/payrolls/${id}/payslip/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      toast.error("Failed to download payslip. Please try again later.");
    }
  };

  const renderTable = (payrollsData: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-muted-foreground border-b border-border bg-muted/30">
          <tr>
            <th className="px-6 py-4 font-medium">Month/Year</th>
            <th className="px-6 py-4 font-medium">Payslip #</th>
            <th className="px-6 py-4 font-medium text-right">Basic Salary</th>
            <th className="px-6 py-4 font-medium text-right">Deductions & Tax</th>
            <th className="px-6 py-4 font-medium text-right">Net Salary</th>
            <th className="px-6 py-4 font-medium text-center">Status</th>
            <th className="px-6 py-4 font-medium text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-foreground">
          {payrollsData.length > 0 ? payrollsData.map((row) => (
            <tr key={row.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4 font-medium whitespace-nowrap">
                {new Date(row.payrollYear, row.payrollMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </td>
              <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{row.payslipNumber}</td>
              <td className="px-6 py-4 text-right">${row.grossSalary?.toLocaleString()}</td>
              <td className="px-6 py-4 text-right text-red-400">
                -${((row.totalDeductions || 0) + (row.totalTaxes || 0)).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right font-bold text-emerald-400">
                ${row.netSalary?.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                  row.status === 'processed' || row.status === 'paid' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                } capitalize`}>
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  {row.status === 'paid' && (
                    <button 
                      onClick={() => handleDownloadPayslip(row.id, row.payslipNumber)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="py-8 text-center text-muted-foreground">
                No payslips found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading payslips...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">My Payslips</h3>
        </div>
        {renderTable(payrolls)}
      </div>
    </div>
  );
}

export default function HrDashboard() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  let activeTab = currentPath === 'dashboard' ? 'overview' : currentPath || 'overview';

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
      case 'profile-requests': return <ProfileApprovalsTab />;
      case 'onboarding': return <EmployeeOnboardingTab />;
      case 'lifecycle': return <LifecycleTab />;
      case 'my-attendance': return <AttendanceTab />;
      case 'company-attendance': return <AttendanceList />;
      case 'leave': return <LeaveTab />;
      case 'my-payslips': return <MyPayslipsTab />;
      case 'company-payroll': return <PayrollList />;
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

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { 
  FileText, X, Clock,
  Brain, AlertTriangle, Target, UserPlus, Download
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
import FeedbackDashboard from '../../performance/feedback/FeedbackDashboard';
import { performanceService } from '../../../services/performance.service';

import type { Employee } from '../../../types';
import ProfileTab from '../../../components/profile/ProfileTab';
import ProfileApprovalsList from '../../../components/profile/ProfileApprovalsList';

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

function OverviewTab() {
  const user = useAuthStore(s => s.user);
  const [teamCount, setTeamCount] = useState<number | string>('--');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number | string>('--');
  const [attendancePercent, setAttendancePercent] = useState<number | string>('--');

  const [teamAttendanceData, setTeamAttendanceData] = useState<any[]>([]);
  const [teamPerformanceData, setTeamPerformanceData] = useState<any[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoadingCharts(true);
      Promise.all([
        getTeamMembers(),
        leaveService.getTeamRequests(),
        api.get('/attendance/team'),
        performanceService.getTeamPerformance(new Date().getFullYear(), new Date().getMonth() + 1).catch(() => ({ data: [] }))
      ]).then(([membersData, requests, attendanceRes, perfRes]) => {
        setTeamCount(membersData.length);
        
        // Pending approvals
        const pending = requests.filter((r: any) => r.status === 'PENDING').length;
        setPendingApprovalsCount(pending);

        // Attendance processing
        const attendanceData: any[] = attendanceRes.data;
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendanceData.filter(record => record.date === today);
        const uniqueEmployeesPresent = new Set(todayRecords.map(r => r.employeeId)).size;
        
        if (membersData.length > 0) {
          const percent = Math.round((uniqueEmployeesPresent / membersData.length) * 100);
          setAttendancePercent(`${percent}%`);
        } else {
          setAttendancePercent('--');
        }

        // Process Weekly Attendance for Chart
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const grouped = [
          { name: 'Mon', value: 0, value2: 0 },
          { name: 'Tue', value: 0, value2: 0 },
          { name: 'Wed', value: 0, value2: 0 },
          { name: 'Thu', value: 0, value2: 0 },
          { name: 'Fri', value: 0, value2: 0 },
        ];
        
        // Only look at last 7 days
        const start = new Date();
        start.setDate(start.getDate() - 7);
        const recentAttendance = attendanceData.filter(r => new Date(r.attendanceDate) >= start);

        recentAttendance.forEach((record: any) => {
          const date = new Date(record.attendanceDate);
          const dayName = days[date.getDay()];
          const group = grouped.find(g => g.name === dayName);
          if (group && (record.status === 'present' || record.status === 'late')) {
            group.value += 1; // Total present
            if (record.status === 'present') {
              group.value2 += 1; // On time
            }
          }
        });
        setTeamAttendanceData(grouped);

        // Process Performance for Chart
        const perfData: any = perfRes.data || perfRes || [];
        // Extract array if it returns the raw data or wrapped in data
        const perfArray = Array.isArray(perfData) ? perfData : perfData.data || [];
        
        const topPerformers = perfArray
          .map((p: any) => ({
            name: `${p.employee.firstName} ${p.employee.lastName[0]}.`,
            value: Number(p.finalScore || 0)
          }))
          .filter((p: any) => p.value > 0)
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 5); // Top 5
        setTeamPerformanceData(topPerformers);

      }).catch(() => {
        setTeamCount('--');
        setPendingApprovalsCount(0);
        setAttendancePercent('--');
      }).finally(() => {
        setLoadingCharts(false);
      });
    }
  }, [user]);

  const kpiData: KpiCardType[] = [
    { label: 'Team Members', value: String(teamCount), trend: 'neutral', icon: 'Users', color: 'blue-500' },
    { label: 'Team Attendance', value: String(attendancePercent), trend: 'neutral', icon: 'Calendar', color: 'emerald-500' },
    { label: 'Pending Approvals', value: String(pendingApprovalsCount), trend: 'neutral', icon: 'FileText', color: 'amber-500' },
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
        <div className="relative">
          {loadingCharts && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Loading chart data...</span>
            </div>
          )}
          <AreaChartCard
            title="Team Attendance (This Week)"
            data={teamAttendanceData}
            areas={[
              { key: 'value', color: '#3b82f6', label: 'Total Present' },
              { key: 'value2', color: '#10b981', label: 'On Time' },
            ]}
          />
        </div>
        <div className="relative">
          {loadingCharts && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Loading chart data...</span>
            </div>
          )}
          {teamPerformanceData.length === 0 && !loadingCharts ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-xl border border-dashed border-border flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Top Performers (Current Month)</span>
              <span className="text-xs font-bold px-3 py-1 bg-muted text-muted-foreground rounded-full border border-border">No performance data yet</span>
            </div>
          ) : null}
          <div className={teamPerformanceData.length === 0 && !loadingCharts ? "opacity-30 pointer-events-none" : ""}>
            <BarChartCard
              title="Top Performers (Current Month)"
              data={teamPerformanceData.length > 0 ? teamPerformanceData : [{ name: 'No Data', value: 0 }]}
              bars={[{ key: 'value', color: '#8b5cf6', label: 'Score' }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamTab() {
  const [members, setMembers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getTeamMembers();
      setMembers(data);
    } catch (err) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading team members...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Team Roster</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-foreground text-sm font-medium hover:bg-blue-500 transition-colors">
          <UserPlus size={16} />
          Assign Tasks
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col p-4 rounded-xl border border-border bg-card/50 backdrop-blur-xl hover:border-border transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                {member.profilePhotoUrl ? (
                  <img src={member.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white">{member.firstName?.[0] || 'U'}</span>
                )}
              </div>
              <span className={`px-2 py-1 text-xs rounded-full border ${
                member.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                member.status === 'ON_LEAVE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {member.status}
              </span>
            </div>
            <h4 className="text-base font-semibold text-foreground">{member.firstName} {member.lastName}</h4>
            <p className="text-sm text-muted-foreground mb-4">{member.designation}</p>
            
          </div>
        ))}
        {members.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-muted/10">
            No team members found.
          </div>
        )}
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
        <FeedbackDashboard />
      </div>
    </div>
  );
}

function AIInsightsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Manager AI Assistant</h3>
        <p className="text-sm text-muted-foreground">AI Insights module coming soon. Will provide predictive analytics on team performance and retention risks.</p>
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

function TeamPayslipsTab() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/payrolls/team');
        setPayrolls(res.data);
      } catch (err) {
        console.error("Failed to fetch team payrolls", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            <th className="px-6 py-4 font-medium">Employee</th>
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
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-bold text-foreground">{row.employeeName || 'Unknown Employee'}</div>
                <div className="text-xs text-muted-foreground">{row.employeeCode || 'N/A'}</div>
              </td>
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
              <td colSpan={8} className="py-8 text-center text-muted-foreground">
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
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Team Payslips</h3>
          <span className="text-xs text-muted-foreground">Viewing payroll records for your direct reports</span>
        </div>
        {renderTable(payrolls)}
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
      case 'my-attendance': return <AttendanceTab />;
      case 'team-attendance': return <div className="-m-8"><AttendanceList /></div>;
      case 'my-payslips': return <MyPayslipsTab />;
      case 'team-payslips': return <TeamPayslipsTab />;
      case 'profile': return <ProfileTab />;
      case 'profile-requests': return <ProfileApprovalsList />;
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

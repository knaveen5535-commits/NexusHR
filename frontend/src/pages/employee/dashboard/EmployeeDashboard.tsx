import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { toast } from 'sonner';
import { 
  Clock, Download
} from 'lucide-react';
import KpiCard from '../../../components/common/KpiCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import type { KpiCard as KpiCardType } from '../../../types';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { leaveService } from '../../../services/leave.service';
import type { LeaveRequest, LeaveBalance, LeaveRequestSubmit } from '../../../types/leave';
import FeedbackDashboard from '../../performance/feedback/FeedbackDashboard';
import { performanceService } from '../../../services/performance.service';
import ProfileTab from '../../../components/profile/ProfileTab';

function OverviewTab() {
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<number>(0);
  const [performanceRating, setPerformanceRating] = useState<string>('--');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      Promise.allSettled([
        api.get(`/attendance/employee/${user.id}`).then(res => setAttendanceHistory(res.data)),
        leaveService.getMyBalances(new Date().getFullYear()).then(res => {
          setLeaveBalances(res);
          const totalRemaining = res.reduce((acc, curr) => acc + curr.remainingDays, 0);
          setLeaveBalance(totalRemaining);
        }),
        performanceService.getMyPerformanceHistory().then(res => {
          const perfArray = Array.isArray(res) ? res : (res as any).data || [];
          const validScores = perfArray.filter((p:any) => Number(p.finalScore) > 0);
          if (validScores.length > 0) {
            const sum = validScores.reduce((acc: number, curr: any) => acc + Number(curr.finalScore), 0);
            const avg = sum / validScores.length;
            setPerformanceRating(Math.round(avg).toString());
          }
        }).catch(err => console.error(err))
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [user]);

  const today = new Date();
  
  // Calculate total working days in the current month up to today (Mon-Fri)
  let workingDays = 0;
  for (let d = new Date(today.getFullYear(), today.getMonth(), 1); d <= today; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) workingDays++; // Exclude Sunday (0) and Saturday (6)
  }
  
  // Count present days THIS month
  let presentDays = 0;
  attendanceHistory.forEach(r => {
    const d = new Date(r.attendanceDate);
    if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      if (r.status === 'present' || r.status === 'late') presentDays++;
    }
  });
  
  const attendancePercentage = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;
  const attendanceDisplay = workingDays > 0 ? `${attendancePercentage}%` : '--';
  
  // Absents is workingDays - presentDays. But if today is before 9 AM, we don't count today as absent yet.
  let adjustedWorkingDays = workingDays;
  if (today.getHours() < 9 && today.getDay() !== 0 && today.getDay() !== 6) {
    adjustedWorkingDays--;
  }
  const absentDays = Math.max(0, adjustedWorkingDays - presentDays);
  
  let currentStreak = 0;
  for (let i = attendanceHistory.length - 1; i >= 0; i--) {
    if (attendanceHistory[i].status === 'present' || attendanceHistory[i].status === 'late') {
      currentStreak++;
    } else if (attendanceHistory[i].status === 'absent') {
      break;
    }
  }

  // Chart data processing
  const recentWeeks = [
    { name: 'Week 1', value: 0, value2: 0 },
    { name: 'Week 2', value: 0, value2: 0 },
    { name: 'Week 3', value: 0, value2: 0 },
    { name: 'Week 4', value: 0, value2: 0 },
  ];
  
  if (attendanceHistory.length > 0) {
    // Process last 28 days into 4 weeks
    const today = new Date();
    today.setHours(0,0,0,0);
    attendanceHistory.forEach(r => {
      const d = new Date(r.attendanceDate);
      const diffTime = Math.abs(today.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let weekIndex = -1;
      if (diffDays <= 7) weekIndex = 3;
      else if (diffDays <= 14) weekIndex = 2;
      else if (diffDays <= 21) weekIndex = 1;
      else if (diffDays <= 28) weekIndex = 0;

      if (weekIndex !== -1) {
        if (r.status === 'present' || r.status === 'late') recentWeeks[weekIndex].value += 1;
        if (r.status === 'absent') recentWeeks[weekIndex].value2 += 1;
      }
    });
  }

  const leaveChartData = leaveBalances.map(b => ({
    name: b.leaveType.name,
    value: b.remainingDays,
    value2: b.usedDays
  }));

  const kpiData: KpiCardType[] = [
    { label: 'My Attendance', value: isLoading ? '...' : attendanceDisplay, change: isLoading ? 'Loading data...' : (workingDays > 0 ? `${absentDays} days absent` : 'No data available'), trend: attendancePercentage > 80 ? 'up' : 'down', icon: 'Calendar', color: 'blue-500' },
    { label: 'Leave Balance', value: isLoading ? '...' : `${leaveBalance} Days`, change: isLoading ? 'Loading data...' : 'Total available', trend: 'neutral', icon: 'FileText', color: 'emerald-500' },
    { label: 'Current Streak', value: isLoading ? '...' : `${currentStreak} Days`, change: isLoading ? 'Loading data...' : (currentStreak > 0 ? 'Consecutive present' : 'No active streak'), trend: currentStreak > 3 ? 'up' : 'neutral', icon: 'Activity', color: 'amber-500' },
    { label: 'Performance', value: isLoading ? '...' : (performanceRating !== '--' ? performanceRating : '--'), change: isLoading ? 'Loading data...' : (performanceRating !== '--' ? 'Average score' : 'No data available'), trend: 'neutral', icon: 'TrendingUp', color: 'purple-500' },
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
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Loading chart data...</span>
            </div>
          )}
          {attendanceHistory.length === 0 && !isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-xl border border-dashed border-border flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Monthly Attendance Overview</span>
              <span className="text-xs font-bold px-3 py-1 bg-muted text-muted-foreground rounded-full border border-border">No attendance records found</span>
            </div>
          ) : null}
          <div className={attendanceHistory.length === 0 && !isLoading ? "opacity-30 pointer-events-none" : ""}>
            <AreaChartCard
              title="Recent Attendance (Last 4 Weeks)"
              data={recentWeeks}
              areas={[
                { key: 'value', color: '#10b981', label: 'Days Present' },
                { key: 'value2', color: '#ef4444', label: 'Days Absent' },
              ]}
            />
          </div>
        </div>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Loading chart data...</span>
            </div>
          )}
          {leaveBalances.length === 0 && !isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-xl border border-dashed border-border flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Leave Balance Overview</span>
              <span className="text-xs font-bold px-3 py-1 bg-muted text-muted-foreground rounded-full border border-border">No leave balances found</span>
            </div>
          ) : null}
          <div className={leaveBalances.length === 0 && !isLoading ? "opacity-30 pointer-events-none" : ""}>
            <BarChartCard
              title="Leave Balance Overview"
              data={leaveChartData.length > 0 ? leaveChartData : [{ name: 'No Data', value: 0 }]}
              bars={[
                { key: 'value', color: '#10b981', label: 'Remaining' },
                { key: 'value2', color: '#3b82f6', label: 'Used' }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}



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
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Attendance History</h3>
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

function LeaveTab() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState<LeaveRequestSubmit>({
    leaveTypeId: 0,
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const getMinDate = () => {
    const now = new Date();
    if (now.getHours() >= 18) {
      now.setDate(now.getDate() + 1);
    }
    return now.toISOString().split('T')[0];
  };
  const minDate = getMinDate();
  const hasPendingRequest = requests.some(r => r.status === 'PENDING');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [b, r] = await Promise.all([
        leaveService.getMyBalances(),
        leaveService.getMyRequests()
      ]);
      setBalances(b);
      setRequests(r);
      if (b.length > 0 && leaveForm.leaveTypeId === 0) {
        setLeaveForm(prev => ({ ...prev, leaveTypeId: b[0].leaveType.id }));
      }
    } catch (err: any) {
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async () => {
    try {
      if (!leaveForm.leaveTypeId || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
        toast.error('Please fill all required fields');
        return;
      }
      setIsSubmitting(true);
      if (editingId) {
        await leaveService.editLeaveRequest(editingId, leaveForm);
        toast.success('Leave request updated');
      } else {
        await leaveService.submitLeaveRequest(leaveForm);
        toast.success('Leave request submitted');
      }
      setApplyModalOpen(false);
      setEditingId(null);
      setLeaveForm({ leaveTypeId: balances[0]?.leaveType.id || 0, startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await leaveService.cancelLeaveRequest(id);
      toast.success('Leave request cancelled');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to cancel request');
    }
  };

  const openEdit = (req: LeaveRequest) => {
    setEditingId(req.id);
    setLeaveForm({
      leaveTypeId: req.leaveType.id,
      startDate: req.startDate,
      endDate: req.endDate,
      reason: req.reason
    });
    setApplyModalOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading leave data...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Leave Balances</h3>
            <div className="space-y-4">
              {balances.map((balance) => {
                const total = balance.totalDays;
                const used = balance.usedDays;
                const pending = balance.pendingDays;
                const percent = total > 0 ? ((used + pending) / total) * 100 : 0;
                
                return (
                  <div key={balance.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground">{balance.leaveType.name}</span>
                      <span className="text-foreground font-medium">{balance.remainingDays} / {total} remaining</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${percent > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(percent, 100)}%` }} 
                      />
                    </div>
                    {pending > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 text-right">{pending} pending approval</p>
                    )}
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => {
                if (hasPendingRequest) return;
                setEditingId(null);
                setLeaveForm({ leaveTypeId: balances[0]?.leaveType.id || 0, startDate: '', endDate: '', reason: '' });
                setApplyModalOpen(true);
              }}
              disabled={hasPendingRequest}
              className={`w-full mt-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg ${
                hasPendingRequest 
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-blue-500/20'
              }`}
            >
              {hasPendingRequest ? 'Pending Request Exists' : 'Apply Leave'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Leave History</h3>
          <div className="space-y-3">
            {requests.length > 0 ? requests.map(req => (
              <div key={req.id} className="p-4 rounded-lg bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{req.leaveType.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
                      req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      req.status === 'CANCELLED' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {req.startDate} to {req.endDate} ({req.numberOfDays} {req.numberOfDays === 1 ? 'day' : 'days'})
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{req.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  {req.status === 'PENDING' && (
                    <>
                      <button onClick={() => openEdit(req)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-foreground hover:bg-muted border border-border transition-colors">Edit</button>
                      <button onClick={() => handleCancel(req.id)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors">Cancel</button>
                    </>
                  )}
                  {req.approvalHistories && req.approvalHistories.length > 0 && (
                    <div className="text-xs text-muted-foreground text-right ml-4">
                      {req.approvalHistories.map((h, i) => (
                        <div key={i} className="max-w-[200px] mb-1 last:mb-0">
                          <div className="truncate font-medium">{h.action} by {h.actionByUserName}</div>
                          {h.comments && (
                            <div className="italic text-[10px] text-muted-foreground/80 break-words line-clamp-2">"{h.comments}"</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                No leave history found.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {applyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApplyModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">{editingId ? 'Edit Leave Request' : 'Apply for Leave'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Leave Type</label>
                  <select 
                    value={leaveForm.leaveTypeId} 
                    onChange={e => setLeaveForm({...leaveForm, leaveTypeId: Number(e.target.value)})}
                    className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {balances.map(b => (
                      <option key={b.leaveType.id} value={b.leaveType.id}>{b.leaveType.name} ({b.remainingDays} days left)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Start Date</label>
                    <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} min={minDate} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">End Date</label>
                    <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} min={leaveForm.startDate || minDate} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Reason</label>
                  <textarea rows={3} value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please provide your reason..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setApplyModalOpen(false)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={handleApply} disabled={isSubmitting} className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Submitting...' : 'Submit'}
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-foreground">Current Goals</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">0 Active</span>
          </div>
          <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            No goals set.
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <FeedbackDashboard />
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-foreground mb-4">Recent Notifications</h3>
      <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
        No new notifications.
      </div>
    </div>
  );
}

function PayrollTab() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (user?.id) {
      api.get('/payrolls/me')
        .then(res => setPayrolls(res.data))
        .catch(err => console.error("Failed to fetch payrolls", err))
        .finally(() => setLoading(false));
    }
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

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading payslips...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">My Payslips</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground border-b border-border">
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
              {payrolls.length > 0 ? payrolls.map((row) => (
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
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  const activeTab = currentPath === 'dashboard' ? 'overview' : currentPath || 'overview';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'profile': return <ProfileTab />;
      case 'attendance': return <AttendanceTab />;
      case 'leave': return <LeaveTab />;
      case 'performance': return <PerformanceTab />;
      case 'payroll': return <PayrollTab />;
      case 'notifications': return <NotificationsTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 relative">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">My Space</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile, attendance, and benefits.</p>
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

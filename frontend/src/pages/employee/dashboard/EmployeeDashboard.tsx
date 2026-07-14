import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { toast } from 'sonner';
import { 
  User, FileText, Star, Bell, 
  Clock, CheckCircle, AlertCircle, Download,
  Mail, Phone, MapPin
} from 'lucide-react';
import KpiCard from '../../../components/common/KpiCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import type { KpiCard as KpiCardType } from '../../../types';
import { submitResignation, getMyResignations } from '../../../services/resignation.service';
import type { Resignation } from '../../../services/resignation.service';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

function OverviewTab() {
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (user?.id) {
      api.get(`/attendance/employee/${user.id}`)
        .then(res => setAttendanceHistory(res.data))
        .catch(console.error);
    }
  }, [user]);

  let presentDays = 0;
  let totalDays = attendanceHistory.length;
  attendanceHistory.forEach(r => {
    if (r.status === 'present' || r.status === 'late') presentDays++;
  });
  
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  const attendanceDisplay = totalDays > 0 ? `${attendancePercentage}%` : '--';
  const absentDays = totalDays - presentDays;

  const kpiData: KpiCardType[] = [
    { label: 'My Attendance', value: attendanceDisplay, change: totalDays > 0 ? `${absentDays} days absent` : 'No data available', trend: attendancePercentage > 80 ? 'up' : 'down', icon: 'Calendar', color: 'blue-500' },
    { label: 'Leave Balance', value: '--', change: 'No data available', trend: 'neutral', icon: 'FileText', color: 'emerald-500' },
    { label: 'Current Streak', value: '--', change: 'No data available', trend: 'neutral', icon: 'Activity', color: 'amber-500' },
    { label: 'Performance', value: '--', change: 'No data available', trend: 'neutral', icon: 'Star', color: 'purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={kpi.label} data={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Attendance</h3>
          <div className="py-12 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            Chart data unavailable
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Leave Balance Overview</h3>
          <div className="py-12 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            Chart data unavailable
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const user = useAuthStore(s => s.user);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-3xl font-bold text-white">{user?.firstName?.[0] || 'U'}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">{user?.firstName || '--'} {user?.lastName || ''}</h2>
          <p className="text-sm text-muted-foreground">{user?.designation || '--'}</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">{user?.department || '--'}</span>
            <span className="px-2 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Mail size={16} className="text-muted-foreground" />
              <span className="truncate">{user?.email || '--'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Phone size={16} className="text-muted-foreground" />
              <span>--</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <MapPin size={16} className="text-muted-foreground" />
              <span>--</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Personal Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Employee ID</p>
              <p className="text-sm text-foreground font-medium">{user?.employeeId || '--'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Joining</p>
              <p className="text-sm text-foreground font-medium">--</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="text-sm text-foreground font-medium">--</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reporting Manager</p>
              <p className="text-sm text-foreground font-medium">--</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Documents</h3>
          <div className="space-y-3">
            <div className="py-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              No documents available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceTab() {
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = useAuthStore(s => s.user);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const empId = user?.id || 1;
      const res = await api.get(`/attendance/employee/${empId}`);
      setAttendanceHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await api.post('/attendance/check-in', {
        employeeId: user?.id || 1, // fallback for demo
        checkInTime: new Date().toISOString(),
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
        checkOutTime: new Date().toISOString(),
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
            <button onClick={handleCheckIn} disabled={loading} className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-foreground text-sm font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              Check In
            </button>
            <button onClick={handleCheckOut} disabled={loading} className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary transition-colors border border-border disabled:opacity-50">
              Check Out
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Working hours: 09:00 AM - 06:00 PM</p>
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
                {attendanceHistory.length > 0 ? attendanceHistory.map((row, i) => (
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
  const emptyLeaveBalance = [
    { name: 'Annual', value: 0, total: 0 },
    { name: 'Sick', value: 0, total: 0 },
    { name: 'Personal', value: 0, total: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Leave Balances</h3>
            <div className="space-y-4">
              {emptyLeaveBalance.map((leave) => (
                <div key={leave.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">{leave.name} Leave</span>
                    <span className="text-foreground font-medium">-- / --</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-muted w-full" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 rounded-lg bg-blue-600 text-foreground text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
              Apply Leave
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Leave History</h3>
          <div className="space-y-3">
            <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              No leave history found.
            </div>
          </div>
        </div>
      </div>
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
          <h3 className="text-sm font-semibold text-foreground mb-6">Recent Reviews</h3>
          <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            No performance reviews available.
          </div>
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
      api.get(`/payrolls/employee/${user.id}`)
        .then(res => setPayrolls(res.data))
        .catch(err => console.error("Failed to fetch payrolls", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

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
                <th className="pb-3 font-medium">Month/Year</th>
                <th className="pb-3 font-medium">Payslip #</th>
                <th className="pb-3 font-medium text-right">Basic Salary</th>
                <th className="pb-3 font-medium text-right">Deductions & Tax</th>
                <th className="pb-3 font-medium text-right">Net Salary</th>
                <th className="pb-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {payrolls.length > 0 ? payrolls.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3 font-medium">
                    {new Date(row.payrollYear, row.payrollMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="py-3 text-muted-foreground">{row.payslipNumber}</td>
                  <td className="py-3 text-right">${row.grossSalary?.toLocaleString()}</td>
                  <td className="py-3 text-right text-red-400">
                    -${((row.totalDeductions || 0) + (row.totalTaxes || 0)).toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    ${row.netSalary?.toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                      row.status === 'processed' || row.status === 'paid' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    } capitalize`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
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

  const [resignModalOpen, setResignModalOpen] = useState(false);
  const [resignForm, setResignForm] = useState({ reason: '', expectedLeaveDate: '' });
  const [myResignation, setMyResignation] = useState<Resignation | null>(null);

  useEffect(() => {
    getMyResignations().then(data => {
      // Find the most recent or pending resignation
      if (data && data.length > 0) {
        const pendingOrApproved = data.find(r => r.status === 'PENDING' || r.status === 'APPROVED');
        setMyResignation(pendingOrApproved || data[0]);
      }
    }).catch(console.error);
  }, []);

  const handleResignSubmit = async () => {
    try {
      if (!resignForm.reason || !resignForm.expectedLeaveDate) {
        toast.error('Reason and expected leave date are required');
        return;
      }

      const selectedDate = new Date(resignForm.expectedLeaveDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        toast.error('Expected leave date must be in the future');
        return;
      }

      const res = await submitResignation(resignForm);
      setMyResignation(res);
      setResignModalOpen(false);
      toast.success('Resignation request submitted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit resignation');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 relative">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Space</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your profile, attendance, and benefits.</p>
        </div>
        <div className="flex gap-2 items-center">
          {myResignation && (myResignation.status === 'PENDING' || myResignation.status === 'APPROVED') ? (
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${myResignation.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
              Resignation {myResignation.status}
            </span>
          ) : (
            <button onClick={() => setResignModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors border border-red-500/20">
              Submit Resignation
            </button>
          )}
          <button className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary transition-colors border border-border">
            Export Data
          </button>
        </div>
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

      <AnimatePresence>
        {resignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setResignModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Submit Resignation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Reason for Resignation</label>
                  <textarea rows={4} value={resignForm.reason} onChange={(e) => setResignForm({...resignForm, reason: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please provide your reason..." />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Expected Last Working Day</label>
                  <input type="date" value={resignForm.expectedLeaveDate} onChange={(e) => setResignForm({...resignForm, expectedLeaveDate: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setResignModalOpen(false)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:bg-muted">Cancel</button>
                  <button onClick={handleResignSubmit} className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20">Submit</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

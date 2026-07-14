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

// Dummy Data
const kpiData: KpiCardType[] = [
  { label: 'My Attendance', value: '96%', change: '2 days absent this month', trend: 'up', icon: 'Calendar', color: 'blue-500' },
  { label: 'Leave Balance', value: '15 days', change: '8 annual, 5 sick, 2 personal', trend: 'neutral', icon: 'FileText', color: 'emerald-500' },
  { label: 'Current Streak', value: '12 days', change: 'Best: 45 days', trend: 'up', icon: 'Activity', color: 'amber-500' },
  { label: 'Performance', value: '4.5 ⭐', change: 'Top 15% of company', trend: 'up', icon: 'Star', color: 'purple-500' },
];

const myAttendance = [
  { name: 'Week 1', value: 100 },
  { name: 'Week 2', value: 80 },
  { name: 'Week 3', value: 100 },
  { name: 'Week 4', value: 100 },
];

const leaveBalance = [
  { name: 'Annual', value: 8, total: 15 },
  { name: 'Sick', value: 5, total: 10 },
  { name: 'Personal', value: 2, total: 5 },
];

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={kpi.label} data={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          title="Monthly Attendance %"
          data={myAttendance}
          bars={[{ key: 'value', color: '#3b82f6', label: 'Attendance %' }]}
        />
        <AreaChartCard
          title="Leave Balance Overview"
          data={leaveBalance.map((d) => ({ name: d.name, value: d.value, value2: d.total }))}
          areas={[
            { key: 'value', color: '#10b981', label: 'Used' },
            { key: 'value2', color: '#3b82f6', label: 'Total' },
          ]}
        />
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <User size={40} className="text-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Alex Johnson</h2>
          <p className="text-sm text-muted-foreground">Senior Frontend Engineer</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">Engineering</span>
            <span className="px-2 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Full-time</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Mail size={16} className="text-muted-foreground" />
              <span>alex.johnson@nexushr.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Phone size={16} className="text-muted-foreground" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <MapPin size={16} className="text-muted-foreground" />
              <span>San Francisco, CA</span>
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
              <p className="text-sm text-foreground font-medium">EMP-2023-045</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Joining</p>
              <p className="text-sm text-foreground font-medium">Mar 15, 2023</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="text-sm text-foreground font-medium">Jan 22, 1990</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reporting Manager</p>
              <p className="text-sm text-foreground font-medium">Sarah Miller</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Documents</h3>
          <div className="space-y-3">
            {['Offer Letter', 'ID Proof', 'Resume', 'NDA Agreement'].map((doc) => (
              <div key={doc} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-blue-400" />
                  <span className="text-sm text-foreground">{doc}</span>
                </div>
                <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Download size={16} />
                </button>
              </div>
            ))}
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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Leave Balances</h3>
            <div className="space-y-4">
              {leaveBalance.map((leave) => (
                <div key={leave.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">{leave.name} Leave</span>
                    <span className="text-foreground font-medium">{leave.total - leave.value} / {leave.total}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        leave.name === 'Annual' ? 'bg-blue-500' : leave.name === 'Sick' ? 'bg-emerald-500' : 'bg-purple-500'
                      }`} 
                      style={{ width: `${((leave.total - leave.value) / leave.total) * 100}%` }} 
                    />
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
            {[
              { type: 'Annual Leave', dates: 'Aug 10 - Aug 14, 2026', days: 5, status: 'Approved', color: 'emerald' },
              { type: 'Sick Leave', dates: 'Jun 05 - Jun 06, 2026', days: 2, status: 'Approved', color: 'emerald' },
              { type: 'Personal Leave', dates: 'May 12, 2026', days: 1, status: 'Rejected', color: 'red' },
              { type: 'Annual Leave', dates: 'Sep 01 - Sep 03, 2026', days: 3, status: 'Pending', color: 'amber' },
            ].map((leave, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
                <div>
                  <h4 className="text-sm font-medium text-foreground">{leave.type}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{leave.dates} • {leave.days} Day(s)</p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium bg-${leave.color}-500/10 text-${leave.color}-400 border border-${leave.color}-500/20`}>
                  {leave.status}
                </span>
              </div>
            ))}
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
            <h3 className="text-sm font-semibold text-foreground">Current Goals (Q3)</h3>
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">3 Active</span>
          </div>
          <div className="space-y-5">
            {[
              { title: 'Migrate legacy components to React 19', progress: 75, color: 'blue' },
              { title: 'Reduce bundle size by 15%', progress: 40, color: 'emerald' },
              { title: 'Complete AWS Cloud Practitioner Cert', progress: 90, color: 'purple' },
            ].map((goal, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground">{goal.title}</span>
                  <span className="text-foreground font-medium">{goal.progress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 bg-${goal.color}-500`} 
                    style={{ width: `${goal.progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-6">Recent Reviews</h3>
          <div className="space-y-4">
            {[
              { period: 'Q2 2026', rating: '4.5', feedback: 'Excellent leadership in the UI revamp project. Continued growth in technical architecture.', reviewer: 'Sarah Miller' },
              { period: 'Q1 2026', rating: '4.2', feedback: 'Solid performance. Met all deliverables on time. Needs to focus more on mentoring juniors.', reviewer: 'Sarah Miller' },
            ].map((review, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-foreground">{review.period} Review</h4>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-amber-400">{review.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic mb-2">"{review.feedback}"</p>
                <p className="text-xs text-muted-foreground text-right">- {review.reviewer}</p>
              </div>
            ))}
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
      <div className="space-y-2">
        {[
          { title: 'Company Townhall', desc: 'Join us for the Q3 kickoff meeting next Tuesday.', type: 'announcement', time: '2 hours ago', icon: Bell, color: 'blue' },
          { title: 'Leave Approved', desc: 'Your Annual Leave request for Aug 10 has been approved.', type: 'leave', time: '1 day ago', icon: CheckCircle, color: 'emerald' },
          { title: 'Timesheet Reminder', desc: 'Please submit your timesheet for this week.', type: 'reminder', time: '2 days ago', icon: AlertCircle, color: 'amber' },
          { title: 'IT Maintenance', desc: 'Jira will be down for maintenance this weekend.', type: 'announcement', time: '3 days ago', icon: Bell, color: 'zinc' },
        ].map((notif, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-muted border border-border hover:bg-secondary/50 transition-colors">
            <div className={`w-10 h-10 rounded-full bg-${notif.color}-500/10 flex items-center justify-center shrink-0 border border-${notif.color}-500/20`}>
              <notif.icon size={18} className={`text-${notif.color}-400`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{notif.title}</h4>
                <span className="text-xs text-muted-foreground">{notif.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{notif.desc}</p>
            </div>
          </div>
        ))}
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

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { getDashboardStats, type DashboardStats } from '../../../services/employee.service';
import { 
  Calendar, UserPlus, CheckCircle, DollarSign,
  FileText, Download, Upload, Target, Shield, Heart, UserMinus
} from 'lucide-react';
import KpiCard from '../../../components/common/KpiCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import type { KpiCard as KpiCardType } from '../../../types';
import AttendanceList from '../../attendance/AttendanceList';
import PayrollList from '../../payroll/PayrollList';



const lifecycleData = [
  { name: 'Applied', value: 45 },
  { name: 'Screened', value: 32 },
  { name: 'Interviewed', value: 21 },
  { name: 'Offered', value: 12 },
  { name: 'Hired', value: 8 },
];

const weeklyAttendance = [
  { name: 'Mon', value: 180, value2: 12 },
  { name: 'Tue', value: 175, value2: 17 },
  { name: 'Wed', value: 185, value2: 7 },
  { name: 'Thu', value: 172, value2: 20 },
  { name: 'Fri', value: 168, value2: 24 },
];

const pendingLeaves = [
  { employee: 'Alice Wang', type: 'Annual', days: 3, from: 'Jun 15', to: 'Jun 17', status: 'pending' },
  { employee: 'Bob Kim', type: 'Sick', days: 2, from: 'Jun 12', to: 'Jun 13', status: 'pending' },
  { employee: 'Carol Davis', type: 'Personal', days: 1, from: 'Jun 18', to: 'Jun 18', status: 'pending' },
];



function OverviewTab({ stats, isLoading }: { stats: DashboardStats | null, isLoading: boolean }) {
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
        <AreaChartCard
          title="Weekly Attendance Overview"
          data={weeklyAttendance}
          areas={[
            { key: 'value', color: '#10b981', label: 'Present' },
            { key: 'value2', color: '#ef4444', label: 'Absent' },
          ]}
        />
        <BarChartCard
          title="Recruitment Funnel"
          data={lifecycleData}
          bars={[{ key: 'value', color: '#3b82f6', label: 'Candidates' }]}
        />
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Company Leave Applications</h3>
          <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">18 Pending</span>
        </div>
        <div className="space-y-3">
          {pendingLeaves.map((leave, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{leave.employee}</p>
                <p className="text-xs text-muted-foreground">{leave.type} Leave - {leave.days} days ({leave.from} - {leave.to})</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">Approve</button>
                <button className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors border border-red-500/20">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
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

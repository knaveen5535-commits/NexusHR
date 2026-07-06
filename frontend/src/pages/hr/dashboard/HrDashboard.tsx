import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { 
  Calendar, UserPlus, CheckCircle, DollarSign,
  FileText, Download, Upload, Target, Shield, Heart, UserMinus
} from 'lucide-react';
import KpiCard from '../../../components/common/KpiCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import type { KpiCard as KpiCardType } from '../../../types';

const kpiData: KpiCardType[] = [
  { label: 'Total Employees', value: '1,247', change: '+12 this month', trend: 'up', icon: 'Users', color: 'blue-500' },
  { label: 'New Joinees', value: '23', change: '+8 vs last month', trend: 'up', icon: 'UserPlus', color: 'purple-500' },
  { label: 'Leave Requests', value: '18', change: '5 urgent', trend: 'down', icon: 'FileText', color: 'amber-500' },
  { label: 'Attendance Today', value: '94.7%', change: '+2.3%', trend: 'up', icon: 'Calendar', color: 'emerald-500' },
];

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



function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={kpi.label} data={kpi} index={i} />
        ))}
        {/* Additional KPIs */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <CheckCircle size={24} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Pending Approvals</p>
            <p className="text-xl font-bold text-white">45</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
            <DollarSign size={24} className="text-teal-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Payroll Status</p>
            <p className="text-xl font-bold text-white">Processed</p>
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
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <UserPlus size={20} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Onboarding Portal</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 mb-2">Initiate new hire onboarding processes and collect required documents.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-800/30 border border-dashed border-zinc-700 hover:bg-zinc-800/50 hover:border-blue-500/50 transition-colors gap-2">
                <Upload size={20} className="text-zinc-400" />
                <span className="text-sm font-medium text-white">Offer Letter</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-800/30 border border-dashed border-zinc-700 hover:bg-zinc-800/50 hover:border-blue-500/50 transition-colors gap-2">
                <Shield size={20} className="text-zinc-400" />
                <span className="text-sm font-medium text-white">ID Proof Upload</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-zinc-800/30 border border-dashed border-zinc-700 hover:bg-zinc-800/50 hover:border-blue-500/50 transition-colors gap-2">
                <FileText size={20} className="text-zinc-400" />
                <span className="text-sm font-medium text-white">Resume Upload</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors gap-2">
                <UserPlus size={20} className="text-white" />
                <span className="text-sm font-medium text-white">Create Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Offboarding */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-500/10">
              <UserMinus size={20} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Offboarding Portal</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Review Resignation Requests', count: 3 },
              { label: 'Schedule Exit Interviews', count: 2 },
              { label: 'Clearance Status', count: '1 Pending' },
              { label: 'Final Settlement Processing', count: 1 },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                <span className="text-sm text-zinc-300">{task.label}</span>
                <span className="text-xs font-medium px-2 py-1 bg-zinc-800 rounded-md text-white">{task.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Company Attendance Monitor</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Present</th>
                  <th className="pb-3 font-medium">On Leave</th>
                  <th className="pb-3 font-medium">Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {[
                  { dept: 'Engineering', total: 145, present: 138, leave: 5, late: 12 },
                  { dept: 'Sales', total: 85, present: 80, leave: 3, late: 2 },
                  { dept: 'Marketing', total: 42, present: 39, leave: 2, late: 1 },
                  { dept: 'HR & Admin', total: 18, present: 17, leave: 1, late: 0 },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 font-medium text-white">{row.dept}</td>
                    <td className="py-3">{row.total}</td>
                    <td className="py-3 text-emerald-400">{row.present}</td>
                    <td className="py-3 text-amber-400">{row.leave}</td>
                    <td className="py-3 text-red-400">{row.late}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-4">Overtime & Late Logs</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <h4 className="text-sm font-medium text-red-400 mb-1">Late Logins (Today)</h4>
              <p className="text-2xl font-bold text-white">15</p>
              <p className="text-xs text-zinc-400 mt-1">Requires manager review</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <h4 className="text-sm font-medium text-blue-400 mb-1">Overtime Hours (Week)</h4>
              <p className="text-2xl font-bold text-white">124 hrs</p>
              <p className="text-xs text-zinc-400 mt-1">Across 4 departments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Company Leave Applications</h3>
          <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">18 Pending</span>
        </div>
        <div className="space-y-3">
          {pendingLeaves.map((leave, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-zinc-800">
              <div>
                <p className="text-sm font-medium text-white">{leave.employee}</p>
                <p className="text-xs text-zinc-400">{leave.type} Leave - {leave.days} days ({leave.from} - {leave.to})</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">Approve</button>
                <button className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors border border-red-500/20">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Leave Balance Overview</h3>
        <p className="text-sm text-zinc-400 mb-6">Monitor organizational liability and upcoming mass leaves.</p>
        <div className="space-y-4">
          {[
            { label: 'Annual Leave Liability', value: '4,250 days', color: 'blue' },
            { label: 'Sick Leave Utilization', value: '42%', color: 'emerald' },
            { label: 'Upcoming Holidays (Q3)', value: '3 days', color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-zinc-800">
              <span className="text-sm text-zinc-300">{stat.label}</span>
              <span className={`text-sm font-bold text-${stat.color}-400`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PayrollTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl text-center">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Total Monthly Payroll</h3>
            <p className="text-3xl font-bold text-white mb-4">$452,500</p>
            <button className="w-full py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors">
              Process Payroll (Jul)
            </button>
          </div>
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
            <h3 className="text-sm font-medium text-white mb-4">Salary Structure config</h3>
            <div className="space-y-3">
              {['Basic Salary', 'Allowances', 'Deductions', 'Bonus'].map((item) => (
                <button key={item} className="w-full flex justify-between items-center p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-sm text-zinc-300">
                  {item}
                  <Target size={16} className="text-zinc-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Payslip Generation</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-sm hover:bg-zinc-700 transition-colors border border-zinc-700">
              <Download size={16} /> Batch Download
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Gross</th>
                  <th className="pb-3 font-medium">Net</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {[
                  { name: 'Alice Wang', gross: '$8,500', net: '$6,800', status: 'Ready' },
                  { name: 'Bob Kim', gross: '$9,200', net: '$7,360', status: 'Ready' },
                  { name: 'Carol Davis', gross: '$7,800', net: '$6,240', status: 'Pending Review' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 font-medium text-white">{row.name}</td>
                    <td className="py-3">{row.gross}</td>
                    <td className="py-3">{row.net}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${row.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="text-blue-400 hover:text-blue-300 text-xs font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Company Announcements</h3>
          <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors">New Announcement</button>
        </div>
        <div className="space-y-4">
          {[
            { title: 'Q3 Townhall Meeting', date: 'Jul 15, 2026', desc: 'Join the executive team for the Q3 kickoff and company updates.' },
            { title: 'New Health Benefits', date: 'Jul 01, 2026', desc: 'Updated health insurance policies are now active.' },
          ].map((ann, i) => (
            <div key={i} className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-800">
              <h4 className="text-sm font-medium text-white">{ann.title}</h4>
              <p className="text-xs text-blue-400 mt-1 mb-2">{ann.date}</p>
              <p className="text-sm text-zinc-400">{ann.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Automated Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
            <div className="p-2 rounded-full bg-indigo-500/10">
              <Heart size={20} className="text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-indigo-400">Upcoming Birthdays</h4>
              <p className="text-sm text-zinc-300">5 employees have birthdays this week.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-teal-500/5 border border-teal-500/20">
            <div className="p-2 rounded-full bg-teal-500/10">
              <Calendar size={20} className="text-teal-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-teal-400">Holiday Notifications</h4>
              <p className="text-sm text-zinc-300">Independence Day (Aug 15) alert scheduled.</p>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'lifecycle': return <LifecycleTab />;
      case 'attendance': return <AttendanceTab />;
      case 'leave': return <LeaveTab />;
      case 'payroll': return <PayrollTab />;
      case 'notifications': return <NotificationsTab />;
      case 'performance': return <div className="p-6 text-center text-zinc-400">Performance management module coming soon.</div>;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">HR Central</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage workforce lifecycle, attendance, payroll, and core operations.</p>
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

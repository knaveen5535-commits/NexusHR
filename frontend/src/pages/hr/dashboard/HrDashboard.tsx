import { motion } from 'framer-motion';
import KpiCard from '../../../components/common/KpiCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import type { KpiCard as KpiCardType } from '../../../types';

const kpiData: KpiCardType[] = [
  { label: 'Total Employees', value: '1,247', change: '+12% this month', trend: 'up', icon: 'Users', color: 'blue-500' },
  { label: 'Pending Leave', value: '18', change: '5 urgent', trend: 'down', icon: 'FileText', color: 'amber-500' },
  { label: 'Attendance Today', value: '94.7%', change: '+2.3%', trend: 'up', icon: 'Calendar', color: 'emerald-500' },
  { label: 'New Hires This Month', value: '23', change: '+8 vs last month', trend: 'up', icon: 'UserPlus', color: 'purple-500' },
];

const weeklyAttendance = [
  { name: 'Mon', present: 180, absent: 12 },
  { name: 'Tue', present: 175, absent: 17 },
  { name: 'Wed', present: 185, absent: 7 },
  { name: 'Thu', present: 172, absent: 20 },
  { name: 'Fri', present: 168, absent: 24 },
];

const lifecycleData = [
  { name: 'Applied', value: 45 },
  { name: 'Screened', value: 32 },
  { name: 'Interviewed', value: 21 },
  { name: 'Offered', value: 12 },
  { name: 'Hired', value: 8 },
];

const pendingLeaves = [
  { employee: 'Alice Wang', type: 'Annual', days: 3, from: 'Jun 15', to: 'Jun 17', status: 'pending' },
  { employee: 'Bob Kim', type: 'Sick', days: 2, from: 'Jun 12', to: 'Jun 13', status: 'pending' },
  { employee: 'Carol Davis', type: 'Personal', days: 1, from: 'Jun 18', to: 'Jun 18', status: 'pending' },
];

export default function HrDashboard() {
  return (
    <div className="p-4 sm:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">HR Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Employee lifecycle and workforce management</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={kpi.label} data={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard
          title="Weekly Attendance"
          data={weeklyAttendance.map((d) => ({ name: d.name, value: d.present, value2: d.absent }))}
          areas={[
            { key: 'value', color: '#10b981', label: 'Present' },
            { key: 'value2', color: '#ef4444', label: 'Absent' },
          ]}
        />
        <BarChartCard
          title="Employee Lifecycle Pipeline"
          data={lifecycleData}
          bars={[{ key: 'value', color: '#3b82f6', label: 'Candidates' }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Pending Leave Requests</h3>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">18 pending</span>
          </div>
          <div className="space-y-3">
            {pendingLeaves.map((leave, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                <div>
                  <p className="text-sm font-medium text-white">{leave.employee}</p>
                  <p className="text-xs text-zinc-400">{leave.type} Leave - {leave.days} days ({leave.from} - {leave.to})</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">Approve</button>
                  <button className="px-3 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {[
              { title: 'Skill Gap Alert', desc: '3 employees in Engineering lack required certifications', type: 'warning' },
              { title: 'Retention Risk', desc: '2 senior employees showing disengagement patterns', type: 'danger' },
              { title: 'Hiring Suggestion', desc: 'Increase Q3 hiring for Sales team by 20%', type: 'info' },
            ].map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                <div className={`h-2 w-2 mt-2 rounded-full shrink-0 ${
                  rec.type === 'warning' ? 'bg-amber-500' : rec.type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-white">{rec.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

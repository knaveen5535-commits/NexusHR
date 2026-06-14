import { motion } from 'framer-motion';
import KpiCard from '../../../components/common/KpiCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import type { KpiCard as KpiCardType } from '../../../types';

const kpiData: KpiCardType[] = [
  { label: 'Team Members', value: '12', change: '+1 this month', trend: 'up', icon: 'Users', color: 'blue-500' },
  { label: 'Attendance Rate', value: '96.2%', change: '+1.5%', trend: 'up', icon: 'Calendar', color: 'emerald-500' },
  { label: 'Pending Approvals', value: '5', change: '3 urgent', trend: 'down', icon: 'FileText', color: 'amber-500' },
  { label: 'Team Performance', value: '4.6', change: '+0.3 this quarter', trend: 'up', icon: 'TrendingUp', color: 'purple-500' },
];

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

const pendingApprovals = [
  { employee: 'Alice Wang', type: 'Annual Leave', days: 3, status: 'pending' },
  { employee: 'David Lee', type: 'Sick Leave', days: 1, status: 'pending' },
  { employee: 'Eva Martinez', type: 'Personal Leave', days: 2, status: 'pending' },
];

export default function ManagerDashboard() {
  return (
    <div className="p-4 sm:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Team overview and performance tracking</p>
      </motion.div>

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
            { key: 'value', color: '#3b82f6', label: 'Present' },
            { key: 'value2', color: '#8b5cf6', label: 'On Time' },
          ]}
        />
        <BarChartCard
          title="Team Performance Ratings"
          data={teamPerformance}
          bars={[{ key: 'value', color: '#10b981', label: 'Rating' }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Pending Approvals</h3>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">5 pending</span>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((approval, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                <div>
                    <p className="text-sm font-medium text-white">{approval.employee}</p>
                    <p className="text-xs text-zinc-400">{approval.type} - {approval.days} days</p>
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
          <h3 className="text-sm font-semibold text-white mb-4">Team Productivity Insights</h3>
          <div className="space-y-4">
            {[
              { metric: 'Avg Tasks Completed', value: '38/42', progress: 90 },
              { metric: 'On-time Delivery', value: '95%', progress: 95 },
              { metric: 'Team Satisfaction', value: '4.2/5', progress: 84 },
              { metric: 'Goal Achievement', value: '78%', progress: 78 },
            ].map((item) => (
              <div key={item.metric}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">{item.metric}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

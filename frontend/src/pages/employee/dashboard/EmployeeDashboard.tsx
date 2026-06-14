import { motion } from 'framer-motion';
import KpiCard from '../../../components/common/KpiCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import type { KpiCard as KpiCardType } from '../../../types';

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

const recentPayrolls = [
  { month: 'May 2026', gross: 8500, net: 6800, status: 'paid' as const },
  { month: 'Apr 2026', gross: 8500, net: 6800, status: 'paid' as const },
  { month: 'Mar 2026', gross: 8500, net: 6650, status: 'paid' as const },
];

export default function EmployeeDashboard() {
  return (
    <div className="p-4 sm:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Personal overview and self-service</p>
      </motion.div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Payroll</h3>
          <div className="space-y-3">
            {recentPayrolls.map((pay, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                <div>
                  <p className="text-sm font-medium text-white">{pay.month}</p>
                  <p className="text-xs text-zinc-400">Gross: ${pay.gross.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">${pay.net.toLocaleString()}</p>
                  <span className="text-xs text-emerald-400 capitalize">{pay.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-4">AI Personal Assistant</h3>
          <div className="space-y-3">
            {[
              { q: 'How is my attendance this month?', preview: 'You have 96% attendance. Only 2 days absent.' },
              { q: 'Show my next payroll', preview: 'Your next payroll is estimated at $6,800.' },
              { q: 'Performance feedback', preview: 'Your current rating is 4.5. Great work!' },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full text-left p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 hover:border-zinc-700 transition-colors group"
              >
                <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{item.q}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{item.preview}</p>
              </button>
            ))}
            <div className="relative mt-2">
              <input
                type="text"
                placeholder="Ask anything about your work..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 pr-12 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors">
                Ask
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

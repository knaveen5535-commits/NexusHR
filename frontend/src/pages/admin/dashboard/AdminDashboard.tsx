import { motion } from 'framer-motion';
import KpiCard from '../../../components/common/KpiCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import PieChartCard from '../../../components/charts/PieChartCard';
import type { KpiCard as KpiCardType } from '../../../types';

const kpiData: KpiCardType[] = [
  { label: 'Total Employees', value: '1,247', change: '+12% this month', trend: 'up', icon: 'Users', color: 'blue-500' },
  { label: 'Departments', value: '12', change: '2 new this quarter', trend: 'up', icon: 'Building', color: 'purple-500' },
  { label: 'Attendance Rate', value: '94.7%', change: '+2.3% vs last month', trend: 'up', icon: 'Calendar', color: 'emerald-500' },
  { label: 'Payroll This Month', value: '$4.2M', change: '+8.1% vs last month', trend: 'up', icon: 'DollarSign', color: 'amber-500' },
  { label: 'Open Positions', value: '23', change: '-5 vs last month', trend: 'down', icon: 'UserPlus', color: 'rose-500' },
  { label: 'AI Insights', value: '12', change: '3 new recommendations', trend: 'up', icon: 'Sparkles', color: 'cyan-500' },
];

const attendanceData = [
  { name: 'Mon', value: 95, value2: 88 },
  { name: 'Tue', value: 92, value2: 85 },
  { name: 'Wed', value: 97, value2: 90 },
  { name: 'Thu', value: 91, value2: 82 },
  { name: 'Fri', value: 88, value2: 78 },
  { name: 'Sat', value: 65, value2: 55 },
  { name: 'Sun', value: 45, value2: 40 },
];

const departmentData = [
  { name: 'Engineering', value: 35 },
  { name: 'Marketing', value: 20 },
  { name: 'Sales', value: 25 },
  { name: 'HR', value: 10 },
  { name: 'Finance', value: 10 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const monthlyData = [
  { name: 'Jan', value: 3.2, value2: 2.1 },
  { name: 'Feb', value: 3.5, value2: 2.3 },
  { name: 'Mar', value: 3.8, value2: 2.4 },
  { name: 'Apr', value: 4.0, value2: 2.5 },
  { name: 'May', value: 4.2, value2: 2.6 },
  { name: 'Jun', value: 4.5, value2: 2.8 },
];

const pieData = departmentData.map((d, i) => ({ ...d, color: COLORS[i] }));

export default function AdminDashboard() {
  return (
    <div className="p-4 sm:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Company-wide overview and analytics</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={kpi.label} data={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard
          title="Attendance Trends (Last 7 Days)"
          data={attendanceData}
          areas={[
            { key: 'value', color: '#3b82f6', label: 'This Week' },
            { key: 'value2', color: '#8b5cf6', label: 'Last Week' },
          ]}
        />
        <AreaChartCard
          title="Payroll Overview (Monthly)"
          data={monthlyData}
          areas={[
            { key: 'value', color: '#10b981', label: 'Revenue' },
            { key: 'value2', color: '#ef4444', label: 'Cost' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChartCard
            title="Department Distribution"
            data={departmentData}
            bars={[{ key: 'value', color: '#3b82f6', label: 'Employees' }]}
            horizontal
          />
        </div>
        <PieChartCard title="Department Split" data={pieData} innerRadius={55} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-4">System Health</h3>
          <div className="space-y-4">
            {[
              { label: 'API Response Time', value: '142ms', status: 'good' as const },
              { label: 'Active Sessions', value: '1,247', status: 'good' as const },
              { label: 'Database Load', value: '23%', status: 'good' as const },
              { label: 'Error Rate', value: '0.02%', status: 'good' as const },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-sm text-zinc-400">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{metric.value}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {[
              { action: 'New employee onboarded', user: 'Sarah Connor', time: '2h ago', type: 'add' },
              { action: 'Payroll processed', user: 'Finance Dept', time: '5h ago', type: 'payment' },
              { action: 'Leave approved', user: 'Mike Johnson', time: '1d ago', type: 'check' },
              { action: 'Department updated', user: 'Engineering', time: '1d ago', type: 'edit' },
              { action: 'AI report generated', user: 'System', time: '2d ago', type: 'ai' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-zinc-800 last:border-0 last:pb-0">
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-zinc-500">by {activity.user} - {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

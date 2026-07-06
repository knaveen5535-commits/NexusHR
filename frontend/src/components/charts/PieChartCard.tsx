import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { useChartConfig } from './ChartConfig';

interface PieChartCardProps {
  title: string;
  data: { name: string; value: number; color: string }[];
  height?: number;
  innerRadius?: number;
  isDark?: boolean;
}

export default function PieChartCard({ title, data, height = 300, innerRadius = 60, isDark }: PieChartCardProps) {
  const config = useChartConfig();

  return (
    <div className={`rounded-xl border p-6 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white/80'}`}>
      <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius + 40}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip {...config.tooltip} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span style={{ color: config.textColor, fontSize: '12px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

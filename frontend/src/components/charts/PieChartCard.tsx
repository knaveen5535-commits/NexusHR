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
  const hasData = data && data.length > 0 && data.some(d => d.value > 0);

  return (
    <div className={`rounded-xl border p-6 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white/80'}`}>
      <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      {hasData ? (
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
      ) : (
        <div className={`w-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed ${isDark ? 'border-zinc-700/50 text-zinc-500 bg-zinc-800/20' : 'border-slate-300 text-slate-400 bg-slate-50/50'}`} style={{ height }}>
          <div className="text-sm font-semibold">No Data Yet</div>
          <div className="text-xs">There is no data to display for this report.</div>
        </div>
      )}
    </div>
  );
}

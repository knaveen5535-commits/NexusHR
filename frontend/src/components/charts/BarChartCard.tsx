import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useChartConfig } from './ChartConfig';

interface BarChartCardProps {
  title: string;
  data: { name: string; value: number; value2?: number }[];
  bars: { key: string; color: string; label: string; stackId?: string }[];
  height?: number;
  horizontal?: boolean;
  isDark?: boolean;
}

export default function BarChartCard({ title, data, bars, height = 300, horizontal, isDark }: BarChartCardProps) {
  const config = useChartConfig();

  return (
    <div className={`rounded-xl border p-6 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white/80'}`}>
      <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'}>
          <CartesianGrid stroke={config.gridColor} strokeDasharray="3 3" strokeOpacity={0.5} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fill: config.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: config.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fill: config.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: config.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip {...config.tooltip} />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color}
              radius={[4, 4, 0, 0]}
              stackId={bar.stackId}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useChartConfig } from './ChartConfig';

interface AreaChartCardProps {
  title: string;
  data: { name: string; value: number; value2?: number }[];
  areas: { key: string; color: string; label: string }[];
  height?: number;
  isDark?: boolean;
}

export default function AreaChartCard({ title, data, areas, height = 300, isDark }: AreaChartCardProps) {
  const config = useChartConfig();
  const hasData = data && data.length > 0 && data.some(d => areas.some(a => Number(d[a.key as keyof typeof d] || 0) > 0));

  return (
    <div className={`rounded-xl border p-6 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white/80'}`}>
      <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              {areas.map((area) => (
                <linearGradient key={area.key} id={`gradient-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={area.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={config.gridColor} strokeDasharray="3 3" strokeOpacity={0.5} />
            <XAxis dataKey="name" tick={{ fill: config.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: config.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip {...config.tooltip} />
            {areas.map((area) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                stroke={area.color}
                fill={`url(#gradient-${area.key})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
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

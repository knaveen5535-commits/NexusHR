import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useChartConfig } from './ChartConfig';

interface AreaChartCardProps {
  title: string;
  data: { name: string; value: number; value2?: number }[];
  areas: { key: string; color: string; label: string }[];
  height?: number;
}

export default function AreaChartCard({ title, data, areas, height = 300 }: AreaChartCardProps) {
  const config = useChartConfig();

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
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
    </div>
  );
}

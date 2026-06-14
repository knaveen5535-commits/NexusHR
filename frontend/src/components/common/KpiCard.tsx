import { motion } from 'framer-motion';
import { createElement } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiCard as KpiCardType } from '../../types';
import { resolveIcon } from '../../utils/icons';

export default function KpiCard({ data, index = 0 }: { data: KpiCardType; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl hover:border-zinc-700 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-400">{data.label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{data.value}</p>
          {data.change && (
            <div className="flex items-center gap-1">
              {data.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
              {data.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
              {data.trend === 'neutral' && <Minus className="h-3.5 w-3.5 text-zinc-400" />}
              <span className={`text-xs font-medium ${
                data.trend === 'up' ? 'text-emerald-400' :
                data.trend === 'down' ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {data.change}
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${data.color}/10 border border-${data.color}/20`}>
          {createElement(resolveIcon(data.icon), { className: `h-6 w-6 text-${data.color}` })}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

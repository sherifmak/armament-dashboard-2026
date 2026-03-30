import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { DailyAggregate } from '../../types';
import { CATEGORY_COLORS } from '../../constants';
import { conflicts } from '../../data/conflicts';
import { formatDate, formatNumber } from '../../utils/formatters';

interface TimelineChartProps {
  data: DailyAggregate[];
  height?: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !label) return null;
  const conflict = conflicts.find(
    (c) => label >= c.startDate && label <= c.endDate
  );
  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-3 shadow-xl">
      <p className="font-mono text-xs text-dashboard-text font-bold mb-1">{formatDate(label)}</p>
      {conflict && (
        <p className="text-[10px] text-dashboard-accent mb-2">{conflict.name}</p>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4 text-xs">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-dashboard-text">{formatNumber(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-dashboard-border mt-1 pt-1 flex justify-between text-xs">
        <span className="text-dashboard-muted">Total</span>
        <span className="font-mono font-bold text-dashboard-text">
          {formatNumber(payload.reduce((s, p) => s + p.value, 0))}
        </span>
      </div>
    </div>
  );
}

export function TimelineChart({ data, height = 350 }: TimelineChartProps) {
  const conflictBoundaries = conflicts
    .filter((c) => data.some((d) => d.date >= c.startDate && d.date <= c.endDate));

  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
      <h3 className="font-mono text-sm font-semibold text-dashboard-text mb-4">
        DAILY ARMAMENT ACTIVITY
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradDrones" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_COLORS.drones} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CATEGORY_COLORS.drones} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradMissiles" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_COLORS.missiles} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CATEGORY_COLORS.missiles} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradDefense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_COLORS.defense} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CATEGORY_COLORS.defense} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#374151"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis stroke="#374151" tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          {conflictBoundaries.map((c) => (
            <ReferenceLine
              key={c.id}
              x={c.startDate}
              stroke="#6b7280"
              strokeDasharray="3 3"
              label={{ value: c.name, position: 'insideTopRight', fill: '#6b7280', fontSize: 9 }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="drones"
            stackId="1"
            stroke={CATEGORY_COLORS.drones}
            fill="url(#gradDrones)"
            strokeWidth={1.5}
            name="Drones"
          />
          <Area
            type="monotone"
            dataKey="missiles"
            stackId="1"
            stroke={CATEGORY_COLORS.missiles}
            fill="url(#gradMissiles)"
            strokeWidth={1.5}
            name="Missiles"
          />
          <Area
            type="monotone"
            dataKey="defense"
            stackId="1"
            stroke={CATEGORY_COLORS.defense}
            fill="url(#gradDefense)"
            strokeWidth={1.5}
            name="Defense"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

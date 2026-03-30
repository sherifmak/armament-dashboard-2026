import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CountryStats } from '../../types';
import { COUNTRY_MAP, CATEGORY_COLORS } from '../../constants';
import { formatNumber } from '../../utils/formatters';

interface CountryComparisonBarProps {
  stats: CountryStats[];
  height?: number;
}

export function CountryComparisonBar({ stats, height = 350 }: CountryComparisonBarProps) {
  const data = stats.map((s) => ({
    name: COUNTRY_MAP[s.country].flag + ' ' + COUNTRY_MAP[s.country].name,
    Drones: s.totalDrones,
    Missiles: s.totalMissiles,
    Defense: s.totalDefense,
  }));

  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
      <h3 className="font-mono text-sm font-semibold text-dashboard-text mb-4">
        COUNTRY COMPARISON
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="name" stroke="#374151" tick={{ fontSize: 11 }} />
          <YAxis stroke="#374151" tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value: number) => formatNumber(value)}
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #1f2937',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="Drones" fill={CATEGORY_COLORS.drones} radius={[2, 2, 0, 0]} />
          <Bar dataKey="Missiles" fill={CATEGORY_COLORS.missiles} radius={[2, 2, 0, 0]} />
          <Bar dataKey="Defense" fill={CATEGORY_COLORS.defense} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
} from 'recharts';
import type { CountryStats } from '../types';
import { COUNTRY_MAP, CATEGORY_COLORS } from '../constants';
import { formatNumber, formatCost } from '../utils/formatters';

interface ComparePageProps {
  countryStats: CountryStats[];
}

export function ComparePage({ countryStats }: ComparePageProps) {
  const barData = countryStats.map((s) => ({
    name: COUNTRY_MAP[s.country].flag + ' ' + COUNTRY_MAP[s.country].name,
    Drones: s.totalDrones,
    Missiles: s.totalMissiles,
    Defense: s.totalDefense,
  }));

  const costData = countryStats.map((s) => ({
    name: COUNTRY_MAP[s.country].flag + ' ' + COUNTRY_MAP[s.country].name,
    cost: s.estimatedCost,
    color: COUNTRY_MAP[s.country].color,
  }));

  const maxVal = Math.max(...countryStats.map((s) => Math.max(s.totalDrones, s.totalMissiles, s.totalDefense)));
  const radarData = [
    { category: 'Drones', ...Object.fromEntries(countryStats.map((s) => [s.country, maxVal > 0 ? (s.totalDrones / maxVal) * 100 : 0])) },
    { category: 'Missiles', ...Object.fromEntries(countryStats.map((s) => [s.country, maxVal > 0 ? (s.totalMissiles / maxVal) * 100 : 0])) },
    { category: 'Defense', ...Object.fromEntries(countryStats.map((s) => [s.country, maxVal > 0 ? (s.totalDefense / maxVal) * 100 : 0])) },
  ];

  return (
    <div className="space-y-5">
      <h2 className="font-mono text-lg font-bold text-dashboard-text">COUNTRY COMPARISON</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
          <h3 className="font-mono text-sm font-semibold text-dashboard-text mb-4">BY CATEGORY</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#374151" tick={{ fontSize: 10 }} />
              <YAxis stroke="#374151" tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => formatNumber(value)}
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Drones" fill={CATEGORY_COLORS.drones} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Missiles" fill={CATEGORY_COLORS.missiles} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Defense" fill={CATEGORY_COLORS.defense} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
          <h3 className="font-mono text-sm font-semibold text-dashboard-text mb-4">CAPABILITY RADAR</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1f2937" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              {countryStats.map((s) => (
                <Radar
                  key={s.country}
                  name={COUNTRY_MAP[s.country].name}
                  dataKey={s.country}
                  stroke={COUNTRY_MAP[s.country].color}
                  fill={COUNTRY_MAP[s.country].color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
        <h3 className="font-mono text-sm font-semibold text-dashboard-text mb-4">ESTIMATED COST</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={costData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" stroke="#374151" tick={{ fontSize: 10 }} tickFormatter={(v: number) => formatCost(v)} />
            <YAxis type="category" dataKey="name" stroke="#374151" tick={{ fontSize: 11 }} width={120} />
            <Tooltip
              formatter={(value: number) => formatCost(value)}
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="cost" radius={[0, 4, 4, 0]} name="Estimated Cost">
              {costData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

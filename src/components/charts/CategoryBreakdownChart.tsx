import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants';
import { formatNumber } from '../../utils/formatters';

interface CategoryBreakdownChartProps {
  drones: number;
  missiles: number;
  defense: number;
}

export function CategoryBreakdownChart({ drones, missiles, defense }: CategoryBreakdownChartProps) {
  const data = [
    { name: CATEGORY_LABELS.drones, value: drones, color: CATEGORY_COLORS.drones },
    { name: CATEGORY_LABELS.missiles, value: missiles, color: CATEGORY_COLORS.missiles },
    { name: CATEGORY_LABELS.defense, value: defense, color: CATEGORY_COLORS.defense },
  ];

  const total = drones + missiles + defense;

  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
      <h3 className="font-mono text-sm font-semibold text-dashboard-text mb-4">
        CATEGORY BREAKDOWN
      </h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatNumber(value)}
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-3 flex-1">
          {data.map((d) => (
            <div key={d.name}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: d.color }}>{d.name}</span>
                <span className="font-mono text-dashboard-text">{formatNumber(d.value)}</span>
              </div>
              <div className="h-1.5 bg-dashboard-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: total > 0 ? `${(d.value / total) * 100}%` : '0%',
                    backgroundColor: d.color,
                  }}
                />
              </div>
              <p className="text-[10px] text-dashboard-muted mt-0.5">
                {total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

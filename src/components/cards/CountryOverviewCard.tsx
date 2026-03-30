import type { CountryStats, CountryCode } from '../../types';
import { COUNTRY_MAP, CATEGORY_COLORS } from '../../constants';
import { formatNumber, formatCost } from '../../utils/formatters';

interface CountryOverviewCardProps {
  stats: CountryStats;
}

export function CountryOverviewCard({ stats }: CountryOverviewCardProps) {
  const country = COUNTRY_MAP[stats.country as CountryCode];

  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{country.flag}</span>
        <h3 className="font-mono font-semibold text-sm" style={{ color: country.color }}>
          {country.name}
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-dashboard-muted">Drones</span>
          <span className="text-sm font-mono font-medium" style={{ color: CATEGORY_COLORS.drones }}>
            {formatNumber(stats.totalDrones)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-dashboard-muted">Missiles</span>
          <span className="text-sm font-mono font-medium" style={{ color: CATEGORY_COLORS.missiles }}>
            {formatNumber(stats.totalMissiles)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-dashboard-muted">Defense</span>
          <span className="text-sm font-mono font-medium" style={{ color: CATEGORY_COLORS.defense }}>
            {formatNumber(stats.totalDefense)}
          </span>
        </div>

        <div className="border-t border-dashboard-border pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-dashboard-muted">Total</span>
            <span className="text-sm font-mono font-bold text-dashboard-text">
              {formatNumber(stats.grandTotal)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-dashboard-muted">Est. Cost</span>
            <span className="text-xs font-mono text-dashboard-accent">
              {formatCost(stats.estimatedCost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { DailyTrackingEntry, CountryStats, DailyAggregate } from '../types';
import { StatCard } from '../components/cards/StatCard';
import { CountryOverviewCard } from '../components/cards/CountryOverviewCard';
import { TimelineChart } from '../components/charts/TimelineChart';
import { CategoryBreakdownChart } from '../components/charts/CategoryBreakdownChart';
import { CATEGORY_COLORS } from '../constants';

interface OverviewPageProps {
  data: DailyTrackingEntry[];
  countryStats: CountryStats[];
  dailyAggregates: DailyAggregate[];
  totals: {
    totalDrones: number;
    totalMissiles: number;
    totalDefense: number;
    grandTotal: number;
    totalCost: number;
  };
}

export function OverviewPage({ countryStats, dailyAggregates, totals }: OverviewPageProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Total Events" value={totals.grandTotal} color="#e5e7eb" subtitle="All categories" />
        <StatCard label="Drones" value={totals.totalDrones} color={CATEGORY_COLORS.drones} subtitle="Launched / deployed" />
        <StatCard label="Missiles" value={totals.totalMissiles} color={CATEGORY_COLORS.missiles} subtitle="Fired / dropped" />
        <StatCard label="Defense" value={totals.totalDefense} color={CATEGORY_COLORS.defense} subtitle="Interceptors fired" />
        <StatCard label="Est. Total Cost" value={totals.totalCost} color="#10b981" isCost subtitle="Based on unit costs" />
      </div>

      <TimelineChart data={dailyAggregates} />

      <div className="grid grid-cols-2 gap-4">
        <CategoryBreakdownChart
          drones={totals.totalDrones}
          missiles={totals.totalMissiles}
          defense={totals.totalDefense}
        />
        <div className="grid grid-cols-2 gap-4">
          {countryStats.map((s) => (
            <CountryOverviewCard key={s.country} stats={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

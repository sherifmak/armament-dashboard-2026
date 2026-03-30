import { useState } from 'react';
import type { Page, FilterState } from './types';
import { ALL_COUNTRIES, ALL_CATEGORIES, DEFAULT_DATE_RANGE } from './constants';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useTrackingData } from './hooks/useTrackingData';
import { useFilteredData } from './hooks/useFilteredData';
import { useDashboardStats } from './hooks/useDashboardStats';
import { OverviewPage } from './pages/OverviewPage';
import { TimelinePage } from './pages/TimelinePage';
import { ComparePage } from './pages/ComparePage';
import { TablePage } from './pages/TablePage';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('overview');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: DEFAULT_DATE_RANGE,
    countries: [...ALL_COUNTRIES],
    categories: [...ALL_CATEGORIES],
  });

  const { data, loading, error } = useTrackingData();
  const filteredData = useFilteredData(data, filters);
  const { countryStats, dailyAggregates, totals, dailyByCountry } = useDashboardStats(filteredData);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dashboard-bg">
        <div className="text-center">
          <div className="animate-pulse text-dashboard-accent font-mono text-lg mb-2">LOADING</div>
          <p className="text-dashboard-muted text-xs font-mono">Fetching tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-dashboard-bg">
        <div className="text-center">
          <div className="text-dashboard-danger font-mono text-lg mb-2">ERROR</div>
          <p className="text-dashboard-muted text-xs font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      activePage={activePage}
      onNavigate={setActivePage}
      filters={filters}
      onFiltersChange={setFilters}
    >
      {activePage === 'overview' && (
        <OverviewPage
          data={filteredData}
          countryStats={countryStats}
          dailyAggregates={dailyAggregates}
          totals={totals}
        />
      )}
      {activePage === 'timeline' && (
        <TimelinePage
          dailyAggregates={dailyAggregates}
          dailyByCountry={dailyByCountry}
        />
      )}
      {activePage === 'compare' && (
        <ComparePage countryStats={countryStats} />
      )}
      {activePage === 'table' && (
        <TablePage data={filteredData} />
      )}
    </DashboardLayout>
  );
}

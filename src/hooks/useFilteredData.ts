import { useMemo } from 'react';
import type { DailyTrackingEntry, FilterState } from '../types';

export function useFilteredData(
  data: DailyTrackingEntry[],
  filters: FilterState
): DailyTrackingEntry[] {
  return useMemo(() => {
    return data.filter((entry) => {
      if (entry.date < filters.dateRange.start || entry.date > filters.dateRange.end) return false;
      if (!filters.countries.includes(entry.country)) return false;
      if (!filters.categories.includes(entry.category)) return false;
      return true;
    });
  }, [data, filters]);
}

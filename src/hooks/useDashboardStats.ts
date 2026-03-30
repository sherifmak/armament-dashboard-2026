import { useMemo } from 'react';
import type { DailyTrackingEntry, CountryStats, DailyAggregate, CountryCode } from '../types';
import { WEAPON_MAP } from '../data/weaponSystems';
import { ALL_COUNTRIES } from '../constants';

export function useDashboardStats(data: DailyTrackingEntry[]) {
  const countryStats = useMemo((): CountryStats[] => {
    return ALL_COUNTRIES.map((code) => {
      const countryData = data.filter((d) => d.country === code);
      const totalDrones = countryData
        .filter((d) => d.category === 'drones')
        .reduce((sum, d) => sum + d.count, 0);
      const totalMissiles = countryData
        .filter((d) => d.category === 'missiles')
        .reduce((sum, d) => sum + d.count, 0);
      const totalDefense = countryData
        .filter((d) => d.category === 'defense')
        .reduce((sum, d) => sum + d.count, 0);

      const estimatedCost = countryData.reduce((sum, d) => {
        const weapon = WEAPON_MAP[d.systemId];
        if (weapon?.unitCost) return sum + d.count * weapon.unitCost;
        return sum;
      }, 0);

      return {
        country: code,
        totalDrones,
        totalMissiles,
        totalDefense,
        grandTotal: totalDrones + totalMissiles + totalDefense,
        estimatedCost,
      };
    });
  }, [data]);

  const dailyAggregates = useMemo((): DailyAggregate[] => {
    const byDate = new Map<string, DailyAggregate>();

    for (const entry of data) {
      let agg = byDate.get(entry.date);
      if (!agg) {
        agg = { date: entry.date, drones: 0, missiles: 0, defense: 0, total: 0, byCountry: {} };
        byDate.set(entry.date, agg);
      }
      agg[entry.category] += entry.count;
      agg.total += entry.count;
      agg.byCountry[entry.country] = (agg.byCountry[entry.country] ?? 0) + entry.count;
    }

    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const totals = useMemo(() => {
    return {
      totalDrones: data.filter((d) => d.category === 'drones').reduce((s, d) => s + d.count, 0),
      totalMissiles: data.filter((d) => d.category === 'missiles').reduce((s, d) => s + d.count, 0),
      totalDefense: data.filter((d) => d.category === 'defense').reduce((s, d) => s + d.count, 0),
      grandTotal: data.reduce((s, d) => s + d.count, 0),
      totalCost: data.reduce((sum, d) => {
        const weapon = WEAPON_MAP[d.systemId];
        if (weapon?.unitCost) return sum + d.count * weapon.unitCost;
        return sum;
      }, 0),
    };
  }, [data]);

  const dailyByCountry = useMemo(() => {
    const byDate = new Map<string, Record<string, number>>();
    for (const entry of data) {
      let rec = byDate.get(entry.date);
      if (!rec) {
        rec = {};
        byDate.set(entry.date, rec);
      }
      const key = entry.country as CountryCode;
      rec[key] = (rec[key] ?? 0) + entry.count;
    }
    return Array.from(byDate.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  return { countryStats, dailyAggregates, totals, dailyByCountry };
}

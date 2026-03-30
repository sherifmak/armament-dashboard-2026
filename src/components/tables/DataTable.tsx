import { useState, useMemo } from 'react';
import type { DailyTrackingEntry } from '../../types';
import { COUNTRY_MAP, CATEGORY_LABELS, CATEGORY_COLORS } from '../../constants';
import { WEAPON_MAP } from '../../data/weaponSystems';
import { formatDate, formatNumber, formatCost } from '../../utils/formatters';
import { getConfidenceBg } from '../../utils/colors';

interface DataTableProps {
  data: DailyTrackingEntry[];
}

type SortKey = 'date' | 'country' | 'category' | 'system' | 'count' | 'cost' | 'confidence';
type SortDir = 'asc' | 'desc';

export function DataTable({ data }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let items = data;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (d) =>
          d.context.toLowerCase().includes(q) ||
          (WEAPON_MAP[d.systemId]?.name ?? '').toLowerCase().includes(q) ||
          COUNTRY_MAP[d.country].name.toLowerCase().includes(q)
      );
    }
    return [...items].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'date': return dir * a.date.localeCompare(b.date);
        case 'country': return dir * a.country.localeCompare(b.country);
        case 'category': return dir * a.category.localeCompare(b.category);
        case 'system': return dir * (WEAPON_MAP[a.systemId]?.name ?? '').localeCompare(WEAPON_MAP[b.systemId]?.name ?? '');
        case 'count': return dir * (a.count - b.count);
        case 'cost': {
          const costA = (WEAPON_MAP[a.systemId]?.unitCost ?? 0) * a.count;
          const costB = (WEAPON_MAP[b.systemId]?.unitCost ?? 0) * b.count;
          return dir * (costA - costB);
        }
        case 'confidence': return dir * a.confidence.localeCompare(b.confidence);
        default: return 0;
      }
    });
  }, [data, sortKey, sortDir, search]);

  const SortHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <th
      className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-dashboard-muted cursor-pointer hover:text-dashboard-text select-none"
      onClick={() => toggleSort(sortKeyVal)}
    >
      {label} {sortKey === sortKeyVal ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
    </th>
  );

  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-dashboard-border flex items-center gap-3">
        <h3 className="font-mono text-sm font-semibold text-dashboard-text">
          DETAILED DATA
        </h3>
        <span className="text-xs text-dashboard-muted font-mono">{filtered.length} entries</span>
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-dashboard-bg border border-dashboard-border rounded px-3 py-1.5 text-xs text-dashboard-text font-mono w-48 placeholder:text-dashboard-muted"
        />
      </div>
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full text-xs">
          <thead className="bg-dashboard-bg sticky top-0">
            <tr>
              <SortHeader label="Date" sortKeyVal="date" />
              <SortHeader label="Country" sortKeyVal="country" />
              <SortHeader label="Category" sortKeyVal="category" />
              <SortHeader label="System" sortKeyVal="system" />
              <SortHeader label="Count" sortKeyVal="count" />
              <th className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-dashboard-muted">Range</th>
              <SortHeader label="Est. Cost" sortKeyVal="cost" />
              <SortHeader label="Conf." sortKeyVal="confidence" />
              <th className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-dashboard-muted">Sources</th>
              <th className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-dashboard-muted">Context</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => {
              const weapon = WEAPON_MAP[entry.systemId];
              const cost = weapon?.unitCost ? weapon.unitCost * entry.count : null;
              return (
                <tr key={i} className="border-t border-dashboard-border hover:bg-white/[0.02]">
                  <td className="px-3 py-2 font-mono text-dashboard-text">{formatDate(entry.date)}</td>
                  <td className="px-3 py-2" style={{ color: COUNTRY_MAP[entry.country].color }}>
                    {COUNTRY_MAP[entry.country].flag} {COUNTRY_MAP[entry.country].name}
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ color: CATEGORY_COLORS[entry.category], backgroundColor: CATEGORY_COLORS[entry.category] + '15' }}>
                      {CATEGORY_LABELS[entry.category]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-dashboard-text">{weapon?.name ?? entry.systemId}</td>
                  <td className="px-3 py-2 font-mono font-medium text-dashboard-text">{formatNumber(entry.count)}</td>
                  <td className="px-3 py-2 font-mono text-dashboard-muted text-[10px]">
                    {entry.countLow !== entry.countHigh ? `${formatNumber(entry.countLow)}-${formatNumber(entry.countHigh)}` : '-'}
                  </td>
                  <td className="px-3 py-2 font-mono text-dashboard-accent">
                    {cost ? formatCost(cost) : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${getConfidenceBg(entry.confidence)}`}>
                      {entry.confidence}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-dashboard-muted text-[10px]">
                    {entry.sources.join(', ')}
                  </td>
                  <td className="px-3 py-2 text-dashboard-muted max-w-[200px] truncate">
                    {entry.context}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

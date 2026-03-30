import type { FilterState, CountryCode, Category } from '../../types';
import { COUNTRIES, CATEGORY_LABELS, CATEGORY_COLORS } from '../../constants';
import { getCountryColor } from '../../utils/colors';

interface HeaderProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  lastUpdated?: string;
}

export function Header({ filters, onFiltersChange, lastUpdated }: HeaderProps) {
  const toggleCountry = (code: CountryCode) => {
    const countries = filters.countries.includes(code)
      ? filters.countries.filter((c) => c !== code)
      : [...filters.countries, code];
    if (countries.length > 0) onFiltersChange({ ...filters, countries });
  };

  const toggleCategory = (cat: Category) => {
    const categories = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    if (categories.length > 0) onFiltersChange({ ...filters, categories });
  };

  return (
    <header className="bg-dashboard-surface border-b border-dashboard-border px-5 py-3 flex items-center gap-6 shrink-0">
      <div className="flex items-center gap-3">
        <label className="text-xs text-dashboard-muted font-mono">FROM</label>
        <input
          type="date"
          value={filters.dateRange.start}
          onChange={(e) =>
            onFiltersChange({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })
          }
          className="bg-dashboard-bg border border-dashboard-border rounded px-2 py-1 text-xs text-dashboard-text font-mono"
        />
        <label className="text-xs text-dashboard-muted font-mono">TO</label>
        <input
          type="date"
          value={filters.dateRange.end}
          onChange={(e) =>
            onFiltersChange({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })
          }
          className="bg-dashboard-bg border border-dashboard-border rounded px-2 py-1 text-xs text-dashboard-text font-mono"
        />
      </div>

      <div className="h-6 w-px bg-dashboard-border" />

      <div className="flex items-center gap-1.5">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => toggleCountry(c.code)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              filters.countries.includes(c.code)
                ? 'border-current opacity-100'
                : 'border-dashboard-border opacity-40 hover:opacity-70'
            }`}
            style={{ color: getCountryColor(c.code) }}
          >
            {c.flag} {c.name}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-dashboard-border" />

      <div className="flex items-center gap-1.5">
        {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([cat, label]) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              filters.categories.includes(cat)
                ? 'border-current opacity-100'
                : 'border-dashboard-border opacity-40 hover:opacity-70'
            }`}
            style={{ color: CATEGORY_COLORS[cat] }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {lastUpdated && (
        <div className="text-[10px] text-dashboard-muted font-mono">
          LAST UPDATE: {lastUpdated}
        </div>
      )}
    </header>
  );
}

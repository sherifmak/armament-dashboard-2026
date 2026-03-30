import type { Country, CountryCode, Category } from './types';

export const COUNTRIES: Country[] = [
  { code: 'IR', name: 'Iran', flag: '\u{1F1EE}\u{1F1F7}', color: '#22c55e', accentColor: '#4ade80' },
  { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}', color: '#3b82f6', accentColor: '#60a5fa' },
  { code: 'IL', name: 'Israel', flag: '\u{1F1EE}\u{1F1F1}', color: '#a855f7', accentColor: '#c084fc' },
  { code: 'AE', name: 'UAE', flag: '\u{1F1E6}\u{1F1EA}', color: '#f59e0b', accentColor: '#fbbf24' },
];

export const COUNTRY_MAP: Record<CountryCode, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
) as Record<CountryCode, Country>;

export const CATEGORY_COLORS: Record<Category, string> = {
  drones: '#ef4444',
  missiles: '#f59e0b',
  defense: '#3b82f6',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  drones: 'Drones',
  missiles: 'Missiles',
  defense: 'Anti-Drone / Anti-Missile',
};

export const ALL_COUNTRIES: CountryCode[] = ['IR', 'US', 'IL', 'AE'];
export const ALL_CATEGORIES: Category[] = ['drones', 'missiles', 'defense'];

export const DEFAULT_DATE_RANGE = {
  start: '2026-02-28',
  end: '2026-03-29',
};

export type CountryCode = 'IR' | 'US' | 'IL' | 'AE';

export type Category = 'drones' | 'missiles' | 'defense';

export type Confidence = 'high' | 'medium' | 'low';

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  color: string;
  accentColor: string;
}

export interface WeaponSystem {
  id: string;
  name: string;
  country: CountryCode;
  category: Category;
  unitCost: number | null;
  description: string;
}

export interface DailyTrackingEntry {
  date: string;
  country: CountryCode;
  category: Category;
  systemId: string;
  count: number;
  countLow: number;
  countHigh: number;
  sources: string[];
  confidence: Confidence;
  context: string;
  conflictId?: string;
}

export interface ConflictEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  countriesInvolved: CountryCode[];
}

export interface CountryStats {
  country: CountryCode;
  totalDrones: number;
  totalMissiles: number;
  totalDefense: number;
  grandTotal: number;
  estimatedCost: number;
}

export interface DailyAggregate {
  date: string;
  drones: number;
  missiles: number;
  defense: number;
  total: number;
  byCountry: Partial<Record<CountryCode, number>>;
}

export interface FilterState {
  dateRange: { start: string; end: string };
  countries: CountryCode[];
  categories: Category[];
}

export type Page = 'overview' | 'timeline' | 'compare' | 'table';

import type { CountryCode, Category, Confidence } from '../types';
import { COUNTRY_MAP, CATEGORY_COLORS } from '../constants';

export function getCountryColor(code: CountryCode): string {
  return COUNTRY_MAP[code].color;
}

export function getCategoryColor(category: Category): string {
  return CATEGORY_COLORS[category];
}

export function getConfidenceColor(confidence: Confidence): string {
  switch (confidence) {
    case 'high': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'low': return '#ef4444';
  }
}

export function getConfidenceBg(confidence: Confidence): string {
  switch (confidence) {
    case 'high': return 'bg-green-900/30 text-green-400 border-green-800';
    case 'medium': return 'bg-amber-900/30 text-amber-400 border-amber-800';
    case 'low': return 'bg-red-900/30 text-red-400 border-red-800';
  }
}

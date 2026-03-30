/**
 * Armament Tracking Scraper
 *
 * Fetches conflict data from multiple sources, reconciles estimates,
 * and appends new entries to public/data/tracking.json.
 *
 * Sources:
 *   1. ACLED API — conflict events with geo-coding
 *   2. CENTCOM RSS — official US military press releases
 *   3. Fallback: manual keyword-based classification
 *
 * Run: npx tsx scripts/scraper.ts
 * Schedule: GitHub Actions cron every 6 hours
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// --- Types ---

interface TrackingEntry {
  date: string;
  country: 'IR' | 'US' | 'IL' | 'AE';
  category: 'drones' | 'missiles' | 'defense';
  systemId: string;
  count: number;
  countLow: number;
  countHigh: number;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  context: string;
  conflictId?: string;
}

interface AcledEvent {
  event_date: string;
  country: string;
  event_type: string;
  sub_event_type: string;
  notes: string;
  fatalities: number;
  source: string;
  source_scale: string;
}

interface SourceEstimate {
  source: string;
  tier: 1 | 2 | 3;
  count: number;
}

// --- Config ---

const TRACKING_PATH = resolve(import.meta.dirname ?? '.', '../public/data/tracking.json');
const ACLED_API_URL = 'https://api.acleddata.com/acled/read';
const ACLED_API_KEY = process.env['ACLED_API_KEY'] ?? '';
const ACLED_EMAIL = process.env['ACLED_EMAIL'] ?? '';

const CENTCOM_RSS_URL = 'https://www.centcom.mil/RSS/';

// Keyword maps for classifying events
const DRONE_KEYWORDS = ['shahed', 'drone', 'uav', 'kamikaze', 'loitering', 'hadid', 'lucas', 'mq-9', 'reaper', 'harop', 'heron', 'apache'];
const MISSILE_KEYWORDS = ['missile', 'tomahawk', 'ballistic', 'cruise', 'fateh', 'kheibar', 'fattah', 'jdam', 'prsm', 'lora', 'munition', 'bomb'];
const DEFENSE_KEYWORDS = ['intercept', 'iron dome', 'patriot', 'thaad', 'arrow', 'david', 'sling', 'bavar', 's-300', 'cheongung', 'iron beam', 'air defense', 'air defence'];

const COUNTRY_KEYWORDS: Record<string, 'IR' | 'US' | 'IL' | 'AE'> = {
  iran: 'IR', iranian: 'IR', irgc: 'IR', tehran: 'IR',
  'united states': 'US', american: 'US', us: 'US', centcom: 'US', pentagon: 'US',
  israel: 'IL', israeli: 'IL', idf: 'IL',
  uae: 'AE', emirati: 'AE', 'united arab': 'AE', abu_dhabi: 'AE',
};

const SYSTEM_MAP: Record<string, string> = {
  shahed: 'ir-shahed-136', hadid: 'ir-hadid-110', fateh: 'ir-fateh-313',
  kheibar: 'ir-kheibar-shekan', fattah: 'ir-fattah', bavar: 'ir-bavar-373',
  's-300': 'ir-s300', khordad: 'ir-khordad-15',
  tomahawk: 'us-tomahawk', prsm: 'us-prsm', jdam: 'us-jdam',
  reaper: 'us-mq9', 'mq-9': 'us-mq9', lucas: 'us-lucas',
  patriot: 'us-patriot', thaad: 'us-thaad', 'sm-3': 'us-sm3',
  'iron dome': 'il-iron-dome', "david's sling": 'il-davids-sling',
  'arrow 2': 'il-arrow-2', 'arrow 3': 'il-arrow-3', 'iron beam': 'il-iron-beam',
  harop: 'il-harop', heron: 'il-heron', lora: 'il-lora',
  apache: 'ae-apache', cheongung: 'ae-cheongung',
};

// --- Source tier ranking ---

const SOURCE_TIERS: Record<string, 1 | 2 | 3> = {
  CENTCOM: 1, IDF: 1, 'UAE MoD': 1,
  ACLED: 2, CSIS: 2, JINSA: 2,
  'Al Jazeera': 3, Reuters: 3, JPost: 3,
};

// --- Helper functions ---

function loadExistingData(): TrackingEntry[] {
  if (!existsSync(TRACKING_PATH)) return [];
  const raw = readFileSync(TRACKING_PATH, 'utf-8');
  return JSON.parse(raw) as TrackingEntry[];
}

function saveData(data: TrackingEntry[]): void {
  writeFileSync(TRACKING_PATH, JSON.stringify(data, null, 2));
}

function getLastDate(data: TrackingEntry[]): string {
  if (data.length === 0) return '2026-02-28';
  return data.reduce((max, d) => (d.date > max ? d.date : max), data[0]!.date);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function classifyCategory(text: string): 'drones' | 'missiles' | 'defense' | null {
  const lower = text.toLowerCase();
  if (DEFENSE_KEYWORDS.some((k) => lower.includes(k))) return 'defense';
  if (DRONE_KEYWORDS.some((k) => lower.includes(k))) return 'drones';
  if (MISSILE_KEYWORDS.some((k) => lower.includes(k))) return 'missiles';
  return null;
}

function classifyCountry(text: string): 'IR' | 'US' | 'IL' | 'AE' | null {
  const lower = text.toLowerCase();
  for (const [keyword, code] of Object.entries(COUNTRY_KEYWORDS)) {
    if (lower.includes(keyword)) return code;
  }
  return null;
}

function classifySystem(text: string, country: string, category: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, systemId] of Object.entries(SYSTEM_MAP)) {
    if (lower.includes(keyword)) return systemId;
  }
  // Fallback defaults
  const defaults: Record<string, Record<string, string>> = {
    IR: { drones: 'ir-shahed-136', missiles: 'ir-fateh-313', defense: 'ir-bavar-373' },
    US: { drones: 'us-mq9', missiles: 'us-tomahawk', defense: 'us-patriot' },
    IL: { drones: 'il-harop', missiles: 'il-air-strikes', defense: 'il-iron-dome' },
    AE: { drones: 'ae-apache', missiles: 'ae-patriot', defense: 'ae-thaad' },
  };
  return defaults[country]?.[category] ?? 'unknown';
}

function extractCount(text: string): number | null {
  const patterns = [
    /(\d{1,5})\s*(?:missiles?|drones?|intercept|rockets?|projectiles?|strikes?)/i,
    /(?:launched?|fired?|intercepted?|destroyed?|struck)\s*(?:approximately\s*)?(\d{1,5})/i,
    /(\d{1,5})\s*(?:were|have been)\s*(?:launched|fired|intercepted|destroyed)/i,
  ];
  for (const pat of patterns) {
    const match = text.match(pat);
    if (match?.[1]) return parseInt(match[1], 10);
  }
  return null;
}

function reconcileEstimates(estimates: SourceEstimate[]): {
  count: number;
  countLow: number;
  countHigh: number;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
} {
  if (estimates.length === 0) {
    return { count: 0, countLow: 0, countHigh: 0, sources: [], confidence: 'low' };
  }

  const sorted = [...estimates].sort((a, b) => a.tier - b.tier);
  const counts = sorted.map((e) => e.count);
  const sources = sorted.map((e) => e.source);
  const median = counts[Math.floor(counts.length / 2)]!;
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  // Check agreement
  const spread = max > 0 ? (max - min) / max : 0;
  let confidence: 'high' | 'medium' | 'low';
  let count: number;

  if (spread <= 0.1) {
    confidence = 'high';
    count = median;
  } else if (spread <= 0.3) {
    confidence = 'medium';
    count = sorted[0]!.count; // Use tier 1 source
  } else {
    confidence = 'low';
    count = median;
  }

  return { count, countLow: min, countHigh: max, sources, confidence };
}

function getConflictId(date: string): string | undefined {
  if (date <= '2026-03-02') return 'opening-strikes';
  if (date <= '2026-03-05') return 'iran-retaliation';
  if (date <= '2026-03-15') return 'attrition-phase';
  return 'degraded-phase';
}

function isDuplicate(existing: TrackingEntry[], entry: TrackingEntry): boolean {
  return existing.some(
    (e) =>
      e.date === entry.date &&
      e.country === entry.country &&
      e.systemId === entry.systemId
  );
}

// --- ACLED fetch ---

async function fetchAcled(sinceDate: string): Promise<AcledEvent[]> {
  if (!ACLED_API_KEY || !ACLED_EMAIL) {
    console.log('[ACLED] No API key configured, skipping');
    return [];
  }

  const params = new URLSearchParams({
    key: ACLED_API_KEY,
    email: ACLED_EMAIL,
    event_date: `${sinceDate}|${todayISO()}`,
    event_date_where: 'BETWEEN',
    country: 'Iran|Israel|United Arab Emirates',
    event_type: 'Battles|Explosions/Remote violence|Strategic developments',
    limit: '500',
  });

  try {
    const res = await fetch(`${ACLED_API_URL}?${params}`);
    if (!res.ok) throw new Error(`ACLED API error: ${res.status}`);
    const json = (await res.json()) as { data: AcledEvent[] };
    console.log(`[ACLED] Fetched ${json.data.length} events`);
    return json.data;
  } catch (err) {
    console.error('[ACLED] Fetch failed:', err);
    return [];
  }
}

// --- CENTCOM RSS fetch ---

async function fetchCentcom(): Promise<string[]> {
  try {
    const res = await fetch(CENTCOM_RSS_URL);
    if (!res.ok) throw new Error(`CENTCOM RSS error: ${res.status}`);
    const text = await res.text();
    // Extract <description> content from RSS items
    const descriptions: string[] = [];
    const regex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/gs;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1]) descriptions.push(match[1]);
    }
    console.log(`[CENTCOM] Fetched ${descriptions.length} items`);
    return descriptions;
  } catch (err) {
    console.error('[CENTCOM] Fetch failed:', err);
    return [];
  }
}

// --- Process ACLED events ---

function processAcledEvents(events: AcledEvent[]): TrackingEntry[] {
  const entries: TrackingEntry[] = [];

  for (const event of events) {
    const category = classifyCategory(event.notes);
    if (!category) continue;

    let country: 'IR' | 'US' | 'IL' | 'AE' | null = null;
    if (event.country === 'Iran') country = 'IR';
    else if (event.country === 'Israel') country = 'IL';
    else if (event.country === 'United Arab Emirates') country = 'AE';

    // Try to determine acting country from notes
    const actingCountry = classifyCountry(event.notes);
    if (actingCountry) country = actingCountry;
    if (!country) continue;

    const count = extractCount(event.notes) ?? 1;
    const systemId = classifySystem(event.notes, country, category);

    entries.push({
      date: event.event_date,
      country,
      category,
      systemId,
      count,
      countLow: Math.round(count * 0.85),
      countHigh: Math.round(count * 1.15),
      sources: ['ACLED'],
      confidence: 'medium',
      context: event.notes.slice(0, 150),
      conflictId: getConflictId(event.event_date),
    });
  }

  return entries;
}

// --- Process CENTCOM items ---

function processCentcomItems(items: string[]): TrackingEntry[] {
  const entries: TrackingEntry[] = [];
  const today = todayISO();

  for (const text of items) {
    const category = classifyCategory(text);
    if (!category) continue;

    const country = classifyCountry(text) ?? 'US';
    const count = extractCount(text) ?? 1;
    const systemId = classifySystem(text, country, category);

    entries.push({
      date: today,
      country,
      category,
      systemId,
      count,
      countLow: Math.round(count * 0.9),
      countHigh: Math.round(count * 1.1),
      sources: ['CENTCOM'],
      confidence: 'high',
      context: text.slice(0, 150),
      conflictId: getConflictId(today),
    });
  }

  return entries;
}

// --- Merge and reconcile ---

function mergeEntries(acled: TrackingEntry[], centcom: TrackingEntry[]): TrackingEntry[] {
  // Group by date + country + systemId
  const groups = new Map<string, TrackingEntry[]>();

  for (const entry of [...acled, ...centcom]) {
    const key = `${entry.date}|${entry.country}|${entry.systemId}`;
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }

  const merged: TrackingEntry[] = [];
  for (const [, group] of groups) {
    if (group.length === 1) {
      merged.push(group[0]!);
      continue;
    }

    // Reconcile multiple estimates
    const estimates: SourceEstimate[] = group.map((e) => ({
      source: e.sources[0] ?? 'Unknown',
      tier: SOURCE_TIERS[e.sources[0] ?? ''] ?? 3,
      count: e.count,
    }));

    const reconciled = reconcileEstimates(estimates);
    const base = group[0]!;

    merged.push({
      ...base,
      count: reconciled.count,
      countLow: reconciled.countLow,
      countHigh: reconciled.countHigh,
      sources: reconciled.sources,
      confidence: reconciled.confidence,
    });
  }

  return merged;
}

// --- Main ---

async function main() {
  console.log('=== Armament Tracker Scraper ===');
  console.log(`Date: ${todayISO()}`);

  const existing = loadExistingData();
  const lastDate = getLastDate(existing);
  console.log(`Existing entries: ${existing.length}, last date: ${lastDate}`);

  // Fetch from sources
  const [acledEvents, centcomItems] = await Promise.all([
    fetchAcled(lastDate),
    fetchCentcom(),
  ]);

  // Process into tracking entries
  const acledEntries = processAcledEvents(acledEvents);
  const centcomEntries = processCentcomItems(centcomItems);
  console.log(`Processed: ${acledEntries.length} ACLED, ${centcomEntries.length} CENTCOM`);

  // Merge and reconcile
  const newEntries = mergeEntries(acledEntries, centcomEntries);

  // Deduplicate against existing data
  const deduplicated = newEntries.filter((e) => !isDuplicate(existing, e));
  console.log(`New entries after dedup: ${deduplicated.length}`);

  if (deduplicated.length === 0) {
    console.log('No new data to add.');
    return;
  }

  // Append and save
  const updated = [...existing, ...deduplicated].sort((a, b) => a.date.localeCompare(b.date));
  saveData(updated);
  console.log(`Saved ${updated.length} total entries to ${TRACKING_PATH}`);
}

main().catch((err) => {
  console.error('Scraper failed:', err);
  process.exit(1);
});

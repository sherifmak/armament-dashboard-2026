/**
 * Armament Tracking Scraper
 *
 * Fetches conflict data from multiple free sources (no API keys required),
 * reconciles estimates, and appends new entries to public/data/tracking.json.
 *
 * Sources (all free, no auth):
 *   1. CENTCOM RSS — official US military press releases
 *   2. LiveUAMap Iran — real-time conflict markers
 *   3. ACLED API — optional, requires free API key
 *
 * Run: npx tsx scripts/scraper.ts
 * Schedule: GitHub Actions cron daily at 23:00 UTC
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
const LIVEUAMAP_URL = 'https://iran.liveuamap.com/rss';
const GULF_NEWS_RSS = 'https://gulfnews.com/rss/uae';

// Keyword maps for classifying events
const DRONE_KEYWORDS = ['shahed', 'drone', 'uav', 'kamikaze', 'loitering', 'hadid', 'lucas', 'mq-9', 'reaper', 'harop', 'heron', 'apache'];
const MISSILE_KEYWORDS = ['missile', 'tomahawk', 'ballistic', 'cruise', 'fateh', 'kheibar', 'fattah', 'jdam', 'prsm', 'lora', 'munition', 'bomb', 'strike'];
const DEFENSE_KEYWORDS = ['intercept', 'iron dome', 'patriot', 'thaad', 'arrow', 'david', 'sling', 'bavar', 's-300', 'cheongung', 'iron beam', 'air defense', 'air defence', 'shot down', 'destroyed'];

const COUNTRY_KEYWORDS: Record<string, 'IR' | 'US' | 'IL' | 'AE'> = {
  iran: 'IR', iranian: 'IR', irgc: 'IR', tehran: 'IR', isfahan: 'IR',
  'united states': 'US', american: 'US', centcom: 'US', pentagon: 'US', 'u.s.': 'US',
  israel: 'IL', israeli: 'IL', idf: 'IL', 'tel aviv': 'IL',
  uae: 'AE', emirati: 'AE', 'united arab': 'AE', 'abu dhabi': 'AE', dubai: 'AE',
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

const SOURCE_TIERS: Record<string, 1 | 2 | 3> = {
  CENTCOM: 1, IDF: 1, 'UAE MoD': 1,
  ACLED: 2, CSIS: 2, JINSA: 2, LiveUAMap: 2,
  'Al Jazeera': 3, Reuters: 3, JPost: 3, 'Gulf News': 3,
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
    /(\d{1,5})\s*(?:missiles?|drones?|intercept|rockets?|projectiles?|strikes?|uavs?)/i,
    /(?:launched?|fired?|intercepted?|destroyed?|struck|engaged)\s*(?:approximately\s*)?(\d{1,5})/i,
    /(\d{1,5})\s*(?:were|have been)\s*(?:launched|fired|intercepted|destroyed)/i,
    /intercept(?:ed)?\s*(\d{1,5})/i,
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

  const spread = max > 0 ? (max - min) / max : 0;
  let confidence: 'high' | 'medium' | 'low';
  let count: number;

  if (spread <= 0.1) {
    confidence = 'high';
    count = median;
  } else if (spread <= 0.3) {
    confidence = 'medium';
    count = sorted[0]!.count;
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

function extractDateFromText(text: string): string | null {
  // Try to find dates like "April 5, 2026" or "2026-04-05"
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch?.[1]) return isoMatch[1];

  const months: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04',
    may: '05', june: '06', july: '07', august: '08',
    september: '09', october: '10', november: '11', december: '12',
  };
  const namedMatch = text.match(/(\w+)\s+(\d{1,2}),?\s*(\d{4})/i);
  if (namedMatch?.[1] && namedMatch[2] && namedMatch[3]) {
    const month = months[namedMatch[1].toLowerCase()];
    if (month) return `${namedMatch[3]}-${month}-${namedMatch[2].padStart(2, '0')}`;
  }
  return null;
}

// --- RSS fetcher (generic) ---

async function fetchRSS(url: string, sourceName: string): Promise<{ title: string; description: string; date: string }[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ArmamentTracker/1.0' },
    });
    if (!res.ok) {
      console.log(`[${sourceName}] HTTP ${res.status}, skipping`);
      return [];
    }
    const text = await res.text();
    const items: { title: string; description: string; date: string }[] = [];

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(text)) !== null) {
      const block = itemMatch[1] ?? '';
      const title = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] ?? '';
      const desc = block.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s)?.[1] ?? '';
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';

      let date = todayISO();
      if (pubDate) {
        const d = new Date(pubDate);
        if (!isNaN(d.getTime())) date = d.toISOString().slice(0, 10);
      }

      items.push({ title, description: desc, date });
    }

    console.log(`[${sourceName}] Fetched ${items.length} items`);
    return items;
  } catch (err) {
    console.error(`[${sourceName}] Fetch failed:`, err);
    return [];
  }
}

// --- Process RSS items into entries ---

function processRSSItems(
  items: { title: string; description: string; date: string }[],
  sourceName: string,
  sinceDate: string
): TrackingEntry[] {
  const entries: TrackingEntry[] = [];

  for (const item of items) {
    if (item.date <= sinceDate) continue;

    const text = `${item.title} ${item.description}`;
    const category = classifyCategory(text);
    if (!category) continue;

    const country = classifyCountry(text);
    if (!country) continue;

    const count = extractCount(text) ?? 1;
    const systemId = classifySystem(text, country, category);
    const tier = SOURCE_TIERS[sourceName] ?? 3;

    entries.push({
      date: item.date,
      country,
      category,
      systemId,
      count,
      countLow: Math.round(count * (tier === 1 ? 0.9 : 0.8)),
      countHigh: Math.round(count * (tier === 1 ? 1.1 : 1.2)),
      sources: [sourceName],
      confidence: tier === 1 ? 'high' : tier === 2 ? 'medium' : 'low',
      context: item.title.slice(0, 150),
      conflictId: getConflictId(item.date),
    });
  }

  return entries;
}

// --- ACLED fetch (optional, needs API key) ---

async function fetchAcled(sinceDate: string): Promise<TrackingEntry[]> {
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

    const entries: TrackingEntry[] = [];
    for (const event of json.data) {
      const category = classifyCategory(event.notes);
      if (!category) continue;

      let country: 'IR' | 'US' | 'IL' | 'AE' | null = null;
      if (event.country === 'Iran') country = 'IR';
      else if (event.country === 'Israel') country = 'IL';
      else if (event.country === 'United Arab Emirates') country = 'AE';
      const actingCountry = classifyCountry(event.notes);
      if (actingCountry) country = actingCountry;
      if (!country) continue;

      const count = extractCount(event.notes) ?? 1;
      entries.push({
        date: event.event_date,
        country,
        category,
        systemId: classifySystem(event.notes, country, category),
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
  } catch (err) {
    console.error('[ACLED] Fetch failed:', err);
    return [];
  }
}

// --- Merge and reconcile ---

function mergeEntries(...groups: TrackingEntry[][]): TrackingEntry[] {
  const all = groups.flat();
  const grouped = new Map<string, TrackingEntry[]>();

  for (const entry of all) {
    const key = `${entry.date}|${entry.country}|${entry.systemId}`;
    const group = grouped.get(key) ?? [];
    group.push(entry);
    grouped.set(key, group);
  }

  const merged: TrackingEntry[] = [];
  for (const [, group] of grouped) {
    if (group.length === 1) {
      merged.push(group[0]!);
      continue;
    }

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

  // Fetch from all sources in parallel (all free, no keys required except ACLED)
  const [centcomItems, liveuamapItems, gulfNewsItems, acledEntries] = await Promise.all([
    fetchRSS(CENTCOM_RSS_URL, 'CENTCOM'),
    fetchRSS(LIVEUAMAP_URL, 'LiveUAMap'),
    fetchRSS(GULF_NEWS_RSS, 'Gulf News'),
    fetchAcled(lastDate),
  ]);

  // Process RSS feeds into tracking entries
  const centcomEntries = processRSSItems(centcomItems, 'CENTCOM', lastDate);
  const liveuamapEntries = processRSSItems(liveuamapItems, 'LiveUAMap', lastDate);
  const gulfEntries = processRSSItems(gulfNewsItems, 'Gulf News', lastDate);

  console.log(`Processed: ${centcomEntries.length} CENTCOM, ${liveuamapEntries.length} LiveUAMap, ${gulfEntries.length} Gulf News, ${acledEntries.length} ACLED`);

  // Merge and reconcile across all sources
  const newEntries = mergeEntries(centcomEntries, liveuamapEntries, gulfEntries, acledEntries);

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

import { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceArea,
} from 'recharts';
import type { DailyAggregate } from '../types';
import { CATEGORY_COLORS, COUNTRIES } from '../constants';
import { conflicts } from '../data/conflicts';
import { formatDate, formatNumber } from '../utils/formatters';

interface TimelinePageProps {
  dailyAggregates: DailyAggregate[];
  dailyByCountry: Array<Record<string, unknown>>;
}

export function TimelinePage({ dailyAggregates, dailyByCountry }: TimelinePageProps) {
  const [view, setView] = useState<'category' | 'country'>('category');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="font-mono text-lg font-bold text-dashboard-text">TIMELINE</h2>
        <div className="flex gap-1 bg-dashboard-surface border border-dashboard-border rounded-md p-0.5">
          <button
            onClick={() => setView('category')}
            className={`px-3 py-1 rounded text-xs font-mono ${
              view === 'category' ? 'bg-dashboard-accent/20 text-dashboard-accent' : 'text-dashboard-muted hover:text-dashboard-text'
            }`}
          >
            By Category
          </button>
          <button
            onClick={() => setView('country')}
            className={`px-3 py-1 rounded text-xs font-mono ${
              view === 'country' ? 'bg-dashboard-accent/20 text-dashboard-accent' : 'text-dashboard-muted hover:text-dashboard-text'
            }`}
          >
            By Country
          </button>
        </div>
      </div>

      <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height={500}>
          {view === 'category' ? (
            <AreaChart data={dailyAggregates} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="tgDrones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CATEGORY_COLORS.drones} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CATEGORY_COLORS.drones} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tgMissiles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CATEGORY_COLORS.missiles} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CATEGORY_COLORS.missiles} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tgDefense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CATEGORY_COLORS.defense} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CATEGORY_COLORS.defense} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tickFormatter={formatDate} stroke="#374151" tick={{ fontSize: 10 }} />
              <YAxis stroke="#374151" tick={{ fontSize: 10 }} />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number) => formatNumber(value)}
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '12px' }}
              />
              {conflicts.map((c) => (
                <ReferenceArea
                  key={c.id}
                  x1={c.startDate}
                  x2={c.endDate}
                  fill="#6b7280"
                  fillOpacity={0.05}
                  label={{ value: c.name, position: 'insideTop', fill: '#6b7280', fontSize: 9 }}
                />
              ))}
              <Area type="monotone" dataKey="drones" stackId="1" stroke={CATEGORY_COLORS.drones} fill="url(#tgDrones)" strokeWidth={2} name="Drones" />
              <Area type="monotone" dataKey="missiles" stackId="1" stroke={CATEGORY_COLORS.missiles} fill="url(#tgMissiles)" strokeWidth={2} name="Missiles" />
              <Area type="monotone" dataKey="defense" stackId="1" stroke={CATEGORY_COLORS.defense} fill="url(#tgDefense)" strokeWidth={2} name="Defense" />
            </AreaChart>
          ) : (
            <LineChart data={dailyByCountry} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tickFormatter={formatDate} stroke="#374151" tick={{ fontSize: 10 }} />
              <YAxis stroke="#374151" tick={{ fontSize: 10 }} />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number) => formatNumber(value)}
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '12px' }}
              />
              {COUNTRIES.map((c) => (
                <Line key={c.code} type="monotone" dataKey={c.code} stroke={c.color} strokeWidth={2} dot={false} name={c.name} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
        <h3 className="font-mono text-sm font-semibold text-dashboard-text mb-3">CONFLICT PHASES</h3>
        <div className="grid grid-cols-1 gap-2">
          {conflicts.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-3 rounded bg-dashboard-bg border border-dashboard-border">
              <div className="shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-dashboard-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-dashboard-text">{c.name}</span>
                  <span className="text-[10px] text-dashboard-muted font-mono">
                    {formatDate(c.startDate)} - {formatDate(c.endDate)}
                  </span>
                </div>
                <p className="text-xs text-dashboard-muted mt-0.5">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { ConflictEvent } from '../types';

export const conflicts: ConflictEvent[] = [
  {
    id: 'opening-strikes',
    name: 'Opening Strikes',
    startDate: '2026-02-28',
    endDate: '2026-03-02',
    description: 'US/Israel launch Operation Epic Fury / Roaring Lion. 1,700+ strikes in 72 hours. Khamenei killed Day 1.',
    countriesInvolved: ['US', 'IL', 'IR'],
  },
  {
    id: 'iran-retaliation',
    name: 'Iranian Retaliation',
    startDate: '2026-03-01',
    endDate: '2026-03-05',
    description: 'Iran launches 500+ ballistic missiles and ~2,000 drones. Peak fire rate Feb 28-Mar 1, declining 90% by Mar 4.',
    countriesInvolved: ['IR', 'US', 'IL', 'AE'],
  },
  {
    id: 'hezbollah-joins',
    name: 'Hezbollah Enters War',
    startDate: '2026-03-02',
    endDate: '2026-03-29',
    description: 'Hezbollah fires rockets/drones at northern Israel. 668 attack waves by Mar 19. Daily avg 37 attacks.',
    countriesInvolved: ['IR', 'IL'],
  },
  {
    id: 'attrition-phase',
    name: 'Attrition Phase',
    startDate: '2026-03-06',
    endDate: '2026-03-15',
    description: 'Iranian launch rate collapsed 92%. US/Israel shift to stand-in precision strikes. 5,000+ targets engaged by Day 10.',
    countriesInvolved: ['US', 'IL', 'IR', 'AE'],
  },
  {
    id: 'degraded-phase',
    name: 'Degraded Capability',
    startDate: '2026-03-16',
    endDate: '2026-03-29',
    description: '70% of Iran launchers neutralized. Sporadic attacks continue. Interceptor depletion concerns emerge.',
    countriesInvolved: ['US', 'IL', 'IR', 'AE'],
  },
];

import type { Ladder } from '@/types';

/** Add a ladder here; its problemIds must all resolve in data/gym/index.ts (integrity-tested). */
export const LADDERS: Ladder[] = [
  {
    id: 'cond',
    title: 'Conditional Aggregation',
    category: 'sql',
    module: 'm3',
    concept: 'case',
    blurb: 'Turn counts into rates with CASE inside aggregates: success rate, refund rate, dispute rate.',
    problemIds: ['ca1', 'ca2'],
  },
];

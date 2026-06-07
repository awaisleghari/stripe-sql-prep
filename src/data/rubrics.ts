import type { Rubric } from '@/types';

export const RUBRICS: Rubric[] = [
  {
    id: 'communication',
    title: 'Interview communication',
    criteria: [
      'Asks clarifying questions before writing anything',
      'Defines the metric, the grain and the denominator out loud',
      'Builds the query/solution in steps and narrates them',
      'Calls out nulls, duplicates, late data, refunds/disputes, time zones',
      'Validates the result and states edge cases',
    ],
  },
];

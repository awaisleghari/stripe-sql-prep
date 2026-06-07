import type { Problem } from '@/types';

/**
 * Sample SQL problems for the "Conditional aggregation" ladder (Repo-1).
 * They carry the full guided-UX field set so Focus Mode is fully exercised.
 * Remaining problems migrate in Repo-2.
 */
export const conditionalProblems: Problem[] = [
  {
    id: 'ca1',
    title: 'Count succeeded vs total charges per merchant',
    ladder: 'cond',
    pos: 1,
    stage: 'Recognition',
    lvl: 0,
    difficulty: 'recognition',
    priority: 'required',
    mode: 'SQL',
    source: 'SQLBolt-style',
    module: 'm3',
    timed: false,
    est: '4 min',
    business:
      'Before you can compute a success RATE you need the two counts it is built from: how many charges a merchant attempted, and how many succeeded.',
    task: 'Per merchant, return the number of attempts (all charges) and the number that succeeded.',
    prompt:
      'Write a query returning merchant_id, total attempts, and succeeded count, one row per merchant.',
    prereq: 'none — first rung',
    harder: 'First rung: just the two counts, no division yet.',
    teaches:
      'Conditional aggregation: COUNT(*) for the denominator and a filtered SUM/COUNT for the numerator, in one GROUP BY.',
    deliverable: 'One row per merchant with attempts and succeeded counts.',
    before: [
      'What is one row in the output? (one merchant)',
      'What is the denominator — all charges, or only succeeded?',
      'How do you count only succeeded rows without a second query?',
    ],
    howto: [
      'GROUP BY merchant_id.',
      'COUNT(*) gives attempts.',
      "SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) gives the numerator.",
    ],
    schema: ['charges'],
    hints: [
      'One GROUP BY merchant_id is enough.',
      'COUNT(*) counts every row in the group (attempts).',
      "Use a CASE inside SUM to count only succeeded rows.",
    ],
    confusion:
      'Filtering to succeeded in WHERE makes attempts equal successes. Keep all rows; do the condition inside the aggregate.',
    solution:
      "SELECT merchant_id,\n" +
      "       COUNT(*) AS attempts,\n" +
      "       SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) AS succeeded\n" +
      "FROM charges\n" +
      "GROUP BY merchant_id;",
    verify: {
      grain: 'one row per merchant',
      columns: ['merchant_id', 'attempts', 'succeeded'],
      sample: { cols: ['merchant_id', 'attempts', 'succeeded'], rows: [['m_101', '1200', '900'], ['m_103', '800', '770']] },
      commonWrong: ["Filtering status = 'succeeded' in WHERE (attempts collapses to successes)."],
      validation: ['succeeded <= attempts for every merchant.'],
      edgeCases: ['Merchants with only failed charges show succeeded = 0, not a missing row.'],
      checklist: ['GROUP BY merchant_id', 'COUNT(*) attempts', 'CASE inside SUM for numerator'],
    },
    concept: ['case', 'groupby'],
    metric: 'counts',
    edge: ['pending charges'],
    explain:
      'Say: "I keep every charge and use a CASE inside SUM so the numerator counts only succeeded while COUNT(*) keeps the full denominator."',
    next: 'ca2',
  },
  {
    id: 'ca2',
    title: 'Payment success rate per merchant',
    ladder: 'cond',
    pos: 2,
    stage: 'Mechanical',
    lvl: 1,
    difficulty: 'easy',
    priority: 'required',
    mode: 'SQL',
    source: 'SQLBolt-style',
    module: 'm3',
    timed: false,
    est: '5 min',
    business:
      'Now turn the two counts into the metric Stripe cares about most: the share of attempts that succeed.',
    task: 'Per merchant, return the payment success rate (succeeded ÷ attempts).',
    prompt:
      'Write a query returning merchant_id and success_rate, guarding against division by zero.',
    prereq: 'ca1 (the two counts)',
    harder: 'You divide the numerator by the denominator and must keep it a float — the rate, not an integer.',
    teaches:
      'AVG of a CASE gives a rate directly; or divide explicitly with a float cast / NULLIF guard.',
    deliverable: 'One row per merchant with a success_rate in [0,1].',
    before: [
      'What makes the result a fraction, not an integer 0?',
      'What if a merchant has zero attempts?',
    ],
    howto: [
      "AVG(CASE WHEN status = 'succeeded' THEN 1.0 ELSE 0 END) is the rate.",
      'The 1.0 forces float division.',
    ],
    schema: ['charges'],
    hints: [
      "AVG of a 1/0 CASE is the success rate.",
      'Use 1.0 (not 1) so you get a float, not integer division.',
      'NULLIF(denominator, 0) avoids divide-by-zero if you divide explicitly.',
    ],
    confusion:
      'Integer division (succeeded/attempts) truncates to 0. Force a float with 1.0 or a cast.',
    solution:
      "SELECT merchant_id,\n" +
      "       AVG(CASE WHEN status = 'succeeded' THEN 1.0 ELSE 0 END) AS success_rate\n" +
      "FROM charges\n" +
      "GROUP BY merchant_id;",
    verify: {
      grain: 'one row per merchant',
      columns: ['merchant_id', 'success_rate'],
      sample: { cols: ['merchant_id', 'success_rate'], rows: [['m_101', '0.75'], ['m_103', '0.96']] },
      commonWrong: ['Integer division returning 0.', 'Dividing succeeded by succeeded (always 1).'],
      validation: ['Every rate is in [0,1].'],
      edgeCases: ['Zero-attempt merchants: decide between 0 and NULL and state it.'],
      checklist: ['float division', 'GROUP BY merchant', 'rate in [0,1]'],
    },
    concept: ['case', 'groupby'],
    metric: 'rate',
    edge: ['division by zero', 'pending charges'],
    explain:
      'Say: "AVG of a 1.0/0 CASE gives the success rate in one pass; the 1.0 keeps it a float so it does not truncate to zero."',
    next: null,
  },
];

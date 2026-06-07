import type { Module } from '@/types';

/**
 * Sample module (Repo-1). Demonstrates the full module shape:
 * concept + sqlPattern + predict + debug + exercises + 5-question L0→L5 quiz + meta.
 * Full module migration happens in Repo-3.
 */
export const m1Select: Module = {
  id: 'm1',
  day: 'Day 1',
  badge: 'beginner',
  title: 'SELECT, WHERE, ORDER BY, LIMIT',
  skill: 'select',
  meta: {
    why: 'Every Stripe query starts here: pick columns, keep the rows you want, order them, cap the output.',
    outcome: 'You can read a table, filter to the rows that matter, and return a ranked, capped result.',
  },
  concept:
    '<p>A <strong>table</strong> is a grid: every <strong>row</strong> is one record (one charge, one customer) and every <strong>column</strong> holds one fixed type of value.</p>' +
    '<p>The core verb is <code class="inline">SELECT</code> columns <code class="inline">FROM</code> a table. <code class="inline">WHERE</code> keeps only the rows you want, <code class="inline">ORDER BY</code> sorts them, and <code class="inline">LIMIT</code> caps how many come back.</p>',
  sqlPattern:
    "SELECT charge_id, amount, created_at\n" +
    "FROM charges\n" +
    "WHERE status = 'succeeded' AND amount > 5000\n" +
    "ORDER BY created_at DESC\n" +
    "LIMIT 10;",
  schemaRefs: ['charges'],
  predict: {
    prompt: 'What does this query return?',
    query:
      "SELECT merchant_id, amount\nFROM charges\nWHERE status = 'failed'\nORDER BY amount DESC\nLIMIT 3;",
    options: [
      'The 3 largest failed charges, highest amount first',
      'The 3 smallest failed charges',
      'All failed charges',
      'The 3 most recent failed charges',
    ],
    answer: 0,
    explain: 'WHERE keeps only failed charges; ORDER BY amount DESC sorts largest-first; LIMIT 3 caps to three rows.',
  },
  debug: {
    prompt: 'This query should return succeeded charges over $50, newest first. Why is it wrong?',
    broken:
      "SELECT charge_id, amount\nFROM charges\nWHERE status = succeeded AND amount > 5000\nORDER BY created_at;",
    hint: 'Look at the string literal and the sort direction.',
    fixed:
      "SELECT charge_id, amount\nFROM charges\nWHERE status = 'succeeded' AND amount > 5000\nORDER BY created_at DESC;",
    why: "String literals need single quotes ('succeeded'), and ORDER BY defaults to ASC — add DESC for newest-first.",
  },
  exercises: [
    { id: 'm1e1', difficulty: 'easy', prompt: 'Return charge_id and amount for all succeeded charges.', solution: "SELECT charge_id, amount FROM charges WHERE status = 'succeeded';", explain: 'A simple projection + filter.' },
    { id: 'm1e2', difficulty: 'medium', prompt: 'Return the 5 largest succeeded charges in USD, highest first.', solution: "SELECT charge_id, amount FROM charges WHERE status = 'succeeded' AND currency = 'usd' ORDER BY amount DESC LIMIT 5;", explain: 'Filter, sort descending, cap with LIMIT.' },
    { id: 'm1e3', difficulty: 'hard', prompt: 'Return the most recent failed charge per merchant is NOT possible with these clauses alone — explain what you would need.', explain: '"Per group" requires GROUP BY or a window function (later modules). Recognising the limit of SELECT/WHERE/ORDER/LIMIT is the point.' },
  ],
  quiz: [
    { level: 0, q: 'Which clause keeps only some rows?', options: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'], answer: 1, why: 'WHERE filters rows by a condition.', concept: 'filtering' },
    { level: 1, q: "How do you write the text value succeeded in SQL?", options: ['succeeded', '"succeeded"', "'succeeded'", '`succeeded`'], answer: 2, why: 'Standard SQL string literals use single quotes.', concept: 'literals' },
    { level: 2, q: 'What is the default sort direction of ORDER BY?', options: ['Descending', 'Ascending', 'Random', 'Insertion order'], answer: 1, why: 'ORDER BY is ascending unless you add DESC.', concept: 'ordering' },
    { level: 3, q: 'ORDER BY amount DESC LIMIT 3 returns…', options: ['3 smallest', '3 largest', 'all sorted', 'a random 3'], answer: 1, why: 'DESC sorts largest-first, LIMIT 3 caps to the top three.', concept: 'top-n' },
    { level: 4, q: 'Why might WHERE amount > 5000 surprise you on money columns?', options: ['It excludes NULLs silently', 'amount is in cents, so 5000 = $50', 'It rounds amounts', 'It only works on integers'], answer: 1, why: 'Money is stored in cents; 5000 cents is $50. Forgetting the unit is a classic bug.', concept: 'units' },
  ],
  mistakes: ['Double quotes around string literals (those mean identifiers in standard SQL).', 'Forgetting amount is in cents.'],
  edges: ['NULL status rows are not matched by status = \'succeeded\'.'],
  interview: 'Say what you are selecting, the filter, the sort, and the cap — in that order — before writing it.',
};

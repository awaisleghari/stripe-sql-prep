import type { ModuleId } from '@/types';

/**
 * Presentation copy for each learning module's hero header: a one-line "why this matters"
 * and the concrete capability the module unlocks ("what you'll be able to do").
 * Keyed by module id; modules without an entry simply render without the why/outcome lines.
 */
export const MODULE_META: Record<ModuleId, { why: string; outcome: string }> = {
  m0: {
    why: "Every SQL question is really a data question. Before syntax, you decide what one row means, which rows count, and how you'll check the answer.",
    outcome: 'read a request and name the grain, the relevant table, the metric and its denominator — before writing a line of SQL.',
  },
  m1: {
    why: 'SELECT / WHERE / ORDER BY / LIMIT are the verbs of every query. Most real filters are about status, payment method, time windows and NULLs.',
    outcome: 'pull exactly the rows you want, in the order you want, and sidestep the NULL and inequality traps.',
  },
  m2: {
    why: 'GROUP BY turns rows into per-entity metrics — the backbone of merchant, country and cohort reporting at Stripe.',
    outcome: 'aggregate to any grain, filter groups with HAVING, and keep counts vs sums straight.',
  },
  m3: {
    why: 'Conditional aggregation is how nearly every Stripe rate — approval, refund, dispute, recovery — is built.',
    outcome: 'compute success / refund / dispute rates correctly, with the right denominator and no integer-division bug.',
  },
  m4: {
    why: 'Charges, refunds, disputes, customers and merchants live in separate tables — you must combine them without inflating the numbers.',
    outcome: 'choose INNER vs LEFT deliberately, write anti-joins, preserve zero-activity rows, and avoid fan-out.',
  },
  m6: {
    why: 'Many Stripe questions need first/last events, previous-period comparisons, running totals or rankings — without losing row-level detail.',
    outcome: 'use ROW_NUMBER, RANK, LAG/LEAD and SUM OVER, and pick the correct window frame.',
  },
  m8: {
    why: 'Retries and replayed webhooks create duplicate rows; counting them naively overstates every metric.',
    outcome: 'deduplicate to one row per logical key with a deterministic rule, and count true distinct attempts.',
  },
  m11: {
    why: 'Gross volume is not net revenue. Finance reports what merchants actually keep, which lives in the ledger.',
    outcome: 'separate GPV, net (ledger) and MRR, handle multi-currency, and reconcile the pieces.',
  },
  m12: {
    why: 'Refund and dispute rates are watched by card networks; the denominator and late-arriving timing are exactly where answers go wrong.',
    outcome: 'compute refund / dispute rates with the right denominator and attribute late-arriving disputes correctly.',
  },
};

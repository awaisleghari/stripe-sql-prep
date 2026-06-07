import type { PanicSection } from '@/types';

/* MIGRATED page content. */
export const PANIC: PanicSection[] = [
  {
    "h": "The 7-step loop (say it out loud)",
    "items": [
      "Clarify the metric & does pending/refund/dispute count?",
      "State the grain: 'one row per ___'.",
      "Name the denominator explicitly.",
      "Name tables + join keys; watch fan-out.",
      "Build in CTEs, step by step.",
      "Edge cases: NULLs, dupes, multi-currency, late data, time zones.",
      "Validate: range check, totals reconcile, a known merchant looks right."
    ]
  },
  {
    "h": "Syntax cheat card",
    "code": "-- success rate\nAVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END)\n-- conditional count (keeps denominator)\nCOUNT(*) FILTER (WHERE status='succeeded')\n-- dedup to latest per key\nROW_NUMBER() OVER (PARTITION BY k ORDER BY t DESC, id DESC) = 1\n-- month bucket\nDATE_TRUNC('month', created_at)\n-- rolling 7 days\nSUM(x) OVER (ORDER BY day\n  RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW)\n-- period-over-period\nLAG(x) OVER (PARTITION BY m ORDER BY month)\n-- safe divide\nx::numeric / NULLIF(y, 0)"
  },
  {
    "h": "Money & ledger reminders",
    "items": [
      "Amounts are in CENTS → divide by 100.0 (never 100).",
      "Net revenue = balance_transactions.net_amount (already nets fees/refunds/disputes).",
      "GPV = succeeded charges only; it is NOT revenue.",
      "MRR: annual ÷ 12, active subs only.",
      "Never SUM cents across currencies."
    ]
  },
  {
    "h": "Top traps that lose offers",
    "items": [
      "Integer division on rates → use 1.0 / ::numeric.",
      "Fan-out: aggregate the many-side before joining.",
      "WHERE on the right table kills a LEFT JOIN → put it in ON.",
      "NOT IN + NULL → zero rows. Use NOT EXISTS.",
      "Refunds ≠ disputes. Dispute denominator = succeeded charges.",
      "Disputes arrive late → attribute to the charge date.",
      "Filtering a window function in WHERE → wrap in a CTE."
    ]
  },
  {
    "h": "Pacing & composure",
    "items": [
      "Restate the question in your own words first — buys thinking time and shows rigor.",
      "Write the CTE skeleton (names only) before filling logic.",
      "If stuck, narrate your plan; partial credit lives in the explanation.",
      "Validate before you say 'done'. Always.",
      "Breathe. A calm 'let me clarify the metric' resets any wobble."
    ]
  }
];

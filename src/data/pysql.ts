import type { PysqlRow } from '@/types';

/* MIGRATED page content. */
export const PYSQL: PysqlRow[] = [
  {
    "plain": "Keep only the rows that match a condition (e.g. only succeeded charges).",
    "sql": "WHERE status = 'succeeded'",
    "py": "[c for c in charges if c[\"status\"] == \"succeeded\"]",
    "trap": "Pending and failed are different statuses; <> / NOT IN silently drop NULL values like failure_code.",
    "stripe": "Payment success queries, GPV (succeeded only), approval metrics."
  },
  {
    "plain": "Combine several conditions.",
    "sql": "WHERE method='card' AND (status='failed' OR amount > 50000)",
    "py": "[c for c in charges if c[\"method\"]==\"card\" and (c[\"status\"]==\"failed\" or c[\"amount\"]>50000)]",
    "trap": "AND binds tighter than OR — parenthesise the OR group or you change the meaning.",
    "stripe": "High-value failed card charges; risk filters."
  },
  {
    "plain": "Pick specific columns from each row.",
    "sql": "SELECT charge_id, amount FROM charges",
    "py": "[{\"id\": c[\"charge_id\"], \"amt\": c[\"amount\"]} for c in charges]",
    "trap": "SELECT * is fine to explore, never to ship a metric.",
    "stripe": "Charge-level extracts feeding a dashboard."
  },
  {
    "plain": "Count rows per group.",
    "sql": "SELECT merchant_id, COUNT(*) FROM charges GROUP BY merchant_id",
    "py": "counts = {}\nfor c in charges:\n    counts[c[\"merchant_id\"]] = counts.get(c[\"merchant_id\"], 0) + 1",
    "trap": "Every non-aggregated SELECT column must be in GROUP BY.",
    "stripe": "Attempts per merchant; charges per status."
  },
  {
    "plain": "Sum a value per group.",
    "sql": "SELECT merchant_id, SUM(amount) FROM charges WHERE status='succeeded' GROUP BY merchant_id",
    "py": "gross = {}\nfor c in charges:\n    if c[\"status\"]==\"succeeded\":\n        gross[c[\"merchant_id\"]] = gross.get(c[\"merchant_id\"],0) + c[\"amount\"]",
    "trap": "Amounts are in cents; divide by 100.0. Don't sum across currencies.",
    "stripe": "Gross payment volume (GPV) by merchant."
  },
  {
    "plain": "Compute a rate (successes divided by attempts).",
    "sql": "AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END)",
    "py": "succ = sum(1 for c in g if c[\"status\"]==\"succeeded\")\nrate = succ / len(g)   # float division",
    "trap": "Integer division returns 0 — use 1.0 (or ::numeric). Get the denominator right.",
    "stripe": "Approval/success rate, refund rate, dispute rate, recovery rate."
  },
  {
    "plain": "Filter groups after aggregating (not individual rows).",
    "sql": "GROUP BY merchant_id HAVING COUNT(*) >= 500",
    "py": "big = {m: n for m, n in counts.items() if n >= 500}",
    "trap": "A condition on an aggregate goes in HAVING; a condition on a row goes in WHERE.",
    "stripe": "Volume floors so tiny merchants don't dominate a ranking."
  },
  {
    "plain": "Attach related info from another table (look up by key).",
    "sql": "FROM charges c JOIN customers cu ON cu.customer_id = c.customer_id",
    "py": "cust = {cu[\"customer_id\"]: cu for cu in customers}\nfor c in charges:\n    c[\"email\"] = cust.get(c[\"customer_id\"], {}).get(\"email\")",
    "trap": "One-to-many joins fan out and double-count sums — aggregate the many-side first.",
    "stripe": "charges→customers, charges→refunds, merchants→charges."
  },
  {
    "plain": "Keep rows from the left table even when there's no match.",
    "sql": "FROM merchants m LEFT JOIN charges c ON c.merchant_id=m.merchant_id AND c.status='succeeded'",
    "py": "for m in merchants:\n    m[\"n\"] = sum(1 for c in charges if c[\"merchant_id\"]==m[\"merchant_id\"] and c[\"status\"]==\"succeeded\")",
    "trap": "A WHERE on the right table turns LEFT JOIN into INNER — put that filter in ON.",
    "stripe": "Show every merchant including those with zero succeeded charges."
  },
  {
    "plain": "Find rows in A with no match in B (anti-join).",
    "sql": "WHERE NOT EXISTS (SELECT 1 FROM charges c WHERE c.customer_id=cu.customer_id AND c.status='succeeded')",
    "py": "paid = {c[\"customer_id\"] for c in charges if c[\"status\"]==\"succeeded\"}\nnever = [cu for cu in customers if cu[\"customer_id\"] not in paid]",
    "trap": "NOT IN with any NULL returns zero rows — prefer NOT EXISTS / a set difference.",
    "stripe": "Customers who never had a succeeded charge; merchants with no payouts."
  },
  {
    "plain": "Keep one row per key (deduplicate retries).",
    "sql": "ROW_NUMBER() OVER (PARTITION BY idempotency_key ORDER BY created_at DESC) = 1",
    "py": "latest = {}\nfor c in sorted(charges, key=lambda c: c[\"created_at\"]):\n    latest[c[\"idempotency_key\"]] = c   # last wins\ndeduped = list(latest.values())",
    "trap": "DISTINCT can't 'keep the latest'; you need a deterministic tiebreaker.",
    "stripe": "Retried/duplicated charges sharing an idempotency_key."
  },
  {
    "plain": "Rank items within a group.",
    "sql": "RANK() OVER (PARTITION BY country ORDER BY gpv DESC)",
    "py": "for country, rows in groups.items():\n    for i, r in enumerate(sorted(rows, key=lambda r: -r[\"gpv\"]), 1):\n        r[\"rank\"] = i",
    "trap": "RANK skips after ties (1,2,2,4); DENSE_RANK doesn't (1,2,2,3); ROW_NUMBER forces uniqueness.",
    "stripe": "Top merchants by volume; top decline reason per merchant."
  },
  {
    "plain": "Running cumulative total over time.",
    "sql": "SUM(amount) OVER (PARTITION BY customer_id ORDER BY created_at ROWS UNBOUNDED PRECEDING)",
    "py": "run = {}\nfor c in sorted(charges, key=lambda c: c[\"created_at\"]):\n    run[c[\"customer_id\"]] = run.get(c[\"customer_id\"],0) + c[\"amount\"]\n    c[\"cumulative\"] = run[c[\"customer_id\"]]",
    "trap": "No ORDER BY = whole-partition total, not running. ROWS vs RANGE matters on tied times.",
    "stripe": "Customer lifetime spend over time; cumulative GPV."
  },
  {
    "plain": "Compare each period to the previous one.",
    "sql": "LAG(gpv) OVER (PARTITION BY merchant_id ORDER BY month)",
    "py": "prev = {}\nfor row in sorted(monthly, key=lambda r:(r[\"m\"], r[\"month\"])):\n    row[\"prev\"] = prev.get(row[\"m\"])\n    prev[row[\"m\"]] = row[\"gpv\"]",
    "trap": "Missing months make LAG point to the wrong prior row — build a month spine.",
    "stripe": "Month-over-month merchant GPV growth; churn deltas."
  },
  {
    "plain": "Bucket timestamps into a period (day/month).",
    "sql": "DATE_TRUNC('month', created_at)",
    "py": "key = (c[\"created_at\"].year, c[\"created_at\"].month)",
    "trap": "Truncation uses the session time zone — state UTC vs local; the current month is partial.",
    "stripe": "Monthly GPV, MRR cohorts, rolling velocity."
  },
  {
    "plain": "Safe division that won't crash on zero.",
    "sql": "refunded::numeric / NULLIF(succeeded, 0)",
    "py": "rate = refunded / succeeded if succeeded else None",
    "trap": "Dividing by zero (a merchant with no succeeded charges) errors or returns NULL — guard it.",
    "stripe": "Any rate metric: refund rate, dispute rate, success rate."
  }
];

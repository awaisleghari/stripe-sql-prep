import type { Module } from '@/types';

/* MIGRATED learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m2: Module = {
  "id": "m2",
  "day": "Day 1",
  "badge": "beginner",
  "title": "GROUP BY · HAVING",
  "skill": "groupby",
  "bcolor": "blue",
  "concept": "<p><code class=\"inline\">GROUP BY</code> collapses many rows into one row per group, and aggregate functions (<code class=\"inline\">COUNT</code>, <code class=\"inline\">SUM</code>, <code class=\"inline\">AVG</code>, <code class=\"inline\">MIN</code>, <code class=\"inline\">MAX</code>) summarise each group. Every column in <code class=\"inline\">SELECT</code> must either be in the <code class=\"inline\">GROUP BY</code> or wrapped in an aggregate.</p>\n<p><strong>WHERE filters rows before grouping; HAVING filters groups after.</strong> \"Merchants with > 100 charges\" is a HAVING condition (it's about the group), not WHERE.</p>\n<p>Watch how aggregates treat NULL: <code class=\"inline\">COUNT(*)</code> counts rows; <code class=\"inline\">COUNT(col)</code> counts non-NULL values; <code class=\"inline\">AVG</code>/<code class=\"inline\">SUM</code> ignore NULLs.</p>",
  "sqlPattern": "SELECT merchant_id, COUNT(*) AS attempts\nFROM charges\nGROUP BY merchant_id\nHAVING COUNT(*) >= 500;",
  "schemaRefs": [
    "charges"
  ],
  "pysupport": "# GROUP BY merchant_id with COUNT(*) and SUM(amount) using a dict\ntotals = {}\nfor c in charges:\n    t = totals.setdefault(c[\"merchant_id\"], {\"n\": 0, \"gross\": 0})\n    t[\"n\"] += 1\n    if c[\"status\"] == \"succeeded\":\n        t[\"gross\"] += c[\"amount\"]",
  "reasoning": {
    "question": "\"How many charges and how much volume does each merchant have?\"",
    "grain": "One row per merchant (one row per group).",
    "included": "For volume, succeeded charges; for attempts, all charge rows.",
    "excluded": "Depends on the metric — succeeded-only for volume; decide explicitly on pending.",
    "table": "<code class=\"inline\">charges</code>, grouped by <code class=\"inline\">merchant_id</code>.",
    "metric": "<code class=\"inline\">COUNT(*)</code> for attempts; <code class=\"inline\">SUM(amount)</code> for gross volume.",
    "denom": "For a rate, the denominator is the group's attempt count — filter groups with HAVING, not WHERE.",
    "wrong": "Filtering an aggregate in WHERE; selecting a column that isn't grouped; integer division; <code class=\"inline\">COUNT(*)</code> vs <code class=\"inline\">COUNT(col)</code> on NULLs.",
    "validate": "Per-merchant parts sum to the platform total; tiny merchants don't dominate (use a volume floor)."
  },
  "predicts": [
    {
      "prompt": "<code class='inline'>failure_code</code> is NULL for succeeded charges. What does <code class='inline'>COUNT(failure_code)</code> give per merchant?",
      "query": "SELECT merchant_id,\n       COUNT(*)            AS rows_total,\n       COUNT(failure_code) AS fc\nFROM charges\nGROUP BY merchant_id;",
      "options": [
        "fc = rows_total always",
        "fc = count of charges that have a failure_code (i.e. failed ones)",
        "fc = 0 always",
        "Error"
      ],
      "answer": 1,
      "explain": "<code class='inline'>COUNT(col)</code> ignores NULLs, so <code class='inline'>fc</code> = number of FAILED charges (those have a failure_code). <code class='inline'>COUNT(*)</code> counts every row. This difference is a handy trick for conditional counts."
    },
    {
      "prompt": "Per-merchant charge counts: merchant 101 has 3 charges, merchant 102 has 1. What does this return?",
      "query": "SELECT merchant_id, COUNT(*) AS n\nFROM charges\nGROUP BY merchant_id\nHAVING COUNT(*) >= 2;",
      "options": [
        "both merchants",
        "only merchant 101 (n=3)",
        "only merchant 102",
        "error — COUNT not allowed in HAVING"
      ],
      "answer": 1,
      "explain": "HAVING filters whole groups after aggregation; only merchant 101 (3 ≥ 2) qualifies. Aggregates ARE allowed in HAVING (that's its job)."
    }
  ],
  "debugs": [
    {
      "prompt": "Wanted: per-merchant gross volume, only for merchants whose gross exceeds $1M. Errors out.",
      "broken": "SELECT merchant_id, SUM(amount) AS gross\nFROM charges\nWHERE SUM(amount) > 100000000\nGROUP BY merchant_id;",
      "hint": "You're filtering on an aggregate. WHERE can't see aggregates — they don't exist until after grouping.",
      "fixed": "SELECT merchant_id, SUM(amount) AS gross\nFROM charges\nWHERE status = 'succeeded'\nGROUP BY merchant_id\nHAVING SUM(amount) > 100000000;",
      "why": "Aggregate conditions belong in <code class='inline'>HAVING</code> (post-grouping). I also added a row-level <code class='inline'>WHERE status='succeeded'</code> since gross volume should only count successful payments."
    },
    {
      "title": "aggregate in WHERE",
      "prompt": "Intended: merchants with at least 500 charges. This throws an error.",
      "broken": "SELECT merchant_id, COUNT(*)\nFROM charges\nWHERE COUNT(*) >= 500\nGROUP BY merchant_id;",
      "hint": "WHERE runs before grouping. Where do conditions on aggregates belong?",
      "fixed": "SELECT merchant_id, COUNT(*)\nFROM charges\nGROUP BY merchant_id\nHAVING COUNT(*) >= 500;",
      "why": "WHERE is evaluated before aggregation, so it can't reference COUNT(*). Filter aggregated groups with HAVING."
    }
  ],
  "exercises": [
    {
      "id": "m2e1",
      "lvl": 1,
      "priority": "required",
      "title": "Count per group",
      "prompt": "Count charges per <code class='inline'>status</code> across the whole platform.",
      "hints": [
        "GROUP BY status, COUNT(*)."
      ],
      "solution": "SELECT status, COUNT(*) AS n\nFROM charges\nGROUP BY status;"
    },
    {
      "id": "m2e2",
      "lvl": 2,
      "priority": "required",
      "title": "Gross volume per merchant",
      "prompt": "Gross payment volume (succeeded only) per merchant, in dollars, highest first.",
      "hints": [
        "Filter succeeded in WHERE, SUM(amount) in SELECT.",
        "Divide the SUM by 100.0."
      ],
      "solution": "SELECT merchant_id,\n       SUM(amount) / 100.0 AS gpv_usd\nFROM charges\nWHERE status = 'succeeded'\nGROUP BY merchant_id\nORDER BY gpv_usd DESC;"
    },
    {
      "id": "m2e3",
      "lvl": 3,
      "priority": "should",
      "title": "Multi-key grouping",
      "prompt": "For each merchant <em>and</em> payment_method, return charge count and succeeded count.",
      "hints": [
        "GROUP BY two columns.",
        "Succeeded count via <code class='inline'>COUNT(*) FILTER (WHERE status='succeeded')</code> or SUM(CASE...)."
      ],
      "solution": "SELECT merchant_id, payment_method,\n       COUNT(*) AS attempts,\n       COUNT(*) FILTER (WHERE status = 'succeeded') AS succeeded\nFROM charges\nGROUP BY merchant_id, payment_method\nORDER BY merchant_id, payment_method;"
    },
    {
      "id": "m2e4",
      "lvl": 4,
      "priority": "should",
      "title": "HAVING on a ratio + volume floor",
      "prompt": "Find merchants whose succeeded rate is BELOW 85%, but only consider merchants with at least 200 charges.",
      "hints": [
        "Rate = succeeded / attempts; use FILTER counts.",
        "Two HAVING conditions ANDed; cast to avoid integer division."
      ],
      "solution": "SELECT merchant_id,\n       COUNT(*) AS attempts,\n       COUNT(*) FILTER (WHERE status = 'succeeded')::numeric\n         / COUNT(*) AS success_rate\nFROM charges\nGROUP BY merchant_id\nHAVING COUNT(*) >= 200\n   AND COUNT(*) FILTER (WHERE status = 'succeeded')::numeric\n         / COUNT(*) < 0.85;"
    },
    {
      "id": "m2e5",
      "lvl": 5,
      "priority": "stretch",
      "title": "Interview-hard (timed 6 min)",
      "prompt": "<strong>Prompt is deliberately vague:</strong> \"Which merchants look unhealthy on payments this month?\" Define a metric, build it, and defend it. Produce one row per merchant with attempts, success_rate, and a flag for merchants below 80% on ≥300 attempts this calendar month.",
      "hints": [
        "Clarify: 'unhealthy' = low success rate. Pick a threshold and a volume floor and SAY so.",
        "'This month' = DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())."
      ],
      "solution": "SELECT merchant_id,\n       COUNT(*) AS attempts,\n       ROUND(COUNT(*) FILTER (WHERE status='succeeded')::numeric\n             / COUNT(*), 3) AS success_rate,\n       (COUNT(*) >= 300\n        AND COUNT(*) FILTER (WHERE status='succeeded')::numeric\n            / COUNT(*) < 0.80) AS unhealthy_flag\nFROM charges\nWHERE status IN ('succeeded','failed')           -- exclude in-flight pending\n  AND DATE_TRUNC('month', created_at)\n      = DATE_TRUNC('month', NOW())\nGROUP BY merchant_id\nORDER BY success_rate ASC;"
    },
    {
      "id": "m2e6",
      "lvl": 2,
      "priority": "should",
      "title": "Charges and gross by status",
      "prompt": "For merchant 101, return one row per status with the count of charges and the summed amount (USD) in that status, most common status first.",
      "hints": [
        "GROUP BY status.",
        "SUM(amount)/100.0 for dollars."
      ],
      "solution": "SELECT status, COUNT(*) AS n, SUM(amount)/100.0 AS gross_usd\nFROM charges\nWHERE merchant_id = 101\nGROUP BY status\nORDER BY n DESC;"
    },
    {
      "id": "m2e7",
      "lvl": 3,
      "priority": "should",
      "title": "High-volume merchants (floor)",
      "prompt": "Return merchants with at least 1000 total charges, plus their succeeded-charge count, busiest first.",
      "hints": [
        "Volume floor goes in HAVING.",
        "Conditional count with FILTER for succeeded."
      ],
      "solution": "SELECT merchant_id, COUNT(*) AS attempts,\n  COUNT(*) FILTER (WHERE status='succeeded') AS succeeded\nFROM charges\nGROUP BY merchant_id\nHAVING COUNT(*) >= 1000\nORDER BY attempts DESC;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "After GROUP BY merchant_id, what is ONE output row?",
      "options": [
        "One charge",
        "One merchant (one group)",
        "One status",
        "One customer"
      ],
      "answer": 1,
      "why": "GROUP BY collapses each group to a single row — here, one per merchant.",
      "concept": "group grain"
    },
    {
      "level": 1,
      "q": "\"Merchants with more than 500 charges\" is filtered with:",
      "options": [
        "WHERE COUNT(*) > 500",
        "HAVING COUNT(*) > 500",
        "WHERE n > 500",
        "LIMIT 500"
      ],
      "answer": 1,
      "why": "It's a condition on an aggregate, so it belongs in HAVING (after grouping).",
      "concept": "HAVING vs WHERE"
    },
    {
      "level": 2,
      "q": "GPV per merchant (succeeded, dollars). Which is right?",
      "options": [
        "SELECT merchant_id, SUM(amount) FROM charges GROUP BY merchant_id",
        "SELECT merchant_id, SUM(amount)/100.0 FROM charges WHERE status='succeeded' GROUP BY merchant_id",
        "SELECT SUM(amount) FROM charges",
        "SELECT COUNT(*) FROM charges GROUP BY merchant_id"
      ],
      "answer": 1,
      "why": "Filter succeeded, sum cents, divide by 100.0, group by merchant.",
      "concept": "grouped sum"
    },
    {
      "level": 3,
      "q": "COUNT(*) and COUNT(failure_code) per merchant differ because:",
      "options": [
        "They're always identical",
        "COUNT(col) ignores NULLs, so it counts only failed charges (those have a code)",
        "COUNT(*) ignores NULLs",
        "COUNT(col) errors on NULL"
      ],
      "answer": 1,
      "why": "COUNT(col) skips NULLs; succeeded charges have NULL failure_code, so COUNT(failure_code) ≈ failed count.",
      "concept": "COUNT semantics"
    },
    {
      "level": 5,
      "q": "Computing success rate by merchant — which clarification matters MOST first?",
      "options": [
        "Table alias style",
        "Whether in-flight pending charges count in the denominator, plus a volume floor for tiny merchants",
        "Output column order",
        "AVG vs SUM"
      ],
      "answer": 1,
      "why": "Denominator definition and a volume floor change the answer and the ranking; nail them before coding.",
      "concept": "denominator + floor"
    }
  ],
  "mistakes": [
    "Filtering an aggregate in WHERE instead of HAVING.",
    "Selecting a non-aggregated column that isn't in GROUP BY.",
    "Integer division when computing a rate.",
    "Shrinking the denominator by filtering status in WHERE when you needed a conditional count."
  ],
  "edges": [
    "A merchant with zero charges simply doesn't appear (no row) — if you need it shown as 0, you'd LEFT JOIN from a merchant list (M4).",
    "<code class='inline'>COUNT(*)</code> vs <code class='inline'>COUNT(col)</code> differ whenever the column has NULLs."
  ],
  "interview": "<p>The senior move: <em>\"Let me define the metric and the denominator first. Success rate = succeeded ÷ attempted. I'll decide whether pending counts — I'll exclude in-flight pending. I'll add a volume floor so noisy small merchants don't dominate, and I'll filter groups with HAVING, not WHERE, because the floor is an aggregate condition.\"</em></p>",
  "followup": {
    "prompt": "PM: \"Can we see this trend week over week instead of one number?\"",
    "answer": "Yes — group by <code class='inline'>DATE_TRUNC('week', created_at)</code> as an extra key (M7), or use a window function to compare each week to the prior (M6). The grain becomes one row per merchant per week."
  }
};

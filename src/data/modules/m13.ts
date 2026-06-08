import type { Module } from '@/types';

/* Learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m13: Module = {
  "id": "m13",
  "day": "Day 5",
  "badge": "advanced",
  "title": "Failed-Payment Recovery",
  "skill": "recovery",
  "bcolor": "volcano",
  "concept": "<p>A failed charge isn't always lost revenue: a later retry can succeed. <strong>Recovery</strong> is when a failed payment is followed by a successful one for the same customer within a <em>recovery window</em>. The metric Stripe cares about is the <strong>recovery rate</strong> = recovered failures ÷ total failures.</p>\n<p><strong>The unit is the failure, not the success.</strong> Count each failed charge once; ask \"was it followed by a success within N days?\" A single later success can rescue several earlier failures — so a success is <em>not</em> the unit, and you must never count successes as the numerator.</p>\n<p><strong>Direction and window matter.</strong> The success must come <em>after</em> the failure (<code class=\"inline\">s.created_at &gt; f.created_at</code>) and within the window (<code class=\"inline\">&lt;= f.created_at + INTERVAL '7 days'</code>). A success that happened <em>before</em> the failure, or months later, is not a recovery of that failure.</p>\n<p><strong>Two ways to express \"a later success exists.\"</strong> A correlated <code class=\"inline\">EXISTS</code> / self-join checks \"is there a succeeded charge for this customer in the window after this failure?\" A window-function approach orders each customer's charges and uses <code class=\"inline\">LEAD</code> to look at the next event — both answer the same question; <code class=\"inline\">EXISTS</code> reads most clearly for a yes/no recovery flag.</p>\n<div class=\"callout warn\"><span class=\"t\">Denominator discipline</span>Recovery rate is recovered failures ÷ <em>all</em> failures in the window. Counting successes, or letting one success inflate the numerator by the failures it rescued, both corrupt the rate. One failure → one yes/no recovery flag.</div>",
  "sqlPattern": "WITH failures AS (\n  SELECT charge_id, customer_id, created_at\n  FROM charges\n  WHERE status = 'failed'\n    AND created_at >= NOW() - INTERVAL '90 days'\n),\nrecovered AS (\n  SELECT f.charge_id\n  FROM failures f\n  WHERE EXISTS (\n    SELECT 1 FROM charges s\n    WHERE s.customer_id = f.customer_id\n      AND s.status = 'succeeded'\n      AND s.created_at >  f.created_at\n      AND s.created_at <= f.created_at + INTERVAL '7 days'\n  )\n)\nSELECT (SELECT COUNT(*) FROM failures)  AS failures,\n       (SELECT COUNT(*) FROM recovered) AS recovered,\n       ROUND((SELECT COUNT(*) FROM recovered)::numeric\n             / NULLIF((SELECT COUNT(*) FROM failures), 0), 4) AS recovery_rate;",
  "schemaRefs": [
    "charges",
    "customers",
    "merchants",
    "invoices"
  ],
  "pysupport": "# Recovery rate = failures followed by a success within the window, over all failures.\nby_cust = {}\nfor ch in charges:\n    by_cust.setdefault(ch[\"customer_id\"], []).append(ch)\n\ntotal = recovered = 0\nfor rows in by_cust.values():\n    rows.sort(key=lambda r: r[\"created_at\"])     # order each customer's charges in time\n    for i, f in enumerate(rows):\n        if f[\"status\"] != \"failed\":\n            continue\n        total += 1                                # the unit is the failure\n        later = rows[i + 1:]\n        if any(s[\"status\"] == \"succeeded\" for s in later):   # a later success in window\n            recovered += 1\nrecovery_rate = recovered / total",
  "reasoning": {
    "question": "\"Of payments that failed, what fraction recovered — a later attempt succeeded — within the recovery window?\"",
    "grain": "One row per failed charge gets a yes/no recovery flag; the summary is one row (or per merchant).",
    "included": "Failed charges in the window form the denominator base.",
    "excluded": "Successes are not units; a success that precedes the failure or falls outside the window is not a recovery.",
    "table": "<code class=\"inline\">charges</code> self-referenced: failures vs later successes for the same <code class=\"inline\">customer_id</code>.",
    "metric": "Recovery rate = recovered failures ÷ total failures.",
    "denom": "All failed charges in the window — count each once; never the success count.",
    "wrong": "Counting successes as the numerator; matching a success that came before the failure; ignoring the recovery window.",
    "validate": "recovered ≤ failures; recovery_rate ∈ 0–1; each failure contributes one flag regardless of how many successes follow."
  },
  "predicts": [
    {
      "prompt": "Customer 7: failure on day 1, success on day 3, failure on day 10 (no success after). With a 7-day window, how many failures and how many recovered?",
      "query": "-- customer 7 charges, in order:\n--   day 1  failed\n--   day 3  succeeded\n--   day 10 failed   (no later success)",
      "options": [
        "1 failure, 1 recovered",
        "2 failures, 1 recovered (the day-1 failure)",
        "2 failures, 2 recovered",
        "1 failure, 0 recovered"
      ],
      "answer": 1,
      "explain": "Two failures. The day-1 failure has a success on day 3 (within 7 days) → recovered. The day-10 failure has no later success → not recovered. recovery_rate = 1/2."
    },
    {
      "prompt": "One success on day 5 follows two failures (day 1 and day 4) for the same customer, all within the window. How many recoveries are counted?",
      "query": "-- day 1 failed, day 4 failed, day 5 succeeded",
      "options": [
        "1 — a success counts once",
        "2 — both failures were followed by a success within the window",
        "3",
        "0"
      ],
      "answer": 1,
      "explain": "The unit is the failure. Both the day-1 and day-4 failures have a later success within 7 days, so both are recovered (2). The single success is not the unit — it just satisfies the EXISTS for each failure."
    }
  ],
  "debugs": [
    {
      "title": "Counting successes instead of failures",
      "prompt": "Goal: recovery rate = recovered failures ÷ failures. This computes successes ÷ failures, which can exceed 1 and isn't a recovery rate.",
      "broken": "SELECT COUNT(*) FILTER (WHERE status='succeeded') AS recovered,\n       COUNT(*) FILTER (WHERE status='failed')    AS failures,\n       ROUND(COUNT(*) FILTER (WHERE status='succeeded')::numeric\n             / NULLIF(COUNT(*) FILTER (WHERE status='failed'),0), 4) AS recovery_rate\nFROM charges\nWHERE created_at >= NOW() - INTERVAL '90 days';",
      "hint": "Recovery is a property of a FAILURE (was it followed by a success in the window?), not a count of successes. Successes ≠ recoveries.",
      "fixed": "WITH failures AS (\n  SELECT charge_id, customer_id, created_at\n  FROM charges WHERE status='failed' AND created_at >= NOW() - INTERVAL '90 days'\n),\nrecovered AS (\n  SELECT f.charge_id FROM failures f\n  WHERE EXISTS (\n    SELECT 1 FROM charges s\n    WHERE s.customer_id=f.customer_id AND s.status='succeeded'\n      AND s.created_at > f.created_at\n      AND s.created_at <= f.created_at + INTERVAL '7 days')\n)\nSELECT (SELECT COUNT(*) FROM failures) AS failures,\n       (SELECT COUNT(*) FROM recovered) AS recovered,\n       ROUND((SELECT COUNT(*) FROM recovered)::numeric / NULLIF((SELECT COUNT(*) FROM failures),0),4) AS recovery_rate;",
      "why": "The numerator must be failures that were <em>recovered</em> (a later success in the window), found via EXISTS — not the raw number of successes, which has no fixed relationship to failures."
    },
    {
      "title": "Matching a success that came before the failure",
      "prompt": "Goal: a failure is recovered only by a LATER success. This self-join matches any success for the customer, including earlier ones, over-counting recoveries.",
      "broken": "SELECT COUNT(DISTINCT f.charge_id) AS recovered\nFROM charges f\nJOIN charges s\n  ON s.customer_id = f.customer_id\n AND s.status = 'succeeded'\nWHERE f.status = 'failed'\n  AND s.created_at <= f.created_at + INTERVAL '7 days';",
      "hint": "There's no lower bound on the success time — a success from last week 'recovers' a failure today.",
      "fixed": "SELECT COUNT(DISTINCT f.charge_id) AS recovered\nFROM charges f\nJOIN charges s\n  ON s.customer_id = f.customer_id\n AND s.status = 'succeeded'\n AND s.created_at >  f.created_at\n AND s.created_at <= f.created_at + INTERVAL '7 days'\nWHERE f.status = 'failed';",
      "why": "Recovery requires the success to be strictly <em>after</em> the failure and within the window. Without <code class='inline'>s.created_at &gt; f.created_at</code>, unrelated earlier successes are matched and the recovery count balloons."
    }
  ],
  "exercises": [
    {
      "id": "m13e1",
      "lvl": 1,
      "priority": "required",
      "title": "Count failed charges (last 90 days)",
      "prompt": "Per merchant, the number of failed charges in the last 90 days. <em>Grain: one row per merchant. This is the recovery-rate denominator base.</em>",
      "hints": [
        "Filter status='failed' AND created_at >= NOW() - INTERVAL '90 days'.",
        "GROUP BY merchant_id, COUNT(*)."
      ],
      "solution": "SELECT merchant_id, COUNT(*) AS failures\nFROM charges\nWHERE status='failed'\n  AND created_at >= NOW() - INTERVAL '90 days'\nGROUP BY merchant_id\nORDER BY failures DESC;"
    },
    {
      "id": "m13e2",
      "lvl": 2,
      "priority": "required",
      "title": "Flag each failure as recovered or not",
      "prompt": "For failures in the last 90 days, return charge_id and a boolean <code class='inline'>recovered</code> = a succeeded charge exists for the same customer within 7 days after the failure. <em>Grain: one row per failed charge.</em>",
      "hints": [
        "Use EXISTS correlated on customer_id with the success strictly after the failure and within 7 days.",
        "<code class='inline'>s.created_at > f.created_at AND s.created_at <= f.created_at + INTERVAL '7 days'</code>."
      ],
      "solution": "SELECT f.charge_id,\n       EXISTS (\n         SELECT 1 FROM charges s\n         WHERE s.customer_id = f.customer_id\n           AND s.status='succeeded'\n           AND s.created_at >  f.created_at\n           AND s.created_at <= f.created_at + INTERVAL '7 days'\n       ) AS recovered\nFROM charges f\nWHERE f.status='failed'\n  AND f.created_at >= NOW() - INTERVAL '90 days';"
    },
    {
      "id": "m13e3",
      "lvl": 3,
      "priority": "should",
      "title": "Recovery rate per merchant",
      "prompt": "Per merchant, failures, recovered failures, and recovery_rate over the last 90 days (7-day window). <em>Grain: one row per merchant. Validation: recovered ≤ failures; rate ∈ 0–1.</em>",
      "hints": [
        "failures CTE; mark each recovered via EXISTS; aggregate per merchant.",
        "COUNT(*) FILTER (WHERE recovered) / NULLIF(COUNT(*),0)."
      ],
      "solution": "WITH failures AS (\n  SELECT charge_id, merchant_id, customer_id, created_at\n  FROM charges\n  WHERE status='failed' AND created_at >= NOW() - INTERVAL '90 days'\n),\nflagged AS (\n  SELECT f.merchant_id,\n         EXISTS (\n           SELECT 1 FROM charges s\n           WHERE s.customer_id=f.customer_id AND s.status='succeeded'\n             AND s.created_at > f.created_at\n             AND s.created_at <= f.created_at + INTERVAL '7 days'\n         ) AS recovered\n  FROM failures f\n)\nSELECT merchant_id,\n       COUNT(*) AS failures,\n       COUNT(*) FILTER (WHERE recovered) AS recovered,\n       ROUND(COUNT(*) FILTER (WHERE recovered)::numeric / NULLIF(COUNT(*),0), 4) AS recovery_rate\nFROM flagged\nGROUP BY merchant_id\nORDER BY recovery_rate DESC;"
    },
    {
      "id": "m13e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "Window-function approach: next success after each failure",
      "prompt": "Using a window function, for each failed charge find the customer's NEXT succeeded charge time and flag recovered if it's within 7 days. <em>Grain: one row per failed charge. Show the LEAD/ordered alternative to EXISTS.</em>",
      "hints": [
        "Order each customer's events; for failures, find the earliest later success.",
        "A correlated MIN subquery or LEAD over an ordered, success-only frame both work; keep the window bound."
      ],
      "solution": "WITH failures AS (\n  SELECT charge_id, customer_id, created_at\n  FROM charges WHERE status='failed' AND created_at >= NOW() - INTERVAL '90 days'\n),\nnext_success AS (\n  SELECT f.charge_id,\n         f.created_at,\n         (SELECT MIN(s.created_at)\n          FROM charges s\n          WHERE s.customer_id = f.customer_id\n            AND s.status='succeeded'\n            AND s.created_at > f.created_at) AS next_success_at\n  FROM failures f\n)\nSELECT charge_id,\n       next_success_at,\n       (next_success_at IS NOT NULL\n        AND next_success_at <= created_at + INTERVAL '7 days') AS recovered\nFROM next_success;"
    },
    {
      "id": "m13e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: recovery rate by failure week",
      "prompt": "Per week of failure (bucket on the failure's created_at), report failures, recovered (success within 7 days), and recovery_rate over the last 8 weeks. State the recovery window, keep the denominator the failures, and flag that the newest week is immature (its failures may still recover). <em>Validation: recovered ≤ failures per week; rate ∈ 0–1.</em>",
      "hints": [
        "Bucket failures with DATE_TRUNC('week', created_at).",
        "Mark recovery via EXISTS (later success within 7 days); aggregate per week.",
        "The most recent week's failures haven't had 7 days to recover — say so."
      ],
      "solution": "WITH failures AS (\n  SELECT charge_id, customer_id, created_at,\n         DATE_TRUNC('week', created_at) AS fail_week\n  FROM charges\n  WHERE status='failed'\n    AND created_at >= NOW() - INTERVAL '8 weeks'\n),\nflagged AS (\n  SELECT f.fail_week,\n         EXISTS (\n           SELECT 1 FROM charges s\n           WHERE s.customer_id=f.customer_id AND s.status='succeeded'\n             AND s.created_at > f.created_at\n             AND s.created_at <= f.created_at + INTERVAL '7 days'\n         ) AS recovered\n  FROM failures f\n)\nSELECT fail_week,\n       COUNT(*) AS failures,\n       COUNT(*) FILTER (WHERE recovered) AS recovered,\n       ROUND(COUNT(*) FILTER (WHERE recovered)::numeric / NULLIF(COUNT(*),0), 4) AS recovery_rate\nFROM flagged\nGROUP BY fail_week\nORDER BY fail_week;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "What is failed-payment recovery?",
      "options": [
        "Refunding a customer",
        "A failed charge being followed by a successful retry within a recovery window",
        "A dispute being won",
        "Deleting failed charges"
      ],
      "answer": 1,
      "why": "Recovery is when a payment that failed is later retried successfully within a defined window — turning a would-be loss into revenue.",
      "concept": "recovery definition"
    },
    {
      "level": 1,
      "q": "For a failure to be 'recovered', the matching success must be:",
      "options": [
        "Any success for the customer, any time",
        "A success strictly after the failure and within the recovery window",
        "A success before the failure",
        "A refund"
      ],
      "answer": 1,
      "why": "Recovery is directional and time-bounded: the success must come after the failure and inside the window (e.g. 7 days).",
      "concept": "direction + window"
    },
    {
      "level": 2,
      "q": "Which expression flags a failure as recovered?",
      "options": [
        "COUNT(*) FILTER (WHERE status='succeeded')",
        "EXISTS (succeeded charge, same customer, created_at > failure AND within 7 days)",
        "SUM(amount)",
        "status='failed' AND status='succeeded'"
      ],
      "answer": 1,
      "why": "A correlated EXISTS checking for a later succeeded charge in the window gives the per-failure yes/no recovery flag.",
      "concept": "exists flag"
    },
    {
      "level": 4,
      "q": "One success follows two failures within the window. How many recoveries, and what's the denominator?",
      "options": [
        "1 recovery; denominator = successes",
        "2 recoveries (both failures); denominator = all failures",
        "1 recovery; denominator = all failures",
        "3 recoveries"
      ],
      "answer": 1,
      "why": "The unit is the failure: both failures are recovered (2). The denominator is all failures, never the success count.",
      "concept": "denominator discipline"
    },
    {
      "level": 5,
      "q": "Asked for recovery rate in an interview, what do you state?",
      "options": [
        "Just write SUM(amount)",
        "The recovery window, that the unit is the failure (success strictly after, within window), the denominator is all failures, and that the newest period is immature",
        "That successes are the numerator",
        "Nothing"
      ],
      "answer": 1,
      "why": "Precision wins: define the window, make the failure the unit with a directional/time-bounded match, keep the denominator as all failures, and flag immature recent periods.",
      "concept": "interview judgment"
    }
  ],
  "mistakes": [
    "Counting successes as the numerator instead of recovered failures.",
    "Matching a success that occurred before the failure (no direction guard).",
    "Ignoring the recovery window so a success months later counts.",
    "Letting one success inflate the numerator by every failure it rescued — it's one flag per failure, not per success.",
    "Reading the newest period's recovery rate as final before its failures have had time to recover."
  ],
  "edges": [
    "A failure with no customer activity afterwards is simply not recovered (flag false, still in the denominator).",
    "Multiple failures rescued by one success are each recovered — count the failures, once each.",
    "Recovery window choice (1, 3, 7, 30 days) changes the rate — pick and state it; the newest window is immature."
  ],
  "interview": "<p>Define the recovery precisely: <em>\"The unit is a failed charge in the window. It's recovered if the same customer has a succeeded charge strictly after it and within 7 days — an <code class='inline'>EXISTS</code>. Recovery rate is recovered failures over <em>all</em> failures; one success can rescue several failures, so I count failures, not successes. The most recent week is immature because its failures may still recover.\"</em> That direction, window, and denominator discipline is the whole skill.</p>",
  "followup": {
    "prompt": "Interviewer: \"What's the median time-to-recovery for recovered failures?\"",
    "answer": "For each recovered failure I'd compute its next-success time minus the failure time (the MIN later success within the window), then take <code class='inline'>PERCENTILE_CONT(0.5)</code> over those gaps. The window-function/next-success step from this module gives exactly that gap per failure."
  }
};

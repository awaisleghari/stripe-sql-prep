import type { Module } from '@/types';

/* MIGRATED learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m3: Module = {
  "id": "m3",
  "day": "Day 2",
  "badge": "intermediate",
  "title": "CASE WHEN & Conditional Aggregation",
  "skill": "case",
  "bcolor": "gold",
  "concept": "<p><code class=\"inline\">CASE WHEN ... THEN ... ELSE ... END</code> is SQL's <code class=\"inline\">if/else</code>. It returns a value per row, so you can bucket, relabel, or compute flags.</p>\n<p>The superpower is <strong>conditional aggregation</strong>: wrap a CASE inside an aggregate to compute rates and segmented sums in one pass. <code class=\"inline\">AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END)</code> is literally the success rate — it's the mean of a 0/1 indicator: the share of rows where the flag is 1, which is exactly what a rate is.</p>\n<div class=\"callout warn\"><span class=\"t\">The integer-division trap</span>Use <code class=\"inline\">1.0</code>, not <code class=\"inline\">1</code>. <code class=\"inline\">SUM(CASE WHEN ... THEN 1 END)/COUNT(*)</code> with integer literals does integer division and returns 0.</div>",
  "sqlPattern": "SELECT merchant_id,\n  AVG(CASE WHEN status = 'succeeded' THEN 1.0 ELSE 0 END) AS success_rate\nFROM charges\nGROUP BY merchant_id;",
  "schemaRefs": [
    "charges"
  ],
  "pysupport": "# success rate per merchant = successes / attempts\nagg = {}\nfor c in charges:\n    a = agg.setdefault(c[\"merchant_id\"], {\"succ\": 0, \"att\": 0})\n    a[\"att\"] += 1\n    if c[\"status\"] == \"succeeded\":\n        a[\"succ\"] += 1\nrate = {m: a[\"succ\"] / a[\"att\"] for m, a in agg.items()}  # float division on purpose",
  "reasoning": {
    "question": "\"What share of each merchant's attempts succeeded?\"",
    "grain": "One row per merchant.",
    "included": "Charge attempts in the time window.",
    "excluded": "Possibly in-flight pending charges — clarify and state your choice.",
    "table": "<code class=\"inline\">charges</code>.",
    "metric": "Success rate = the average of a 0/1 success flag = <code class=\"inline\">AVG(CASE WHEN succeeded THEN 1.0 ELSE 0 END)</code>.",
    "denom": "All eligible attempts — not just successes. (A refund rate's denominator is succeeded charges instead.)",
    "wrong": "Integer division (use <code class=\"inline\">1.0</code>); wrong denominator; join fan-out inflating counts before you aggregate.",
    "validate": "Every rate in 0–1; Northwind Coffee (our high-failure merchant) ranks worst."
  },
  "predicts": [
    {
      "prompt": "4 charges: succeeded, succeeded, failed, succeeded. What does this return?",
      "query": "SELECT SUM(CASE WHEN status='succeeded'\n                THEN 1 ELSE 0 END) / COUNT(*) AS rate\nFROM charges;",
      "options": [
        "0.75",
        "0",
        "1",
        "3"
      ],
      "answer": 1,
      "explain": "3/4 in integer division = <strong>0</strong>. The numerator and denominator are both integers. Fix: <code class='inline'>THEN 1.0</code>, or <code class='inline'>AVG(CASE WHEN ... THEN 1.0 ELSE 0 END)</code>, or cast: <code class='inline'>SUM(...)::numeric/COUNT(*)</code>."
    },
    {
      "prompt": "A merchant has exactly 4 charges: succeeded, succeeded, failed, pending. What does this return?",
      "query": "SELECT AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS rate\nFROM charges;",
      "options": [
        "0.50",
        "0.67",
        "0.75",
        "2.0"
      ],
      "answer": 0,
      "explain": "2 of the 4 rows are succeeded → mean of the 0/1 flag = 0.50. Pending counts in the denominator here."
    },
    {
      "prompt": "Same 4 charges (2 succeeded of 4). What does the integer version return?",
      "query": "SELECT SUM(CASE WHEN status='succeeded' THEN 1 ELSE 0 END) / COUNT(*) AS rate\nFROM charges;",
      "options": [
        "0.50",
        "0",
        "0.75",
        "NULL"
      ],
      "answer": 1,
      "explain": "Integer ÷ integer truncates toward zero: 2 / 4 = 0. Always use 1.0 (or ::numeric) for rates."
    }
  ],
  "debugs": [
    {
      "prompt": "Success rate per merchant — but every rate comes back as 0 or 1.",
      "broken": "SELECT merchant_id,\n       SUM(CASE WHEN status='succeeded' THEN 1 ELSE 0 END)\n         / COUNT(*) AS success_rate\nFROM charges\nGROUP BY merchant_id;",
      "hint": "Integer ÷ integer = integer.",
      "fixed": "SELECT merchant_id,\n       AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate\nFROM charges\nGROUP BY merchant_id;",
      "why": "<code class='inline'>AVG(CASE ... 1.0 ...)</code> is the cleanest fix — float literal, no separate divisor, and it's the mean of the indicator."
    },
    {
      "title": "the denominator got filtered away",
      "prompt": "Intended: success rate = succeeded ÷ all attempts. This always returns 1.0.",
      "broken": "SELECT merchant_id,\n  AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS rate\nFROM charges\nWHERE status='succeeded'\nGROUP BY merchant_id;",
      "hint": "What does the WHERE clause leave in the denominator?",
      "fixed": "SELECT merchant_id,\n  AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS rate\nFROM charges\nGROUP BY merchant_id;",
      "why": "Filtering to succeeded rows first means every remaining row is a success → rate 1.0. The denominator must include all attempts; do the success test inside CASE, not in WHERE."
    },
    {
      "title": "COUNT(col) skips NULLs",
      "prompt": "Intended: total attempts per merchant. failure_code is NULL on succeeded charges, and this undercounts.",
      "broken": "SELECT merchant_id, COUNT(failure_code) AS attempts\nFROM charges\nGROUP BY merchant_id;",
      "hint": "How does COUNT(column) treat NULLs versus COUNT(*)?",
      "fixed": "SELECT merchant_id, COUNT(*) AS attempts\nFROM charges\nGROUP BY merchant_id;",
      "why": "COUNT(col) ignores NULLs, so it counted only the failed charges (which have a code). COUNT(*) counts every row regardless of NULLs."
    }
  ],
  "exercises": [
    {
      "id": "m3e1",
      "lvl": 1,
      "priority": "required",
      "title": "Bucket amounts",
      "prompt": "Label each charge <code class='inline'>small</code> (<$10), <code class='inline'>medium</code> ($10–$100), or <code class='inline'>large</code> (>$100). Return <code class='inline'>charge_id</code> and <code class='inline'>tier</code>.",
      "hints": [
        "Amounts are cents: $10 = 1000."
      ],
      "solution": "SELECT charge_id,\n       CASE WHEN amount < 1000  THEN 'small'\n            WHEN amount <= 10000 THEN 'medium'\n            ELSE 'large' END AS tier\nFROM charges;"
    },
    {
      "id": "m3e2",
      "lvl": 2,
      "priority": "required",
      "title": "Payment success rate by merchant",
      "prompt": "For each merchant, the share of charge attempts that succeeded in the last 30 days. Only merchants with ≥100 attempts. Worst first.",
      "hints": [
        "AVG(CASE ... 1.0 ...).",
        "Volume floor → HAVING.",
        "Time window → WHERE."
      ],
      "solution": "SELECT merchant_id,\n       COUNT(*) AS attempts,\n       AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate\nFROM charges\nWHERE created_at >= NOW() - INTERVAL '30 days'\nGROUP BY merchant_id\nHAVING COUNT(*) >= 100\nORDER BY success_rate ASC;"
    },
    {
      "id": "m3e3",
      "lvl": 3,
      "priority": "should",
      "title": "Success AND refund rate together",
      "prompt": "In one query per merchant: attempts, success_rate, and refund_rate (refunds ÷ succeeded charges). A LEFT JOIN to refunds is allowed.",
      "hints": [
        "Refund rate denominator = succeeded charges, not all attempts.",
        "Count distinct refunded charges, or count refunds — decide and state it."
      ],
      "solution": "SELECT c.merchant_id,\n       COUNT(*) AS attempts,\n       AVG(CASE WHEN c.status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate,\n       COUNT(DISTINCT r.charge_id)::numeric\n         / NULLIF(COUNT(*) FILTER (WHERE c.status='succeeded'),0) AS refund_rate\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nGROUP BY c.merchant_id;"
    },
    {
      "id": "m3e4",
      "lvl": 4,
      "priority": "should",
      "title": "Edge-heavy success rate",
      "prompt": "Success rate per merchant for the last 30 days where: pending excluded from denominator; multi-currency merchants reported per currency; only (merchant,currency) cells with ≥50 attempts.",
      "hints": [
        "GROUP BY merchant_id, currency.",
        "Exclude pending in WHERE.",
        "Floor in HAVING."
      ],
      "solution": "SELECT merchant_id, currency,\n       COUNT(*) AS attempts,\n       AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate\nFROM charges\nWHERE status IN ('succeeded','failed')\n  AND created_at >= NOW() - INTERVAL '30 days'\nGROUP BY merchant_id, currency\nHAVING COUNT(*) >= 50\nORDER BY merchant_id, currency;"
    },
    {
      "id": "m3e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final-boss (timed 8 min): decline-reason breakdown",
      "prompt": "For each merchant with >500 attempts in 30 days, find each failure_code's share of that merchant's FAILED charges, and flag merchants whose single largest decline reason is <code class='inline'>insufficient_funds</code> exceeding 40% of failures. Output one row per merchant: top_reason, top_reason_share, flag.",
      "hints": [
        "Build in CTEs: (1) failures per merchant per code, (2) rank within merchant, (3) keep rank 1.",
        "failure_code is NULL on succeeded charges — restrict to failed."
      ],
      "solution": "WITH fails AS (\n  SELECT merchant_id, failure_code,\n         COUNT(*) AS n\n  FROM charges\n  WHERE status = 'failed'\n    AND created_at >= NOW() - INTERVAL '30 days'\n  GROUP BY merchant_id, failure_code\n),\ntot AS (\n  SELECT merchant_id, SUM(n) AS fail_total,\n         COUNT(*) FILTER (WHERE TRUE) AS dummy\n  FROM fails GROUP BY merchant_id\n),\nranked AS (\n  SELECT f.merchant_id, f.failure_code, f.n,\n         f.n::numeric / t.fail_total AS share,\n         ROW_NUMBER() OVER (PARTITION BY f.merchant_id\n                            ORDER BY f.n DESC) AS rk\n  FROM fails f JOIN tot t USING (merchant_id)\n)\nSELECT r.merchant_id,\n       r.failure_code  AS top_reason,\n       ROUND(r.share,3) AS top_reason_share,\n       (r.failure_code = 'insufficient_funds' AND r.share > 0.40) AS flag\nFROM ranked r\nJOIN charges c ON c.merchant_id = r.merchant_id\nWHERE r.rk = 1\nGROUP BY r.merchant_id, r.failure_code, r.share\nHAVING COUNT(*) FILTER (WHERE c.created_at >= NOW()-INTERVAL '30 days') > 500\nORDER BY top_reason_share DESC;"
    },
    {
      "id": "m3e6",
      "lvl": 2,
      "priority": "should",
      "title": "Succeeded count and gross by merchant",
      "prompt": "Per merchant, return the number of succeeded charges and the succeeded gross (USD).",
      "hints": [
        "Use FILTER (WHERE status='succeeded') on both COUNT and SUM."
      ],
      "solution": "SELECT merchant_id,\n  COUNT(*) FILTER (WHERE status='succeeded') AS succeeded,\n  SUM(amount) FILTER (WHERE status='succeeded')/100.0 AS gross_usd\nFROM charges\nGROUP BY merchant_id;"
    },
    {
      "id": "m3e7",
      "lvl": 3,
      "priority": "should",
      "title": "Card vs non-card success rate",
      "prompt": "For merchant 101, compare success rate for card vs non-card payments. Return one row per is_card flag with the rate and the attempt count.",
      "hints": [
        "GROUP BY (payment_method='card').",
        "AVG of a 0/1 success flag — remember 1.0."
      ],
      "solution": "SELECT (payment_method='card') AS is_card,\n  AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate,\n  COUNT(*) AS attempts\nFROM charges\nWHERE merchant_id = 101\nGROUP BY (payment_method='card');"
    },
    {
      "id": "m3e8",
      "lvl": 4,
      "priority": "stretch",
      "title": "Refund rate with the right denominator",
      "prompt": "Per merchant, refund rate = distinct refunded succeeded charges ÷ distinct succeeded charges. Only merchants with ≥200 succeeded charges, highest rate first.",
      "hints": [
        "LEFT JOIN refunds on charge_id.",
        "COUNT(DISTINCT) on both sides; floor in HAVING."
      ],
      "solution": "SELECT c.merchant_id,\n  COUNT(DISTINCT r.charge_id)::numeric\n    / COUNT(DISTINCT c.charge_id) AS refund_rate\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id\nHAVING COUNT(DISTINCT c.charge_id) >= 200\nORDER BY refund_rate DESC;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "The AVG of a 0/1 indicator column equals:",
      "options": [
        "The count of 1s",
        "The proportion of 1s (i.e. the rate)",
        "Always 0.5",
        "The sum of all rows"
      ],
      "answer": 1,
      "why": "Mean of a 0/1 flag = share of 1s. That's exactly a success/refund/dispute rate.",
      "concept": "indicator mean"
    },
    {
      "level": 1,
      "q": "Cleanest success-rate expression:",
      "options": [
        "SUM(status='succeeded')/COUNT(*)",
        "AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END)",
        "COUNT(status='succeeded')",
        "SUM(1)/COUNT(*)"
      ],
      "answer": 1,
      "why": "Float indicator, single pass, correct denominator.",
      "concept": "conditional aggregation"
    },
    {
      "level": 2,
      "q": "Refund rate's correct denominator is:",
      "options": [
        "All charges",
        "All attempts including failed",
        "Succeeded charges",
        "Disputed charges"
      ],
      "answer": 2,
      "why": "You can only refund a charge that succeeded.",
      "concept": "denominator"
    },
    {
      "level": 3,
      "q": "SUM(CASE WHEN s='succeeded' THEN 1 ELSE 0 END)/COUNT(*) returns 0. Why?",
      "options": [
        "Wrong table",
        "Integer ÷ integer truncates toward 0",
        "CASE syntax is invalid",
        "COUNT(*) is NULL"
      ],
      "answer": 1,
      "why": "Both sides are integers. Use 1.0, AVG(CASE … 1.0 …), or ::numeric.",
      "concept": "integer division"
    },
    {
      "level": 5,
      "q": "PM asks \"why is approval rate low?\" Best FIRST move:",
      "options": [
        "Immediately rewrite the query three ways",
        "Define approval rate + denominator, then segment by failure_code / method / country to localize",
        "Blame the card issuer",
        "Raise the volume floor"
      ],
      "answer": 1,
      "why": "Define the metric, then decompose by segments to find where the drop lives.",
      "concept": "metric tree"
    }
  ],
  "mistakes": [
    "Integer division in rates (the cardinal sin).",
    "Wrong denominator: refund rate over all attempts instead of succeeded.",
    "Join fan-out inflating counts before aggregation.",
    "Including succeeded rows when analysing failure_code."
  ],
  "edges": [
    "<code class='inline'>CASE</code> stops at the first matching WHEN — order your conditions from most-specific to least.",
    "A missing <code class='inline'>ELSE</code> defaults to NULL, which then disappears from SUM/AVG."
  ],
  "interview": "<p>Script: <em>\"Success rate is succeeded over attempted — the mean of a 0/1 indicator, so I'll use AVG(CASE WHEN succeeded THEN 1.0 ELSE 0). The grain is one row per merchant. My denominator is attempts; I'll decide pending explicitly. I'll add a volume floor in HAVING and validate that Northwind, our known high-failure merchant, lands at the bottom.\"</em> Calling out the integer-division trap before they catch it is a strong signal.</p>",
  "followup": {
    "prompt": "PM: \"Is a high insufficient_funds rate the merchant's fault or the customer's?\"",
    "answer": "Insufficient_funds is customer-side (the card lacked funds), so retrying later (smart dunning) often recovers it — unlike <code class='inline'>card_declined</code> which may signal fraud or a bad BIN. That's the bridge to M13 (failed-payment recovery)."
  }
};

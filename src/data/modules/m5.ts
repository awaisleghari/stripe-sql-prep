import type { Module } from '@/types';

/* Learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m5: Module = {
  "id": "m5",
  "day": "Day 3",
  "badge": "intermediate",
  "title": "CTEs & Subqueries",
  "skill": "cte",
  "bcolor": "geekblue",
  "concept": "<p>A <strong>CTE (Common Table Expression)</strong> is a <em>named, temporary result</em> you define at the top of a query with <code class=\"inline\">WITH</code>, then read from below as if it were a table. It exists only for that one query and disappears when the query finishes.</p>\n<p><strong>Mental model: a named intermediate step.</strong> Instead of one giant nested query, you build the answer in labelled stages — <code class=\"inline\">eligible_charges</code>, <code class=\"inline\">refunds_by_charge</code>, <code class=\"inline\">merchant_rollup</code> — and the final <code class=\"inline\">SELECT</code> reads top-to-bottom like a paragraph. You can define several, separated by commas, and a later CTE can read an earlier one.</p>\n<p><strong>Why this matters for Stripe-style data.</strong> The hard questions are metrics assembled from pieces: eligible charges, succeeded charges, refunds per charge, disputes per charge, a merchant-level denominator, then a final rate. The single most important reason to reach for a CTE is to <strong>pre-aggregate a one-to-many table to its target grain BEFORE joining</strong> — that is how you avoid <em>fan-out</em> (a charge with two refunds becoming two rows and double-counting your money).</p>\n<p><strong>CTEs vs subqueries.</strong> A subquery is an inline query inside <code class=\"inline\">FROM</code>, <code class=\"inline\">WHERE</code>, or <code class=\"inline\">SELECT</code> — perfect for a small scalar filter like <code class=\"inline\">WHERE amount &gt; (SELECT AVG(amount) FROM charges)</code>. A CTE is better when a step is multi-line, reused, or part of a sequence you want to read in order. Both can hold intermediate logic; CTEs usually win on <em>interview communication</em>, because the interviewer can follow your reasoning one named step at a time.</p>\n<div class=\"callout warn\"><span class=\"t\">A CTE is not a temp table</span>It lives only inside the single statement that defines it. You cannot reference <code class=\"inline\">eligible_charges</code> from a different query later — it vanishes when this query ends. Name steps for what they hold (<code class=\"inline\">eligible_charges</code>), never <code class=\"inline\">cte1</code>, <code class=\"inline\">cte2</code>.</div>",
  "sqlPattern": "WITH eligible_charges AS (\n  SELECT charge_id, merchant_id\n  FROM charges\n  WHERE status = 'succeeded'\n),\nrefunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n_refunds\n  FROM refunds\n  GROUP BY charge_id\n),\nmerchant_rollup AS (\n  SELECT e.merchant_id,\n         COUNT(*) AS succeeded,\n         COUNT(rbc.charge_id) AS refunded\n  FROM eligible_charges e\n  LEFT JOIN refunds_by_charge rbc USING (charge_id)\n  GROUP BY e.merchant_id\n)\nSELECT merchant_id, succeeded, refunded,\n       ROUND(refunded::numeric / NULLIF(succeeded, 0), 4) AS refund_rate\nFROM merchant_rollup\nORDER BY refund_rate DESC NULLS LAST;",
  "schemaRefs": [
    "charges",
    "refunds",
    "disputes",
    "merchants"
  ],
  "pysupport": "# A CTE is just a named intermediate result. In plain Python you build the\n# same named steps with lists and dicts (no pandas needed).\neligible = [c for c in charges if c[\"status\"] == \"succeeded\"]   # eligible_charges\n\nrefunds_by_charge = {}                                          # refunds_by_charge\nfor r in refunds:\n    refunds_by_charge[r[\"charge_id\"]] = refunds_by_charge.get(r[\"charge_id\"], 0) + 1\n\nrollup = {}                                                     # merchant_rollup\nfor c in eligible:\n    m = rollup.setdefault(c[\"merchant_id\"], {\"succeeded\": 0, \"refunded\": 0})\n    m[\"succeeded\"] += 1\n    if refunds_by_charge.get(c[\"charge_id\"]):\n        m[\"refunded\"] += 1\n# each `rollup[merchant_id]` is the final per-merchant row.",
  "reasoning": {
    "question": "\"Build a metric that needs several steps — e.g. each merchant's refund rate — without losing the grain or double-counting.\"",
    "grain": "Decide the final grain first (one row per merchant), then make every CTE end at a grain that composes toward it.",
    "included": "The eligible population is its own named step: succeeded charges only, in the chosen window.",
    "excluded": "Failed, pending, or out-of-window charges are filtered inside the first CTE, not bolted on at the end.",
    "table": "Each one-to-many source (<code class=\"inline\">refunds</code>, <code class=\"inline\">disputes</code>) gets pre-aggregated to <code class=\"inline\">charge_id</code> or <code class=\"inline\">merchant_id</code> in its own CTE before any join.",
    "metric": "The final SELECT computes the rate from already-clean, already-grained pieces.",
    "denom": "The denominator is the eligible count from the first CTE — never a count inflated by a downstream join.",
    "wrong": "Joining raw <code class=\"inline\">charges</code> to raw <code class=\"inline\">refunds</code> (and <code class=\"inline\">disputes</code>) and counting — fan-out multiplies rows and corrupts both numerator and denominator.",
    "validate": "Each CTE returns the row count you expect for its grain; the final rate sits in 0–1; a merchant with no refunds shows 0, not NULL or a missing row."
  },
  "predicts": [
    {
      "prompt": "Read the query. What is the output grain, which rows are included, and does <code class='inline'>eligible_charges</code> still exist after the query finishes?",
      "query": "WITH eligible_charges AS (\n  SELECT charge_id, merchant_id, amount\n  FROM charges\n  WHERE status = 'succeeded'\n)\nSELECT merchant_id, COUNT(*) AS succeeded_charges\nFROM eligible_charges\nGROUP BY merchant_id;",
      "options": [
        "One row per charge; all charges; the CTE persists as a table",
        "One row per merchant; only succeeded charges; the CTE exists only inside this query",
        "One row per merchant; all charges including failed; the CTE persists",
        "A syntax error — you can't GROUP BY a CTE"
      ],
      "answer": 1,
      "explain": "The final <code class='inline'>GROUP BY merchant_id</code> makes the grain one row per merchant. <code class='inline'>eligible_charges</code> only holds <code class='inline'>status = 'succeeded'</code> rows, so failed charges are excluded. A CTE is scoped to its single statement — it is gone the moment the query ends."
    },
    {
      "prompt": "<code class='inline'>refunds_by_charge</code> has one row per refunded charge. A succeeded charge with no refund LEFT JOINs to it. What does <code class='inline'>COUNT(rbc.charge_id)</code> count?",
      "query": "WITH refunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM refunds GROUP BY charge_id\n)\nSELECT c.merchant_id, COUNT(rbc.charge_id) AS refunded\nFROM charges c\nLEFT JOIN refunds_by_charge rbc USING (charge_id)\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id;",
      "options": [
        "Every succeeded charge (COUNT counts NULLs too)",
        "Only the succeeded charges that have a matching refund row (NULLs are skipped)",
        "Total number of refunds",
        "Always zero"
      ],
      "answer": 1,
      "explain": "<code class='inline'>COUNT(column)</code> skips NULLs, and the LEFT JOIN leaves <code class='inline'>rbc.charge_id</code> NULL for charges with no refund. So this counts refunded succeeded charges. Because refunds were pre-aggregated to one row per charge, there is no fan-out — the succeeded count stays correct."
    }
  ],
  "debugs": [
    {
      "title": "Raw join fan-out corrupts the denominator",
      "prompt": "Goal: per merchant, the count of succeeded charges and how many were refunded and disputed. Every number is inflated for active merchants.",
      "broken": "SELECT c.merchant_id,\n       COUNT(*) AS succeeded,\n       COUNT(r.refund_id) AS refunded,\n       COUNT(d.dispute_id) AS disputed\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nLEFT JOIN disputes d ON d.charge_id = c.charge_id\nWHERE c.status = 'succeeded'\nGROUP BY c.merchant_id;",
      "hint": "Both refunds and disputes are one-to-many on charge_id. Joining them to charges multiplies rows, so even COUNT(*) for succeeded charges is wrong.",
      "fixed": "WITH charges_base AS (\n  SELECT charge_id, merchant_id\n  FROM charges WHERE status = 'succeeded'\n),\nrefunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM refunds GROUP BY charge_id\n),\ndisputes_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM disputes GROUP BY charge_id\n)\nSELECT b.merchant_id,\n       COUNT(*) AS succeeded,\n       COUNT(rbc.charge_id) AS refunded,\n       COUNT(dbc.charge_id) AS disputed\nFROM charges_base b\nLEFT JOIN refunds_by_charge rbc USING (charge_id)\nLEFT JOIN disputes_by_charge dbc USING (charge_id)\nGROUP BY b.merchant_id;",
      "why": "Two one-to-many joins fan out twice: a succeeded charge with 2 refunds and 1 dispute becomes 2 × 1 = 2 rows, so <code class='inline'>COUNT(*)</code> over-counts even the denominator. Pre-aggregate refunds and disputes to one row per charge in their own CTEs, then LEFT JOIN — now each succeeded charge is exactly one row."
    },
    {
      "title": "Filtering after aggregation instead of inside the step",
      "prompt": "Goal: average succeeded charge amount per merchant, USD only. The averages look wrong and some merchants are missing.",
      "broken": "WITH per_merchant AS (\n  SELECT merchant_id, AVG(amount) AS avg_amount, currency\n  FROM charges\n  GROUP BY merchant_id, currency\n)\nSELECT merchant_id, avg_amount\nFROM per_merchant\nWHERE currency = 'usd' AND avg_amount > 0;",
      "hint": "The CTE grouped by currency too, and the status filter is missing — the eligible population was never defined.",
      "fixed": "WITH eligible AS (\n  SELECT merchant_id, amount\n  FROM charges\n  WHERE status = 'succeeded' AND currency = 'usd'\n)\nSELECT merchant_id, AVG(amount)/100.0 AS avg_usd\nFROM eligible\nGROUP BY merchant_id;",
      "why": "Define the eligible rows (<code class='inline'>succeeded</code>, <code class='inline'>usd</code>) <em>inside</em> the first CTE, then aggregate. Grouping by currency split each merchant into multiple rows; filtering currency afterward couldn't undo that, and the missing status filter let failed charges drag the average."
    }
  ],
  "exercises": [
    {
      "id": "m5e1",
      "lvl": 1,
      "priority": "required",
      "title": "Your first CTE: eligible charges",
      "prompt": "Build a CTE named <code class='inline'>eligible_charges</code> of succeeded charges in the last 30 days, then select <code class='inline'>charge_id</code>, <code class='inline'>merchant_id</code>, <code class='inline'>amount</code> from it. <em>Expected grain: one row per succeeded recent charge.</em>",
      "hints": [
        "<code class='inline'>WITH eligible_charges AS ( SELECT ... WHERE status='succeeded' AND created_at >= NOW() - INTERVAL '30 days' )</code>.",
        "Then a plain <code class='inline'>SELECT ... FROM eligible_charges</code>."
      ],
      "solution": "WITH eligible_charges AS (\n  SELECT charge_id, merchant_id, amount\n  FROM charges\n  WHERE status = 'succeeded'\n    AND created_at >= NOW() - INTERVAL '30 days'\n)\nSELECT charge_id, merchant_id, amount\nFROM eligible_charges;"
    },
    {
      "id": "m5e2",
      "lvl": 2,
      "priority": "required",
      "title": "Merchant success rate with one CTE",
      "prompt": "Using one CTE for the eligible <em>attempts</em> (all charges, any status, last 30 days), compute each merchant's success rate = succeeded ÷ attempts. <em>Grain: one row per merchant. Validation: rate ∈ 0–1.</em>",
      "hints": [
        "Eligible attempts = every charge in the window, regardless of status.",
        "Success = <code class='inline'>COUNT(*) FILTER (WHERE status='succeeded')</code>; guard the divide with <code class='inline'>NULLIF</code>."
      ],
      "solution": "WITH attempts AS (\n  SELECT merchant_id, status\n  FROM charges\n  WHERE created_at >= NOW() - INTERVAL '30 days'\n)\nSELECT merchant_id,\n       COUNT(*) AS attempts,\n       COUNT(*) FILTER (WHERE status='succeeded') AS succeeded,\n       ROUND(COUNT(*) FILTER (WHERE status='succeeded')::numeric\n             / NULLIF(COUNT(*), 0), 4) AS success_rate\nFROM attempts\nGROUP BY merchant_id\nORDER BY success_rate;"
    },
    {
      "id": "m5e3",
      "lvl": 3,
      "priority": "should",
      "title": "Pre-aggregate refunds before joining",
      "prompt": "Compute each merchant's refund rate = refunded succeeded charges ÷ succeeded charges. Build <code class='inline'>refunds_by_charge</code> first so the join can't fan out. <em>Common wrong answer: joining raw refunds and counting — that inflates the succeeded denominator.</em>",
      "hints": [
        "CTE 1: succeeded charges. CTE 2: <code class='inline'>refunds_by_charge</code> = one row per refunded charge.",
        "LEFT JOIN on charge_id; <code class='inline'>COUNT(rbc.charge_id)</code> counts only matched (refunded) charges."
      ],
      "solution": "WITH succeeded AS (\n  SELECT charge_id, merchant_id\n  FROM charges WHERE status='succeeded'\n),\nrefunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM refunds GROUP BY charge_id\n)\nSELECT s.merchant_id,\n       COUNT(*) AS succeeded,\n       COUNT(rbc.charge_id) AS refunded,\n       ROUND(COUNT(rbc.charge_id)::numeric / NULLIF(COUNT(*),0), 4) AS refund_rate\nFROM succeeded s\nLEFT JOIN refunds_by_charge rbc USING (charge_id)\nGROUP BY s.merchant_id\nORDER BY refund_rate DESC NULLS LAST;"
    },
    {
      "id": "m5e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "Refunds and disputes without double fan-out",
      "prompt": "One row per merchant: succeeded charges, refunded charges, disputed charges — with no double counting from the two one-to-many tables. <em>Validation: refunded ≤ succeeded and disputed ≤ succeeded for every merchant.</em>",
      "hints": [
        "Three CTEs at charge grain: succeeded base, refunds_by_charge, disputes_by_charge.",
        "LEFT JOIN both pre-aggregated CTEs to the base; never join raw refunds and raw disputes together."
      ],
      "solution": "WITH base AS (\n  SELECT charge_id, merchant_id FROM charges WHERE status='succeeded'\n),\nrefunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM refunds GROUP BY charge_id\n),\ndisputes_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM disputes GROUP BY charge_id\n)\nSELECT b.merchant_id,\n       COUNT(*) AS succeeded,\n       COUNT(rbc.charge_id) AS refunded,\n       COUNT(dbc.charge_id) AS disputed\nFROM base b\nLEFT JOIN refunds_by_charge rbc USING (charge_id)\nLEFT JOIN disputes_by_charge dbc USING (charge_id)\nGROUP BY b.merchant_id\nORDER BY succeeded DESC;"
    },
    {
      "id": "m5e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: merchant health in named steps",
      "prompt": "Build a merchant-health query with multiple CTEs: eligible attempts, a success rollup, a refund rollup, a dispute rollup, then a final SELECT with attempts, success_rate, refund_rate, dispute_rate and a <code class='inline'>health</code> flag ('at_risk' when success_rate &lt; 0.8 OR dispute_rate &gt; 0.01 on ≥100 attempts, else 'ok'). State your assumptions. <em>Validation: every rate ∈ 0–1; merchants below the volume floor are not flagged.</em>",
      "hints": [
        "Aggregate each metric at merchant grain in its own CTE, then LEFT JOIN the rollups together.",
        "Guard every ratio with <code class='inline'>NULLIF(denominator, 0)</code> and COALESCE zero-activity counts to 0.",
        "Put the volume floor (≥100 attempts) in the health CASE, not in a WHERE that would hide low-volume merchants."
      ],
      "solution": "WITH attempts AS (\n  SELECT merchant_id, charge_id, status\n  FROM charges\n  WHERE created_at >= NOW() - INTERVAL '30 days'\n),\nsucceeded AS (\n  SELECT charge_id, merchant_id FROM attempts WHERE status='succeeded'\n),\nrefunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM refunds GROUP BY charge_id\n),\ndisputes_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM disputes GROUP BY charge_id\n),\nrollup AS (\n  SELECT a.merchant_id,\n         COUNT(*) AS attempts,\n         COUNT(*) FILTER (WHERE a.status='succeeded') AS succeeded,\n         COUNT(rbc.charge_id) AS refunded,\n         COUNT(dbc.charge_id) AS disputed\n  FROM attempts a\n  LEFT JOIN refunds_by_charge rbc USING (charge_id)\n  LEFT JOIN disputes_by_charge dbc USING (charge_id)\n  GROUP BY a.merchant_id\n)\nSELECT merchant_id,\n       attempts,\n       ROUND(succeeded::numeric / NULLIF(attempts,0), 4) AS success_rate,\n       ROUND(refunded::numeric / NULLIF(succeeded,0), 4) AS refund_rate,\n       ROUND(disputed::numeric / NULLIF(succeeded,0), 4) AS dispute_rate,\n       CASE WHEN attempts >= 100\n             AND (succeeded::numeric/NULLIF(attempts,0) < 0.8\n                  OR disputed::numeric/NULLIF(succeeded,0) > 0.01)\n            THEN 'at_risk' ELSE 'ok' END AS health\nFROM rollup\nORDER BY success_rate;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "A CTE (WITH … AS) is mainly used to:",
      "options": [
        "Permanently store a table for later queries",
        "Name an intermediate result so a multi-step query reads clearly",
        "Make queries run faster than any other method",
        "Replace GROUP BY"
      ],
      "answer": 1,
      "why": "A CTE names a temporary, query-scoped intermediate result — its value is readability and step-by-step composition, not persistence or guaranteed speed.",
      "concept": "cte purpose"
    },
    {
      "level": 1,
      "q": "Which correctly defines and uses a CTE?",
      "options": [
        "SELECT * FROM WITH e AS (SELECT 1)",
        "WITH e AS (SELECT charge_id FROM charges WHERE status='succeeded') SELECT * FROM e;",
        "CTE e = (SELECT ...); SELECT * FROM e;",
        "WITH SELECT charge_id FROM charges AS e;"
      ],
      "answer": 1,
      "why": "The form is <code class='inline'>WITH name AS ( query ) SELECT … FROM name</code>. You read from the CTE by its name in the main query.",
      "concept": "cte syntax"
    },
    {
      "level": 2,
      "q": "Which CTE correctly defines 'succeeded charges'?",
      "options": [
        "WITH s AS (SELECT * FROM charges) — filter later",
        "WITH s AS (SELECT charge_id, merchant_id FROM charges WHERE status='succeeded')",
        "WITH s AS (SELECT COUNT(*) FROM charges)",
        "WITH s AS (SELECT charge_id FROM refunds)"
      ],
      "answer": 1,
      "why": "Define the eligible population inside the CTE with the status filter, keeping the keys you'll need downstream (charge_id, merchant_id).",
      "concept": "eligible population"
    },
    {
      "level": 4,
      "q": "Joining raw refunds AND raw disputes to charges, then counting, inflates the numbers because:",
      "options": [
        "COUNT ignores NULLs",
        "Both are one-to-many on charge_id, so the joins multiply rows (fan-out) and corrupt even the denominator",
        "Disputes have no charge_id",
        "CTEs are required by syntax"
      ],
      "answer": 1,
      "why": "Two one-to-many joins multiply rows: a charge with 2 refunds and 1 dispute becomes 2 rows, so COUNT(*) over-counts the denominator too. Pre-aggregate each to charge grain first.",
      "concept": "fan-out"
    },
    {
      "level": 5,
      "q": "An interviewer asks for a merchant-health metric. Why build it with CTEs?",
      "options": [
        "CTEs are always faster",
        "To define eligible attempts, pre-aggregate refunds/disputes to grain, and compose the final rate step by step — so the logic is correct (no fan-out) and easy to narrate",
        "To avoid writing GROUP BY",
        "Because subqueries are not allowed in interviews"
      ],
      "answer": 1,
      "why": "Named steps make the reasoning auditable and prevent fan-out: eligible attempts → success rollup → refund/dispute rollups → final rate. That correctness-plus-communication is exactly what's being assessed.",
      "concept": "interview judgment"
    }
  ],
  "mistakes": [
    "Writing one giant nested query no one (including you) can follow — name the steps with CTEs instead.",
    "Joining raw refunds/disputes directly to charges and counting — fan-out double-counts and corrupts the denominator.",
    "Filtering after aggregation when the filter (status, currency, window) should define the eligible population inside the first CTE.",
    "Accidentally changing the grain inside a CTE (e.g. grouping by an extra column) and not noticing downstream.",
    "Assuming a CTE persists outside the query, or naming CTEs vaguely (cte1, cte2)."
  ],
  "edges": [
    "A CTE is scoped to its statement — you cannot reference it from a later, separate query.",
    "<code class='inline'>COUNT(col)</code> after a LEFT JOIN counts only matched rows (NULLs skipped); <code class='inline'>COUNT(*)</code> counts every row — pick deliberately.",
    "A CTE that returns zero rows still composes fine; the final LEFT JOIN yields NULLs you should <code class='inline'>COALESCE</code> to 0."
  ],
  "interview": "<p>Narrate the steps as you build them: <em>\"I'll define <code class='inline'>eligible_charges</code> — succeeded, in-window — as my denominator. Then I pre-aggregate <code class='inline'>refunds_by_charge</code> and <code class='inline'>disputes_by_charge</code> to one row per charge so the joins can't fan out. A <code class='inline'>merchant_rollup</code> CTE counts each, and the final SELECT turns them into rates with <code class='inline'>NULLIF</code> guards.\"</em> Stating the grain of each CTE and naming fan-out before it bites is exactly the senior signal Stripe interviewers look for.</p>",
  "followup": {
    "prompt": "Interviewer: \"Now compare each merchant's refund rate to the previous month.\"",
    "answer": "That's a comparison across rows, which is where window functions come in (M6) — I'd compute monthly refund rate in a CTE, then use <code class='inline'>LAG</code> over <code class='inline'>PARTITION BY merchant_id ORDER BY month</code> to bring the prior month onto each row. The CTE-built rollup is the clean input the window function reads from."
  }
};

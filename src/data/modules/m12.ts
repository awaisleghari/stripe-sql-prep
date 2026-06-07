import type { Module } from '@/types';

/* MIGRATED learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m12: Module = {
  "id": "m12",
  "day": "Day 5",
  "badge": "advanced",
  "title": "Refunds & Dispute Metrics",
  "skill": "disputes",
  "bcolor": "volcano",
  "concept": "<p><strong>Refund vs dispute</strong> — the distinction Stripe interviewers probe:</p>\n<table class=\"tbl compact\"><tr><th></th><th>Refund</th><th>Dispute (chargeback)</th></tr>\n<tr><td>Initiated by</td><td>The merchant</td><td>The cardholder's bank</td></tr>\n<tr><td>Table</td><td><code class=\"inline\">refunds</code></td><td><code class=\"inline\">disputes</code></td></tr>\n<tr><td>Fees</td><td>Usually returned</td><td>Extra dispute fee; kept even if won</td></tr>\n<tr><td>Timing</td><td>Soon after charge</td><td>Often 30–60 days LATER (late-arriving)</td></tr>\n<tr><td>Outcome</td><td>Final</td><td>won / lost / under_review</td></tr></table>\n<p><strong>Dispute rate</strong> = disputes ÷ <em>succeeded charges</em>. Card networks watch ~1%. <strong>Refund rate</strong> = refunds ÷ succeeded charges.</p>",
  "sqlPattern": "SELECT c.merchant_id,\n  COUNT(DISTINCT d.charge_id)::numeric\n    / NULLIF(COUNT(DISTINCT c.charge_id), 0) AS dispute_rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id = c.charge_id\nWHERE c.status = 'succeeded'\nGROUP BY c.merchant_id;",
  "schemaRefs": [
    "charges",
    "refunds",
    "disputes"
  ],
  "pysupport": "succeeded = {c[\"charge_id\"] for c in charges if c[\"status\"] == \"succeeded\"}\nrefunded  = {r[\"charge_id\"] for r in refunds if r[\"charge_id\"] in succeeded}\nrefund_rate = len(refunded) / len(succeeded)   # distinct charges, not refund rows",
  "reasoning": {
    "question": "\"How often are charges refunded or disputed, and what does it cost?\"",
    "grain": "One row per merchant (or per country).",
    "included": "Succeeded charges in the denominator; refunds/disputes attached via <code class=\"inline\">charge_id</code>.",
    "excluded": "Failed and pending charges — they can't be refunded or disputed.",
    "table": "<code class=\"inline\">charges</code> + <code class=\"inline\">refunds</code> (merchant-initiated) or <code class=\"inline\">disputes</code> (bank-initiated, late-arriving).",
    "metric": "Refund rate = distinct refunded ÷ distinct succeeded charges; dispute rate is analogous.",
    "denom": "Distinct succeeded charges — use <code class=\"inline\">COUNT(DISTINCT)</code> to avoid fan-out.",
    "wrong": "Confusing refunds with disputes; denominator = all charges; fan-out; same-month dispute attribution ignoring the lag.",
    "validate": "Rates in 0–1; PixelForge (high-dispute) and Velvet (high-refund) surface as expected."
  },
  "predicts": [
    {
      "prompt": "PixelForge's disputes arrive 45 days after the charge. You compute 'June dispute rate' as June disputes ÷ June charges. What's wrong?",
      "query": "disputes in June / charges in June",
      "options": [
        "Nothing",
        "Numerator and denominator are misaligned in time — June disputes mostly belong to April/May charges (late-arriving)",
        "It double-counts",
        "Disputes can't be dated"
      ],
      "answer": 1,
      "explain": "Because disputes lag, same-month math mixes cohorts. The correct cohort rate attributes each dispute to the MONTH OF ITS CHARGE: disputes on April charges ÷ April charges."
    },
    {
      "prompt": "A merchant has 200 succeeded charges; 3 distinct charges were disputed (one of them twice → 4 dispute rows). What does this return?",
      "query": "SELECT COUNT(DISTINCT d.charge_id)::numeric\n  / COUNT(DISTINCT c.charge_id) AS rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id = c.charge_id\nWHERE c.status='succeeded';",
      "options": [
        "4 / 200 = 0.020",
        "3 / 200 = 0.015",
        "3 / 201",
        "2 / 200"
      ],
      "answer": 1,
      "explain": "COUNT(DISTINCT d.charge_id) = 3 (the twice-disputed charge counts once) → 3/200 = 0.015. Plain COUNT(*) would have over-counted to 4."
    }
  ],
  "debugs": [
    {
      "prompt": "Dispute rate per merchant — but it counts disputes against ALL charges including failed ones, and fans out.",
      "broken": "SELECT c.merchant_id,\n       COUNT(d.dispute_id)::numeric / COUNT(*) AS dispute_rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id=c.charge_id\nGROUP BY c.merchant_id;",
      "hint": "Only succeeded charges can be disputed, and the join fans out on multi-dispute charges.",
      "fixed": "SELECT c.merchant_id,\n       COUNT(DISTINCT d.charge_id)::numeric\n         / NULLIF(COUNT(DISTINCT c.charge_id),0) AS dispute_rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id=c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id;",
      "why": "Denominator = distinct succeeded charges; numerator = distinct disputed charges. NULLIF guards merchants with no succeeded charges."
    },
    {
      "title": "two bugs in one dispute rate",
      "prompt": "Intended: dispute rate = disputed ÷ succeeded. It understates the rate and double-counts multi-dispute charges.",
      "broken": "SELECT c.merchant_id,\n  COUNT(d.dispute_id)::numeric / COUNT(*) AS rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id = c.charge_id\nGROUP BY c.merchant_id;",
      "hint": "Denominator should be succeeded charges only; and the join fans out on multi-dispute charges.",
      "fixed": "SELECT c.merchant_id,\n  COUNT(DISTINCT d.charge_id)::numeric\n    / NULLIF(COUNT(DISTINCT c.charge_id),0) AS rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id = c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id;",
      "why": "Add WHERE c.status='succeeded' for the right denominator, and use COUNT(DISTINCT) on both sides so a charge with several disputes counts once. NULLIF guards divide-by-zero."
    }
  ],
  "exercises": [
    {
      "id": "m12e1",
      "lvl": 1,
      "priority": "required",
      "title": "Disputes by status",
      "prompt": "Count disputes by <code class='inline'>status</code> across the platform.",
      "hints": [
        "GROUP BY status."
      ],
      "solution": "SELECT status, COUNT(*) AS n\nFROM disputes\nGROUP BY status\nORDER BY n DESC;"
    },
    {
      "id": "m12e2",
      "lvl": 2,
      "priority": "required",
      "title": "Refund rate by country",
      "prompt": "Refund rate by the charge's <code class='inline'>card_country</code>: distinct refunded succeeded charges ÷ distinct succeeded charges. Highest first.",
      "hints": [
        "Join refunds via charge_id.",
        "Denominator = succeeded charges; COUNT(DISTINCT) both sides."
      ],
      "solution": "SELECT c.card_country,\n       COUNT(DISTINCT r.charge_id)::numeric\n         / NULLIF(COUNT(DISTINCT c.charge_id),0) AS refund_rate\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.card_country\nORDER BY refund_rate DESC NULLS LAST;"
    },
    {
      "id": "m12e3",
      "lvl": 3,
      "priority": "should",
      "title": "Merchants with dispute rate > 1%",
      "prompt": "Find merchants with dispute rate > 1% and at least 500 succeeded charges. Return merchant_id, succeeded, disputed, dispute_rate.",
      "hints": [
        "Anti-fan-out: COUNT(DISTINCT).",
        "Volume floor + threshold in HAVING."
      ],
      "solution": "SELECT c.merchant_id,\n       COUNT(DISTINCT c.charge_id) AS succeeded,\n       COUNT(DISTINCT d.charge_id) AS disputed,\n       ROUND(COUNT(DISTINCT d.charge_id)::numeric\n             / COUNT(DISTINCT c.charge_id), 4) AS dispute_rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id=c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id\nHAVING COUNT(DISTINCT c.charge_id) >= 500\n   AND COUNT(DISTINCT d.charge_id)::numeric\n       / COUNT(DISTINCT c.charge_id) > 0.01\nORDER BY dispute_rate DESC;"
    },
    {
      "id": "m12e4",
      "lvl": 4,
      "priority": "should",
      "title": "Net dispute loss incl. fees",
      "prompt": "Total net loss from disputes per merchant (USD): only <code class='inline'>lost</code> disputes count, each incurring a $15 dispute fee. Won/under_review excluded.",
      "hints": [
        "Filter status='lost'.",
        "Loss = disputed amount + $15 fee (1500 cents) per dispute."
      ],
      "solution": "SELECT c.merchant_id,\n       (SUM(d.amount) + COUNT(*) * 1500) / 100.0 AS dispute_loss_usd\nFROM disputes d\nJOIN charges c ON c.charge_id = d.charge_id\nWHERE d.status='lost' AND c.currency='USD'\nGROUP BY c.merchant_id\nORDER BY dispute_loss_usd DESC;"
    },
    {
      "id": "m12e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final-boss (timed 10 min): early-fraud signal",
      "prompt": "Surface merchants whose trailing-30-day dispute rate is more than 2× their trailing-90-day baseline (emerging-fraud alarm), with ≥200 charges in the 30-day window. Attribute disputes by the CHARGE date. Defend the late-arriving-data choice.",
      "hints": [
        "Two windowed CTEs (30d, 90d) keyed by charge date.",
        "Join and compare rates; guard with NULLIF."
      ],
      "solution": "WITH base AS (\n  SELECT c.merchant_id, c.charge_id, c.created_at AS charge_at, d.dispute_id\n  FROM charges c\n  LEFT JOIN disputes d ON d.charge_id = c.charge_id\n  WHERE c.status='succeeded'\n),\nw30 AS (\n  SELECT merchant_id,\n         COUNT(DISTINCT charge_id) AS chg,\n         COUNT(DISTINCT dispute_id) AS disp\n  FROM base WHERE charge_at >= NOW() - INTERVAL '30 days'\n  GROUP BY merchant_id\n),\nw90 AS (\n  SELECT merchant_id,\n         COUNT(DISTINCT charge_id) AS chg,\n         COUNT(DISTINCT dispute_id) AS disp\n  FROM base WHERE charge_at >= NOW() - INTERVAL '90 days'\n  GROUP BY merchant_id\n)\nSELECT a.merchant_id,\n       ROUND(a.disp::numeric/NULLIF(a.chg,0),4) AS rate_30d,\n       ROUND(b.disp::numeric/NULLIF(b.chg,0),4) AS baseline_90d\nFROM w30 a JOIN w90 b USING (merchant_id)\nWHERE a.chg >= 200\n  AND a.disp::numeric/NULLIF(a.chg,0)\n      > 2 * (b.disp::numeric/NULLIF(b.chg,0))\nORDER BY rate_30d DESC;"
    },
    {
      "id": "m12e6",
      "lvl": 2,
      "priority": "should",
      "title": "Refunds by reason and amount",
      "prompt": "Per refund reason, return the count and total refunded amount (USD), largest total first.",
      "hints": [
        "GROUP BY reason; SUM(amount)/100.0."
      ],
      "solution": "SELECT reason, COUNT(*) AS n, SUM(amount)/100.0 AS refunded_usd\nFROM refunds\nGROUP BY reason\nORDER BY refunded_usd DESC;"
    },
    {
      "id": "m12e7",
      "lvl": 3,
      "priority": "should",
      "title": "Dispute rate per merchant",
      "prompt": "Per merchant: succeeded charges, distinct disputed charges, and dispute rate. Only merchants with ≥300 succeeded charges, highest rate first.",
      "hints": [
        "LEFT JOIN disputes on charge_id.",
        "COUNT(DISTINCT) on both sides; floor in HAVING."
      ],
      "solution": "SELECT c.merchant_id,\n  COUNT(DISTINCT c.charge_id) AS succeeded,\n  COUNT(DISTINCT d.charge_id) AS disputed,\n  ROUND(COUNT(DISTINCT d.charge_id)::numeric / COUNT(DISTINCT c.charge_id), 4) AS dispute_rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id = c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id\nHAVING COUNT(DISTINCT c.charge_id) >= 300\nORDER BY dispute_rate DESC;"
    },
    {
      "id": "m12e8",
      "lvl": 4,
      "priority": "stretch",
      "title": "Lost-dispute loss including fees",
      "prompt": "Per merchant, total USD loss from LOST disputes — the disputed amount plus a $15 fee per dispute. Highest loss first.",
      "hints": [
        "Filter status='lost'.",
        "Loss = SUM(amount) + COUNT(*) * 1500 cents."
      ],
      "solution": "SELECT c.merchant_id,\n  (SUM(d.amount) + COUNT(*) * 1500)/100.0 AS loss_usd\nFROM disputes d\nJOIN charges c ON c.charge_id = d.charge_id\nWHERE d.status='lost' AND c.currency='USD'\nGROUP BY c.merchant_id\nORDER BY loss_usd DESC;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "A chargeback (dispute) differs from a refund because:",
      "options": [
        "They're the same thing",
        "A refund is merchant-initiated; a dispute is the cardholder's bank-initiated and arrives later",
        "A dispute is always faster",
        "Refunds live in the disputes table"
      ],
      "answer": 1,
      "why": "Different initiator, table, fee treatment, and timing (disputes lag the charge).",
      "concept": "refund vs dispute"
    },
    {
      "level": 1,
      "q": "Dispute rate's correct denominator is:",
      "options": [
        "All charges",
        "Succeeded charges",
        "Failed charges",
        "Refunded charges"
      ],
      "answer": 1,
      "why": "Only succeeded charges can be disputed.",
      "concept": "denominator"
    },
    {
      "level": 2,
      "q": "Refund rate by country, without double-counting a charge with 2 refunds:",
      "options": [
        "COUNT(*) of refunds ÷ COUNT(*) charges",
        "COUNT(DISTINCT r.charge_id) ÷ COUNT(DISTINCT c.charge_id)",
        "SUM(refunds) ÷ charges",
        "AVG(refund_amount)"
      ],
      "answer": 1,
      "why": "DISTINCT charge_id on both sides prevents fan-out from multiple refunds per charge.",
      "concept": "DISTINCT anti-fan-out"
    },
    {
      "level": 3,
      "q": "Computing \"June dispute rate\" as June disputes ÷ June charges is wrong because:",
      "options": [
        "June has 30 days",
        "Disputes arrive weeks later, so they belong to earlier charge cohorts — attribute by charge date",
        "You can't divide dates",
        "Disputes have no timestamp"
      ],
      "answer": 1,
      "why": "Late-arriving disputes belong to the cohort of their original charge, not the month they post.",
      "concept": "late-arriving attribution"
    },
    {
      "level": 5,
      "q": "Flagging merchants over the ~1% network dispute threshold — key clarification?",
      "options": [
        "The flag's color",
        "Whether the rate is on count or volume, the window (rolling vs lifetime), and that recent windows are lower bounds (late disputes)",
        "The Postgres version",
        "Whether to LIMIT the output"
      ],
      "answer": 1,
      "why": "Count-vs-volume, window choice, and late-arrival all change the rate and the flag.",
      "concept": "threshold definition"
    }
  ],
  "mistakes": [
    "Confusing refunds (merchant-initiated) with disputes (bank-initiated).",
    "Dispute/refund rate over all charges instead of succeeded.",
    "Fan-out from multi-dispute/multi-refund charges (use DISTINCT).",
    "Same-month dispute rate ignoring the lag."
  ],
  "edges": [
    "A dispute can be won, lost, or pending — 'loss' should use the final state.",
    "Disputes are late-arriving: recent-period rates are lower bounds that rise over time."
  ],
  "interview": "<p>Open by distinguishing the two: <em>\"Refunds are merchant-initiated and live in refunds; disputes are bank chargebacks in disputes and arrive weeks later. Dispute rate = distinct disputed ÷ distinct succeeded charges. I'll use COUNT(DISTINCT) to avoid fan-out, attribute disputes to the charge date because of the lag, and add a volume floor. PixelForge — our known high-dispute merchant — should surface, which I'll use as a sanity check.\"</em></p>",
  "followup": {
    "prompt": "PM: \"Velvet has high refunds but low disputes. Is that good or bad?\"",
    "answer": "Often good: proactive refunds keep customers from escalating to chargebacks, which carry fees and count against network thresholds. High refunds + low disputes can signal healthy customer service — though it does dent net revenue, so it's a tradeoff worth quantifying."
  }
};

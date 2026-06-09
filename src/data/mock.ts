import type { Mock } from '@/types';

/* MIGRATED page content. */
export const MOCK1: Mock = {
  "id": "m1",
  "title": "Mock 1 · Diagnostic",
  "time": "45 min",
  "level": "Diagnostic",
  "blurb": "A gentle full-shape rehearsal. Do it after Day 2. Time-box yourself, speak every answer aloud, then self-score with the rubrics.",
  "components": [
    {
      "kind": "SQL problem",
      "rubric": "sql",
      "prompt": "Payment success rate by merchant for the last 30 days. Only merchants with ≥100 attempts. Worst first.",
      "guidance": "<p>Reference solution:</p>",
      "solution": "SELECT merchant_id,\n       COUNT(*) AS attempts,\n       AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate\nFROM charges\nWHERE created_at >= NOW() - INTERVAL '30 days'\nGROUP BY merchant_id\nHAVING COUNT(*) >= 100\nORDER BY success_rate ASC;",
      "notes": [
        "Grain: one row per merchant.",
        "Denominator = attempts; decide on pending.",
        "Northwind (101) should be worst."
      ]
    },
    {
      "kind": "Multi-step metric",
      "rubric": "sql",
      "prompt": "Rank merchants by GPV (succeeded, USD). Return rank, merchant, gpv_usd. Top 5.",
      "solution": "WITH gpv AS (\n  SELECT merchant_id, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id\n)\nSELECT RANK() OVER (ORDER BY gross DESC) AS rnk,\n       merchant_id, gross/100.0 AS gpv_usd\nFROM gpv ORDER BY rnk LIMIT 5;",
      "notes": [
        "GPV in a CTE, then RANK.",
        "RANK vs ROW_NUMBER: ties should share.",
        "Currency-scoped so cents are comparable."
      ]
    },
    {
      "kind": "Product analytics case",
      "rubric": "prod",
      "prompt": "Northwind's success rate dropped 3 points week-over-week. Walk through how you'd diagnose it.",
      "solution": "-- Framework, not a single query:\n-- 1) Decompose: success_rate = succeeded / attempts. Did attempts spike or successes fall?\n-- 2) Segment: by payment_method, card_country, failure_code, customer new-vs-returning, time-of-day.\n-- 3) Hypotheses: a BIN range started declining; a new geo with weak auth; a pricing change raised insufficient_funds; a deploy broke 3DS.\n-- 4) Confirm with a failure_code breakdown week-over-week (M3 final boss).\n-- 5) Recommend: retry insufficient_funds via smart dunning; investigate the declining BIN with the issuer.",
      "notes": [
        "Lead with the metric tree.",
        "Localise with segmentation before guessing.",
        "End with a concrete action."
      ]
    },
    {
      "kind": "Experimentation case",
      "rubric": "exp",
      "prompt": "You're handed: control conversion 4.0% (n=10,000), treatment 4.4% (n=10,000). Did the new checkout win?",
      "solution": "-- Two-proportion comparison.\n-- Absolute lift = 0.4pp; relative lift = +10%.\n-- SE ≈ sqrt(p(1-p)(1/n1+1/n2)), p≈0.042 → SE ≈ sqrt(0.042*0.958*(2/10000)) ≈ 0.00284.\n-- z = 0.004 / 0.00284 ≈ 1.41 → p ≈ 0.16 (two-sided). NOT significant at 0.05.\n-- Verdict: promising but underpowered; do not ship on this alone.\n-- Guardrails: dispute rate, refund rate, support tickets must not regress.\n-- Caveats: no peeking; confirm randomization unit = customer; check for novelty effects.",
      "notes": [
        "Compute a z-stat, don't eyeball.",
        "State significance AND practical lift.",
        "Name guardrails and biases."
      ]
    },
    {
      "kind": "Debug / edge-case",
      "rubric": "sql",
      "prompt": "This 'success rate' returns all 0s or 1s. Fix it and explain.",
      "solution": "-- Broken:\nSELECT merchant_id,\n       SUM(CASE WHEN status='succeeded' THEN 1 ELSE 0 END)/COUNT(*) AS rate\nFROM charges GROUP BY merchant_id;\n-- Fix: integer division. Use a float.\nSELECT merchant_id,\n       AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS rate\nFROM charges GROUP BY merchant_id;",
      "notes": [
        "Name the bug: integer ÷ integer.",
        "Cleanest fix is AVG(... 1.0 ...)."
      ]
    },
    {
      "kind": "Communication self-score",
      "rubric": "comm",
      "prompt": "Re-explain your success-rate solution as if to a non-technical PM in 4 sentences, then score yourself on the communication rubric.",
      "solution": "-- Model answer:\n-- \"Success rate is the share of payment attempts that go through. I counted attempts per merchant\n--  over the last 30 days, then the fraction that succeeded. I ignored tiny merchants with under 100\n--  attempts so the list isn't noisy, and I flagged that I excluded in-flight pending charges.\n--  Northwind is worst at 78%, which matches what we expected.\"",
      "notes": [
        "Metric in plain words.",
        "Name the denominator and the floor.",
        "Tie back to a known sanity check."
      ]
    }
  ]
};

export const MOCKS: Mock[] = [MOCK1];

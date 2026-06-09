import type { Problem } from '@/types';

/* MIGRATED DATA — edit a problem here, then it is auto-included via src/data/gym/index.ts.
   Source of truth migrated from the original single-file app (Repo-2). */
export const refundsProblems: Problem[] = [
  {
    "id": "rf1",
    "ladder": "ref",
    "pos": 1,
    "stage": "Recognition",
    "lvl": 0,
    "difficulty": "recognition",
    "priority": "required",
    "source": "StripeAPI-style",
    "module": "m12",
    "title": "Refund vs dispute",
    "concept": [
      "disputes"
    ],
    "obj": [
      "Refund",
      "Dispute"
    ],
    "metric": "definitions",
    "edge": [
      "late-arriving data"
    ],
    "timed": false,
    "est": "3 min",
    "business": "An analyst conflates refunds and chargebacks. Set them straight.",
    "schema": [
      "refunds",
      "disputes"
    ],
    "prompt": "In plain English: how does a refund differ from a dispute (chargeback) — who starts it, which table, fee treatment, and timing?",
    "hints": [
      "One is merchant-initiated, the other bank-initiated.",
      "One arrives promptly, the other weeks later."
    ],
    "model": "A refund is merchant-initiated (the merchant returns money), lives in refunds, usually returns the processing fee, and happens soon after the charge. A dispute/chargeback is initiated by the cardholder's bank, lives in disputes, carries an extra dispute fee even if won, and typically arrives 30–60 days later (late-arriving). Different tables, fees, timing, and outcomes (won/lost/under_review).",
    "grain": "Conceptual.",
    "explain": "Say the four differences aloud: initiator, table, fees, timing.",
    "teaches": "The refund-vs-dispute distinction interviewers probe.",
    "harder": "First rung — vocabulary and model.",
    "mode": "SQL"
  },
  {
    "id": "rf2",
    "ladder": "ref",
    "pos": 2,
    "stage": "Mechanical",
    "lvl": 1,
    "difficulty": "easy",
    "priority": "required",
    "source": "SQLBolt-style",
    "module": "m12",
    "title": "Count refunds by reason",
    "concept": [
      "disputes",
      "groupby"
    ],
    "obj": [
      "Refund"
    ],
    "metric": "refund counts",
    "edge": [],
    "timed": false,
    "est": "4 min",
    "business": "What drives refunds across the platform?",
    "schema": [
      "refunds"
    ],
    "prompt": "Count refunds by reason, most common first.",
    "hints": [
      "GROUP BY reason, COUNT(*), ORDER BY count DESC."
    ],
    "solution": "SELECT reason, COUNT(*) AS n\nFROM refunds\nGROUP BY reason\nORDER BY n DESC;",
    "grain": "One row per refund reason.",
    "explain": "Explain what a high requested_by_customer share might imply.",
    "teaches": "Simple categorical breakdown.",
    "harder": "Adds grouping to the step-1 vocabulary.",
    "mode": "SQL"
  },
  {
    "id": "rf3",
    "ladder": "ref",
    "pos": 3,
    "stage": "Simple application",
    "lvl": 2,
    "difficulty": "medium",
    "priority": "required",
    "source": "DataLemur-style",
    "module": "m12",
    "title": "Refund rate by country",
    "concept": [
      "disputes",
      "rates",
      "joins"
    ],
    "obj": [
      "Refund",
      "Charge"
    ],
    "metric": "refund rate",
    "edge": [
      "fan-out",
      "NULLs"
    ],
    "timed": false,
    "est": "6 min",
    "business": "Which card countries refund most?",
    "schema": [
      "charges",
      "refunds"
    ],
    "prompt": "Refund rate by card_country = distinct refunded succeeded charges ÷ distinct succeeded charges, highest first.",
    "hints": [
      "LEFT JOIN refunds via charge_id; denominator = succeeded charges.",
      "COUNT(DISTINCT) on both sides to avoid fan-out."
    ],
    "solution": "SELECT c.card_country,\n       COUNT(DISTINCT r.charge_id)::numeric\n         / NULLIF(COUNT(DISTINCT c.charge_id),0) AS refund_rate\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.card_country\nORDER BY refund_rate DESC NULLS LAST;",
    "verify": {
      "grain": "One row per card_country.",
      "columns": [
        "card_country",
        "refund_rate"
      ],
      "sample": {
        "cols": [
          "card_country",
          "refund_rate"
        ],
        "rows": [
          [
            "US",
            "0.071"
          ],
          [
            "GB",
            "0.034"
          ]
        ]
      },
      "commonWrong": [
        "Denominator = all charges (incl. failed).",
        "COUNT(*) instead of DISTINCT → fan-out on multi-refund charges."
      ],
      "validation": [
        "refund_rate in [0,1].",
        "US elevated (Velvet's market)."
      ],
      "edgeCases": [
        "NULL card_country forms its own row — keep it visible.",
        "A partially-refunded charge counts once (DISTINCT)."
      ],
      "checklist": [
        "denominator = succeeded",
        "DISTINCT both sides",
        "NULL country handled"
      ]
    },
    "explain": "Explain why the denominator is succeeded charges, not all charges.",
    "teaches": "Rate over a join with anti-fan-out discipline.",
    "harder": "Join + denominator choice + DISTINCT.",
    "mode": "SQL"
  },
  {
    "id": "rf4",
    "ladder": "ref",
    "pos": 4,
    "stage": "Applied metric",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "required",
    "source": "DataLemur-style",
    "module": "m12",
    "title": "Merchants over the 1% dispute threshold",
    "concept": [
      "disputes",
      "rates",
      "having"
    ],
    "obj": [
      "Dispute",
      "Charge"
    ],
    "metric": "dispute rate",
    "edge": [
      "late-arriving data",
      "fan-out"
    ],
    "timed": false,
    "est": "7 min",
    "business": "Card networks watch dispute rate ~1%. Surface merchants who breach it.",
    "schema": [
      "charges",
      "disputes"
    ],
    "prompt": "Merchants with dispute rate &gt; 1% and ≥500 succeeded charges. Return succeeded, disputed, dispute_rate.",
    "hints": [
      "COUNT(DISTINCT) both sides; denominator = succeeded.",
      "Threshold + floor in HAVING."
    ],
    "solution": "SELECT c.merchant_id,\n       COUNT(DISTINCT c.charge_id) AS succeeded,\n       COUNT(DISTINCT d.charge_id) AS disputed,\n       ROUND(COUNT(DISTINCT d.charge_id)::numeric / COUNT(DISTINCT c.charge_id),4) AS dispute_rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id=c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id\nHAVING COUNT(DISTINCT c.charge_id) >= 500\n   AND COUNT(DISTINCT d.charge_id)::numeric / COUNT(DISTINCT c.charge_id) > 0.01\nORDER BY dispute_rate DESC;",
    "verify": {
      "grain": "One row per merchant breaching 1% with ≥500 succeeded.",
      "columns": [
        "merchant_id",
        "succeeded",
        "disputed",
        "dispute_rate"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "succeeded",
          "disputed",
          "dispute_rate"
        ],
        "rows": [
          [
            "103",
            "780",
            "14",
            "0.0179"
          ]
        ]
      },
      "commonWrong": [
        "Denominator = all charges.",
        "No volume floor → tiny merchants spike.",
        "Count vs volume threshold unclarified."
      ],
      "validation": [
        "PixelForge (103) ~1.8%.",
        "Every row > 0.01; disputed ≤ succeeded."
      ],
      "edgeCases": [
        "Network thresholds are usually rolling/monthly, not lifetime.",
        "Recent cohorts' rates are lower bounds (late disputes)."
      ],
      "checklist": [
        "DISTINCT both sides",
        "floor + threshold in HAVING",
        "PixelForge surfaces"
      ]
    },
    "explain": "State whether your threshold is on count or volume and why.",
    "teaches": "Threshold + floor metric with anti-fan-out.",
    "harder": "Two HAVING conditions + denominator discipline.",
    "mode": "SQL"
  },
  {
    "id": "rf5",
    "ladder": "ref",
    "pos": 5,
    "stage": "Multi-step",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "StrataScratch-style",
    "module": "m12",
    "title": "Lost-dispute loss including fees",
    "concept": [
      "disputes",
      "joins"
    ],
    "obj": [
      "Dispute",
      "Charge"
    ],
    "metric": "dispute loss",
    "edge": [
      "fees",
      "won vs lost"
    ],
    "timed": false,
    "est": "8 min",
    "business": "Quantify real chargeback losses: only lost disputes, each with a $15 dispute fee.",
    "schema": [
      "charges",
      "disputes"
    ],
    "prompt": "Total net dispute loss (USD) per merchant: lost disputes only, each incurring a $15 fee. Highest first.",
    "hints": [
      "Filter status='lost'.",
      "Loss = SUM(disputed amount) + COUNT(*) × 1500 cents."
    ],
    "solution": "SELECT c.merchant_id,\n       (SUM(d.amount) + COUNT(*) * 1500)/100.0 AS dispute_loss_usd\nFROM disputes d\nJOIN charges c ON c.charge_id = d.charge_id\nWHERE d.status='lost' AND c.currency='usd'\nGROUP BY c.merchant_id\nORDER BY dispute_loss_usd DESC;",
    "verify": {
      "grain": "One row per merchant with lost disputes.",
      "columns": [
        "merchant_id",
        "dispute_loss_usd"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "dispute_loss_usd"
        ],
        "rows": [
          [
            "103",
            "4210.00"
          ]
        ]
      },
      "commonWrong": [
        "Counting won/under_review as losses.",
        "Forgetting the per-dispute fee.",
        "Blending currencies."
      ],
      "validation": [
        "Only merchants with lost disputes appear.",
        "Loss ≥ sum of disputed amounts (fee adds)."
      ],
      "edgeCases": [
        "under_review can flip to lost later — figure is provisional.",
        "Dispute fee varies by region; $15 is the common USD figure."
      ],
      "checklist": [
        "status='lost' only",
        "per-dispute fee added",
        "currency scoped",
        "provisional caveat"
      ]
    },
    "explain": "Explain why won and under_review are excluded.",
    "teaches": "Outcome-aware loss with a fee component.",
    "harder": "Status filtering + a fee term + currency scope.",
    "mode": "SQL"
  },
  {
    "id": "rf6",
    "ladder": "ref",
    "pos": 6,
    "stage": "Debug",
    "lvl": 3,
    "difficulty": "hard",
    "priority": "required",
    "source": "GitHub-repo-style",
    "module": "m12",
    "title": "Debug: dispute rate uses the wrong denominator",
    "concept": [
      "disputes",
      "rates",
      "fan-out"
    ],
    "obj": [
      "Dispute",
      "Charge"
    ],
    "metric": "dispute rate",
    "edge": [
      "fan-out",
      "NULLs"
    ],
    "timed": false,
    "est": "5 min",
    "business": "A dispute rate counts disputes against ALL charges and double-counts multi-dispute charges.",
    "schema": [
      "charges",
      "disputes"
    ],
    "broken": "SELECT c.merchant_id,\n       COUNT(d.dispute_id)::numeric / COUNT(*) AS dispute_rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id=c.charge_id\nGROUP BY c.merchant_id;",
    "prompt": "Identify both problems and fix the query.",
    "hints": [
      "Only succeeded charges can be disputed.",
      "The join fans out on multi-dispute charges — use DISTINCT and a NULLIF guard."
    ],
    "solution": "SELECT c.merchant_id,\n       COUNT(DISTINCT d.charge_id)::numeric\n         / NULLIF(COUNT(DISTINCT c.charge_id),0) AS dispute_rate\nFROM charges c\nLEFT JOIN disputes d ON d.charge_id=c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id;",
    "verify": {
      "grain": "One row per merchant.",
      "columns": [
        "merchant_id",
        "dispute_rate"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "dispute_rate"
        ],
        "rows": [
          [
            "103",
            "0.0179"
          ],
          [
            "102",
            "0.0020"
          ]
        ]
      },
      "commonWrong": [
        "Fixing only the denominator but leaving COUNT(*) fan-out.",
        "Removing the join entirely."
      ],
      "validation": [
        "Rates drop to realistic sub-2% values.",
        "disputed ≤ succeeded per merchant."
      ],
      "edgeCases": [
        "NULLIF guards merchants with zero succeeded charges."
      ],
      "checklist": [
        "status='succeeded' filter",
        "COUNT(DISTINCT) both sides",
        "NULLIF guard"
      ]
    },
    "explain": "Name both bugs and the single combined fix.",
    "teaches": "Denominator + fan-out repair together.",
    "harder": "Two defects to spot in one short query.",
    "mode": "SQL"
  },
  {
    "id": "rf7",
    "ladder": "ref",
    "pos": 7,
    "stage": "Edge-case hard",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "Mode-style",
    "module": "m12",
    "title": "Late-arriving disputes: attribute by charge date",
    "concept": [
      "disputes",
      "dates",
      "cte"
    ],
    "obj": [
      "Dispute",
      "Charge"
    ],
    "metric": "cohort dispute rate",
    "edge": [
      "late-arriving data",
      "time zones"
    ],
    "timed": false,
    "est": "9 min",
    "business": "PixelForge's disputes arrive ~45 days after the charge. A naive monthly dispute rate is misleading.",
    "schema": [
      "charges",
      "disputes"
    ],
    "prompt": "Monthly dispute rate for merchant 103 attributing each dispute to the MONTH OF ITS CHARGE (not the dispute date). One row per charge-month.",
    "hints": [
      "Join disputes to charges; bucket by the charge's created_at month.",
      "Denominator = succeeded charges in that charge-month."
    ],
    "solution": "WITH c AS (\n  SELECT charge_id, DATE_TRUNC('month', created_at) AS charge_month\n  FROM charges WHERE merchant_id=103 AND status='succeeded'\n)\nSELECT c.charge_month,\n       COUNT(DISTINCT c.charge_id) AS succeeded,\n       COUNT(DISTINCT d.charge_id) AS disputed,\n       ROUND(COUNT(DISTINCT d.charge_id)::numeric / NULLIF(COUNT(DISTINCT c.charge_id),0),4) AS dispute_rate\nFROM c\nLEFT JOIN disputes d ON d.charge_id = c.charge_id\nGROUP BY c.charge_month\nORDER BY c.charge_month;",
    "verify": {
      "grain": "One row per charge-month for merchant 103.",
      "columns": [
        "charge_month",
        "succeeded",
        "disputed",
        "dispute_rate"
      ],
      "sample": {
        "cols": [
          "charge_month",
          "succeeded",
          "disputed",
          "dispute_rate"
        ],
        "rows": [
          [
            "2024-04-01",
            "210",
            "5",
            "0.0238"
          ],
          [
            "2024-05-01",
            "240",
            "3",
            "0.0125"
          ]
        ]
      },
      "commonWrong": [
        "Bucketing by dispute date → recent months look artificially clean.",
        "Denominator from a different month than the numerator."
      ],
      "validation": [
        "Numerator and denominator share the same charge-month.",
        "Recent months' rates are still rising (disputes pending)."
      ],
      "edgeCases": [
        "The latest charge-months are lower bounds — disputes haven't all arrived.",
        "Time zone shifts which month a late-night charge falls in."
      ],
      "checklist": [
        "bucket by charge month",
        "aligned numerator/denominator",
        "late-arrival lower-bound caveat"
      ]
    },
    "explain": "Explain why dispute-date bucketing understates recent months.",
    "teaches": "Cohort attribution for late-arriving events.",
    "harder": "Time alignment is the whole difficulty.",
    "mode": "SQL"
  },
  {
    "id": "rf8",
    "ladder": "ref",
    "pos": 8,
    "stage": "Final boss",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "DataLemur-style",
    "module": "m12",
    "title": "Final Boss: trailing-30 dispute spike vs trailing-90 baseline",
    "concept": [
      "disputes",
      "dates",
      "cte"
    ],
    "obj": [
      "Dispute",
      "Charge"
    ],
    "metric": "dispute spike",
    "edge": [
      "late-arriving data",
      "fan-out",
      "time zones"
    ],
    "timed": true,
    "est": "12 min",
    "business": "Risk wants a single query that flags emerging chargeback problems before they breach network limits.",
    "schema": [
      "charges",
      "disputes"
    ],
    "prompt": "Flag merchants whose trailing-30-day dispute rate exceeds 2× their trailing-90-day baseline, with ≥200 charges in 30 days, attributing by charge date. State assumptions, then build it.",
    "hints": [
      "Two windowed CTEs keyed by charge date; COUNT(DISTINCT) both sides.",
      "Volume floor + NULLIF guards; compare the two rates."
    ],
    "solution": "WITH base AS (\n  SELECT c.merchant_id, c.charge_id, c.created_at AS charge_at, d.dispute_id\n  FROM charges c LEFT JOIN disputes d ON d.charge_id=c.charge_id\n  WHERE c.status='succeeded'\n),\nw30 AS (SELECT merchant_id, COUNT(DISTINCT charge_id) chg, COUNT(DISTINCT dispute_id) disp\n        FROM base WHERE charge_at >= NOW()-INTERVAL '30 days' GROUP BY merchant_id),\nw90 AS (SELECT merchant_id, COUNT(DISTINCT charge_id) chg, COUNT(DISTINCT dispute_id) disp\n        FROM base WHERE charge_at >= NOW()-INTERVAL '90 days' GROUP BY merchant_id)\nSELECT a.merchant_id,\n       ROUND(a.disp::numeric/NULLIF(a.chg,0),4) AS rate_30d,\n       ROUND(b.disp::numeric/NULLIF(b.chg,0),4) AS baseline_90d\nFROM w30 a JOIN w90 b USING (merchant_id)\nWHERE a.chg >= 200\n  AND a.disp::numeric/NULLIF(a.chg,0) > 2*(b.disp::numeric/NULLIF(b.chg,0))\nORDER BY rate_30d DESC;",
    "verify": {
      "grain": "One row per merchant breaching the 2× rule.",
      "columns": [
        "merchant_id",
        "rate_30d",
        "baseline_90d"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "rate_30d",
          "baseline_90d"
        ],
        "rows": [
          [
            "103",
            "0.0260",
            "0.0110"
          ]
        ]
      },
      "commonWrong": [
        "Attributing by dispute date.",
        "No volume floor.",
        "Dividing by zero with no NULLIF."
      ],
      "validation": [
        "rate_30d > 2 × baseline_90d for every row.",
        "Flagged merchants have ≥200 charges in 30d."
      ],
      "edgeCases": [
        "Charge-date attribution makes the 30-day rate a rising lower bound.",
        "Time-zone boundaries shift the windows."
      ],
      "checklist": [
        "two windowed CTEs by charge date",
        "DISTINCT both sides",
        "volume floor",
        "NULLIF",
        "late-data caveat"
      ]
    },
    "explain": "Walk the interviewer through your assumptions, metric, grain, and the late-data caveat.",
    "teaches": "Baseline-vs-recent anomaly detection on late-arriving data.",
    "harder": "The capstone: ambiguity, two windows, late data, timed.",
    "mode": "SQL"
  }
];

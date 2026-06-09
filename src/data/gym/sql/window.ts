import type { Problem } from '@/types';

/* MIGRATED DATA — edit a problem here, then it is auto-included via src/data/gym/index.ts.
   Source of truth migrated from the original single-file app (Repo-2). */
export const windowProblems: Problem[] = [
  {
    "id": "wn1",
    "ladder": "win",
    "pos": 1,
    "stage": "Recognition",
    "lvl": 0,
    "difficulty": "recognition",
    "priority": "required",
    "source": "WindowFunctions-style",
    "module": "m6",
    "title": "Why windows keep row-level detail",
    "concept": [
      "windows"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "n/a",
    "edge": [],
    "timed": false,
    "est": "3 min",
    "business": "You need each charge AND a running total per customer in the same result.",
    "schema": [
      "charges"
    ],
    "prompt": "In plain English: how does a window function differ from GROUP BY, and why does that matter when you want to keep every charge row but also show a cumulative total?",
    "hints": [
      "GROUP BY collapses rows; a window adds a column and keeps rows.",
      "PARTITION BY is the group; ORDER BY is the sequence."
    ],
    "model": "GROUP BY returns one row per group, destroying row-level detail. A window function computes across a set of rows (the PARTITION) but keeps every input row, adding a computed column. So you can show each charge and its running total side by side — impossible with GROUP BY alone.",
    "grain": "Conceptual — row-level grain preserved.",
    "explain": "Say: 'I need per-row detail plus a cross-row computation, so this is a window, not GROUP BY.'",
    "teaches": "Windows preserve rows; GROUP BY collapses them.",
    "harder": "First rung — the core distinction.",
    "mode": "SQL"
  },
  {
    "id": "wn2",
    "ladder": "win",
    "pos": 2,
    "stage": "Mechanical",
    "lvl": 1,
    "difficulty": "easy",
    "priority": "required",
    "source": "WindowFunctions-style",
    "module": "m6",
    "title": "ROW_NUMBER per merchant",
    "concept": [
      "windows",
      "row_number"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "sequence",
    "edge": [],
    "timed": false,
    "est": "4 min",
    "business": "Number each merchant's succeeded charges in chronological order.",
    "schema": [
      "charges"
    ],
    "prompt": "Return charge_id, merchant_id, and a per-merchant sequence number (1 = oldest) for succeeded charges.",
    "hints": [
      "ROW_NUMBER() OVER (PARTITION BY merchant_id ORDER BY created_at)."
    ],
    "solution": "SELECT charge_id, merchant_id,\n       ROW_NUMBER() OVER (PARTITION BY merchant_id ORDER BY created_at) AS seq\nFROM charges\nWHERE status='succeeded';",
    "grain": "One row per succeeded charge (rows preserved).",
    "explain": "Explain what PARTITION BY and ORDER BY each control.",
    "teaches": "The anatomy of a window: function OVER (PARTITION BY … ORDER BY …).",
    "harder": "Adds the OVER clause to step 1's idea.",
    "mode": "SQL"
  },
  {
    "id": "wn3",
    "ladder": "win",
    "pos": 3,
    "stage": "Simple application",
    "lvl": 2,
    "difficulty": "medium",
    "priority": "required",
    "source": "WindowFunctions-style",
    "module": "m6",
    "title": "Rank merchants by GPV",
    "concept": [
      "windows",
      "rank"
    ],
    "obj": [
      "Charge",
      "Merchant"
    ],
    "metric": "GPV rank",
    "edge": [
      "multi-currency"
    ],
    "timed": false,
    "est": "6 min",
    "business": "Rank merchants by USD gross volume for a leaderboard; ties should share a rank.",
    "schema": [
      "charges"
    ],
    "prompt": "Return merchant_id, gpv_usd, and rank (ties share). Top 10.",
    "hints": [
      "Aggregate GPV in a CTE, then RANK() OVER (ORDER BY gross DESC).",
      "RANK ties-then-skips; that's usually what 'rank' means."
    ],
    "solution": "WITH gpv AS (\n  SELECT merchant_id, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id\n)\nSELECT merchant_id, gross/100.0 AS gpv_usd,\n       RANK() OVER (ORDER BY gross DESC) AS rnk\nFROM gpv ORDER BY rnk LIMIT 10;",
    "verify": {
      "grain": "One row per merchant (top 10).",
      "columns": [
        "merchant_id",
        "gpv_usd",
        "rnk"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "gpv_usd",
          "rnk"
        ],
        "rows": [
          [
            "102",
            "184320.00",
            "1"
          ],
          [
            "105",
            "151200.50",
            "2"
          ]
        ]
      },
      "commonWrong": [
        "Summing across currencies.",
        "ROW_NUMBER when ties should share a rank."
      ],
      "validation": [
        "Velvet (102) likely #1.",
        "rnk ascending matches gpv descending."
      ],
      "edgeCases": [
        "RANK vs DENSE_RANK vs ROW_NUMBER — state your choice.",
        "USD-only scope excludes GlobalGoods' other currencies."
      ],
      "checklist": [
        "GPV in a CTE",
        "RANK chosen + justified",
        "Currency scoped"
      ]
    },
    "explain": "Explain why you chose RANK over ROW_NUMBER.",
    "teaches": "Ranking with ties; aggregate-then-window.",
    "harder": "Combines a CTE with a window ranking function.",
    "mode": "SQL"
  },
  {
    "id": "wn4",
    "ladder": "win",
    "pos": 4,
    "stage": "Applied metric",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "required",
    "source": "GitHub-repo-style",
    "module": "m6",
    "title": "First successful charge per customer",
    "concept": [
      "windows",
      "row_number"
    ],
    "obj": [
      "Charge",
      "Customer"
    ],
    "metric": "activation",
    "edge": [
      "ties"
    ],
    "timed": false,
    "est": "7 min",
    "business": "Activation analysis: find each customer's very first succeeded charge.",
    "schema": [
      "charges"
    ],
    "prompt": "Return one row per customer: their first succeeded charge_id and its created_at.",
    "hints": [
      "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) and keep rn=1.",
      "Filter rn=1 in an outer query (windows aren't allowed in WHERE).",
      "Add a tiebreaker for identical timestamps."
    ],
    "solution": "WITH r AS (\n  SELECT customer_id, charge_id, created_at,\n         ROW_NUMBER() OVER (PARTITION BY customer_id\n                            ORDER BY created_at, charge_id) AS rn\n  FROM charges WHERE status='succeeded'\n)\nSELECT customer_id, charge_id AS first_charge_id, created_at AS first_at\nFROM r WHERE rn = 1;",
    "verify": {
      "grain": "One row per customer with ≥1 succeeded charge.",
      "columns": [
        "customer_id",
        "first_charge_id",
        "first_at"
      ],
      "sample": {
        "cols": [
          "customer_id",
          "first_charge_id",
          "first_at"
        ],
        "rows": [
          [
            "55101",
            "90011",
            "2024-01-05 09:00+00"
          ]
        ]
      },
      "commonWrong": [
        "Filtering rn=1 in WHERE of the same SELECT (not allowed).",
        "No tiebreaker → non-deterministic 'first' on tied timestamps."
      ],
      "validation": [
        "One row per customer.",
        "first_at is the minimum succeeded created_at for that customer."
      ],
      "edgeCases": [
        "Customers with only failed charges don't appear.",
        "Two charges at the same instant need charge_id as a tiebreaker."
      ],
      "checklist": [
        "ROW_NUMBER partitioned by customer",
        "rn=1 filtered in outer query",
        "deterministic tiebreaker"
      ]
    },
    "explain": "Explain why the window must be filtered in a CTE/outer query.",
    "teaches": "'First/last per group' via ROW_NUMBER = 1.",
    "harder": "Requires the CTE-then-filter pattern and a tiebreaker.",
    "mode": "SQL"
  },
  {
    "id": "wn5",
    "ladder": "win",
    "pos": 5,
    "stage": "Multi-step",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "Mode-style",
    "module": "m6",
    "title": "Month-over-month GPV with LAG",
    "concept": [
      "windows",
      "lag",
      "dates"
    ],
    "obj": [
      "Charge",
      "Merchant"
    ],
    "metric": "MoM growth",
    "edge": [
      "late-arriving data",
      "time zones"
    ],
    "timed": false,
    "est": "9 min",
    "business": "Show each merchant's monthly USD GPV and its % change vs the prior month.",
    "schema": [
      "charges"
    ],
    "prompt": "Per merchant and month: gpv_usd and mom_pct (% change vs previous month).",
    "hints": [
      "Aggregate monthly GPV in a CTE (DATE_TRUNC).",
      "LAG(gross) OVER (PARTITION BY merchant_id ORDER BY month); guard with NULLIF."
    ],
    "solution": "WITH m AS (\n  SELECT merchant_id, DATE_TRUNC('month', created_at) AS month, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id, DATE_TRUNC('month', created_at)\n)\nSELECT merchant_id, month, gross/100.0 AS gpv_usd,\n       ROUND((gross - LAG(gross) OVER (PARTITION BY merchant_id ORDER BY month))::numeric\n             / NULLIF(LAG(gross) OVER (PARTITION BY merchant_id ORDER BY month),0)*100,1) AS mom_pct\nFROM m ORDER BY merchant_id, month;",
    "verify": {
      "grain": "One row per (merchant, month).",
      "columns": [
        "merchant_id",
        "month",
        "gpv_usd",
        "mom_pct"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "month",
          "gpv_usd",
          "mom_pct"
        ],
        "rows": [
          [
            "102",
            "2024-05-01",
            "16100.00",
            "5.9"
          ],
          [
            "102",
            "2024-06-01",
            "12300.00",
            "-23.6"
          ]
        ]
      },
      "commonWrong": [
        "Missing months make LAG compare to the wrong prior month.",
        "No NULLIF → divide-by-zero on the first month."
      ],
      "validation": [
        "First month per merchant has NULL mom_pct.",
        "mom_pct sign matches whether GPV rose or fell."
      ],
      "edgeCases": [
        "Gap months: a skipped month makes LAG reach two months back — use a month spine to be rigorous.",
        "The current month is partial; its growth is provisional."
      ],
      "checklist": [
        "Monthly CTE",
        "LAG partitioned per merchant",
        "NULLIF guard",
        "gap/partial-month caveats"
      ]
    },
    "explain": "Explain what a missing month does to LAG and how a date spine fixes it.",
    "teaches": "Period-over-period with LAG.",
    "harder": "Time bucketing + ordered window + null-safe division.",
    "mode": "SQL"
  },
  {
    "id": "wn6",
    "ladder": "win",
    "pos": 6,
    "stage": "Edge-case hard",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "WindowFunctions-style",
    "module": "m6",
    "title": "Deduplicate: latest row per idempotency_key",
    "concept": [
      "windows",
      "dedup",
      "row_number"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "dedup",
    "edge": [
      "duplicates",
      "NULLs"
    ],
    "timed": false,
    "est": "7 min",
    "business": "CloudDesk (merchant 107) retries charges under one idempotency_key, creating duplicate rows.",
    "schema": [
      "charges"
    ],
    "prompt": "Keep exactly one row per idempotency_key (the latest) for merchant 107. Return idempotency_key, charge_id, status.",
    "hints": [
      "ROW_NUMBER() OVER (PARTITION BY idempotency_key ORDER BY created_at DESC, charge_id DESC) = 1.",
      "DISTINCT can't 'keep the latest'."
    ],
    "solution": "SELECT idempotency_key, charge_id, status\nFROM (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY idempotency_key\n            ORDER BY created_at DESC, charge_id DESC) AS rn\n  FROM charges WHERE merchant_id = 107\n) t\nWHERE rn = 1;",
    "verify": {
      "grain": "One row per idempotency_key for merchant 107.",
      "columns": [
        "idempotency_key",
        "charge_id",
        "status"
      ],
      "sample": {
        "cols": [
          "idempotency_key",
          "charge_id",
          "status"
        ],
        "rows": [
          [
            "ik_9f2a",
            "90412",
            "succeeded"
          ]
        ]
      },
      "commonWrong": [
        "DISTINCT on all columns (different charge_ids stay 'distinct').",
        "No deterministic tiebreaker → non-reproducible result."
      ],
      "validation": [
        "Output rows = COUNT(DISTINCT idempotency_key) for 107.",
        "Each kept row is the most recent for its key."
      ],
      "edgeCases": [
        "NULL idempotency_key rows all collapse into one group — handle separately.",
        "Keep-rule could prefer a succeeded row over the latest — state which."
      ],
      "checklist": [
        "ROW_NUMBER on idempotency_key",
        "deterministic tiebreaker",
        "rn=1 in outer query",
        "NULL-key caveat"
      ]
    },
    "explain": "Explain your keep-rule and the tiebreaker that makes it reproducible.",
    "teaches": "Deduplication via ROW_NUMBER = 1.",
    "harder": "A real data-quality problem with a non-obvious keep-rule.",
    "mode": "SQL"
  },
  {
    "id": "wn7",
    "ladder": "win",
    "pos": 7,
    "stage": "Debug",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "WindowFunctions-style",
    "module": "m6",
    "title": "Debug: running total shows the grand total",
    "concept": [
      "windows",
      "frames"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "running total",
    "edge": [
      "ROWS vs RANGE"
    ],
    "timed": false,
    "est": "6 min",
    "business": "A per-customer running total prints the same grand total on every row.",
    "schema": [
      "charges"
    ],
    "broken": "SELECT customer_id, created_at,\n       SUM(amount) OVER (PARTITION BY customer_id) AS running\nFROM charges WHERE status='succeeded';",
    "prompt": "Why is 'running' the same on every row, and how do you make it a true running total?",
    "hints": [
      "A SUM OVER with no ORDER BY covers the whole partition.",
      "Add ORDER BY created_at with ROWS UNBOUNDED PRECEDING."
    ],
    "solution": "SELECT customer_id, created_at,\n       SUM(amount) OVER (PARTITION BY customer_id\n                         ORDER BY created_at\n                         ROWS UNBOUNDED PRECEDING) AS running\nFROM charges WHERE status='succeeded';",
    "verify": {
      "grain": "One row per succeeded charge.",
      "columns": [
        "customer_id",
        "created_at",
        "running"
      ],
      "sample": {
        "cols": [
          "customer_id",
          "created_at",
          "running"
        ],
        "rows": [
          [
            "55101",
            "2024-01-05",
            "999"
          ],
          [
            "55101",
            "2024-02-05",
            "1998"
          ]
        ]
      },
      "commonWrong": [
        "Adding ORDER BY but leaving the default RANGE frame, which lumps tied timestamps together.",
        "Thinking PARTITION BY alone makes it cumulative."
      ],
      "validation": [
        "running is non-decreasing within a customer.",
        "Last row per customer = that customer's total."
      ],
      "edgeCases": [
        "ROWS vs RANGE matters when timestamps tie — ROWS steps per row.",
        "Add charge_id to ORDER BY for full determinism."
      ],
      "checklist": [
        "ORDER BY added",
        "ROWS frame for true running total",
        "non-decreasing within customer"
      ]
    },
    "explain": "Explain the difference between no-ORDER-BY, RANGE, and ROWS frames.",
    "teaches": "Window frames: whole-partition vs running.",
    "harder": "Frame semantics are subtle and interview-favourite.",
    "mode": "SQL"
  },
  {
    "id": "wn8",
    "ladder": "win",
    "pos": 8,
    "stage": "Final boss",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "Mode-style",
    "module": "m6",
    "title": "Final Boss: rolling 30-day dispute spike vs 90-day baseline",
    "concept": [
      "windows",
      "dates",
      "cte"
    ],
    "obj": [
      "Charge",
      "Dispute"
    ],
    "metric": "dispute rate",
    "edge": [
      "late-arriving data",
      "time zones"
    ],
    "timed": true,
    "est": "12 min",
    "business": "Fraud ops wants an early-warning signal: merchants whose recent dispute rate is spiking versus their own baseline.",
    "schema": [
      "charges",
      "disputes"
    ],
    "prompt": "Flag merchants whose trailing-30-day dispute rate is more than 2× their trailing-90-day baseline, with ≥200 charges in the 30-day window. Attribute disputes by the CHARGE date. Clarify assumptions, then build it.",
    "hints": [
      "Two windowed CTEs (30d, 90d) keyed by charge date; COUNT(DISTINCT) both sides.",
      "Compare rates with NULLIF guards; a volume floor avoids false alarms."
    ],
    "solution": "WITH base AS (\n  SELECT c.merchant_id, c.charge_id, c.created_at AS charge_at, d.dispute_id\n  FROM charges c\n  LEFT JOIN disputes d ON d.charge_id = c.charge_id\n  WHERE c.status='succeeded'\n),\nw30 AS (\n  SELECT merchant_id, COUNT(DISTINCT charge_id) chg, COUNT(DISTINCT dispute_id) disp\n  FROM base WHERE charge_at >= NOW() - INTERVAL '30 days' GROUP BY merchant_id\n),\nw90 AS (\n  SELECT merchant_id, COUNT(DISTINCT charge_id) chg, COUNT(DISTINCT dispute_id) disp\n  FROM base WHERE charge_at >= NOW() - INTERVAL '90 days' GROUP BY merchant_id\n)\nSELECT a.merchant_id,\n       ROUND(a.disp::numeric/NULLIF(a.chg,0),4) AS rate_30d,\n       ROUND(b.disp::numeric/NULLIF(b.chg,0),4) AS baseline_90d\nFROM w30 a JOIN w90 b USING (merchant_id)\nWHERE a.chg >= 200\n  AND a.disp::numeric/NULLIF(a.chg,0) > 2 * (b.disp::numeric/NULLIF(b.chg,0))\nORDER BY rate_30d DESC;",
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
        "Attributing disputes by dispute_date → recent window looks artificially clean.",
        "No volume floor → noisy windows fire false alarms."
      ],
      "validation": [
        "Every row: rate_30d > 2 × baseline_90d.",
        "Flagged merchants have ≥200 charges in 30d."
      ],
      "edgeCases": [
        "Charge-date attribution means the 30-day rate is a rising lower bound (late disputes).",
        "Time-zone choice shifts the window boundaries."
      ],
      "checklist": [
        "Two windowed CTEs by charge date",
        "NULLIF guards",
        "volume floor 200",
        "late-arrival caveat stated"
      ]
    },
    "explain": "Explain why you attribute by charge date and what that does to the most recent window.",
    "teaches": "Windowed cohort comparison + late-arriving data judgment.",
    "harder": "Ambiguous, multi-CTE, late-data-aware, timed.",
    "mode": "SQL"
  }
];

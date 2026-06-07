import type { Problem } from '@/types';

/* MIGRATED DATA — edit a problem here, then it is auto-included via src/data/gym/index.ts.
   Source of truth migrated from the original single-file app (Repo-2). */
export const conditionalProblems: Problem[] = [
  {
    "id": "ca1",
    "ladder": "cond",
    "pos": 1,
    "stage": "Recognition",
    "lvl": 0,
    "difficulty": "recognition",
    "priority": "required",
    "source": "SQLBolt-style",
    "module": "m3",
    "title": "Recognize the 0/1 success flag",
    "concept": [
      "case",
      "rates"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "success rate",
    "edge": [],
    "timed": false,
    "est": "3 min",
    "business": "Stripe asks for 'payment success rate'. Before any SQL, get crisp on what makes one charge a success and what averaging that does.",
    "schema": [
      "charges"
    ],
    "prompt": "In plain English: which column and value mark a charge as a success, and what does the <em>average</em> of a 0/1 success flag represent? No SQL — describe the indicator, the metric, and the grain you'd report at.",
    "hints": [
      "A charge's status is 'succeeded', 'failed', or 'pending'.",
      "If success = 1 and everything else = 0, the mean of that column is a proportion."
    ],
    "model": "Success condition: status = 'succeeded'. Encode succeeded → 1, otherwise → 0. The AVG of that 0/1 flag across rows is the share that succeeded — i.e. the success rate. The grain (per merchant, per day, …) is whatever you GROUP BY. The denominator is every eligible attempt, not just the successes.",
    "grain": "Conceptual — no rows returned yet.",
    "explain": "Say aloud: 'Success rate is the mean of a 0/1 success flag; my denominator is all eligible attempts.'",
    "teaches": "A rate is just the mean of a 0/1 indicator.",
    "harder": "This is the first rung — pure intuition, no syntax.",
    "mode": "SQL"
  },
  {
    "id": "ca2",
    "ladder": "cond",
    "pos": 2,
    "stage": "Mechanical",
    "lvl": 1,
    "difficulty": "easy",
    "priority": "required",
    "source": "SQLBolt-style",
    "module": "m3",
    "title": "Write CASE WHEN for succeeded vs not",
    "concept": [
      "case"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "flag",
    "edge": [],
    "timed": false,
    "est": "4 min",
    "business": "Build the indicator column you described in step 1.",
    "schema": [
      "charges"
    ],
    "prompt": "Return <code class='inline'>charge_id</code> and a column <code class='inline'>is_success</code> = 1 when status='succeeded', else 0, for merchant 101.",
    "hints": [
      "CASE WHEN status='succeeded' THEN 1 ELSE 0 END."
    ],
    "solution": "SELECT charge_id,\n       CASE WHEN status='succeeded' THEN 1 ELSE 0 END AS is_success\nFROM charges\nWHERE merchant_id = 101;",
    "grain": "One row per charge for merchant 101.",
    "explain": "Explain why ELSE 0 matters: failed AND pending both fall into 'not success' here.",
    "teaches": "Encoding a 0/1 indicator with CASE.",
    "harder": "Adds real syntax to the step-1 idea; still one table, no aggregation.",
    "mode": "SQL"
  },
  {
    "id": "ca3",
    "ladder": "cond",
    "pos": 3,
    "stage": "Simple application",
    "lvl": 2,
    "difficulty": "medium",
    "priority": "required",
    "source": "pgexercises-style",
    "module": "m3",
    "title": "Count succeeded charges and attempts by merchant",
    "concept": [
      "case",
      "groupby"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "counts",
    "edge": [
      "pending"
    ],
    "timed": false,
    "est": "5 min",
    "business": "Operations want, per merchant, how many charges were attempted and how many succeeded.",
    "schema": [
      "charges"
    ],
    "prompt": "For each merchant return <code class='inline'>attempts</code> (all statuses) and <code class='inline'>succeeded</code>.",
    "hints": [
      "COUNT(*) for attempts.",
      "Conditional count: COUNT(*) FILTER (WHERE status='succeeded')."
    ],
    "solution": "SELECT merchant_id,\n       COUNT(*) AS attempts,\n       COUNT(*) FILTER (WHERE status='succeeded') AS succeeded\nFROM charges\nGROUP BY merchant_id\nORDER BY merchant_id;",
    "verify": {
      "grain": "One row per merchant.",
      "columns": [
        "merchant_id",
        "attempts",
        "succeeded"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "attempts",
          "succeeded"
        ],
        "rows": [
          [
            "101",
            "1000",
            "780"
          ],
          [
            "102",
            "1500",
            "1440"
          ]
        ]
      },
      "commonWrong": [
        "Using WHERE status='succeeded' — that shrinks the attempts denominator too.",
        "COUNT(status) instead of COUNT(*) for attempts."
      ],
      "validation": [
        "succeeded ≤ attempts in every row.",
        "Sum of attempts = total charges."
      ],
      "edgeCases": [
        "Pending charges are counted in attempts — decide later whether that's right.",
        "A merchant with only failed charges shows succeeded = 0, not absent."
      ],
      "checklist": [
        "FILTER keeps the full denominator",
        "succeeded ≤ attempts",
        "grouped by merchant"
      ]
    },
    "explain": "Explain why FILTER beats a second WHERE-filtered query here.",
    "teaches": "Conditional COUNT alongside the total without shrinking the denominator.",
    "harder": "Introduces grouping and the attempts-vs-successes split.",
    "mode": "SQL"
  },
  {
    "id": "ca4",
    "ladder": "cond",
    "pos": 4,
    "stage": "Applied metric",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "required",
    "source": "DataLemur-style",
    "module": "m3",
    "title": "Payment success rate by merchant",
    "concept": [
      "case",
      "rates"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "success rate",
    "edge": [
      "integer division"
    ],
    "timed": false,
    "est": "6 min",
    "business": "The classic Stripe metric: what fraction of attempts succeed, per merchant?",
    "schema": [
      "charges"
    ],
    "prompt": "Compute success rate per merchant (succeeded ÷ attempts), worst first.",
    "hints": [
      "AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END).",
      "Order ascending so the worst float to the top."
    ],
    "solution": "SELECT merchant_id,\n       AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate\nFROM charges\nGROUP BY merchant_id\nORDER BY success_rate ASC;",
    "verify": {
      "grain": "One row per merchant.",
      "columns": [
        "merchant_id",
        "success_rate"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "success_rate"
        ],
        "rows": [
          [
            "101",
            "0.78"
          ],
          [
            "106",
            "0.90"
          ],
          [
            "102",
            "0.96"
          ]
        ]
      },
      "commonWrong": [
        "THEN 1 instead of 1.0 → integer division → all zeros.",
        "Denominator = successes instead of attempts."
      ],
      "validation": [
        "Every rate in [0,1].",
        "Northwind (101) ranks worst."
      ],
      "edgeCases": [
        "Pending in the denominator depresses the rate — clarify.",
        "Tiny merchants can show 0 or 1 — a volume floor comes next."
      ],
      "checklist": [
        "Used 1.0 (float)",
        "Denominator = attempts",
        "Northwind worst (sanity)"
      ]
    },
    "explain": "State your denominator out loud and why integer division would break it.",
    "teaches": "The AVG-of-indicator rate and the integer-division trap.",
    "harder": "Now a ratio — the float/denominator discipline matters.",
    "mode": "SQL"
  },
  {
    "id": "ca5",
    "ladder": "cond",
    "pos": 5,
    "stage": "Multi-step",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "DataLemur-style",
    "module": "m3",
    "title": "Success rate: last 30 days, ≥100-attempt floor",
    "concept": [
      "case",
      "rates",
      "having"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "success rate",
    "edge": [
      "pending",
      "low-volume"
    ],
    "timed": false,
    "est": "8 min",
    "business": "A noisy leaderboard is useless. Restrict to recent activity and meaningful volume.",
    "schema": [
      "charges"
    ],
    "prompt": "Success rate per merchant over the last 30 days, only merchants with ≥100 attempts, worst first.",
    "hints": [
      "Time window in WHERE; volume floor in HAVING.",
      "HAVING COUNT(*) >= 100."
    ],
    "solution": "SELECT merchant_id,\n       COUNT(*) AS attempts,\n       AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate\nFROM charges\nWHERE created_at >= NOW() - INTERVAL '30 days'\nGROUP BY merchant_id\nHAVING COUNT(*) >= 100\nORDER BY success_rate ASC;",
    "verify": {
      "grain": "One row per merchant with ≥100 attempts in the window.",
      "columns": [
        "merchant_id",
        "attempts",
        "success_rate"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "attempts",
          "success_rate"
        ],
        "rows": [
          [
            "101",
            "1000",
            "0.78"
          ],
          [
            "103",
            "800",
            "0.94"
          ]
        ]
      },
      "commonWrong": [
        "Volume floor in WHERE (it's an aggregate → HAVING).",
        "Hard-coded date instead of a relative interval."
      ],
      "validation": [
        "All rows have attempts ≥ 100.",
        "Rates in [0,1]."
      ],
      "edgeCases": [
        "Time zone shifts the 30-day boundary.",
        "A merchant with 100 attempts all on day 31 won't appear."
      ],
      "checklist": [
        "Window in WHERE",
        "Floor in HAVING",
        "Relative interval",
        "Rates valid"
      ]
    },
    "explain": "Justify the 100-attempt floor and the 30-day window to a PM.",
    "teaches": "Row filter (WHERE) vs group filter (HAVING) plus a volume floor.",
    "harder": "Combines filtering, grouping, and group-level thresholds.",
    "mode": "SQL"
  },
  {
    "id": "ca6",
    "ladder": "cond",
    "pos": 6,
    "stage": "Debug",
    "lvl": 3,
    "difficulty": "hard",
    "priority": "required",
    "source": "GitHub-repo-style",
    "module": "m3",
    "title": "Debug: every success rate is 0 or 1",
    "concept": [
      "case",
      "rates"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "success rate",
    "edge": [
      "integer division"
    ],
    "timed": false,
    "est": "4 min",
    "business": "A teammate's per-merchant success rate returns only 0s and 1s.",
    "schema": [
      "charges"
    ],
    "broken": "SELECT merchant_id,\n       SUM(CASE WHEN status='succeeded' THEN 1 ELSE 0 END) / COUNT(*) AS success_rate\nFROM charges\nGROUP BY merchant_id;",
    "prompt": "Find the bug in the query above and fix it.",
    "hints": [
      "What types are the numerator and denominator?",
      "integer ÷ integer truncates toward zero."
    ],
    "solution": "SELECT merchant_id,\n       AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate\nFROM charges\nGROUP BY merchant_id;",
    "verify": {
      "grain": "One row per merchant.",
      "columns": [
        "merchant_id",
        "success_rate"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "success_rate"
        ],
        "rows": [
          [
            "101",
            "0.78"
          ],
          [
            "102",
            "0.96"
          ]
        ]
      },
      "commonWrong": [
        "'Fixing' it by casting only the denominator — cast the numerator or use 1.0.",
        "Leaving SUM(...)/COUNT(*) with integer 1."
      ],
      "validation": [
        "Rates are now fractional and in [0,1]."
      ],
      "edgeCases": [
        "::numeric on either side also works: SUM(...)::numeric/COUNT(*)."
      ],
      "checklist": [
        "Named the bug: integer division",
        "Used a float / AVG of 1.0"
      ]
    },
    "explain": "Explain the bug in one sentence and give the cleanest fix.",
    "teaches": "Spotting and repairing integer division.",
    "harder": "You must read and diagnose, not just write.",
    "mode": "SQL"
  },
  {
    "id": "ca7",
    "ladder": "cond",
    "pos": 7,
    "stage": "Edge-case hard",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "StrataScratch-style",
    "module": "m3",
    "title": "Exclude pending; success rate by merchant & currency",
    "concept": [
      "case",
      "rates",
      "groupby"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "success rate",
    "edge": [
      "pending",
      "multi-currency"
    ],
    "timed": false,
    "est": "8 min",
    "business": "In-flight pending charges aren't failures, and a multi-currency merchant hides currency-specific decline patterns.",
    "schema": [
      "charges"
    ],
    "prompt": "Success rate per merchant <em>and</em> currency over the last 30 days, excluding in-flight pending from the denominator, only (merchant,currency) cells with ≥50 settled attempts.",
    "hints": [
      "Exclude pending: WHERE status IN ('succeeded','failed').",
      "GROUP BY merchant_id, currency; floor in HAVING."
    ],
    "solution": "SELECT merchant_id, currency,\n       COUNT(*) AS attempts,\n       AVG(CASE WHEN status='succeeded' THEN 1.0 ELSE 0 END) AS success_rate\nFROM charges\nWHERE status IN ('succeeded','failed')\n  AND created_at >= NOW() - INTERVAL '30 days'\nGROUP BY merchant_id, currency\nHAVING COUNT(*) >= 50\nORDER BY merchant_id, currency;",
    "verify": {
      "grain": "One row per (merchant, currency) cell with ≥50 settled attempts.",
      "columns": [
        "merchant_id",
        "currency",
        "attempts",
        "success_rate"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "currency",
          "attempts",
          "success_rate"
        ],
        "rows": [
          [
            "106",
            "EUR",
            "220",
            "0.93"
          ],
          [
            "106",
            "USD",
            "180",
            "0.91"
          ]
        ]
      },
      "commonWrong": [
        "Leaving pending in the denominator (depresses the rate).",
        "Aggregating across currencies and losing the signal."
      ],
      "validation": [
        "GlobalGoods (106) appears once per currency.",
        "Each cell attempts ≥ 50; rates in [0,1]."
      ],
      "edgeCases": [
        "A rate is unit-free so blending currencies is mathematically OK but operationally hides decline patterns.",
        "'attempts' here means settled attempts — say so."
      ],
      "checklist": [
        "Pending excluded + denominator defined",
        "GROUP BY currency",
        "Per-cell floor",
        "Currency nuance explained"
      ]
    },
    "explain": "Explain why you split by currency even though a rate is unit-free.",
    "teaches": "Denominator decisions + multi-key grain on real, messy data.",
    "harder": "Two-key grain, an explicit exclusion, and a per-cell floor.",
    "mode": "SQL"
  },
  {
    "id": "ca8",
    "ladder": "cond",
    "pos": 8,
    "stage": "Final boss",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "DataLemur-style",
    "module": "m3",
    "title": "Final Boss: decline-reason mix + insufficient_funds flag",
    "concept": [
      "case",
      "windows",
      "cte"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "decline mix",
    "edge": [
      "NULLs",
      "pending"
    ],
    "timed": true,
    "est": "10 min",
    "business": "Ambiguous ask from a PM: 'Which merchants look unhealthy on declines this month?'",
    "schema": [
      "charges"
    ],
    "prompt": "For merchants with &gt;500 attempts in 30 days, find each merchant's top failure_code and its share of that merchant's failed charges; flag merchants whose top reason is <code class='inline'>insufficient_funds</code> exceeding 40% of failures. One row per merchant: top_reason, top_reason_share, flag. Clarify your assumptions first.",
    "hints": [
      "Layer CTEs: failures per code → totals → rank within merchant.",
      "failure_code is NULL on succeeded charges — restrict to failed for the mix."
    ],
    "solution": "WITH fails AS (\n  SELECT merchant_id, failure_code, COUNT(*) AS n\n  FROM charges\n  WHERE status='failed' AND created_at >= NOW() - INTERVAL '30 days'\n  GROUP BY merchant_id, failure_code\n),\ntot AS (SELECT merchant_id, SUM(n) AS fail_total FROM fails GROUP BY merchant_id),\nranked AS (\n  SELECT f.merchant_id, f.failure_code, f.n,\n         f.n::numeric / t.fail_total AS share,\n         ROW_NUMBER() OVER (PARTITION BY f.merchant_id ORDER BY f.n DESC) AS rk\n  FROM fails f JOIN tot t USING (merchant_id)\n),\nvol AS (\n  SELECT merchant_id, COUNT(*) AS attempts\n  FROM charges WHERE created_at >= NOW() - INTERVAL '30 days'\n  GROUP BY merchant_id HAVING COUNT(*) > 500\n)\nSELECT r.merchant_id, r.failure_code AS top_reason,\n       ROUND(r.share,3) AS top_reason_share,\n       (r.failure_code='insufficient_funds' AND r.share > 0.40) AS flag\nFROM ranked r JOIN vol v USING (merchant_id)\nWHERE r.rk = 1\nORDER BY top_reason_share DESC;",
    "verify": {
      "grain": "One row per qualifying merchant (&gt;500 attempts).",
      "columns": [
        "merchant_id",
        "top_reason",
        "top_reason_share",
        "flag"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "top_reason",
          "top_reason_share",
          "flag"
        ],
        "rows": [
          [
            "101",
            "insufficient_funds",
            "0.470",
            "true"
          ],
          [
            "103",
            "fraudulent",
            "0.310",
            "false"
          ]
        ]
      },
      "commonWrong": [
        "Including succeeded (NULL failure_code) rows in the failure mix.",
        "Computing share over all charges instead of over failures.",
        "Forgetting the >500 gate is on ALL attempts, not failures."
      ],
      "validation": [
        "Northwind (101) flagged true.",
        "Each merchant's shares would sum to 1 if all rows kept.",
        "Only >500-attempt merchants appear."
      ],
      "edgeCases": [
        "Ties for top reason: ROW_NUMBER picks one — RANK would surface ties.",
        "A failed charge with NULL failure_code (data quality) forms its own bucket."
      ],
      "checklist": [
        "CTE layering",
        "Restricted to failed for the mix",
        "Attempts gate on ALL charges",
        "Tie handling noted"
      ]
    },
    "explain": "Open by stating the two clarifications you'd ask, then your metric definition and grain.",
    "teaches": "CTE composition + ranking within a group + handling an ambiguous prompt under time pressure.",
    "harder": "Ambiguous, multi-CTE, timed — a real interview closer.",
    "mode": "SQL"
  }
];

import type { Problem } from '@/types';

/* MIGRATED DATA — edit a problem here, then it is auto-included via src/data/gym/index.ts.
   Source of truth migrated from the original single-file app (Repo-2). */
export const revenueProblems: Problem[] = [
  {
    "id": "rv1",
    "ladder": "rev",
    "pos": 1,
    "stage": "Recognition",
    "lvl": 0,
    "difficulty": "recognition",
    "priority": "required",
    "source": "Sigma-style",
    "module": "m11",
    "title": "GPV vs net revenue",
    "concept": [
      "revenue"
    ],
    "obj": [
      "Charge",
      "BalanceTransaction"
    ],
    "metric": "definitions",
    "edge": [
      "fees"
    ],
    "timed": false,
    "est": "3 min",
    "business": "A PM uses 'revenue' loosely. You need to pin down which number they mean.",
    "schema": [
      "charges",
      "balance_transactions"
    ],
    "prompt": "In plain English: how do GPV, net revenue, and MRR differ, and which table holds the truth for net revenue?",
    "hints": [
      "GPV = top-line succeeded volume.",
      "Net subtracts refunds, disputes, and fees — and lives in the ledger."
    ],
    "model": "GPV (gross payment volume) = sum of succeeded charge amounts; it ignores refunds, disputes, and fees. Net revenue = what the merchant keeps after those deductions, and it lives in balance_transactions.net_amount (the ledger). MRR = the normalized monthly run-rate of active subscriptions, not a sum of payments. Always read net from the ledger, never reconstruct it from charges.",
    "grain": "Conceptual.",
    "explain": "Say: 'Do you mean gross volume, net revenue, or MRR? They're different numbers.'",
    "teaches": "Three distinct 'revenue' metrics and where net truly lives.",
    "harder": "First rung — disambiguation.",
    "mode": "SQL"
  },
  {
    "id": "rv2",
    "ladder": "rev",
    "pos": 2,
    "stage": "Mechanical",
    "lvl": 1,
    "difficulty": "easy",
    "priority": "required",
    "source": "SQLBolt-style",
    "module": "m11",
    "title": "Sum succeeded charges → GPV",
    "concept": [
      "revenue",
      "groupby"
    ],
    "obj": [
      "Charge"
    ],
    "metric": "GPV",
    "edge": [
      "cents"
    ],
    "timed": false,
    "est": "4 min",
    "business": "Compute Velvet Apparel's gross volume.",
    "schema": [
      "charges"
    ],
    "prompt": "GPV (USD, succeeded) for merchant 102, in dollars.",
    "hints": [
      "SUM(amount)/100.0 with status and currency filters."
    ],
    "solution": "SELECT SUM(amount)/100.0 AS gpv_usd\nFROM charges\nWHERE merchant_id=102 AND status='succeeded' AND currency='usd';",
    "grain": "A single scalar (one merchant, one currency).",
    "explain": "Explain why this is GROSS, not revenue.",
    "teaches": "GPV = SUM of succeeded amounts, in the right units.",
    "harder": "Adds the cents/status/currency discipline.",
    "mode": "SQL"
  },
  {
    "id": "rv3",
    "ladder": "rev",
    "pos": 3,
    "stage": "Simple application",
    "lvl": 2,
    "difficulty": "medium",
    "priority": "required",
    "source": "Sigma-style",
    "module": "m11",
    "title": "Net revenue from the ledger",
    "concept": [
      "revenue"
    ],
    "obj": [
      "BalanceTransaction"
    ],
    "metric": "net revenue",
    "edge": [
      "fees",
      "multi-currency"
    ],
    "timed": false,
    "est": "5 min",
    "business": "Finance wants true net revenue per merchant, not gross volume.",
    "schema": [
      "balance_transactions"
    ],
    "prompt": "Net revenue (USD) per merchant from balance_transactions, highest first.",
    "hints": [
      "SUM(net_amount) grouped by merchant.",
      "Filter currency='usd' to stay comparable."
    ],
    "solution": "SELECT merchant_id, SUM(net_amount)/100.0 AS net_usd\nFROM balance_transactions\nWHERE currency='usd'\nGROUP BY merchant_id\nORDER BY net_usd DESC;",
    "verify": {
      "grain": "One row per merchant.",
      "columns": [
        "merchant_id",
        "net_usd"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "net_usd"
        ],
        "rows": [
          [
            "105",
            "142880.10"
          ],
          [
            "102",
            "160540.00"
          ]
        ]
      },
      "commonWrong": [
        "Summing gross_amount instead of net_amount (forgets fees).",
        "Using charges.amount and calling it net."
      ],
      "validation": [
        "net_usd < that merchant's GPV.",
        "Velvet (102) net is well below its $184k gross."
      ],
      "edgeCases": [
        "Payout-type ledger rows move money out — confirm they're excluded from 'revenue'.",
        "Report per currency or convert via FX."
      ],
      "checklist": [
        "net_amount (ledger)",
        "currency scoped",
        "net < gross sanity"
      ]
    },
    "explain": "Explain why the ledger is the source of truth for net.",
    "teaches": "Reading net revenue from balance_transactions.",
    "harder": "Shifts from charges to the ledger model.",
    "mode": "SQL"
  },
  {
    "id": "rv4",
    "ladder": "rev",
    "pos": 4,
    "stage": "Applied metric",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "required",
    "source": "StrataScratch-style",
    "module": "m11",
    "title": "Net revenue by merchant and currency",
    "concept": [
      "revenue",
      "groupby"
    ],
    "obj": [
      "BalanceTransaction"
    ],
    "metric": "net revenue",
    "edge": [
      "multi-currency"
    ],
    "timed": false,
    "est": "6 min",
    "business": "GlobalGoods settles in several currencies; report net per currency without blending.",
    "schema": [
      "balance_transactions"
    ],
    "prompt": "Net revenue per merchant AND currency (in minor units ÷ 100 for display), highest net first.",
    "hints": [
      "GROUP BY merchant_id, currency.",
      "Don't add cents across currencies."
    ],
    "solution": "SELECT merchant_id, currency,\n       SUM(net_amount)/100.0 AS net_display\nFROM balance_transactions\nGROUP BY merchant_id, currency\nORDER BY net_display DESC;",
    "verify": {
      "grain": "One row per (merchant, currency).",
      "columns": [
        "merchant_id",
        "currency",
        "net_display"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "currency",
          "net_display"
        ],
        "rows": [
          [
            "106",
            "EUR",
            "58200.00"
          ],
          [
            "106",
            "USD",
            "41020.00"
          ]
        ]
      },
      "commonWrong": [
        "Summing net across currencies into one number.",
        "Dividing JPY by 100 (JPY has no minor unit) — note the simplification."
      ],
      "validation": [
        "GlobalGoods (106) appears once per currency.",
        "Per-currency nets are positive for healthy merchants."
      ],
      "edgeCases": [
        "JPY is zero-decimal; /100 is wrong for it — flag the assumption.",
        "To get one comparable total you'd need an FX table."
      ],
      "checklist": [
        "GROUP BY currency",
        "no cross-currency sum",
        "JPY caveat noted"
      ]
    },
    "explain": "Explain why you cannot SUM net_amount across currencies.",
    "teaches": "Currency as part of the grain.",
    "harder": "Multi-currency correctness and a zero-decimal gotcha.",
    "mode": "SQL"
  },
  {
    "id": "rv5",
    "ladder": "rev",
    "pos": 5,
    "stage": "Multi-step",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "Sigma-style",
    "module": "m11",
    "title": "Net by ledger type with a reconciling total",
    "concept": [
      "revenue",
      "cte"
    ],
    "obj": [
      "BalanceTransaction"
    ],
    "metric": "net by type",
    "edge": [
      "fees"
    ],
    "timed": false,
    "est": "8 min",
    "business": "Show how Velvet's net breaks down across charges, refunds, fees, and disputes — and prove the parts sum to the total.",
    "schema": [
      "balance_transactions"
    ],
    "prompt": "For merchant 102 (USD), net_usd by ledger type plus a TOTAL row equal to the parts.",
    "hints": [
      "GROUP BY ROLLUP(type).",
      "COALESCE the NULL grouping key to 'TOTAL'."
    ],
    "solution": "SELECT COALESCE(type,'TOTAL') AS type,\n       SUM(net_amount)/100.0 AS net_usd\nFROM balance_transactions\nWHERE merchant_id=102 AND currency='usd'\nGROUP BY ROLLUP (type)\nORDER BY (type IS NULL), type;",
    "verify": {
      "grain": "One row per ledger type, plus a TOTAL.",
      "columns": [
        "type",
        "net_usd"
      ],
      "sample": {
        "cols": [
          "type",
          "net_usd"
        ],
        "rows": [
          [
            "charge",
            "182000.00"
          ],
          [
            "fee",
            "-5300.00"
          ],
          [
            "refund",
            "-16200.00"
          ],
          [
            "TOTAL",
            "159540.00"
          ]
        ]
      },
      "commonWrong": [
        "Summing gross and forgetting fees are negative net.",
        "Treating refunds as positive."
      ],
      "validation": [
        "TOTAL equals the sum of the type rows.",
        "fee/refund/dispute negative; charge positive."
      ],
      "edgeCases": [
        "ROLLUP emits NULL for the total key.",
        "'Won' disputes may post as positive reversals."
      ],
      "checklist": [
        "ROLLUP(type)",
        "signs correct",
        "TOTAL reconciles"
      ]
    },
    "explain": "Explain how the ledger's signed entries make net 'just a SUM'.",
    "teaches": "Decomposing net and reconciling with ROLLUP.",
    "harder": "Signed-entry reasoning plus a subtotal/total structure.",
    "mode": "SQL"
  },
  {
    "id": "rv6",
    "ladder": "rev",
    "pos": 6,
    "stage": "Debug",
    "lvl": 3,
    "difficulty": "hard",
    "priority": "required",
    "source": "GitHub-repo-style",
    "module": "m11",
    "title": "Debug: 'net revenue' is too high",
    "concept": [
      "revenue"
    ],
    "obj": [
      "BalanceTransaction"
    ],
    "metric": "net revenue",
    "edge": [
      "fees"
    ],
    "timed": false,
    "est": "5 min",
    "business": "A teammate's net revenue looks suspiciously close to gross.",
    "schema": [
      "balance_transactions"
    ],
    "broken": "SELECT merchant_id, SUM(gross_amount)/100.0 AS net_usd\nFROM balance_transactions\nWHERE currency='usd' AND type IN ('charge','refund')\nGROUP BY merchant_id;",
    "prompt": "Why is this not net revenue? Fix it to reflect true net.",
    "hints": [
      "Which column already nets out fees?",
      "Are all relevant ledger types included?"
    ],
    "solution": "SELECT merchant_id, SUM(net_amount)/100.0 AS net_usd\nFROM balance_transactions\nWHERE currency='usd'\nGROUP BY merchant_id;",
    "verify": {
      "grain": "One row per merchant.",
      "columns": [
        "merchant_id",
        "net_usd"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "net_usd"
        ],
        "rows": [
          [
            "102",
            "159540.00"
          ]
        ]
      },
      "commonWrong": [
        "Keeping gross_amount and just subtracting refunds manually.",
        "Excluding fee/dispute ledger types from the sum."
      ],
      "validation": [
        "Net drops below the gross-based figure.",
        "Matches the all-types net query."
      ],
      "edgeCases": [
        "net_amount already embeds the fee, so don't subtract fees twice."
      ],
      "checklist": [
        "Used net_amount",
        "Included all ledger types",
        "Net < gross"
      ]
    },
    "explain": "Explain the difference between gross_amount and net_amount in one sentence.",
    "teaches": "Net lives in net_amount across ALL ledger types.",
    "harder": "Two bugs at once: wrong column and a filtered type set.",
    "mode": "SQL"
  },
  {
    "id": "rv7",
    "ladder": "rev",
    "pos": 7,
    "stage": "Edge-case hard",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "Sigma-style",
    "module": "m11",
    "title": "Settlement timing: available_on vs created_at",
    "concept": [
      "revenue",
      "dates"
    ],
    "obj": [
      "BalanceTransaction"
    ],
    "metric": "settled net",
    "edge": [
      "created_at vs available_on",
      "time zones"
    ],
    "timed": false,
    "est": "8 min",
    "business": "Finance closes the books on settled money. A charge created June 30 may settle (become available) in July.",
    "schema": [
      "balance_transactions"
    ],
    "prompt": "Net revenue (USD) that SETTLED in June 2024 — bucket by available_on, not created_at. One row.",
    "hints": [
      "Filter on available_on within June.",
      "Contrast: created_at would book it in the wrong month."
    ],
    "solution": "SELECT SUM(net_amount)/100.0 AS settled_net_usd\nFROM balance_transactions\nWHERE currency='usd'\n  AND available_on >= DATE '2024-06-01'\n  AND available_on <  DATE '2024-07-01';",
    "verify": {
      "grain": "A single scalar (settled net for June).",
      "columns": [
        "settled_net_usd"
      ],
      "sample": {
        "cols": [
          "settled_net_usd"
        ],
        "rows": [
          [
            "142310.00"
          ]
        ]
      },
      "commonWrong": [
        "Bucketing by created_at — books late-June charges that settle in July into June.",
        "Using BETWEEN with an inclusive upper bound that captures July 1."
      ],
      "validation": [
        "Differs from a created_at-based June total (timing shift).",
        "Half-open interval excludes July 1."
      ],
      "edgeCases": [
        "available_on is a DATE (settlement), created_at a TIMESTAMP (authorization).",
        "Time zone affects which day a late-night charge's created_at falls on."
      ],
      "checklist": [
        "Filtered on available_on",
        "half-open date range",
        "explained created_at vs available_on"
      ]
    },
    "explain": "Explain when finance wants available_on vs created_at.",
    "teaches": "Event time vs settlement time.",
    "harder": "A subtle, very Stripe-specific timing distinction.",
    "mode": "SQL"
  },
  {
    "id": "rv8",
    "ladder": "rev",
    "pos": 8,
    "stage": "Final boss",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "StrataScratch-style",
    "module": "m11",
    "title": "Final Boss: net revenue by signup cohort, multi-currency",
    "concept": [
      "revenue",
      "cte",
      "dates"
    ],
    "obj": [
      "BalanceTransaction",
      "Customer",
      "Charge"
    ],
    "metric": "cohort net",
    "edge": [
      "multi-currency",
      "late-arriving data"
    ],
    "timed": true,
    "est": "13 min",
    "business": "Growth wants net revenue grouped by the customer's signup-month cohort — and the data spans currencies with late adjustments.",
    "schema": [
      "balance_transactions",
      "charges",
      "customers"
    ],
    "prompt": "USD net revenue by customer signup-month cohort. Map each ledger row to a customer via its source charge, then to that customer's signup month. Clarify how you handle non-USD and late adjustments.",
    "hints": [
      "Ledger.source_id can reference a charge; join ledger→charges→customers.",
      "Cohort = DATE_TRUNC('month', customer.created_at); keep currency='usd'."
    ],
    "solution": "WITH bt AS (\n  SELECT b.net_amount, b.source_id\n  FROM balance_transactions b\n  WHERE b.currency='usd' AND b.type IN ('charge','refund','dispute','fee')\n),\nmapped AS (\n  SELECT bt.net_amount, cu.created_at AS signup\n  FROM bt\n  JOIN charges c   ON c.charge_id = bt.source_id\n  JOIN customers cu ON cu.customer_id = c.customer_id\n)\nSELECT DATE_TRUNC('month', signup) AS cohort_month,\n       SUM(net_amount)/100.0 AS net_usd\nFROM mapped\nGROUP BY DATE_TRUNC('month', signup)\nORDER BY cohort_month;",
    "verify": {
      "grain": "One row per signup-month cohort.",
      "columns": [
        "cohort_month",
        "net_usd"
      ],
      "sample": {
        "cols": [
          "cohort_month",
          "net_usd"
        ],
        "rows": [
          [
            "2024-01-01",
            "48200.00"
          ],
          [
            "2024-02-01",
            "51110.00"
          ]
        ]
      },
      "commonWrong": [
        "Summing across currencies.",
        "Mapping the ledger by merchant only, losing the per-customer cohort.",
        "Counting payout-type rows as revenue."
      ],
      "validation": [
        "Cohort nets sum to total USD net for mapped rows.",
        "No future cohort_month."
      ],
      "edgeCases": [
        "Some ledger rows (payouts, top-ups) have no source charge — excluded by the join.",
        "Late refunds/disputes land in the original charge's customer cohort — that's correct attribution."
      ],
      "checklist": [
        "ledger→charge→customer mapping",
        "USD only",
        "cohort = signup month",
        "late-adjustment attribution explained"
      ]
    },
    "explain": "Explain how a refund posted months later still lands in the right cohort.",
    "teaches": "Multi-hop joins to attribute ledger money to a cohort.",
    "harder": "Three-table mapping, multi-currency, late data — timed.",
    "mode": "SQL"
  }
];

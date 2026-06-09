import type { Problem } from '@/types';

/* MIGRATED DATA — edit a problem here, then it is auto-included via src/data/gym/index.ts.
   Source of truth migrated from the original single-file app (Repo-2). */
export const joinsProblems: Problem[] = [
  {
    "id": "jn1",
    "ladder": "joins",
    "pos": 1,
    "stage": "Recognition",
    "lvl": 0,
    "difficulty": "recognition",
    "priority": "required",
    "source": "SQLBolt-style",
    "module": "m4",
    "title": "Why are two tables needed?",
    "concept": [
      "joins"
    ],
    "obj": [
      "Charge",
      "Customer"
    ],
    "metric": "n/a",
    "edge": [],
    "timed": false,
    "est": "3 min",
    "business": "You're asked to show each charge with the customer's email and country.",
    "schema": [
      "charges",
      "customers"
    ],
    "prompt": "In plain English: why can't you answer this from <code class='inline'>charges</code> alone, which key links the two tables, and what is one output row?",
    "hints": [
      "charges has customer_id but not email.",
      "customers has email/country keyed by customer_id."
    ],
    "model": "charges stores customer_id but not the email/country; those live in customers. You join on charges.customer_id = customers.customer_id. One output row = one charge, enriched with its customer's fields (assuming each charge maps to exactly one customer).",
    "grain": "Conceptual — one row per charge once joined.",
    "explain": "Say the join key and the resulting grain aloud before writing SQL.",
    "teaches": "Joins exist to bring columns from another table by a shared key.",
    "harder": "First rung — identify the need and the key.",
    "mode": "SQL"
  },
  {
    "id": "jn2",
    "ladder": "joins",
    "pos": 2,
    "stage": "Mechanical",
    "lvl": 1,
    "difficulty": "easy",
    "priority": "required",
    "source": "SQLBolt-style",
    "module": "m4",
    "title": "INNER JOIN charges → customers",
    "concept": [
      "joins"
    ],
    "obj": [
      "Charge",
      "Customer"
    ],
    "metric": "n/a",
    "edge": [],
    "timed": false,
    "est": "4 min",
    "business": "Enrich each succeeded charge with the buyer's email and country.",
    "schema": [
      "charges",
      "customers"
    ],
    "prompt": "Return charge_id, email, country for merchant 101's succeeded charges.",
    "hints": [
      "JOIN customers ON customers.customer_id = charges.customer_id."
    ],
    "solution": "SELECT c.charge_id, cu.email, cu.country\nFROM charges c\nJOIN customers cu ON cu.customer_id = c.customer_id\nWHERE c.merchant_id = 101 AND c.status='succeeded';",
    "grain": "One row per succeeded charge for merchant 101.",
    "explain": "Explain why an INNER JOIN is fine here (every charge has a customer).",
    "teaches": "Basic INNER JOIN on a foreign key.",
    "harder": "Adds the JOIN clause to step 1's idea.",
    "mode": "SQL"
  },
  {
    "id": "jn3",
    "ladder": "joins",
    "pos": 3,
    "stage": "Simple application",
    "lvl": 2,
    "difficulty": "medium",
    "priority": "required",
    "source": "pgexercises-style",
    "module": "m4",
    "title": "LEFT JOIN charges → refunds",
    "concept": [
      "joins"
    ],
    "obj": [
      "Charge",
      "Refund"
    ],
    "metric": "refund amount",
    "edge": [
      "NULLs"
    ],
    "timed": false,
    "est": "5 min",
    "business": "Show merchant 102's succeeded charges with any refund amount attached.",
    "schema": [
      "charges",
      "refunds"
    ],
    "prompt": "Return charge_id, amount, and refund_amount (NULL if the charge was never refunded).",
    "hints": [
      "LEFT JOIN keeps charges with no refund.",
      "Refund amount comes from refunds.amount."
    ],
    "solution": "SELECT c.charge_id, c.amount/100.0 AS amount_usd,\n       r.amount/100.0 AS refund_usd\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nWHERE c.merchant_id = 102 AND c.status='succeeded';",
    "verify": {
      "grain": "One row per (charge, refund) — note a charge with 2 refunds yields 2 rows.",
      "columns": [
        "charge_id",
        "amount_usd",
        "refund_usd"
      ],
      "sample": {
        "cols": [
          "charge_id",
          "amount_usd",
          "refund_usd"
        ],
        "rows": [
          [
            "50011",
            "42.00",
            "42.00"
          ],
          [
            "50012",
            "18.00",
            ""
          ]
        ]
      },
      "commonWrong": [
        "INNER JOIN — drops charges that were never refunded.",
        "Assuming one row per charge (multi-refund charges fan out)."
      ],
      "validation": [
        "Charges with no refund show NULL refund_usd.",
        "Row count ≥ number of succeeded charges (fan-out on multi-refund)."
      ],
      "edgeCases": [
        "A partially-refunded charge appears once per refund.",
        "refund_usd can exceed amount only across multiple partial refunds."
      ],
      "checklist": [
        "LEFT JOIN (kept un-refunded charges)",
        "Recognised potential fan-out",
        "NULL refund handled"
      ]
    },
    "explain": "Explain when this LEFT JOIN starts to fan out and why that matters.",
    "teaches": "LEFT JOIN to preserve rows + the first hint of fan-out.",
    "harder": "Introduces a one-to-many relationship.",
    "mode": "SQL"
  },
  {
    "id": "jn4",
    "ladder": "joins",
    "pos": 4,
    "stage": "Applied metric",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "required",
    "source": "DataLemur-style",
    "module": "m4",
    "title": "Every merchant, including zero-charge ones",
    "concept": [
      "joins",
      "groupby"
    ],
    "obj": [
      "Merchant",
      "Charge"
    ],
    "metric": "succeeded count",
    "edge": [
      "NULLs"
    ],
    "timed": false,
    "est": "6 min",
    "business": "Leadership wants succeeded-charge counts for ALL merchants — even dormant ones at 0.",
    "schema": [
      "merchants",
      "charges"
    ],
    "prompt": "Return every merchant and their succeeded charge count, including merchants with zero. Highest first.",
    "hints": [
      "Start FROM merchants, LEFT JOIN charges.",
      "Put the status filter in ON, not WHERE; COUNT(c.charge_id)."
    ],
    "solution": "SELECT m.merchant_id, m.name,\n       COUNT(c.charge_id) AS succeeded_charges\nFROM merchants m\nLEFT JOIN charges c\n  ON c.merchant_id = m.merchant_id AND c.status='succeeded'\nGROUP BY m.merchant_id, m.name\nORDER BY succeeded_charges DESC;",
    "verify": {
      "grain": "One row per merchant (all merchants).",
      "columns": [
        "merchant_id",
        "name",
        "succeeded_charges"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "name",
          "succeeded_charges"
        ],
        "rows": [
          [
            "102",
            "Velvet Apparel",
            "1440"
          ],
          [
            "999",
            "Dormant Co",
            "0"
          ]
        ]
      },
      "commonWrong": [
        "status filter in WHERE → turns LEFT into INNER, drops zero merchants.",
        "COUNT(*) → counts the NULL right side as 1 for empty merchants."
      ],
      "validation": [
        "Row count = number of merchants.",
        "Dormant merchants show 0, not absent."
      ],
      "edgeCases": [
        "The 'WHERE kills LEFT JOIN' trap.",
        "COUNT of a nullable column ignores NULLs → true 0."
      ],
      "checklist": [
        "FROM merchants",
        "filter in ON",
        "COUNT(c.charge_id)",
        "zero merchants present"
      ]
    },
    "explain": "Explain why moving the status filter to WHERE would silently break this.",
    "teaches": "Preserving the left side; the ON-vs-WHERE rule.",
    "harder": "The filter-placement subtlety is a classic trap.",
    "mode": "SQL"
  },
  {
    "id": "jn5",
    "ladder": "joins",
    "pos": 5,
    "stage": "Multi-step",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "DataLemur-style",
    "module": "m4",
    "title": "Anti-join: customers who never succeeded",
    "concept": [
      "joins",
      "anti-join"
    ],
    "obj": [
      "Customer",
      "Charge"
    ],
    "metric": "n/a",
    "edge": [
      "NULLs"
    ],
    "timed": false,
    "est": "7 min",
    "business": "StreamBox wants customers (merchant 105) who have never had a single succeeded charge — prime win-back targets.",
    "schema": [
      "customers",
      "charges"
    ],
    "prompt": "Return customer_id and email for merchant 105 customers with no succeeded charge.",
    "hints": [
      "NOT EXISTS is NULL-safe; NOT IN is risky.",
      "Correlate on customer_id and status='succeeded'."
    ],
    "solution": "SELECT cu.customer_id, cu.email\nFROM customers cu\nWHERE cu.merchant_id = 105\n  AND NOT EXISTS (\n    SELECT 1 FROM charges c\n    WHERE c.customer_id = cu.customer_id AND c.status='succeeded'\n  );",
    "verify": {
      "grain": "One row per StreamBox customer with no succeeded charge.",
      "columns": [
        "customer_id",
        "email"
      ],
      "sample": {
        "cols": [
          "customer_id",
          "email"
        ],
        "rows": [
          [
            "55012",
            "trial_only@x.com"
          ],
          [
            "55044",
            "churned@y.com"
          ]
        ]
      },
      "commonWrong": [
        "NOT IN (subquery with a NULL) → returns zero rows.",
        "Forgetting WHERE c.charge_id IS NULL in a LEFT-JOIN version → returns everyone."
      ],
      "validation": [
        "None of these customers appears in succeeded charges.",
        "Count = total customers − customers with ≥1 succeeded charge."
      ],
      "edgeCases": [
        "A customer with only FAILED charges still counts as 'never succeeded'.",
        "Trial customers may legitimately have zero charges."
      ],
      "checklist": [
        "NOT EXISTS (NULL-safe)",
        "correlated on customer_id",
        "'never succeeded' interpreted correctly"
      ]
    },
    "explain": "Explain why NOT EXISTS is safer than NOT IN here.",
    "teaches": "The anti-join pattern and NULL-safety.",
    "harder": "Negation + correlated subquery reasoning.",
    "mode": "SQL"
  },
  {
    "id": "jn6",
    "ladder": "joins",
    "pos": 6,
    "stage": "Debug",
    "lvl": 3,
    "difficulty": "hard",
    "priority": "required",
    "source": "GitHub-repo-style",
    "module": "m4",
    "title": "Debug: LEFT JOIN secretly became INNER",
    "concept": [
      "joins"
    ],
    "obj": [
      "Merchant",
      "Charge"
    ],
    "metric": "succeeded count",
    "edge": [
      "NULLs"
    ],
    "timed": false,
    "est": "5 min",
    "business": "This query was meant to list ALL merchants with their succeeded count, but dormant merchants vanished.",
    "schema": [
      "merchants",
      "charges"
    ],
    "broken": "SELECT m.merchant_id, COUNT(c.charge_id) AS succeeded\nFROM merchants m\nLEFT JOIN charges c ON c.merchant_id = m.merchant_id\nWHERE c.status = 'succeeded'\nGROUP BY m.merchant_id;",
    "prompt": "Why did merchants with no succeeded charges disappear? Fix it.",
    "hints": [
      "What does a WHERE condition on the right table do to unmatched (NULL) rows?",
      "Move the predicate into the ON clause."
    ],
    "solution": "SELECT m.merchant_id, COUNT(c.charge_id) AS succeeded\nFROM merchants m\nLEFT JOIN charges c\n  ON c.merchant_id = m.merchant_id AND c.status='succeeded'\nGROUP BY m.merchant_id;",
    "verify": {
      "grain": "One row per merchant.",
      "columns": [
        "merchant_id",
        "succeeded"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "succeeded"
        ],
        "rows": [
          [
            "102",
            "1440"
          ],
          [
            "999",
            "0"
          ]
        ]
      },
      "commonWrong": [
        "Adding OR c.status IS NULL in WHERE (works but muddled) instead of moving to ON."
      ],
      "validation": [
        "Zero-charge merchants reappear with 0.",
        "Row count = number of merchants."
      ],
      "edgeCases": [
        "Any non-NULL-tolerant predicate on the right table has the same effect."
      ],
      "checklist": [
        "Diagnosed the WHERE-on-right-table trap",
        "Moved filter to ON",
        "Zero merchants restored"
      ]
    },
    "explain": "State the rule: a WHERE on the right table converts LEFT JOIN to INNER.",
    "teaches": "Diagnosing the most common join bug.",
    "harder": "Requires understanding NULL behaviour in WHERE.",
    "mode": "SQL"
  },
  {
    "id": "jn7",
    "ladder": "joins",
    "pos": 7,
    "stage": "Edge-case hard",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "StrataScratch-style",
    "module": "m4",
    "title": "Avoid refund fan-out: GPV + refund count per merchant",
    "concept": [
      "joins",
      "cte",
      "fan-out"
    ],
    "obj": [
      "Charge",
      "Refund",
      "Merchant"
    ],
    "metric": "GPV; refund count",
    "edge": [
      "fan-out",
      "cents"
    ],
    "timed": false,
    "est": "9 min",
    "business": "Finance wants per-merchant gross volume and number of refunds in one table — but the naive join inflates GPV.",
    "schema": [
      "charges",
      "refunds"
    ],
    "prompt": "Per merchant: succeeded GPV (USD) and refund count, without the refund join inflating GPV.",
    "hints": [
      "Aggregate each metric to merchant grain in its OWN CTE, then join.",
      "Never SUM charge amounts after a one-to-many refund join."
    ],
    "solution": "WITH g AS (\n  SELECT merchant_id, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id\n),\nr AS (\n  SELECT c.merchant_id, COUNT(*) AS refunds\n  FROM refunds rf JOIN charges c ON c.charge_id = rf.charge_id\n  GROUP BY c.merchant_id\n)\nSELECT g.merchant_id, g.gross/100.0 AS gpv_usd,\n       COALESCE(r.refunds,0) AS refunds\nFROM g LEFT JOIN r USING (merchant_id)\nORDER BY gpv_usd DESC;",
    "verify": {
      "grain": "One row per merchant with USD GPV.",
      "columns": [
        "merchant_id",
        "gpv_usd",
        "refunds"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "gpv_usd",
          "refunds"
        ],
        "rows": [
          [
            "102",
            "184320.00",
            "135"
          ],
          [
            "101",
            "98410.00",
            "9"
          ]
        ]
      },
      "commonWrong": [
        "Joining charges→refunds then SUM(amount) → GPV multiplied by refunds-per-charge.",
        "COUNT(*) on the joined set as 'refunds' but also using it for GPV."
      ],
      "validation": [
        "GPV matches a standalone GPV query (no inflation).",
        "Merchants with no refunds show 0, not NULL."
      ],
      "edgeCases": [
        "A charge with 2 refunds would double its amount if you summed post-join.",
        "COALESCE turns 'no refunds' into 0."
      ],
      "checklist": [
        "Separate merchant-grain CTEs",
        "No SUM after the refund join",
        "COALESCE for zero refunds"
      ]
    },
    "explain": "Explain fan-out and why pre-aggregation prevents it.",
    "teaches": "Pre-aggregating each side to dodge fan-out.",
    "harder": "Two metrics at different natural grains in one result.",
    "mode": "SQL"
  },
  {
    "id": "jn8",
    "ladder": "joins",
    "pos": 8,
    "stage": "Final boss",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "StrataScratch-style",
    "module": "m4",
    "title": "Final Boss: merchant scorecard without double counting",
    "concept": [
      "joins",
      "cte",
      "fan-out"
    ],
    "obj": [
      "Charge",
      "Refund",
      "Dispute",
      "Merchant"
    ],
    "metric": "GPV; refunds; disputes",
    "edge": [
      "fan-out",
      "multiple 1-to-many",
      "NULLs"
    ],
    "timed": true,
    "est": "12 min",
    "business": "Build a merchant scorecard combining charges, refunds, AND disputes — three sources, two of them one-to-many.",
    "schema": [
      "merchants",
      "charges",
      "refunds",
      "disputes"
    ],
    "prompt": "One row per merchant: succeeded GPV (USD), refund count, dispute count. Include merchants with zero of any. Defend why you don't chain the joins.",
    "hints": [
      "Three separate merchant-grain CTEs, then LEFT JOIN from merchants.",
      "Chaining charges→refunds→disputes fans out twice — corrupting both counts."
    ],
    "solution": "WITH g AS (\n  SELECT merchant_id, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id\n),\nr AS (\n  SELECT c.merchant_id, COUNT(*) AS refunds\n  FROM refunds rf JOIN charges c ON c.charge_id=rf.charge_id\n  GROUP BY c.merchant_id\n),\nd AS (\n  SELECT c.merchant_id, COUNT(*) AS disputes\n  FROM disputes dp JOIN charges c ON c.charge_id=dp.charge_id\n  GROUP BY c.merchant_id\n)\nSELECT m.merchant_id, m.name,\n       COALESCE(g.gross,0)/100.0 AS gpv_usd,\n       COALESCE(r.refunds,0) AS refunds,\n       COALESCE(d.disputes,0) AS disputes\nFROM merchants m\nLEFT JOIN g USING (merchant_id)\nLEFT JOIN r USING (merchant_id)\nLEFT JOIN d USING (merchant_id)\nORDER BY gpv_usd DESC;",
    "verify": {
      "grain": "One row per merchant (all merchants).",
      "columns": [
        "merchant_id",
        "name",
        "gpv_usd",
        "refunds",
        "disputes"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "name",
          "gpv_usd",
          "refunds",
          "disputes"
        ],
        "rows": [
          [
            "102",
            "Velvet Apparel",
            "184320.00",
            "135",
            "3"
          ],
          [
            "103",
            "PixelForge Games",
            "61200.00",
            "12",
            "14"
          ]
        ]
      },
      "commonWrong": [
        "Chaining the three tables in one FROM → GPV × refunds × disputes explosion.",
        "Using COUNT(DISTINCT) as a band-aid instead of pre-aggregating."
      ],
      "validation": [
        "GPV matches the standalone GPV query.",
        "PixelForge (103) shows high disputes; Velvet (102) high refunds.",
        "Every merchant present."
      ],
      "edgeCases": [
        "Two one-to-many joins multiply rows twice if chained.",
        "COALESCE everything so zero-activity merchants aren't NULL."
      ],
      "checklist": [
        "Three independent CTEs",
        "LEFT JOIN from merchants",
        "COALESCE zeros",
        "GPV not inflated",
        "Known merchants sanity-check"
      ]
    },
    "explain": "Explain aloud why chaining the joins double-counts, using the word 'grain'.",
    "teaches": "Composing several one-to-many sources safely.",
    "harder": "Three sources, two fan-out risks, all-merchant coverage — timed.",
    "mode": "SQL"
  }
];

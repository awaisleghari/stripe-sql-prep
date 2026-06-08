import type { Module } from '@/types';

/* MIGRATED learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m11: Module = {
  "id": "m11",
  "day": "Day 5",
  "badge": "advanced",
  "title": "Revenue Metrics: GPV · Net Revenue · MRR",
  "skill": "revenue",
  "bcolor": "volcano",
  "concept": "<p>Three different numbers people sloppily call \"revenue\":</p>\n<ul>\n<li><strong>GPV (Gross Payment Volume)</strong> = sum of succeeded charge amounts. Top line. Ignores refunds, disputes, fees.</li>\n<li><strong>Net revenue</strong> = what the merchant keeps = gross − refunds − disputes lost − Stripe fees. This lives in <code class=\"inline\">balance_transactions.net_amount</code>, the ledger. <em>Always prefer the ledger</em> for net.</li>\n<li><strong>MRR (Monthly Recurring Revenue)</strong> = normalized monthly value of <em>active</em> subscriptions (annual ÷ 12). A run-rate snapshot, not a sum of payments.</li>\n</ul>\n<div class=\"callout warn\"><span class=\"t\">Stripe-specific landmines</span>Money is in cents (÷100.0). You cannot blend currencies. Fees and disputes reduce net but not GPV. A paid annual invoice is 12 months of MRR, not one.</div>",
  "sqlPattern": "SELECT merchant_id, SUM(net_amount)/100.0 AS net_revenue_usd\nFROM balance_transactions\nGROUP BY merchant_id;",
  "schemaRefs": [
    "charges",
    "balance_transactions",
    "subscriptions",
    "invoices"
  ],
  "pysupport": "gpv = sum(c[\"amount\"] for c in charges if c[\"status\"] == \"succeeded\")\nnet = sum(b[\"net_amount\"] for b in balance_transactions)\nmrr = sum((s[\"amount\"] / 12 if s[\"interval\"] == \"year\" else s[\"amount\"])\n          for s in subscriptions if s[\"status\"] == \"active\")",
  "reasoning": {
    "question": "\"What's the revenue?\" — first decide which one: gross volume, net revenue, or recurring run-rate.",
    "grain": "One row per merchant (or per cohort/month, depending on the ask).",
    "included": "GPV: succeeded charges. Net: all ledger entries. MRR: active subscriptions.",
    "excluded": "GPV excludes refunds/disputes/fees; MRR excludes canceled and trialing subs.",
    "table": "<code class=\"inline\">charges</code> (GPV), <code class=\"inline\">balance_transactions</code> (net), <code class=\"inline\">subscriptions</code> (MRR).",
    "metric": "GPV = SUM of succeeded amounts; Net = SUM of <code class=\"inline\">net_amount</code>; MRR = SUM of monthly-normalised active subs.",
    "denom": "For net margin, divide net by GPV.",
    "wrong": "Calling GPV \"revenue\"; reading net from charges instead of the ledger; not dividing annual plans by 12; triple fan-out when joining the three sources raw.",
    "validate": "Net is below GPV; net margin sits in 0–1; subscription merchants have MRR &gt; 0."
  },
  "predicts": [
    {
      "prompt": "Velvet has $184k GPV but heavy refunds and fees. Which query gives true NET revenue?",
      "query": "-- A\nSELECT SUM(amount) FROM charges WHERE status='succeeded';\n-- B\nSELECT SUM(net_amount) FROM balance_transactions;",
      "options": [
        "A — GPV is net revenue",
        "B — the ledger nets out refunds, disputes, and fees",
        "Both are equal",
        "Neither"
      ],
      "answer": 1,
      "explain": "A is GROSS (no refunds/fees subtracted). The ledger books charges (+), refunds (−), disputes (−), and fees (−) into <code class='inline'>net_amount</code>. B is net revenue."
    },
    {
      "prompt": "A $100 charge incurs a $3 processing fee, then is fully refunded ($100 returned). The fee is NOT refunded. What is SUM(net_amount) across its ledger rows?",
      "query": "SELECT SUM(net_amount)/100.0 AS net_usd\nFROM balance_transactions\nWHERE source_id = 900;",
      "options": [
        "$100",
        "$97",
        "-$3",
        "$0"
      ],
      "answer": 2,
      "explain": "Ledger: the charge nets +$97 (after the $3 fee); the refund nets −$100 → total = −$3. GPV would still report $100 — that's why GPV ≠ net."
    }
  ],
  "debugs": [
    {
      "prompt": "MRR for StreamBox — but annual plans inflate it 12×.",
      "broken": "SELECT SUM(amount)/100.0 AS mrr\nFROM subscriptions\nWHERE merchant_id=105 AND status='active';",
      "hint": "An annual plan's amount is a YEAR of value. Normalize to a month.",
      "fixed": "SELECT SUM(CASE WHEN interval='year' THEN amount/12.0\n                ELSE amount END)/100.0 AS mrr\nFROM subscriptions\nWHERE merchant_id=105 AND status='active';",
      "why": "Annual subs contribute <code class='inline'>amount/12</code>. Only <code class='inline'>active</code> (arguably <code class='inline'>past_due</code>) count; <code class='inline'>canceled</code>/<code class='inline'>trialing</code> don't."
    },
    {
      "title": "gross masquerading as net",
      "prompt": "Intended: net revenue per merchant. The numbers look far too high.",
      "broken": "SELECT merchant_id, SUM(amount)/100.0 AS net\nFROM charges\nWHERE status='succeeded'\nGROUP BY merchant_id;",
      "hint": "Which table/column already accounts for fees, refunds and disputes?",
      "fixed": "SELECT merchant_id, SUM(net_amount)/100.0 AS net\nFROM balance_transactions\nGROUP BY merchant_id;",
      "why": "charges.amount is gross volume. True net lives in the ledger's net_amount, which already nets out fees, refunds and disputes."
    }
  ],
  "exercises": [
    {
      "id": "m11e1",
      "lvl": 1,
      "priority": "required",
      "title": "GPV (gross)",
      "prompt": "Gross payment volume (USD, succeeded) for merchant 102, in dollars.",
      "hints": [
        "SUM(amount)/100.0 with status + currency filters."
      ],
      "solution": "SELECT SUM(amount)/100.0 AS gpv_usd\nFROM charges\nWHERE merchant_id=102 AND status='succeeded' AND currency='USD';"
    },
    {
      "id": "m11e2",
      "lvl": 2,
      "priority": "required",
      "title": "Net revenue from the ledger",
      "prompt": "Net revenue (USD) per merchant from <code class='inline'>balance_transactions</code>, highest first.",
      "hints": [
        "SUM(net_amount) grouped by merchant.",
        "Filter currency='usd'."
      ],
      "solution": "SELECT merchant_id, SUM(net_amount)/100.0 AS net_usd\nFROM balance_transactions\nWHERE currency='usd'\nGROUP BY merchant_id\nORDER BY net_usd DESC;"
    },
    {
      "id": "m11e3",
      "lvl": 3,
      "priority": "should",
      "title": "MRR by signup cohort",
      "prompt": "For StreamBox (105), current MRR (USD) split by the customer's signup MONTH cohort. Annual ÷12. Active subs only.",
      "hints": [
        "Cohort = DATE_TRUNC('month', customer.created_at).",
        "Normalize interval; SUM grouped by cohort."
      ],
      "solution": "SELECT DATE_TRUNC('month', cu.created_at) AS cohort_month,\n       SUM(CASE WHEN s.interval='year' THEN s.amount/12.0\n                ELSE s.amount END)/100.0 AS mrr_usd\nFROM subscriptions s\nJOIN customers cu ON cu.customer_id = s.customer_id\nWHERE s.merchant_id=105 AND s.status='active'\nGROUP BY DATE_TRUNC('month', cu.created_at)\nORDER BY cohort_month;"
    },
    {
      "id": "m11e4",
      "lvl": 4,
      "priority": "should",
      "title": "Net revenue reconciliation",
      "prompt": "For merchant 102, net revenue by ledger <code class='inline'>type</code> (charge/refund/fee/dispute) in USD, with a TOTAL that equals the parts.",
      "hints": [
        "GROUP BY type, SUM(net_amount).",
        "Use ROLLUP for the total row."
      ],
      "solution": "SELECT COALESCE(type,'TOTAL') AS type,\n       SUM(net_amount)/100.0 AS net_usd\nFROM balance_transactions\nWHERE merchant_id=102 AND currency='usd'\nGROUP BY ROLLUP (type)\nORDER BY (type IS NULL), type;"
    },
    {
      "id": "m11e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final-boss (timed 10 min): revenue dashboard",
      "prompt": "One row per merchant: GPV, net revenue, net margin (net÷gpv), MRR. USD only; active+past_due subs for MRR. Avoid fan-out across the three sources and defend each join.",
      "hints": [
        "Aggregate GPV, net, MRR in SEPARATE CTEs at merchant grain, then LEFT JOIN — never join the raw tables (triple fan-out).",
        "NULLIF guards margin; COALESCE MRR to 0."
      ],
      "solution": "WITH gpv AS (\n  SELECT merchant_id, SUM(amount) AS gpv\n  FROM charges WHERE status='succeeded' AND currency='USD'\n  GROUP BY merchant_id\n),\nnet AS (\n  SELECT merchant_id, SUM(net_amount) AS net\n  FROM balance_transactions WHERE currency='usd'\n  GROUP BY merchant_id\n),\nmrr AS (\n  SELECT merchant_id,\n         SUM(CASE WHEN interval='year' THEN amount/12.0 ELSE amount END) AS mrr\n  FROM subscriptions WHERE status IN ('active','past_due')\n  GROUP BY merchant_id\n)\nSELECT m.merchant_id, m.name,\n       g.gpv/100.0 AS gpv_usd,\n       n.net/100.0 AS net_usd,\n       ROUND(n.net::numeric / NULLIF(g.gpv,0), 3) AS net_margin,\n       COALESCE(r.mrr,0)/100.0 AS mrr_usd\nFROM merchants m\nLEFT JOIN gpv g USING (merchant_id)\nLEFT JOIN net n USING (merchant_id)\nLEFT JOIN mrr r USING (merchant_id)\nWHERE g.gpv IS NOT NULL\nORDER BY net_usd DESC NULLS LAST;"
    },
    {
      "id": "m11e6",
      "lvl": 2,
      "priority": "should",
      "title": "Net revenue by currency",
      "prompt": "Total net revenue per currency from the ledger (display value = minor units ÷ 100), largest first.",
      "hints": [
        "GROUP BY currency; SUM(net_amount)."
      ],
      "solution": "SELECT currency, SUM(net_amount)/100.0 AS net_display\nFROM balance_transactions\nGROUP BY currency\nORDER BY net_display DESC;"
    },
    {
      "id": "m11e7",
      "lvl": 3,
      "priority": "should",
      "title": "Net margin per merchant",
      "prompt": "Per merchant (USD): GPV, net revenue, and net margin (net ÷ GPV). Only merchants with USD GPV > 0, highest GPV first.",
      "hints": [
        "GPV from a charges CTE, net from a ledger CTE, then join.",
        "Guard the division with NULLIF."
      ],
      "solution": "WITH g AS (\n  SELECT merchant_id, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded' AND currency='USD'\n  GROUP BY merchant_id),\nn AS (\n  SELECT merchant_id, SUM(net_amount) AS net\n  FROM balance_transactions WHERE currency='usd'\n  GROUP BY merchant_id)\nSELECT g.merchant_id, g.gross/100.0 AS gpv_usd, n.net/100.0 AS net_usd,\n  ROUND(n.net::numeric / NULLIF(g.gross,0), 3) AS net_margin\nFROM g JOIN n USING (merchant_id)\nORDER BY gpv_usd DESC;"
    },
    {
      "id": "m11e8",
      "lvl": 4,
      "priority": "stretch",
      "title": "MRR, normalizing annual plans",
      "prompt": "Compute total MRR (USD) from active subscriptions, normalizing annual plans to monthly (annual amount ÷ 12). Return one number.",
      "hints": [
        "Filter status='active'.",
        "CASE on interval to divide annual by 12."
      ],
      "solution": "SELECT SUM(\n  CASE WHEN interval='year' THEN amount/12.0 ELSE amount END\n)/100.0 AS mrr_usd\nFROM subscriptions\nWHERE status='active';"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "GPV, net revenue, and MRR are:",
      "options": [
        "The same number",
        "Three different metrics: gross volume, what's kept after fees/refunds/disputes, and recurring run-rate",
        "All read from the charges table",
        "Just three currencies"
      ],
      "answer": 1,
      "why": "Distinct concepts — disambiguate before computing 'revenue'.",
      "concept": "metric definitions"
    },
    {
      "level": 1,
      "q": "Net revenue is best read from:",
      "options": [
        "charges.amount",
        "balance_transactions.net_amount",
        "invoices.amount_paid",
        "payouts.amount"
      ],
      "answer": 1,
      "why": "The ledger already nets charges, refunds, disputes, and fees into net_amount.",
      "concept": "the ledger"
    },
    {
      "level": 2,
      "q": "An active $1,200/yr plan contributes how much to MRR?",
      "options": [
        "$1,200",
        "$100",
        "$0",
        "$14,400"
      ],
      "answer": 1,
      "why": "Annual plans normalize to a monthly run-rate: 1200 ÷ 12 = $100.",
      "concept": "MRR normalization"
    },
    {
      "level": 3,
      "q": "Building GPV + net + MRR per merchant, the fan-out trap is:",
      "options": [
        "Using ROUND",
        "Joining charges + balance_transactions + subscriptions raw multiplies rows — aggregate each in its own CTE first",
        "Filtering to USD",
        "Using COALESCE"
      ],
      "answer": 1,
      "why": "Three raw 1-to-many sources explode row counts; compute each metric at merchant grain, then LEFT JOIN.",
      "concept": "pre-aggregate"
    },
    {
      "level": 5,
      "q": "Interviewer: \"what's Velvet's revenue?\" Most important clarification:",
      "options": [
        "The output format",
        "Which metric — gross volume vs net revenue vs MRR — and the currency / time window",
        "The Postgres version",
        "Whether to use a CTE"
      ],
      "answer": 1,
      "why": "'Revenue' is ambiguous; the metric choice and currency/window change the number entirely.",
      "concept": "disambiguate revenue"
    }
  ],
  "mistakes": [
    "Calling GPV 'revenue'.",
    "Computing net from charges instead of the ledger.",
    "MRR from invoice sums.",
    "Joining charges/ledger/subscriptions raw → triple fan-out."
  ],
  "edges": [
    "'Won' disputes may reverse in the ledger — net should reflect the final state.",
    "Refunds can post in a later month than the charge — monthly net is provisional."
  ],
  "interview": "<p>Disambiguate first: <em>\"Gross volume, net revenue, or MRR? They differ. For net I'll use the balance_transactions ledger since it already nets fees, refunds, and disputes. For MRR I'll normalize annual to monthly and count only active subs. Grain is one row per merchant, and I'll compute each metric in its own CTE to avoid fan-out.\"</em></p>",
  "followup": {
    "prompt": "PM: \"Why is StreamBox's MRR lower than its monthly GPV?\"",
    "answer": "GPV includes one-time charges, reactivations, and proration on top of recurring; MRR is only the normalized run-rate of currently-active subs. MRR is forward-looking; GPV is backward-looking volume."
  }
};

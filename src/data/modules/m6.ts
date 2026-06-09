import type { Module } from '@/types';

/* MIGRATED learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m6: Module = {
  "id": "m6",
  "day": "Day 3",
  "badge": "advanced",
  "title": "Window Functions",
  "skill": "windows",
  "bcolor": "volcano",
  "concept": "<p>A window function computes across a set of rows <strong>without collapsing them</strong> — unlike GROUP BY, every input row survives and gets an extra computed column. Think of it as keeping every row but adding a new column that looks across related rows — a running total, a rank, or the previous row's value.</p>\n<p>Anatomy: <code class=\"inline\">fn() OVER (PARTITION BY ... ORDER BY ... frame)</code>. PARTITION = the group; ORDER = ordering within the group; frame = which rows are in scope.</p>\n<ul>\n<li><strong>ROW_NUMBER</strong> — 1,2,3 unique (great for dedup / \"latest per key\").</li>\n<li><strong>RANK</strong> — ties share a rank, leaves gaps (1,1,3). <strong>DENSE_RANK</strong> — ties share, no gaps (1,1,2).</li>\n<li><strong>LAG/LEAD</strong> — value from the previous/next row (period-over-period).</li>\n<li><strong>SUM/AVG OVER</strong> — running totals and moving averages.</li>\n</ul>\n<div class=\"callout warn\"><span class=\"t\">The frame default trap</span>When you add <code class=\"inline\">ORDER BY</code> to a <code class=\"inline\">SUM() OVER</code>, the default frame is <code class=\"inline\">RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> — a running total, not the group total. And <code class=\"inline\">RANGE</code> lumps tied ORDER values together; use <code class=\"inline\">ROWS</code> for strict row-by-row.</div>",
  "sqlPattern": "SELECT customer_id, charge_id,\n  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) AS seq\nFROM charges\nWHERE status = 'succeeded';",
  "schemaRefs": [
    "charges"
  ],
  "pysupport": "# window: compare each row to the previous one in its group (like LAG)\ncharges.sort(key=lambda c: (c[\"merchant_id\"], c[\"created_at\"]))\nprev = {}\nfor c in charges:\n    c[\"prev_amount\"] = prev.get(c[\"merchant_id\"])\n    prev[c[\"merchant_id\"]] = c[\"amount\"]",
  "reasoning": {
    "question": "\"Compare each row to others in its group without collapsing them — running totals, ranks, month-over-month.\"",
    "grain": "Row-level grain is preserved — one output row per input row, plus a computed column.",
    "included": "All rows in scope; PARTITION BY sets the group, ORDER BY sets the sequence inside it.",
    "excluded": "The window removes nothing — filter rows in WHERE first if you need to.",
    "table": "Often a pre-aggregated CTE (e.g. monthly GPV), then a window computed over it.",
    "metric": "<code class=\"inline\">RANK</code>, <code class=\"inline\">ROW_NUMBER</code>, <code class=\"inline\">LAG</code>/<code class=\"inline\">LEAD</code>, <code class=\"inline\">SUM/AVG OVER</code> — chosen by the question.",
    "denom": "Not applicable for ranking; for a share, divide by a window total (<code class=\"inline\">SUM() OVER</code> the partition).",
    "wrong": "<code class=\"inline\">SUM OVER</code> without ORDER BY (whole-partition vs running); ROWS vs RANGE on tied values; filtering a window result in WHERE (wrap it in a CTE); LAG across missing periods.",
    "validate": "Row count unchanged; running totals are non-decreasing; ranks start at 1."
  },
  "predicts": [
    {
      "prompt": "Two merchants tie for 2nd place on GPV. Under <code class='inline'>RANK()</code>, what ranks appear?",
      "query": "RANK() OVER (ORDER BY gpv DESC)\n-- gpv: 900, 700, 700, 500",
      "options": [
        "1,2,2,3",
        "1,2,3,4",
        "1,2,2,4",
        "1,1,2,3"
      ],
      "answer": 2,
      "explain": "RANK gives tied rows the same rank and then <strong>skips</strong>: 1, 2, 2, 4. DENSE_RANK would give 1,2,2,3. ROW_NUMBER would force 1,2,3,4 arbitrarily."
    },
    {
      "prompt": "A merchant has 3 succeeded charges created in Jan, Feb, Mar. What sequence does rn take?",
      "query": "SELECT created_at,\n  ROW_NUMBER() OVER (ORDER BY created_at) AS rn\nFROM charges;",
      "options": [
        "all rn = 1",
        "rn = 1, 2, 3 by date",
        "rn = 3, 2, 1",
        "error — needs PARTITION BY"
      ],
      "answer": 1,
      "explain": "ROW_NUMBER assigns 1,2,3 in created_at order. With no PARTITION BY it's one sequence across all rows; PARTITION BY is optional."
    },
    {
      "prompt": "monthly has GPV: April=100, May=150 (one merchant). What does delta look like?",
      "query": "SELECT month, gpv,\n  gpv - LAG(gpv) OVER (ORDER BY month) AS delta\nFROM monthly;",
      "options": [
        "delta = NULL, then 50",
        "delta = 50, then NULL",
        "delta = 100, then 150",
        "error"
      ],
      "answer": 0,
      "explain": "The first row has no previous row, so LAG is NULL → delta NULL. Second row: 150 − 100 = 50."
    }
  ],
  "debugs": [
    {
      "prompt": "Goal: each merchant's running total of succeeded charge amounts over time. But every row shows the same grand total.",
      "broken": "SELECT merchant_id, created_at,\n       SUM(amount) OVER (PARTITION BY merchant_id) AS running\nFROM charges\nWHERE status='succeeded';",
      "hint": "A SUM OVER with no ORDER BY computes the whole-partition total, not a running one.",
      "fixed": "SELECT merchant_id, created_at,\n       SUM(amount) OVER (PARTITION BY merchant_id\n                         ORDER BY created_at\n                         ROWS UNBOUNDED PRECEDING) AS running\nFROM charges\nWHERE status='succeeded';",
      "why": "Adding <code class='inline'>ORDER BY created_at</code> with <code class='inline'>ROWS UNBOUNDED PRECEDING</code> makes it accumulate up to the current row — a true running total."
    },
    {
      "title": "running total isn't running",
      "prompt": "Intended: cumulative spend per customer over time. Every row prints the same grand total.",
      "broken": "SELECT customer_id, created_at,\n  SUM(amount) OVER (PARTITION BY customer_id) AS running\nFROM charges WHERE status='succeeded';",
      "hint": "What frame does a window with no ORDER BY use?",
      "fixed": "SELECT customer_id, created_at,\n  SUM(amount) OVER (PARTITION BY customer_id ORDER BY created_at\n                    ROWS UNBOUNDED PRECEDING) AS running\nFROM charges WHERE status='succeeded';",
      "why": "Without ORDER BY the frame is the whole partition, so every row gets the total. Add ORDER BY plus a ROWS frame for a true running sum."
    },
    {
      "title": "window function in WHERE",
      "prompt": "Intended: each customer's first succeeded charge. This throws an error.",
      "broken": "SELECT customer_id, charge_id\nFROM charges\nWHERE ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) = 1\n  AND status='succeeded';",
      "hint": "At what stage are window functions computed relative to WHERE?",
      "fixed": "SELECT customer_id, charge_id\nFROM (\n  SELECT customer_id, charge_id,\n    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) AS rn\n  FROM charges WHERE status='succeeded'\n) t\nWHERE rn = 1;",
      "why": "Window functions are evaluated after WHERE, so they're illegal there. Compute ROW_NUMBER in a subquery/CTE, then filter rn = 1 in the outer query."
    }
  ],
  "exercises": [
    {
      "id": "m6e1",
      "lvl": 1,
      "priority": "required",
      "title": "Number rows per group",
      "prompt": "Within each merchant, number their succeeded charges 1,2,3… from oldest to newest. Return charge_id, merchant_id, seq.",
      "hints": [
        "ROW_NUMBER() OVER (PARTITION BY merchant_id ORDER BY created_at)."
      ],
      "solution": "SELECT charge_id, merchant_id,\n       ROW_NUMBER() OVER (PARTITION BY merchant_id\n                          ORDER BY created_at) AS seq\nFROM charges\nWHERE status='succeeded';"
    },
    {
      "id": "m6e2",
      "lvl": 2,
      "priority": "required",
      "title": "Rank top merchants by GPV",
      "prompt": "Rank merchants by gross payment volume (succeeded, USD only). Return merchant_id, gpv_usd, rank. Top 10.",
      "hints": [
        "Aggregate to GPV in a CTE, then RANK in the outer query.",
        "Filter currency='usd' to keep cents comparable."
      ],
      "solution": "WITH gpv AS (\n  SELECT merchant_id, SUM(amount) AS gross\n  FROM charges\n  WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id\n)\nSELECT merchant_id,\n       gross/100.0 AS gpv_usd,\n       RANK() OVER (ORDER BY gross DESC) AS rnk\nFROM gpv\nORDER BY rnk\nLIMIT 10;"
    },
    {
      "id": "m6e3",
      "lvl": 3,
      "priority": "should",
      "title": "Running total per customer",
      "prompt": "For each customer of merchant 105, a running cumulative sum of their succeeded charge amounts (dollars) ordered by time. Return customer_id, created_at, cumulative_usd.",
      "hints": [
        "SUM(amount) OVER (PARTITION BY customer_id ORDER BY created_at ROWS UNBOUNDED PRECEDING)."
      ],
      "solution": "SELECT customer_id, created_at,\n       SUM(amount) OVER (PARTITION BY customer_id\n                         ORDER BY created_at\n                         ROWS UNBOUNDED PRECEDING) / 100.0 AS cumulative_usd\nFROM charges\nWHERE merchant_id = 105 AND status='succeeded'\nORDER BY customer_id, created_at;"
    },
    {
      "id": "m6e4",
      "lvl": 4,
      "priority": "should",
      "title": "Month-over-month with LAG",
      "prompt": "Per merchant, monthly succeeded GPV (USD) and the % change vs the previous month. Return merchant_id, month, gpv_usd, mom_pct.",
      "hints": [
        "First aggregate to monthly GPV in a CTE (DATE_TRUNC).",
        "LAG(gpv) OVER (PARTITION BY merchant_id ORDER BY month)."
      ],
      "solution": "WITH m AS (\n  SELECT merchant_id,\n         DATE_TRUNC('month', created_at) AS month,\n         SUM(amount) AS gpv\n  FROM charges\n  WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id, DATE_TRUNC('month', created_at)\n)\nSELECT merchant_id, month, gpv/100.0 AS gpv_usd,\n       ROUND( (gpv - LAG(gpv) OVER (PARTITION BY merchant_id ORDER BY month))\n              ::numeric / NULLIF(LAG(gpv) OVER (PARTITION BY merchant_id ORDER BY month),0)\n              * 100, 1) AS mom_pct\nFROM m\nORDER BY merchant_id, month;"
    },
    {
      "id": "m6e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final-boss (timed 10 min): GPV growth alarms",
      "prompt": "Flag every month where a merchant's USD GPV fell more than 20% vs the prior month — but only for merchants live at least 6 months. Build in CTEs and be ready to defend missing-month handling.",
      "hints": [
        "Reuse the LAG monthly pattern.",
        "Use a window COUNT to get months-live per merchant.",
        "Threshold: mom_pct < -20."
      ],
      "solution": "WITH m AS (\n  SELECT merchant_id,\n         DATE_TRUNC('month', created_at) AS month,\n         SUM(amount) AS gpv,\n         MIN(DATE_TRUNC('month', created_at)) OVER (PARTITION BY merchant_id) AS first_month\n  FROM charges\n  WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id, DATE_TRUNC('month', created_at)\n),\ngrowth AS (\n  SELECT merchant_id, month, gpv, first_month,\n         LAG(gpv) OVER (PARTITION BY merchant_id ORDER BY month) AS prev_gpv,\n         COUNT(*) OVER (PARTITION BY merchant_id) AS live_months\n  FROM m\n)\nSELECT merchant_id, month,\n       gpv/100.0 AS gpv_usd,\n       ROUND((gpv - prev_gpv)::numeric / NULLIF(prev_gpv,0) * 100, 1) AS mom_pct\nFROM growth\nWHERE live_months >= 6\n  AND prev_gpv IS NOT NULL\n  AND (gpv - prev_gpv)::numeric / NULLIF(prev_gpv,0) < -0.20\nORDER BY merchant_id, month;"
    },
    {
      "id": "m6e6",
      "lvl": 2,
      "priority": "should",
      "title": "Number a customer's charges",
      "prompt": "For customer 7's succeeded charges, return charge_id and its chronological number (1 = oldest).",
      "hints": [
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at)."
      ],
      "solution": "SELECT charge_id,\n  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) AS seq\nFROM charges\nWHERE status='succeeded' AND customer_id = 7;"
    },
    {
      "id": "m6e7",
      "lvl": 3,
      "priority": "should",
      "title": "Each merchant's share of platform GPV",
      "prompt": "Per merchant, return USD GPV and its percentage of total platform USD GPV, largest first.",
      "hints": [
        "GPV CTE, then SUM(gross) OVER () gives the platform total.",
        "percent = 100 * gross / window total."
      ],
      "solution": "WITH g AS (\n  SELECT merchant_id, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id)\nSELECT merchant_id, gross/100.0 AS gpv_usd,\n  ROUND(100.0 * gross / SUM(gross) OVER (), 1) AS pct_of_total\nFROM g\nORDER BY gross DESC;"
    },
    {
      "id": "m6e8",
      "lvl": 4,
      "priority": "stretch",
      "title": "Trailing 3-month average GPV",
      "prompt": "Per merchant and month, return USD GPV and the trailing 3-month average GPV (current month + 2 prior).",
      "hints": [
        "Monthly GPV CTE with DATE_TRUNC.",
        "AVG(gross) OVER (PARTITION BY merchant ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."
      ],
      "solution": "WITH m AS (\n  SELECT merchant_id, DATE_TRUNC('month', created_at) AS month, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded' AND currency='usd'\n  GROUP BY merchant_id, DATE_TRUNC('month', created_at))\nSELECT merchant_id, month, gross/100.0 AS gpv_usd,\n  ROUND(AVG(gross) OVER (PARTITION BY merchant_id ORDER BY month\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)/100.0, 2) AS rolling3_usd\nFROM m\nORDER BY merchant_id, month;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "How do window functions differ from GROUP BY?",
      "options": [
        "They collapse rows into groups",
        "They add a computed column while keeping every row",
        "They only work on dates",
        "They replace WHERE"
      ],
      "answer": 1,
      "why": "Windows compute across a row set without collapsing it — every input row survives.",
      "concept": "row-preserving"
    },
    {
      "level": 1,
      "q": "The rank sequence 1, 2, 2, 4 comes from:",
      "options": [
        "ROW_NUMBER",
        "RANK",
        "DENSE_RANK",
        "NTILE"
      ],
      "answer": 1,
      "why": "RANK ties then skips (1,2,2,4); DENSE_RANK would give 1,2,2,3.",
      "concept": "RANK vs DENSE_RANK"
    },
    {
      "level": 2,
      "q": "Each customer's running cumulative charge total over time:",
      "options": [
        "SUM(amount) OVER (PARTITION BY customer_id)",
        "SUM(amount) OVER (PARTITION BY customer_id ORDER BY created_at ROWS UNBOUNDED PRECEDING)",
        "SUM(amount) GROUP BY customer_id",
        "LAG(amount) OVER (…)"
      ],
      "answer": 1,
      "why": "ORDER BY + ROWS UNBOUNDED PRECEDING accumulates up to the current row. No ORDER BY = whole-partition total.",
      "concept": "running total"
    },
    {
      "level": 3,
      "q": "To keep only rows where ROW_NUMBER = 1 you must:",
      "options": [
        "Put it in WHERE directly",
        "Compute it in a CTE/subquery, then filter in the outer query",
        "Use HAVING",
        "It's impossible"
      ],
      "answer": 1,
      "why": "Window functions aren't available in the WHERE of the same SELECT; wrap and filter outside.",
      "concept": "windows not in WHERE"
    },
    {
      "level": 5,
      "q": "Month-over-month GPV via LAG — biggest correctness risk under ambiguity?",
      "options": [
        "Column aliases",
        "Missing months make LAG compare to the wrong prior period (need a date spine); the current month may be partial",
        "Using ROUND",
        "Too many CTEs"
      ],
      "answer": 1,
      "why": "Gaps misalign LAG and the latest month is still filling in — both distort growth.",
      "concept": "gaps in the series"
    }
  ],
  "mistakes": [
    "SUM OVER with no ORDER BY when you wanted a running total (and vice-versa).",
    "ROWS vs RANGE confusion on tied ORDER values.",
    "Ranking with ROW_NUMBER when ties should share (use RANK/DENSE_RANK).",
    "Using LAG across missing periods without a date spine."
  ],
  "edges": [
    "Window functions run AFTER WHERE/GROUP BY but you can't filter on them in WHERE — wrap in a CTE/subquery and filter outside.",
    "NULLs sort last by default with DESC; use <code class='inline'>NULLS LAST/FIRST</code> to control ranking of NULL keys."
  ],
  "interview": "<p>Lead with the distinction: <em>\"I need per-row context without collapsing rows, so this is a window function, not GROUP BY.\"</em> Then specify the window aloud: <em>\"Partition by merchant, order by month, and for the running total I'll use ROWS UNBOUNDED PRECEDING so ties don't lump together.\"</em> Mention that to filter on a window result you must compute it in a CTE first — a detail that trips many candidates.</p>",
  "followup": {
    "prompt": "PM: \"Could you turn the running total into a rolling 7-DAY total instead?\"",
    "answer": "Yes — switch the frame to a date-aware range: <code class='inline'>RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW</code> ordered by the day. RANGE (not ROWS) makes it time-based rather than row-count-based. That's the M7 rolling-window pattern."
  }
};

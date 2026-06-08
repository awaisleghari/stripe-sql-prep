import type { Module } from '@/types';

/* Learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m10: Module = {
  "id": "m10",
  "day": "Day 5",
  "badge": "advanced",
  "title": "Retention & Cohort Analysis",
  "skill": "retention",
  "bcolor": "geekblue",
  "concept": "<p>A <strong>cohort</strong> is a group of entities that share a start event in a period — e.g. <em>customers who signed up in March</em>. <strong>Retention</strong> asks: of that cohort, what fraction were still active N periods later. Cohort analysis is just \"hold the start fixed, watch the group over time.\"</p>\n<p><strong>Pick the cohort anchor.</strong> A <em>signup cohort</em> keys on <code class=\"inline\">customers.created_at</code>. A <em>first-activity cohort</em> keys on each customer's first succeeded charge. They differ: a customer who signs up but never pays is in the signup cohort but not the first-activity one. State which you mean.</p>\n<p><strong>Define \"active\" and the offset.</strong> Active in month <em>m+n</em> usually means \"had a succeeded charge that month.\" The retention curve is <code class=\"inline\">retained(n) / cohort_size</code> at month offset 0, 1, 2, … — anchor each activity month to the cohort month with <code class=\"inline\">cohort_month + INTERVAL 'n months'</code>.</p>\n<p><strong>Count distinct entities, never events.</strong> A customer with five charges in month 1 is retained <em>once</em>. Use <code class=\"inline\">COUNT(DISTINCT customer_id)</code>; counting charge rows inflates retention above 100%.</p>\n<div class=\"callout warn\"><span class=\"t\">Cohort leakage & immature cohorts</span>Leakage is attributing a customer to the wrong cohort (e.g. keying on the <em>activity</em> month instead of the signup month) or counting them in several cohorts. And the newest cohorts haven't had time to mature — month-3 retention for last month's cohort doesn't exist yet, so don't read it as 0.</div>",
  "sqlPattern": "WITH cohort AS (\n  SELECT customer_id,\n         DATE_TRUNC('month', created_at) AS cohort_month\n  FROM customers\n),\nactivity AS (\n  SELECT DISTINCT customer_id,\n         DATE_TRUNC('month', created_at) AS active_month\n  FROM charges\n  WHERE status = 'succeeded'\n)\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.customer_id) AS cohort_size,\n       COUNT(DISTINCT a.customer_id) FILTER (\n         WHERE a.active_month = c.cohort_month + INTERVAL '1 month') AS retained_m1,\n       COUNT(DISTINCT a.customer_id) FILTER (\n         WHERE a.active_month = c.cohort_month + INTERVAL '3 months') AS retained_m3\nFROM cohort c\nLEFT JOIN activity a USING (customer_id)\nGROUP BY c.cohort_month\nORDER BY c.cohort_month;",
  "schemaRefs": [
    "customers",
    "charges",
    "merchants",
    "subscriptions"
  ],
  "pysupport": "# Cohort = signup month; retention = fraction of a cohort active n months later.\ncohort = {}                                  # 'YYYY-MM' -> set(customer_id)\nfor cu in customers:\n    cohort.setdefault(cu[\"created_at\"][:7], set()).add(cu[\"customer_id\"])\n\nactive_months = {}                           # customer_id -> set of active 'YYYY-MM'\nfor ch in charges:\n    if ch[\"status\"] == \"succeeded\":\n        active_months.setdefault(ch[\"customer_id\"], set()).add(ch[\"created_at\"][:7])\n\n# retention[cohort_month][n] = |cohort members active n months later| / |cohort|\n# (the month-offset arithmetic is exactly where SQL DATE_TRUNC + INTERVAL helps).",
  "reasoning": {
    "question": "\"Of the customers who started in month M, what fraction are still active in month M+n?\"",
    "grain": "One row per cohort (or per cohort × offset). Fix the cohort key first.",
    "included": "The cohort base: every entity whose start event falls in the period (signup or first activity).",
    "excluded": "Activity outside the measured offset; duplicate charge rows collapsed to distinct customers.",
    "table": "<code class=\"inline\">customers.created_at</code> for the signup cohort; <code class=\"inline\">charges</code> (succeeded) for activity, joined on customer_id.",
    "metric": "Retained distinct customers at each offset ÷ cohort size.",
    "denom": "The cohort size — the count of entities that started in that period, fixed for every offset.",
    "wrong": "Keying the cohort on the activity month (leakage); counting charge events; reading immature recent cohorts as 0.",
    "validate": "Cohort sizes are stable across offsets; retention ∈ 0–1; the newest cohorts' far offsets are NULL, not 0."
  },
  "predicts": [
    {
      "prompt": "What is the grain, what does <code class='inline'>retained_m1</code> mean, and why might the newest cohort show NULL for <code class='inline'>retained_m3</code>?",
      "query": "WITH cohort AS (SELECT customer_id, DATE_TRUNC('month', created_at) AS cohort_month FROM customers),\nactivity AS (SELECT DISTINCT customer_id, DATE_TRUNC('month', created_at) AS active_month FROM charges WHERE status='succeeded')\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.customer_id) AS cohort_size,\n       COUNT(DISTINCT a.customer_id) FILTER (WHERE a.active_month = c.cohort_month + INTERVAL '3 months') AS retained_m3\nFROM cohort c LEFT JOIN activity a USING (customer_id)\nGROUP BY c.cohort_month;",
      "options": [
        "One row per customer; retained_m1 is total charges; NULL is a bug",
        "One row per cohort month; retained_m3 = distinct cohort members active 3 months after signup; the newest cohort hasn't reached month 3 yet, so it's 0/immature",
        "One row per charge; retained_m3 is GPV",
        "A syntax error"
      ],
      "answer": 1,
      "explain": "Grouping by cohort_month makes the grain one row per cohort. retained_m3 counts cohort members who had a succeeded charge exactly 3 months later. A cohort from last month physically can't have month-3 activity yet — read that as immature, not 0% retention."
    },
    {
      "prompt": "A customer signs up in January but makes their first charge in March. Which cohort are they in for a <em>signup</em> cohort vs a <em>first-activity</em> cohort?",
      "query": "-- customers.created_at = January\n-- first succeeded charge = March",
      "options": [
        "January for both",
        "January (signup) vs March (first-activity)",
        "March for both",
        "Neither cohort"
      ],
      "answer": 1,
      "explain": "A signup cohort keys on <code class='inline'>customers.created_at</code> (January). A first-activity cohort keys on the first succeeded charge (March). Same customer, different cohort — which is why you must state the anchor."
    }
  ],
  "debugs": [
    {
      "title": "Cohort leakage: keying on activity month",
      "prompt": "Goal: month-1 retention by signup cohort. This buckets the cohort on the customer's charge month, so a customer drifts between cohorts as they pay.",
      "broken": "SELECT DATE_TRUNC('month', ch.created_at) AS cohort_month,\n       COUNT(DISTINCT ch.customer_id) AS cohort_size\nFROM charges ch\nWHERE ch.status='succeeded'\nGROUP BY DATE_TRUNC('month', ch.created_at);",
      "hint": "A cohort must be fixed by the START event (signup). Keying on the charge month means the same customer lands in a new cohort every active month.",
      "fixed": "WITH cohort AS (\n  SELECT customer_id, DATE_TRUNC('month', created_at) AS cohort_month\n  FROM customers\n)\nSELECT cohort_month, COUNT(DISTINCT customer_id) AS cohort_size\nFROM cohort\nGROUP BY cohort_month\nORDER BY cohort_month;",
      "why": "The cohort key is the signup month from <code class='inline'>customers</code>, fixed once per customer. Keying on the activity month is classic cohort leakage — the denominator (cohort size) shifts and retention becomes meaningless."
    },
    {
      "title": "Counting activity events, not distinct customers",
      "prompt": "Goal: how many cohort members were active in month 1. The retained count exceeds the cohort size — impossible.",
      "broken": "WITH cohort AS (SELECT customer_id, DATE_TRUNC('month', created_at) AS cohort_month FROM customers)\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.customer_id) AS cohort_size,\n       COUNT(*) AS retained_m1\nFROM cohort c\nJOIN charges ch ON ch.customer_id = c.customer_id\n  AND ch.status='succeeded'\n  AND DATE_TRUNC('month', ch.created_at) = c.cohort_month + INTERVAL '1 month'\nGROUP BY c.cohort_month;",
      "hint": "A customer can have many charges in month 1. COUNT(*) counts charge rows, so retained can exceed the cohort.",
      "fixed": "WITH cohort AS (SELECT customer_id, DATE_TRUNC('month', created_at) AS cohort_month FROM customers)\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.customer_id) AS cohort_size,\n       COUNT(DISTINCT ch.customer_id) AS retained_m1\nFROM cohort c\nLEFT JOIN charges ch ON ch.customer_id = c.customer_id\n  AND ch.status='succeeded'\n  AND DATE_TRUNC('month', ch.created_at) = c.cohort_month + INTERVAL '1 month'\nGROUP BY c.cohort_month;",
      "why": "Retention counts <em>distinct customers</em> active in the offset month. <code class='inline'>COUNT(DISTINCT customer_id)</code> keeps retained ≤ cohort_size; <code class='inline'>COUNT(*)</code> counts every charge and breaks the rate."
    }
  ],
  "exercises": [
    {
      "id": "m10e1",
      "lvl": 1,
      "priority": "required",
      "title": "Assign signup cohorts and sizes",
      "prompt": "Return one row per signup-month cohort with the number of customers in it. <em>Grain: one row per cohort month. Validation: cohort sizes sum to total customers.</em>",
      "hints": [
        "Cohort key = <code class='inline'>DATE_TRUNC('month', customers.created_at)</code>.",
        "COUNT(DISTINCT customer_id) per cohort."
      ],
      "solution": "SELECT DATE_TRUNC('month', created_at) AS cohort_month,\n       COUNT(DISTINCT customer_id) AS cohort_size\nFROM customers\nGROUP BY DATE_TRUNC('month', created_at)\nORDER BY cohort_month;"
    },
    {
      "id": "m10e2",
      "lvl": 2,
      "priority": "required",
      "title": "Month-1 retention by cohort",
      "prompt": "Per signup cohort, the cohort size and how many were active (succeeded charge) in the month after signup, plus the month-1 retention rate. <em>Grain: one row per cohort. Validation: retained_m1 ≤ cohort_size; rate ∈ 0–1.</em>",
      "hints": [
        "cohort CTE from customers; activity = distinct (customer, active_month) from succeeded charges.",
        "Match active_month = cohort_month + INTERVAL '1 month'; guard the rate."
      ],
      "solution": "WITH cohort AS (\n  SELECT customer_id, DATE_TRUNC('month', created_at) AS cohort_month FROM customers\n),\nactivity AS (\n  SELECT DISTINCT customer_id, DATE_TRUNC('month', created_at) AS active_month\n  FROM charges WHERE status='succeeded'\n)\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.customer_id) AS cohort_size,\n       COUNT(DISTINCT a.customer_id) FILTER (WHERE a.active_month = c.cohort_month + INTERVAL '1 month') AS retained_m1,\n       ROUND(COUNT(DISTINCT a.customer_id) FILTER (WHERE a.active_month = c.cohort_month + INTERVAL '1 month')::numeric\n             / NULLIF(COUNT(DISTINCT c.customer_id),0), 4) AS retention_m1\nFROM cohort c\nLEFT JOIN activity a USING (customer_id)\nGROUP BY c.cohort_month\nORDER BY c.cohort_month;"
    },
    {
      "id": "m10e3",
      "lvl": 3,
      "priority": "should",
      "title": "Retention curve: m0, m1, m2, m3",
      "prompt": "Per cohort, the retention rate at offsets 0, 1, 2 and 3 months. <em>Grain: one row per cohort. Edge: the newest cohorts' far offsets should be NULL/immature, not forced to 0.</em>",
      "hints": [
        "One FILTER per offset, each matching active_month = cohort_month + INTERVAL 'n months'.",
        "Divide each by cohort_size with NULLIF."
      ],
      "solution": "WITH cohort AS (\n  SELECT customer_id, DATE_TRUNC('month', created_at) AS cohort_month FROM customers\n),\nactivity AS (\n  SELECT DISTINCT customer_id, DATE_TRUNC('month', created_at) AS active_month\n  FROM charges WHERE status='succeeded'\n)\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.customer_id) AS cohort_size,\n       ROUND(COUNT(DISTINCT a.customer_id) FILTER (WHERE a.active_month = c.cohort_month)::numeric / NULLIF(COUNT(DISTINCT c.customer_id),0),4) AS m0,\n       ROUND(COUNT(DISTINCT a.customer_id) FILTER (WHERE a.active_month = c.cohort_month + INTERVAL '1 month')::numeric / NULLIF(COUNT(DISTINCT c.customer_id),0),4) AS m1,\n       ROUND(COUNT(DISTINCT a.customer_id) FILTER (WHERE a.active_month = c.cohort_month + INTERVAL '2 months')::numeric / NULLIF(COUNT(DISTINCT c.customer_id),0),4) AS m2,\n       ROUND(COUNT(DISTINCT a.customer_id) FILTER (WHERE a.active_month = c.cohort_month + INTERVAL '3 months')::numeric / NULLIF(COUNT(DISTINCT c.customer_id),0),4) AS m3\nFROM cohort c\nLEFT JOIN activity a USING (customer_id)\nGROUP BY c.cohort_month\nORDER BY c.cohort_month;"
    },
    {
      "id": "m10e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "First-activity cohort vs signup cohort",
      "prompt": "Build a first-activity cohort: key each customer on the month of their FIRST succeeded charge (customers who never charged are excluded), and report month-1 retention. Explain how this differs from the signup cohort. <em>Grain: one row per first-activity cohort.</em>",
      "hints": [
        "first_activity = MIN(DATE_TRUNC('month', created_at)) over succeeded charges per customer.",
        "Customers with no succeeded charge are absent from this cohort entirely."
      ],
      "solution": "WITH first_activity AS (\n  SELECT customer_id,\n         DATE_TRUNC('month', MIN(created_at)) AS cohort_month\n  FROM charges WHERE status='succeeded'\n  GROUP BY customer_id\n),\nactivity AS (\n  SELECT DISTINCT customer_id, DATE_TRUNC('month', created_at) AS active_month\n  FROM charges WHERE status='succeeded'\n)\nSELECT f.cohort_month,\n       COUNT(DISTINCT f.customer_id) AS cohort_size,\n       ROUND(COUNT(DISTINCT a.customer_id) FILTER (WHERE a.active_month = f.cohort_month + INTERVAL '1 month')::numeric\n             / NULLIF(COUNT(DISTINCT f.customer_id),0), 4) AS retention_m1\nFROM first_activity f\nLEFT JOIN activity a USING (customer_id)\nGROUP BY f.cohort_month\nORDER BY f.cohort_month;"
    },
    {
      "id": "m10e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: merchant monthly retention with churn",
      "prompt": "For each signup cohort of merchants (by <code class='inline'>merchants.created_at</code>), report cohort size, month-1 and month-3 retention (active = had a succeeded charge that month), and month-3 churn = 1 − retention. State the immature-cohort caveat and exclude cohorts too new to have a month-3 yet. <em>Validation: rates ∈ 0–1; churn = 1 − retention; immature cohorts excluded, not zeroed.</em>",
      "hints": [
        "Cohort on merchants.created_at; activity = distinct (merchant_id, active_month) of succeeded charges.",
        "Exclude cohorts where cohort_month + INTERVAL '3 months' > DATE_TRUNC('month', NOW()).",
        "churn = 1 − retention_m3; guard every divide."
      ],
      "solution": "WITH cohort AS (\n  SELECT merchant_id, DATE_TRUNC('month', created_at) AS cohort_month FROM merchants\n),\nactivity AS (\n  SELECT DISTINCT merchant_id, DATE_TRUNC('month', created_at) AS active_month\n  FROM charges WHERE status='succeeded'\n)\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.merchant_id) AS cohort_size,\n       ROUND(COUNT(DISTINCT a.merchant_id) FILTER (WHERE a.active_month = c.cohort_month + INTERVAL '1 month')::numeric\n             / NULLIF(COUNT(DISTINCT c.merchant_id),0), 4) AS retention_m1,\n       ROUND(COUNT(DISTINCT a.merchant_id) FILTER (WHERE a.active_month = c.cohort_month + INTERVAL '3 months')::numeric\n             / NULLIF(COUNT(DISTINCT c.merchant_id),0), 4) AS retention_m3,\n       ROUND(1 - COUNT(DISTINCT a.merchant_id) FILTER (WHERE a.active_month = c.cohort_month + INTERVAL '3 months')::numeric\n             / NULLIF(COUNT(DISTINCT c.merchant_id),0), 4) AS churn_m3\nFROM cohort c\nLEFT JOIN activity a USING (merchant_id)\nWHERE c.cohort_month + INTERVAL '3 months' <= DATE_TRUNC('month', NOW())\nGROUP BY c.cohort_month\nORDER BY c.cohort_month;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "What is a cohort?",
      "options": [
        "A type of join",
        "A group of entities sharing a start event in a period, tracked over time",
        "A way to remove duplicates",
        "The most recent month of data"
      ],
      "answer": 1,
      "why": "A cohort fixes the start (e.g. signup month) and follows that fixed group across later periods.",
      "concept": "cohort definition"
    },
    {
      "level": 1,
      "q": "Which expression keys a signup cohort?",
      "options": [
        "DATE_TRUNC('month', charges.created_at)",
        "DATE_TRUNC('month', customers.created_at)",
        "COUNT(*)",
        "MAX(created_at)"
      ],
      "answer": 1,
      "why": "A signup cohort is fixed by the customer's signup month — <code class='inline'>customers.created_at</code> — not by any later activity.",
      "concept": "cohort key"
    },
    {
      "level": 2,
      "q": "Which counts the cohort size correctly?",
      "options": [
        "COUNT(*) FROM charges",
        "COUNT(DISTINCT customer_id) per cohort month from customers",
        "SUM(amount)",
        "COUNT(charge_id)"
      ],
      "answer": 1,
      "why": "Cohort size is the distinct entities that started in the period; count distinct customers per cohort month.",
      "concept": "cohort size"
    },
    {
      "level": 4,
      "q": "Why can't you read the newest cohort's month-3 retention as 0%?",
      "options": [
        "It's a syntax error",
        "That cohort hasn't existed for 3 months yet, so month-3 activity is impossible — the value is immature, not 0",
        "Because retention is always 100%",
        "Because charges are missing"
      ],
      "answer": 1,
      "why": "A cohort from last month can't have month-3 data yet; treating NULL/absent as 0% understates retention. Exclude immature offsets.",
      "concept": "immature cohorts"
    },
    {
      "level": 5,
      "q": "An interviewer asks for customer retention. What do you clarify first?",
      "options": [
        "Nothing — start writing SQL",
        "The cohort anchor (signup vs first-activity), the activity definition, the offset, and that recent cohorts are immature — counting distinct customers throughout",
        "Whether to use COUNT(*)",
        "The colour of the chart"
      ],
      "answer": 1,
      "why": "Retention is ambiguous until you fix the cohort anchor, the activity definition, the offset, and acknowledge immature cohorts — all on a distinct-entity grain.",
      "concept": "interview judgment"
    }
  ],
  "mistakes": [
    "Cohort leakage: keying the cohort on the activity month so customers drift between cohorts.",
    "Counting charge events instead of distinct customers, pushing retention above 100%.",
    "Reading immature recent cohorts' far offsets as 0% instead of excluding them.",
    "Confusing signup cohort with first-activity cohort without stating which.",
    "Letting the cohort-size denominator change across offsets."
  ],
  "edges": [
    "A customer who never charges is in the signup cohort but never in any first-activity cohort.",
    "Reactivation: a customer inactive in month 2 but active in month 3 is retained at offset 3 — define whether retention is point-in-time or cumulative.",
    "Late-arriving data and time zones shift which month an activity lands in — state your assumptions."
  ],
  "interview": "<p>Pin the definitions before any SQL: <em>\"Cohort = signup month from <code class='inline'>customers</code>. Active in offset n = a succeeded charge in <code class='inline'>cohort_month + n months</code>, counting distinct customers. Retention(n) = retained / cohort_size, and I'll drop cohorts too new to have reached offset n so I'm not reporting immature data as churn.\"</em> Naming the anchor, the activity rule, and the immaturity caveat is the senior signal.</p>",
  "followup": {
    "prompt": "Interviewer: \"Show the retention curve smoothly, one row per (cohort, offset).\"",
    "answer": "I'd unpivot the offsets into rows — cross join the cohort with a small series of offsets 0..n, then LEFT JOIN activity at <code class='inline'>cohort_month + offset</code> — giving one row per (cohort, offset) that plots directly. The offset arithmetic and the distinct-customer counting stay the same."
  }
};

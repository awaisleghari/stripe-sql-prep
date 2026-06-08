import type { Module } from '@/types';

/* Learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m7: Module = {
  "id": "m7",
  "day": "Day 4",
  "badge": "intermediate",
  "title": "Date / Time Logic",
  "skill": "datetime",
  "bcolor": "gold",
  "concept": "<p>Every time-based metric hides <strong>two different questions</strong>: <em>which rows are in the window</em> (a filter) and <em>how do I bucket them</em> (a group). Keep them separate in your head.</p>\n<p><strong>Filtering a window.</strong> A <em>rolling</em> window is <code class=\"inline\">created_at &gt;= NOW() - INTERVAL '30 days'</code> — a moving 30-day span ending right now. A <em>calendar</em> period uses <code class=\"inline\">DATE_TRUNC</code>: \"this month\" is <code class=\"inline\">DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())</code>.</p>\n<p><strong>Calendar vs rolling is not the same window.</strong> On the 10th of the month, \"this month\" is 10 days of data; \"last 30 days\" reaches back into the previous month. Decide which the question means and say it out loud — this is the single most common time bug.</p>\n<p><strong>Bucketing.</strong> <code class=\"inline\">DATE_TRUNC('day' | 'week' | 'month', created_at)</code> collapses a timestamp to the start of that period. Group by the <em>truncated</em> value, never the raw timestamp — otherwise every microsecond is its own bucket.</p>\n<p><strong>Which timestamp?</strong> <code class=\"inline\">created_at</code> is when the event happened; <code class=\"inline\">available_on</code> on <code class=\"inline\">balance_transactions</code> is when funds settle. A dispute's <code class=\"inline\">created_at</code> is when the <em>dispute</em> was filed — not when the charge happened — so \"dispute rate by charge month\" must bucket on the charge's month (join dispute → charge). Timestamps are UTC; a daily report in a merchant's local zone needs <code class=\"inline\">AT TIME ZONE</code>, and you should state your zone assumption.</p>\n<div class=\"callout warn\"><span class=\"t\">Calendar month ≠ trailing 30 days</span>If someone says \"this month's GPV\" and writes <code class=\"inline\">created_at &gt;= NOW() - INTERVAL '30 days'</code>, the numbers are wrong on every day except the 1st. Use <code class=\"inline\">DATE_TRUNC('month', …)</code> for calendar periods.</div>",
  "sqlPattern": "SELECT DATE_TRUNC('day', created_at) AS day,\n       COUNT(*) AS charges,\n       SUM(amount) / 100.0 AS gpv_usd\nFROM charges\nWHERE status = 'succeeded'\n  AND created_at >= NOW() - INTERVAL '30 days'\nGROUP BY DATE_TRUNC('day', created_at)\nORDER BY day;",
  "schemaRefs": [
    "charges",
    "disputes",
    "balance_transactions",
    "merchants"
  ],
  "pysupport": "# Bucket succeeded charges by calendar day (no pandas — just a dict).\nby_day = {}\nfor c in charges:\n    if c[\"status\"] != \"succeeded\":\n        continue\n    day = c[\"created_at\"][:10]      # 'YYYY-MM-DD' == DATE_TRUNC('day', created_at)\n    by_day[day] = by_day.get(day, 0) + 1\n\n# 'this month' is a calendar filter, not a trailing window:\nthis_month = [c for c in charges if c[\"created_at\"][:7] == TODAY[:7]]   # 'YYYY-MM'",
  "reasoning": {
    "question": "\"A time metric, e.g. daily succeeded volume for the last 30 days, or this month's success rate.\"",
    "grain": "Decide the bucket grain first — one row per day, per week, or per month — and DATE_TRUNC to exactly that.",
    "included": "The window filter: rolling (<code class=\"inline\">NOW() - INTERVAL</code>) or calendar (<code class=\"inline\">DATE_TRUNC = DATE_TRUNC(NOW())</code>) — never confuse the two.",
    "excluded": "Out-of-window rows are filtered before grouping; the wrong status, currency, or settlement-vs-event timestamp is excluded here.",
    "table": "Pick the timestamp that matches the question: charge <code class=\"inline\">created_at</code> for charge metrics, the charge's month (not the dispute's) for dispute-by-charge-month, <code class=\"inline\">available_on</code> for settlement.",
    "metric": "Count / sum / rate computed per bucket after the window filter.",
    "denom": "For a rate per period, the denominator is the eligible rows in that same bucket and window.",
    "wrong": "Calling trailing 30 days \"this month\"; grouping by raw timestamp; using the dispute date when the question asks for charge month; mixing time zones silently.",
    "validate": "Bucket count matches the window length; no surprise extra month bucket; a rate sits in 0–1; the timestamp choice is stated."
  },
  "predicts": [
    {
      "prompt": "Is this \"current month\" or \"trailing 30 days grouped by month\"? What is the output grain, and why might it return <em>two</em> month rows?",
      "query": "SELECT DATE_TRUNC('month', created_at) AS month,\n       COUNT(*) AS charges\nFROM charges\nWHERE created_at >= NOW() - INTERVAL '30 days'\nGROUP BY DATE_TRUNC('month', created_at);",
      "options": [
        "Current calendar month; one row; always one month",
        "Trailing 30 days bucketed by calendar month; one row per month; two rows if the 30-day window crosses a month boundary",
        "A syntax error",
        "All time grouped by month"
      ],
      "answer": 1,
      "explain": "The <code class='inline'>WHERE</code> is a rolling 30-day filter, then the rows are bucketed by calendar month. If today is, say, the 10th, the last 30 days span this month and part of last month — two buckets. This is exactly why \"trailing 30 days\" and \"this month\" are different."
    },
    {
      "prompt": "What does grouping by <code class='inline'>created_at</code> (not truncated) produce for one busy day of charges?",
      "query": "SELECT created_at, COUNT(*) AS n\nFROM charges\nWHERE status='succeeded'\nGROUP BY created_at;",
      "options": [
        "One row for the day",
        "Roughly one row per distinct timestamp — hundreds of near-duplicate buckets",
        "One row per merchant",
        "Zero rows"
      ],
      "answer": 1,
      "explain": "Raw timestamps are distinct to the microsecond, so GROUP BY created_at makes (almost) every charge its own bucket. Bucket with <code class='inline'>DATE_TRUNC('day', created_at)</code> to get one row per day."
    }
  ],
  "debugs": [
    {
      "title": "\"This month\" computed with a trailing window",
      "prompt": "A teammate reports \"this month's GPV\" but the number includes late last month. Fix the filter so it's the current calendar month only.",
      "broken": "SELECT SUM(amount)/100.0 AS gpv_usd\nFROM charges\nWHERE status='succeeded'\n  AND created_at >= NOW() - INTERVAL '30 days';",
      "hint": "Trailing 30 days reaches into the previous month on any day after the 1st. 'This month' is a calendar period.",
      "fixed": "SELECT SUM(amount)/100.0 AS gpv_usd\nFROM charges\nWHERE status='succeeded'\n  AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW());",
      "why": "<code class='inline'>DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())</code> keeps only rows whose month equals the current month — a true calendar filter. The trailing-30-day version silently mixes in part of the prior month."
    },
    {
      "title": "Dispute rate bucketed on the wrong date",
      "prompt": "Goal: dispute rate by the CHARGE's month. The query buckets on the dispute's date, so disputes land in the month they were filed, not the month of the charge.",
      "broken": "SELECT DATE_TRUNC('month', d.created_at) AS month,\n       COUNT(*) AS disputes\nFROM disputes d\nGROUP BY DATE_TRUNC('month', d.created_at);",
      "hint": "A dispute is filed 30–60 days after the charge. 'By charge month' means the charge's created_at, reached via a join.",
      "fixed": "SELECT DATE_TRUNC('month', c.created_at) AS charge_month,\n       COUNT(*) AS disputes\nFROM disputes d\nJOIN charges c ON c.charge_id = d.charge_id\nGROUP BY DATE_TRUNC('month', c.created_at)\nORDER BY charge_month;",
      "why": "\"By charge month\" must bucket on <code class='inline'>charges.created_at</code>, so each dispute is attributed to the month its charge occurred. Bucketing on the dispute's own date misdates late-arriving disputes — a classic Stripe timestamp trap."
    }
  ],
  "exercises": [
    {
      "id": "m7e1",
      "lvl": 1,
      "priority": "required",
      "title": "Daily succeeded count, last 7 days",
      "prompt": "Return one row per day for the last 7 days with the count of succeeded charges. <em>Grain: one row per calendar day. Validation: at most 7–8 rows.</em>",
      "hints": [
        "Filter <code class='inline'>created_at >= NOW() - INTERVAL '7 days'</code> and <code class='inline'>status='succeeded'</code>.",
        "Bucket with <code class='inline'>DATE_TRUNC('day', created_at)</code> and GROUP BY it."
      ],
      "solution": "SELECT DATE_TRUNC('day', created_at) AS day,\n       COUNT(*) AS succeeded\nFROM charges\nWHERE status='succeeded'\n  AND created_at >= NOW() - INTERVAL '7 days'\nGROUP BY DATE_TRUNC('day', created_at)\nORDER BY day;"
    },
    {
      "id": "m7e2",
      "lvl": 2,
      "priority": "required",
      "title": "Monthly GPV by merchant, last 6 months",
      "prompt": "One row per merchant per month for the last 6 months: succeeded USD GPV. <em>Grain: one row per (merchant, month). Common wrong answer: grouping by raw timestamp.</em>",
      "hints": [
        "Two group keys: merchant_id and <code class='inline'>DATE_TRUNC('month', created_at)</code>.",
        "Filter currency='usd', status='succeeded', and the 6-month window."
      ],
      "solution": "SELECT merchant_id,\n       DATE_TRUNC('month', created_at) AS month,\n       SUM(amount)/100.0 AS gpv_usd\nFROM charges\nWHERE status='succeeded' AND currency='usd'\n  AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '6 months'\nGROUP BY merchant_id, DATE_TRUNC('month', created_at)\nORDER BY merchant_id, month;"
    },
    {
      "id": "m7e3",
      "lvl": 3,
      "priority": "should",
      "title": "Current calendar-month success rate by merchant",
      "prompt": "For the current calendar month only, each merchant's success rate = succeeded ÷ attempts. <em>Grain: one row per merchant. Validation: rate ∈ 0–1. Edge: a merchant with attempts but no success → rate 0.</em>",
      "hints": [
        "Calendar filter: <code class='inline'>DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())</code>.",
        "Denominator = all attempts; numerator = succeeded; guard with NULLIF."
      ],
      "solution": "SELECT merchant_id,\n       COUNT(*) AS attempts,\n       COUNT(*) FILTER (WHERE status='succeeded') AS succeeded,\n       ROUND(COUNT(*) FILTER (WHERE status='succeeded')::numeric\n             / NULLIF(COUNT(*),0), 4) AS success_rate\nFROM charges\nWHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())\nGROUP BY merchant_id\nORDER BY success_rate;"
    },
    {
      "id": "m7e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "This month vs previous month GPV",
      "prompt": "Per merchant, succeeded USD GPV for the current calendar month and the previous calendar month, side by side, with the MoM % change. <em>Grain: one row per merchant. Guard the divide.</em>",
      "hints": [
        "Bucket to month in a CTE, then pivot the two months with FILTER.",
        "this_month = COUNT/SUM FILTER (WHERE month = DATE_TRUNC('month', NOW()))."
      ],
      "solution": "WITH monthly AS (\n  SELECT merchant_id,\n         DATE_TRUNC('month', created_at) AS month,\n         SUM(amount) AS gross\n  FROM charges\n  WHERE status='succeeded' AND currency='usd'\n    AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'\n  GROUP BY merchant_id, DATE_TRUNC('month', created_at)\n)\nSELECT merchant_id,\n       SUM(gross) FILTER (WHERE month = DATE_TRUNC('month', NOW()))/100.0 AS this_month_usd,\n       SUM(gross) FILTER (WHERE month = DATE_TRUNC('month', NOW()) - INTERVAL '1 month')/100.0 AS prev_month_usd,\n       ROUND(\n         (SUM(gross) FILTER (WHERE month = DATE_TRUNC('month', NOW()))\n          - SUM(gross) FILTER (WHERE month = DATE_TRUNC('month', NOW()) - INTERVAL '1 month'))::numeric\n         / NULLIF(SUM(gross) FILTER (WHERE month = DATE_TRUNC('month', NOW()) - INTERVAL '1 month'),0), 4) AS mom_change\nFROM monthly\nGROUP BY merchant_id\nORDER BY merchant_id;"
    },
    {
      "id": "m7e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: rolling 30-day success rate with a volume floor",
      "prompt": "Per merchant, the success rate over a rolling 30-day window, but only for merchants with at least 200 attempts in that window. State the rolling-vs-calendar choice and your time-zone assumption. <em>Grain: one row per qualifying merchant. Validation: rate ∈ 0–1; merchants under the floor are excluded, not flagged.</em>",
      "hints": [
        "Rolling window: <code class='inline'>created_at >= NOW() - INTERVAL '30 days'</code> (a moving span, not a calendar month).",
        "Put the 200-attempt floor in HAVING; guard the rate with NULLIF.",
        "State that timestamps are UTC; a merchant-local report would shift the day boundaries."
      ],
      "solution": "SELECT merchant_id,\n       COUNT(*) AS attempts,\n       COUNT(*) FILTER (WHERE status='succeeded') AS succeeded,\n       ROUND(COUNT(*) FILTER (WHERE status='succeeded')::numeric\n             / NULLIF(COUNT(*),0), 4) AS success_rate\nFROM charges\nWHERE created_at >= NOW() - INTERVAL '30 days'\nGROUP BY merchant_id\nHAVING COUNT(*) >= 200\nORDER BY success_rate;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "What problem does DATE_TRUNC solve?",
      "options": [
        "It deletes old rows",
        "It collapses a timestamp to the start of a period (day/week/month) so rows can be bucketed",
        "It converts cents to dollars",
        "It removes duplicates"
      ],
      "answer": 1,
      "why": "DATE_TRUNC normalises every timestamp in a period to that period's start, which is what lets you GROUP BY day, week, or month.",
      "concept": "date_trunc"
    },
    {
      "level": 1,
      "q": "Which expression creates a monthly bucket from created_at?",
      "options": [
        "MONTH(created_at)",
        "DATE_TRUNC('month', created_at)",
        "created_at::month",
        "TRUNC(created_at)"
      ],
      "answer": 1,
      "why": "<code class='inline'>DATE_TRUNC('month', created_at)</code> returns the first instant of that month — the standard monthly bucket key.",
      "concept": "month bucket"
    },
    {
      "level": 2,
      "q": "Which WHERE filters exactly the current calendar month?",
      "options": [
        "created_at >= NOW() - INTERVAL '30 days'",
        "DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())",
        "created_at >= NOW() - INTERVAL '1 month'",
        "EXTRACT(month FROM created_at) = 1"
      ],
      "answer": 1,
      "why": "Comparing the truncated month of the row to the truncated month of now keeps only this calendar month — independent of which day it is.",
      "concept": "calendar filter"
    },
    {
      "level": 4,
      "q": "Why is trailing 30 days wrong for \"this month\"?",
      "options": [
        "It's slower",
        "On any day after the 1st it reaches into the previous month, so it mixes two calendar months",
        "It excludes succeeded charges",
        "It only works in UTC"
      ],
      "answer": 1,
      "why": "A rolling 30-day window ending today overlaps the prior month except on the 1st — so it is not the current calendar month.",
      "concept": "calendar vs rolling"
    },
    {
      "level": 5,
      "q": "Asked for dispute rate by charge month, which timestamp do you bucket on and what caveat do you state?",
      "options": [
        "The dispute's created_at; no caveat",
        "The charge's created_at (joined dispute→charge); caveat that disputes arrive late, so recent months are still maturing",
        "available_on; no caveat",
        "NOW(); state nothing"
      ],
      "answer": 1,
      "why": "\"By charge month\" attributes each dispute to its charge's month (join to charges). The caveat is late arrival: disputes land 30–60 days later, so the newest charge months under-report until they mature.",
      "concept": "timestamp choice"
    }
  ],
  "mistakes": [
    "Calling a trailing 30-day window \"this month\" — they only match on the 1st.",
    "Grouping by the raw timestamp instead of a DATE_TRUNC bucket, creating one bucket per microsecond.",
    "Using the settlement date (available_on) when the metric asks for the event date (created_at), or vice versa.",
    "Bucketing disputes on the dispute date when the question asks for charge month.",
    "Mixing UTC and merchant-local boundaries without stating the time zone."
  ],
  "edges": [
    "A trailing window that crosses a month boundary yields two month buckets — expected, not a bug.",
    "Late-arriving disputes mean the most recent charge months keep gaining disputes for weeks — recent rates are provisional.",
    "<code class='inline'>DATE_TRUNC('week', …)</code> starts weeks on Monday in Postgres; say so if the business expects Sunday."
  ],
  "interview": "<p>Separate the two time questions out loud: <em>\"My window is the last 30 days — a rolling filter on <code class='inline'>created_at</code>, not the calendar month — and I'll bucket by day with <code class='inline'>DATE_TRUNC('day', created_at)</code>. For dispute rate I'd attribute each dispute to its charge's month and flag that recent months are still maturing because disputes arrive late.\"</em> Naming calendar-vs-rolling and the timestamp choice up front is exactly the precision Stripe interviewers want.</p>",
  "followup": {
    "prompt": "Interviewer: \"Now show each merchant's month-over-month change in one query.\"",
    "answer": "I'd bucket monthly GPV in a CTE, then use <code class='inline'>LAG(gpv) OVER (PARTITION BY merchant_id ORDER BY month)</code> to bring the prior month onto each row and compute the % change — that's window functions (M6) reading from the time-bucketed CTE."
  }
};

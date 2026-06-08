import type { Module } from '@/types';

/* Learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m14: Module = {
  "id": "m14",
  "day": "Day 6",
  "badge": "advanced",
  "title": "Anomaly Detection",
  "skill": "anomaly",
  "bcolor": "red",
  "concept": "<p><strong>Anomaly detection asks one question: is today's number unusual versus its recent baseline?</strong> You compute a metric per period (failures per day, dispute rate per day), compare each period to what was normal just before it, and flag the ones that deviate too far.</p>\n<p><strong>Build the baseline from the prior periods, excluding the current one.</strong> A trailing average (and standard deviation) of the previous N days is the baseline. Use a window frame like <code class=\"inline\">ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING</code> — the <code class=\"inline\">1 PRECEDING</code> matters: if the current day is in its own baseline, a spike partly masks itself.</p>\n<p><strong>Two thresholds, same idea.</strong> A simple multiplier flags <code class=\"inline\">current &gt; k × baseline</code>. A <strong>z-score</strong> is more principled: <code class=\"inline\">z = (current − baseline_mean) / baseline_std</code>; <code class=\"inline\">|z| &gt; 3</code> is rare under a stable process. The z-score adapts the threshold to how noisy the metric normally is.</p>\n<p><strong>Low volume is noise, not signal.</strong> A merchant with 4 charges can swing from 0% to 50% failure on one event. Require a <em>volume floor</em> (enough attempts) before you alert, or you'll page on statistical noise. Stripe uses this for dispute-rate spikes, surges in a particular <code class=\"inline\">failure_code</code>, and sudden GPV drops.</p>\n<div class=\"callout warn\"><span class=\"t\">Exclude the current period; floor the volume</span>Two failure modes dominate: putting the current period inside its own baseline (the anomaly hides itself), and flagging low-volume periods where one event moves the rate. Anchor the baseline to <em>prior</em> periods and gate on a minimum volume.</div>",
  "sqlPattern": "WITH daily AS (\n  SELECT DATE_TRUNC('day', created_at) AS day,\n         COUNT(*) FILTER (WHERE status='failed') AS failures\n  FROM charges\n  WHERE created_at >= NOW() - INTERVAL '30 days'\n  GROUP BY DATE_TRUNC('day', created_at)\n),\nstats AS (\n  SELECT day, failures,\n         AVG(failures)        OVER w AS baseline_avg,\n         STDDEV_SAMP(failures) OVER w AS baseline_std\n  FROM daily\n  WINDOW w AS (ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING)\n)\nSELECT day, failures, ROUND(baseline_avg,1) AS baseline_avg,\n       ROUND((failures - baseline_avg) / NULLIF(baseline_std,0), 2) AS z_score,\n       (failures - baseline_avg) / NULLIF(baseline_std,0) > 3 AS is_anomaly\nFROM stats\nWHERE baseline_std IS NOT NULL\nORDER BY day;",
  "schemaRefs": [
    "charges",
    "disputes",
    "merchants"
  ],
  "pysupport": "import math   # stdlib only, no pandas\n# daily failure counts\ndaily = {}\nfor c in charges:\n    if c[\"status\"] == \"failed\":\n        d = c[\"created_at\"][:10]\n        daily[d] = daily.get(d, 0) + 1\n\ndays = sorted(daily)\nfor i, d in enumerate(days):\n    prior = [daily[days[j]] for j in range(max(0, i - 7), i)]   # prior 7 days, not today\n    if len(prior) >= 2:\n        mean = sum(prior) / len(prior)\n        std = math.sqrt(sum((x - mean) ** 2 for x in prior) / (len(prior) - 1))\n        z = (daily[d] - mean) / std if std else 0.0\n        is_anomaly = z > 3",
  "reasoning": {
    "question": "\"Is the current period's metric (failures, dispute rate, a failure_code count) abnormally high versus its recent baseline?\"",
    "grain": "One row per period (day/week), optionally per entity (merchant, failure_code).",
    "included": "The metric per period in the lookback window.",
    "excluded": "The current period is excluded from its own baseline; low-volume periods are gated out before flagging.",
    "table": "<code class=\"inline\">charges</code> (failures, failure_code), <code class=\"inline\">disputes</code> for dispute spikes — aggregated per period first.",
    "metric": "Deviation of the period from its trailing baseline (multiplier or z-score).",
    "denom": "For rate anomalies, the period's eligible volume — gate on a minimum so noise isn't flagged.",
    "wrong": "Current period inside its own baseline; alerting on tiny volumes; one global threshold for a metric whose normal noise varies.",
    "validate": "Baseline uses only prior periods; flagged periods clear a volume floor; z-scores are sane (most near 0)."
  },
  "predicts": [
    {
      "prompt": "Which days does this flag, and why does <code class='inline'>1 PRECEDING</code> matter?",
      "query": "SELECT day, failures,\n       AVG(failures) OVER (ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING) AS baseline,\n       failures > 2 * AVG(failures) OVER (ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING) AS spike\nFROM daily;",
      "options": [
        "Days where failures exceed twice the prior-7-day average; 1 PRECEDING keeps the current day out of its own baseline",
        "All days; the frame doesn't matter",
        "Days with the most charges overall",
        "A syntax error"
      ],
      "answer": 0,
      "explain": "The frame <code class='inline'>7 PRECEDING AND 1 PRECEDING</code> averages the previous seven days, ending the day before. <code class='inline'>spike</code> is true when today is more than 2× that baseline. If you used <code class='inline'>CURRENT ROW</code>, a spike would be partly averaged into its own baseline and the flag would weaken."
    },
    {
      "prompt": "A merchant has 4 attempts today, 2 failed (50%), vs a 5% baseline. With no volume floor, what happens?",
      "query": "-- attempts_today = 4, failures_today = 2, baseline_rate = 0.05",
      "options": [
        "Correctly flagged as a real spike",
        "Flagged as an anomaly, but it's almost certainly noise — 4 attempts can't estimate a rate reliably",
        "Never flagged",
        "Errors out"
      ],
      "answer": 1,
      "explain": "50% vs 5% looks huge, but on 4 attempts a single extra failure swings the rate 25 points. Without a volume floor you'll alert on noise. Require a minimum number of attempts before computing or flagging the rate."
    }
  ],
  "debugs": [
    {
      "title": "Current period inside its own baseline",
      "prompt": "Goal: flag days whose failures are far above the recent norm. The baseline includes the current day, so big spikes barely register.",
      "broken": "SELECT day, failures,\n       AVG(failures) OVER (ORDER BY day ROWS BETWEEN 7 PRECEDING AND CURRENT ROW) AS baseline,\n       failures > 2 * AVG(failures) OVER (ORDER BY day ROWS BETWEEN 7 PRECEDING AND CURRENT ROW) AS spike\nFROM daily;",
      "hint": "CURRENT ROW pulls today into its own baseline, so a spike inflates the very number it's compared against.",
      "fixed": "SELECT day, failures,\n       AVG(failures) OVER (ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING) AS baseline,\n       failures > 2 * AVG(failures) OVER (ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING) AS spike\nFROM daily;",
      "why": "The baseline must be the prior periods only. Ending the frame at <code class='inline'>1 PRECEDING</code> excludes the current day, so a spike is compared against a clean recent norm and the flag fires."
    },
    {
      "title": "No volume floor on a rate anomaly",
      "prompt": "Goal: flag merchants whose daily failure RATE spiked. Tiny merchants flood the alert list because one failure swings their rate.",
      "broken": "SELECT merchant_id, day, failures::numeric / NULLIF(attempts,0) AS fail_rate\nFROM merchant_daily\nWHERE failures::numeric / NULLIF(attempts,0) > 0.3;",
      "hint": "A merchant with 3 attempts and 1 failure is at 33% — statistical noise, not a spike.",
      "fixed": "SELECT merchant_id, day, failures::numeric / NULLIF(attempts,0) AS fail_rate\nFROM merchant_daily\nWHERE attempts >= 50\n  AND failures::numeric / NULLIF(attempts,0) > 0.3;",
      "why": "Add a volume floor (<code class='inline'>attempts &gt;= 50</code>) so the rate is estimated from enough data before you flag it. Without it, low-volume noise dominates the anomaly list."
    }
  ],
  "exercises": [
    {
      "id": "m14e1",
      "lvl": 1,
      "priority": "required",
      "title": "Daily failure counts (last 30 days)",
      "prompt": "Return one row per day for the last 30 days with the count of failed charges. <em>Grain: one row per day. This is the series anomaly detection runs on.</em>",
      "hints": [
        "Filter status='failed' and the 30-day window.",
        "Bucket and group by DATE_TRUNC('day', created_at)."
      ],
      "solution": "SELECT DATE_TRUNC('day', created_at) AS day,\n       COUNT(*) AS failures\nFROM charges\nWHERE status='failed'\n  AND created_at >= NOW() - INTERVAL '30 days'\nGROUP BY DATE_TRUNC('day', created_at)\nORDER BY day;"
    },
    {
      "id": "m14e2",
      "lvl": 2,
      "priority": "required",
      "title": "Trailing-7-day baseline",
      "prompt": "On the daily failure series, add a baseline = average failures over the previous 7 days (excluding the current day). <em>Grain: one row per day. Edge: the first days have a short/empty baseline.</em>",
      "hints": [
        "AVG(failures) OVER (ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING).",
        "Early days will have NULL/partial baselines — expected."
      ],
      "solution": "WITH daily AS (\n  SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) FILTER (WHERE status='failed') AS failures\n  FROM charges WHERE created_at >= NOW() - INTERVAL '30 days'\n  GROUP BY DATE_TRUNC('day', created_at)\n)\nSELECT day, failures,\n       ROUND(AVG(failures) OVER (ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING), 1) AS baseline_avg\nFROM daily\nORDER BY day;"
    },
    {
      "id": "m14e3",
      "lvl": 3,
      "priority": "should",
      "title": "Z-score and anomaly flag",
      "prompt": "Add the trailing standard deviation and a z-score = (failures − baseline_avg) / baseline_std, flagging days with z > 3. <em>Grain: one row per day. Validation: most z-scores near 0; guard the divide.</em>",
      "hints": [
        "STDDEV_SAMP(failures) OVER the same prior-7-day frame.",
        "z = (failures - baseline_avg) / NULLIF(baseline_std, 0); flag z > 3."
      ],
      "solution": "WITH daily AS (\n  SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) FILTER (WHERE status='failed') AS failures\n  FROM charges WHERE created_at >= NOW() - INTERVAL '30 days'\n  GROUP BY DATE_TRUNC('day', created_at)\n),\nstats AS (\n  SELECT day, failures,\n         AVG(failures) OVER w AS baseline_avg,\n         STDDEV_SAMP(failures) OVER w AS baseline_std\n  FROM daily\n  WINDOW w AS (ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING)\n)\nSELECT day, failures, ROUND(baseline_avg,1) AS baseline_avg,\n       ROUND((failures - baseline_avg)/NULLIF(baseline_std,0), 2) AS z_score,\n       (failures - baseline_avg)/NULLIF(baseline_std,0) > 3 AS is_anomaly\nFROM stats\nWHERE baseline_std IS NOT NULL\nORDER BY day;"
    },
    {
      "id": "m14e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "Dispute-rate spike with a volume floor",
      "prompt": "Per merchant per day (last 30 days), the dispute rate = disputed succeeded charges ÷ succeeded charges, flagging days where the rate is more than 3× the merchant's trailing-7-day baseline — but only on days with at least 50 succeeded charges. <em>Grain: one row per (merchant, day). Validation: no day under the volume floor is flagged.</em>",
      "hints": [
        "Build a per-merchant-per-day rate first (pre-aggregate disputes to charge grain to avoid fan-out).",
        "Baseline = AVG(rate) OVER (PARTITION BY merchant_id ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING); gate succeeded >= 50."
      ],
      "solution": "WITH daily AS (\n  SELECT c.merchant_id,\n         DATE_TRUNC('day', c.created_at) AS day,\n         COUNT(*) AS succeeded,\n         COUNT(DISTINCT d.charge_id) AS disputed\n  FROM charges c\n  LEFT JOIN disputes d ON d.charge_id = c.charge_id\n  WHERE c.status='succeeded' AND c.created_at >= NOW() - INTERVAL '30 days'\n  GROUP BY c.merchant_id, DATE_TRUNC('day', c.created_at)\n),\nscored AS (\n  SELECT merchant_id, day, succeeded,\n         disputed::numeric / NULLIF(succeeded,0) AS dispute_rate,\n         AVG(disputed::numeric / NULLIF(succeeded,0)) OVER (\n           PARTITION BY merchant_id ORDER BY day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING\n         ) AS baseline\n  FROM daily\n)\nSELECT merchant_id, day, succeeded,\n       ROUND(dispute_rate,4) AS dispute_rate,\n       ROUND(baseline,4) AS baseline\nFROM scored\nWHERE succeeded >= 50\n  AND dispute_rate > 3 * baseline\nORDER BY merchant_id, day;"
    },
    {
      "id": "m14e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: failure-code spike detection",
      "prompt": "Detect surges in a specific decline reason. Per <code class='inline'>failure_code</code> per day (last 21 days), flag days where that code's failure count exceeds its trailing-7-day mean by more than 3 standard deviations, ignoring codes with fewer than 20 failures in the window. State the immature-recent-day caveat. <em>Grain: one row per (failure_code, day). Validation: rare codes excluded; z guarded.</em>",
      "hints": [
        "Per (failure_code, day) counts; baseline AVG/STDDEV partitioned by failure_code over the prior-7-day frame.",
        "Filter to codes with enough total failures; guard the z divide; the newest day is still accumulating."
      ],
      "solution": "WITH per_code AS (\n  SELECT failure_code,\n         DATE_TRUNC('day', created_at) AS day,\n         COUNT(*) AS n\n  FROM charges\n  WHERE status='failed' AND failure_code IS NOT NULL\n    AND created_at >= NOW() - INTERVAL '21 days'\n  GROUP BY failure_code, DATE_TRUNC('day', created_at)\n),\neligible AS (\n  SELECT failure_code FROM per_code GROUP BY failure_code HAVING SUM(n) >= 20\n),\nstats AS (\n  SELECT p.failure_code, p.day, p.n,\n         AVG(p.n) OVER w AS base_mean,\n         STDDEV_SAMP(p.n) OVER w AS base_std\n  FROM per_code p\n  JOIN eligible e USING (failure_code)\n  WINDOW w AS (PARTITION BY p.failure_code ORDER BY p.day ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING)\n)\nSELECT failure_code, day, n, ROUND(base_mean,1) AS base_mean,\n       ROUND((n - base_mean)/NULLIF(base_std,0), 2) AS z_score\nFROM stats\nWHERE base_std IS NOT NULL\n  AND (n - base_mean)/NULLIF(base_std,0) > 3\nORDER BY z_score DESC;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "Anomaly detection in SQL compares a period's metric to:",
      "options": [
        "Zero",
        "Its recent baseline (a trailing average/std of prior periods)",
        "The all-time maximum",
        "A random number"
      ],
      "answer": 1,
      "why": "An anomaly is a deviation from what was normal recently — you build a trailing baseline and flag periods that depart from it.",
      "concept": "baseline"
    },
    {
      "level": 1,
      "q": "Which window frame builds a baseline that excludes the current day?",
      "options": [
        "ROWS BETWEEN 7 PRECEDING AND CURRENT ROW",
        "ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING",
        "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING",
        "No frame"
      ],
      "answer": 1,
      "why": "Ending the frame at <code class='inline'>1 PRECEDING</code> uses the prior 7 days and leaves the current day out of its own baseline.",
      "concept": "frame"
    },
    {
      "level": 2,
      "q": "The z-score of a value is:",
      "options": [
        "current ÷ baseline",
        "(current − baseline_mean) ÷ baseline_std",
        "current − baseline_mean",
        "baseline_std ÷ current"
      ],
      "answer": 1,
      "why": "A z-score measures how many standard deviations the value sits from the baseline mean, adapting to the metric's normal noise.",
      "concept": "z-score"
    },
    {
      "level": 4,
      "q": "Why gate anomaly flags on a volume floor?",
      "options": [
        "To make queries faster",
        "Because low-volume periods have noisy rates — one event swings them — so they produce false alarms",
        "Because SQL requires it",
        "To exclude succeeded charges"
      ],
      "answer": 1,
      "why": "A tiny denominator can't estimate a rate reliably; without a minimum volume you flag noise, not real spikes.",
      "concept": "volume floor"
    },
    {
      "level": 5,
      "q": "Asked to detect a dispute-rate spike, what do you state?",
      "options": [
        "Just SELECT MAX(rate)",
        "The baseline (trailing prior periods, current excluded), the threshold (multiplier or z-score), a volume floor to suppress noise, and that the newest period is still maturing",
        "That successes are the metric",
        "Nothing"
      ],
      "answer": 1,
      "why": "Precision: define the trailing baseline, exclude the current period, pick a threshold, floor the volume, and flag immature recent periods.",
      "concept": "interview judgment"
    }
  ],
  "mistakes": [
    "Putting the current period inside its own baseline, so a spike masks itself.",
    "Alerting on low-volume periods where one event swings the rate.",
    "Using one fixed threshold for a metric whose normal noise varies — a z-score adapts.",
    "Comparing to the all-time average instead of a recent trailing baseline.",
    "Reading the newest, still-accumulating period as a finished anomaly."
  ],
  "edges": [
    "The first few periods have a short or empty baseline — their flags are unreliable.",
    "Seasonality (weekends) can look like anomalies; compare like-with-like or use a longer baseline.",
    "A sustained shift (new normal) keeps flagging until the baseline catches up — decide if that's desired."
  ],
  "interview": "<p>State the detector precisely: <em>\"Per day I compute the metric, then a trailing baseline mean and std over the prior 7 days — excluding today via <code class='inline'>1 PRECEDING</code>. I flag z &gt; 3, and I gate on a volume floor so low-traffic days don't fire on noise. The newest day is still accumulating, so I treat it as provisional.\"</em> Excluding the current period and flooring volume is the senior signal.</p>",
  "followup": {
    "prompt": "Interviewer: \"How would you reduce false positives further?\"",
    "answer": "Compare like-with-like to handle seasonality (e.g. baseline this Monday against prior Mondays), raise the volume floor, require the spike to persist for two periods before paging, and use a robust baseline (median/MAD) so a single past spike doesn't inflate the std."
  }
};

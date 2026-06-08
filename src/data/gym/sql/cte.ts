import type { Problem } from '@/types';

/* Practice Gym ladder: CTEs & Subqueries (module m5). Problem-forward, progressive.
   Auto-included via src/data/gym/index.ts; referenced by the `cte` ladder. */
export const cteProblems: Problem[] = [
  {
    "id": "ce1",
    "ladder": "cte",
    "pos": 1,
    "stage": "Recognition",
    "lvl": 0,
    "difficulty": "recognition",
    "priority": "required",
    "source": "DataLemur-style",
    "module": "m5",
    "title": "When do you reach for a CTE?",
    "concept": ["cte"],
    "obj": ["Charge", "Refund"],
    "metric": "n/a",
    "edge": [],
    "timed": false,
    "est": "3 min",
    "business": "A teammate has written one deeply nested query to compute merchant refund rate and nobody can review it.",
    "schema": ["charges", "refunds"],
    "prompt": "No SQL yet. In plain English: what is a CTE, and name two reasons you'd rewrite a nested merchant-refund-rate query using CTEs. What is the one correctness reason (not just readability)?",
    "deliverable": "A two-sentence explanation an interviewer could follow: what a CTE is, and why it helps here.",
    "why": "Before you can build multi-step Stripe metrics you must recognise when naming intermediate steps is the right tool — and why it prevents a real bug, not just clutter.",
    "harder": "First rung — recognise the tool and its single most important benefit.",
    "before": [
      "Recall the shape: WITH name AS ( … ) SELECT … FROM name.",
      "Recall what fan-out is from the Joins module."
    ],
    "hints": [
      "Readability: each step gets a name you can read top-to-bottom.",
      "Correctness: a CTE lets you pre-aggregate a one-to-many table (refunds) to grain BEFORE joining — avoiding fan-out."
    ],
    "model": "A CTE is a named, query-scoped intermediate result defined with WITH. Two reasons to use one here: (1) readability — eligible_charges, refunds_by_charge and a final rate read as named steps instead of nested parentheses; (2) the correctness reason — you can pre-aggregate refunds to one row per charge before joining, so the join can't fan out and double-count. The denominator (succeeded charges) stays exactly right.",
    "grain": "Conceptual — no output rows yet.",
    "confusion": "A CTE is not a temp table you can reuse later; it exists only inside the one query that defines it.",
    "explain": "Say the WITH … AS shape and the fan-out-avoidance reason aloud before any code.",
    "teaches": "Recognising CTEs as named steps whose key payoff is pre-aggregation to avoid fan-out.",
    "mode": "SQL"
  },
  {
    "id": "ce2",
    "ladder": "cte",
    "pos": 2,
    "stage": "Mechanical",
    "lvl": 1,
    "difficulty": "easy",
    "priority": "required",
    "source": "pgexercises-style",
    "module": "m5",
    "title": "Define and read a CTE",
    "concept": ["cte"],
    "obj": ["Charge"],
    "metric": "n/a",
    "edge": [],
    "timed": false,
    "est": "4 min",
    "business": "You want only succeeded charges to work with, named so the rest of the query is clean.",
    "schema": ["charges"],
    "prompt": "Write a CTE <code class='inline'>eligible_charges</code> of succeeded charges, then select <code class='inline'>charge_id</code>, <code class='inline'>merchant_id</code>, <code class='inline'>amount</code> from it.",
    "deliverable": "A query of the form WITH eligible_charges AS ( … ) SELECT … FROM eligible_charges.",
    "why": "Defining and reading from a single CTE is the muscle every multi-step query is built on.",
    "harder": "Adds the WITH … AS mechanics to step 1's recognition.",
    "before": ["Filter status = 'succeeded' inside the CTE, not after."],
    "hints": [
      "WITH eligible_charges AS ( SELECT charge_id, merchant_id, amount FROM charges WHERE status='succeeded' ).",
      "Then SELECT charge_id, merchant_id, amount FROM eligible_charges."
    ],
    "solution": "WITH eligible_charges AS (\n  SELECT charge_id, merchant_id, amount\n  FROM charges\n  WHERE status = 'succeeded'\n)\nSELECT charge_id, merchant_id, amount\nFROM eligible_charges;",
    "grain": "One row per succeeded charge.",
    "confusion": "You read from the CTE by its name in the main query — there's no extra keyword.",
    "explain": "Explain that the CTE just names the succeeded-charge row set for this query.",
    "teaches": "The basic WITH … AS ( ) SELECT FROM name pattern.",
    "mode": "SQL"
  },
  {
    "id": "ce3",
    "ladder": "cte",
    "pos": 3,
    "stage": "Simple application",
    "lvl": 2,
    "difficulty": "easy",
    "priority": "required",
    "source": "Mode-style",
    "module": "m5",
    "title": "Eligible population: succeeded, last 30 days",
    "concept": ["cte"],
    "obj": ["Charge"],
    "metric": "count",
    "edge": ["window boundary"],
    "timed": false,
    "est": "5 min",
    "business": "Reporting only cares about recent activity — succeeded charges in the last 30 days.",
    "schema": ["charges"],
    "prompt": "Build a CTE <code class='inline'>recent_succeeded</code> of succeeded charges from the last 30 days, then return one row per merchant with their count.",
    "deliverable": "One row per merchant: merchant_id, recent_succeeded_count.",
    "why": "Most Stripe metrics start by defining an eligible population in a window; doing it inside a CTE keeps the denominator honest.",
    "harder": "Adds a time-window filter and a GROUP BY on the CTE.",
    "before": [
      "What does 'last 30 days' mean — created_at vs now?",
      "Should failed/pending charges count? No — succeeded only."
    ],
    "hints": [
      "Filter created_at >= NOW() - INTERVAL '30 days' AND status='succeeded' inside the CTE.",
      "Then GROUP BY merchant_id and COUNT(*)."
    ],
    "solution": "WITH recent_succeeded AS (\n  SELECT charge_id, merchant_id\n  FROM charges\n  WHERE status = 'succeeded'\n    AND created_at >= NOW() - INTERVAL '30 days'\n)\nSELECT merchant_id, COUNT(*) AS recent_succeeded_count\nFROM recent_succeeded\nGROUP BY merchant_id\nORDER BY recent_succeeded_count DESC;",
    "verify": {
      "grain": "One row per merchant with recent succeeded activity.",
      "columns": ["merchant_id", "recent_succeeded_count"],
      "sample": { "cols": ["merchant_id", "recent_succeeded_count"], "rows": [["101", "412"], ["105", "377"]] },
      "commonWrong": [
        "Counting all statuses, not just succeeded.",
        "Putting the window filter after aggregation instead of in the CTE."
      ],
      "validation": ["Counts are positive; merchants with no recent succeeded charge simply don't appear."],
      "edgeCases": ["A charge exactly 30 days old — decide >= vs > and state it.", "Time zone of created_at vs NOW()."],
      "checklist": ["status='succeeded' inside the CTE", "window inside the CTE", "GROUP BY merchant_id"]
    },
    "confusion": "Filtering the window after the GROUP BY would still aggregate the wrong rows first — define eligibility in the CTE.",
    "explain": "State the eligible population (succeeded, 30-day window) before writing the count.",
    "teaches": "Defining an eligible, windowed population inside a CTE before aggregating.",
    "mode": "SQL"
  },
  {
    "id": "ce4",
    "ladder": "cte",
    "pos": 4,
    "stage": "Applied metric",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "required",
    "source": "DataLemur-style",
    "module": "m5",
    "title": "Merchant success rate from a CTE",
    "concept": ["cte"],
    "obj": ["Charge"],
    "metric": "success rate",
    "edge": ["integer division", "zero denominator"],
    "timed": false,
    "est": "7 min",
    "business": "Risk wants each merchant's payment success rate over the last 30 days.",
    "schema": ["charges"],
    "prompt": "Using one CTE for eligible attempts (all charges in the window, any status), return one row per merchant: attempts, succeeded, and success_rate = succeeded ÷ attempts.",
    "deliverable": "One row per merchant: merchant_id, attempts, succeeded, success_rate (0–1, 4 dp).",
    "why": "Success rate is the canonical Stripe health metric — and the place beginners hit integer division and divide-by-zero.",
    "harder": "Turns the eligible CTE into a real rate with a guarded denominator.",
    "before": [
      "Denominator = attempts (every status), numerator = succeeded.",
      "Guard the divide and avoid integer division."
    ],
    "hints": [
      "Eligible attempts = every charge in the window regardless of status.",
      "succeeded = COUNT(*) FILTER (WHERE status='succeeded'); cast to numeric and wrap the denominator in NULLIF(…, 0)."
    ],
    "solution": "WITH attempts AS (\n  SELECT merchant_id, status\n  FROM charges\n  WHERE created_at >= NOW() - INTERVAL '30 days'\n)\nSELECT merchant_id,\n       COUNT(*) AS attempts,\n       COUNT(*) FILTER (WHERE status='succeeded') AS succeeded,\n       ROUND(COUNT(*) FILTER (WHERE status='succeeded')::numeric\n             / NULLIF(COUNT(*), 0), 4) AS success_rate\nFROM attempts\nGROUP BY merchant_id\nORDER BY success_rate;",
    "verify": {
      "grain": "One row per merchant with attempts in the window.",
      "columns": ["merchant_id", "attempts", "succeeded", "success_rate"],
      "sample": { "cols": ["merchant_id", "attempts", "succeeded", "success_rate"], "rows": [["102", "500", "455", "0.9100"], ["108", "120", "84", "0.7000"]] },
      "commonWrong": [
        "Denominator = succeeded only (then the rate is always 1).",
        "Integer division: succeeded / attempts without a numeric cast.",
        "No NULLIF — a merchant with 0 attempts errors or returns NULL silently."
      ],
      "validation": ["success_rate ∈ [0,1]", "succeeded ≤ attempts for every row"],
      "edgeCases": ["A merchant with attempts but zero succeeded → rate 0, not NULL.", "Pending charges: decide whether they count as attempts and say so."],
      "checklist": ["attempts is the denominator", "numeric cast", "NULLIF guard", "rounded to 4 dp"]
    },
    "confusion": "FILTER (WHERE …) counts a subset within the same aggregate — cleaner than SUM(CASE WHEN …).",
    "explain": "Name the numerator, denominator and the guard before writing the ratio.",
    "teaches": "Computing a guarded rate from a CTE-defined eligible population.",
    "mode": "SQL"
  },
  {
    "id": "ce5",
    "ladder": "cte",
    "pos": 5,
    "stage": "Multi-step",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "Mode-style",
    "module": "m5",
    "title": "Two CTEs: eligible charges → merchant rollup",
    "concept": ["cte"],
    "obj": ["Charge", "Refund"],
    "metric": "refund rate",
    "edge": ["fan-out", "zero denominator"],
    "timed": false,
    "est": "9 min",
    "business": "Finance wants each merchant's refund rate: refunded succeeded charges ÷ succeeded charges.",
    "schema": ["charges", "refunds"],
    "prompt": "Use two CTEs — one for succeeded charges, one for <code class='inline'>refunds_by_charge</code> (one row per refunded charge) — then roll up to one row per merchant with succeeded, refunded, and refund_rate.",
    "deliverable": "One row per merchant: merchant_id, succeeded, refunded, refund_rate (0–1).",
    "why": "Pre-aggregating refunds to charge grain before joining is the core CTE move that keeps the succeeded denominator correct.",
    "harder": "Introduces a second CTE and a LEFT JOIN between two named steps without fan-out.",
    "before": [
      "Refunds is one-to-many on charge_id — a charge can have 2 refunds.",
      "Pre-aggregate refunds to one row per charge so the join can't multiply succeeded rows."
    ],
    "howto": [
      "CTE 1 succeeded: charge_id, merchant_id WHERE status='succeeded'.",
      "CTE 2 refunds_by_charge: GROUP refunds BY charge_id.",
      "LEFT JOIN succeeded → refunds_by_charge on charge_id; COUNT(rbc.charge_id) counts refunded charges; guard the rate."
    ],
    "hints": [
      "COUNT(rbc.charge_id) after the LEFT JOIN counts only matched (refunded) charges; COUNT(*) counts all succeeded.",
      "ROUND(refunded::numeric / NULLIF(succeeded,0), 4)."
    ],
    "solution": "WITH succeeded AS (\n  SELECT charge_id, merchant_id\n  FROM charges WHERE status = 'succeeded'\n),\nrefunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n\n  FROM refunds GROUP BY charge_id\n)\nSELECT s.merchant_id,\n       COUNT(*) AS succeeded,\n       COUNT(rbc.charge_id) AS refunded,\n       ROUND(COUNT(rbc.charge_id)::numeric / NULLIF(COUNT(*), 0), 4) AS refund_rate\nFROM succeeded s\nLEFT JOIN refunds_by_charge rbc USING (charge_id)\nGROUP BY s.merchant_id\nORDER BY refund_rate DESC NULLS LAST;",
    "verify": {
      "grain": "One row per merchant with succeeded charges.",
      "columns": ["merchant_id", "succeeded", "refunded", "refund_rate"],
      "sample": { "cols": ["merchant_id", "succeeded", "refunded", "refund_rate"], "rows": [["104", "300", "21", "0.0700"], ["101", "412", "8", "0.0194"]] },
      "commonWrong": [
        "Joining raw refunds → succeeded count inflates because multi-refund charges fan out.",
        "COUNT(*) for refunded instead of COUNT(rbc.charge_id) — counts succeeded, not refunded."
      ],
      "validation": ["refunded ≤ succeeded for every merchant", "refund_rate ∈ [0,1]"],
      "edgeCases": ["A merchant with no refunds → refunded 0, refund_rate 0.", "A charge refunded twice still counts once in refunded."],
      "checklist": ["refunds pre-aggregated to charge grain", "LEFT JOIN keeps zero-refund merchants", "guarded rate"]
    },
    "confusion": "If you join raw refunds, a charge with two refunds becomes two succeeded rows — the denominator is wrong, not just the numerator.",
    "explain": "Describe each CTE's grain, then how the LEFT JOIN preserves the succeeded count.",
    "teaches": "Composing two CTEs and pre-aggregating the many-side before joining.",
    "mode": "SQL"
  },
  {
    "id": "ce6",
    "ladder": "cte",
    "pos": 6,
    "stage": "Debug",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "should",
    "source": "interview-style",
    "module": "m5",
    "title": "Debug: a raw join that fans out",
    "concept": ["cte"],
    "obj": ["Charge", "Refund", "Dispute"],
    "metric": "counts",
    "edge": ["fan-out"],
    "timed": false,
    "est": "7 min",
    "business": "This query should report per-merchant succeeded, refunded and disputed counts, but active merchants show impossible numbers (refunded > succeeded).",
    "schema": ["charges", "refunds", "disputes"],
    "prompt": "Find the bug in one sentence, then rewrite it with CTEs so the counts are correct.",
    "broken": "SELECT c.merchant_id,\n       COUNT(*) AS succeeded,\n       COUNT(r.refund_id) AS refunded,\n       COUNT(d.dispute_id) AS disputed\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nLEFT JOIN disputes d ON d.charge_id = c.charge_id\nWHERE c.status = 'succeeded'\nGROUP BY c.merchant_id;",
    "deliverable": "A one-sentence diagnosis + a corrected CTE-based query.",
    "why": "Diagnosing fan-out and fixing it with pre-aggregation is the single most common CTE interview moment.",
    "harder": "You must spot the corruption (it inflates even the denominator) and restructure, not just tweak.",
    "before": [
      "Both refunds and disputes are one-to-many on charge_id.",
      "What does a succeeded charge with 2 refunds and 1 dispute become after both joins?"
    ],
    "hints": [
      "Two one-to-many joins multiply rows: 2 refunds × 1 dispute = 2 rows for that charge, so even COUNT(*) succeeded is wrong.",
      "Pre-aggregate refunds and disputes to one row per charge in their own CTEs, then LEFT JOIN."
    ],
    "solution": "WITH charges_base AS (\n  SELECT charge_id, merchant_id\n  FROM charges WHERE status = 'succeeded'\n),\nrefunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM refunds GROUP BY charge_id\n),\ndisputes_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM disputes GROUP BY charge_id\n)\nSELECT b.merchant_id,\n       COUNT(*) AS succeeded,\n       COUNT(rbc.charge_id) AS refunded,\n       COUNT(dbc.charge_id) AS disputed\nFROM charges_base b\nLEFT JOIN refunds_by_charge rbc USING (charge_id)\nLEFT JOIN disputes_by_charge dbc USING (charge_id)\nGROUP BY b.merchant_id;",
    "verify": {
      "grain": "One row per merchant.",
      "columns": ["merchant_id", "succeeded", "refunded", "disputed"],
      "commonWrong": [
        "Adding DISTINCT to patch counts instead of removing the fan-out.",
        "Pre-aggregating only refunds but still raw-joining disputes."
      ],
      "validation": ["refunded ≤ succeeded and disputed ≤ succeeded for every merchant", "succeeded matches a plain GROUP BY count of succeeded charges"],
      "edgeCases": ["A charge with refunds but no dispute (and vice versa) must still count once."],
      "checklist": ["named the bug as fan-out", "both many-sides pre-aggregated", "denominator restored"]
    },
    "confusion": "The headline bug is that the denominator (succeeded) is inflated too — not only the refunded/disputed numerators.",
    "explain": "State the fan-out math (rows multiply) before showing the fix.",
    "teaches": "Diagnosing and removing fan-out by pre-aggregating each many-side in a CTE.",
    "mode": "SQL"
  },
  {
    "id": "ce7",
    "ladder": "cte",
    "pos": 7,
    "stage": "Edge-case hard",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "stretch",
    "source": "StrataScratch-style",
    "module": "m5",
    "title": "Refund rate with a clean denominator and a subquery filter",
    "concept": ["cte"],
    "obj": ["Charge", "Refund"],
    "metric": "refund rate",
    "edge": ["fan-out", "currency", "subquery vs CTE"],
    "timed": false,
    "est": "10 min",
    "business": "Finance wants USD refund rate per merchant, but only for merchants whose succeeded volume is above the platform median, to cut noise.",
    "schema": ["charges", "refunds"],
    "prompt": "Pre-aggregate refunds, compute USD refund rate per merchant, and keep only merchants with succeeded count above the median succeeded count across merchants. State where a subquery is cleaner than a CTE.",
    "deliverable": "One row per qualifying merchant: merchant_id, succeeded, refunded, refund_rate.",
    "why": "Real metrics combine a multi-CTE rollup with a scalar/subquery threshold — and you must keep the denominator clean while filtering on it.",
    "harder": "Adds a volume threshold (a scalar subquery / HAVING) on top of the fan-out-safe rollup, plus a currency scope.",
    "before": [
      "Scope currency = 'usd' inside the eligible CTE.",
      "Median is a single scalar — a subquery or a HAVING comparison is cleaner than another full CTE."
    ],
    "howto": [
      "succeeded_usd CTE: succeeded + currency='usd'.",
      "refunds_by_charge CTE: GROUP refunds BY charge_id.",
      "rollup CTE: per-merchant succeeded + refunded.",
      "Final SELECT: filter succeeded > the median via a scalar subquery."
    ],
    "hints": [
      "PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY succeeded) gives the median; compute it over the rollup.",
      "A scalar subquery in WHERE/HAVING reads cleaner here than a fourth CTE just for one number."
    ],
    "solution": "WITH succeeded_usd AS (\n  SELECT charge_id, merchant_id\n  FROM charges\n  WHERE status = 'succeeded' AND currency = 'usd'\n),\nrefunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM refunds GROUP BY charge_id\n),\nrollup AS (\n  SELECT s.merchant_id,\n         COUNT(*) AS succeeded,\n         COUNT(rbc.charge_id) AS refunded\n  FROM succeeded_usd s\n  LEFT JOIN refunds_by_charge rbc USING (charge_id)\n  GROUP BY s.merchant_id\n)\nSELECT merchant_id, succeeded, refunded,\n       ROUND(refunded::numeric / NULLIF(succeeded, 0), 4) AS refund_rate\nFROM rollup\nWHERE succeeded > (\n  SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY succeeded) FROM rollup\n)\nORDER BY refund_rate DESC;",
    "verify": {
      "grain": "One row per merchant above the median succeeded volume.",
      "columns": ["merchant_id", "succeeded", "refunded", "refund_rate"],
      "commonWrong": [
        "Filtering on a join-inflated succeeded count (median is then wrong too).",
        "Applying the median filter before pre-aggregation, so the threshold is computed on fanned-out rows.",
        "Forgetting currency scope and mixing USD with other currencies."
      ],
      "validation": ["refund_rate ∈ [0,1]", "every returned merchant's succeeded > median", "refunded ≤ succeeded"],
      "edgeCases": ["Odd vs even number of merchants for the median.", "A merchant exactly at the median — > excludes it; state the choice."],
      "checklist": ["currency scoped in CTE", "refunds pre-aggregated", "median computed on clean rollup", "subquery used for the scalar threshold"]
    },
    "confusion": "Compute the median on the already-clean rollup; if you threshold a fanned-out count, both the threshold and the filter are wrong.",
    "explain": "Justify subquery-vs-CTE: the median is one scalar, so a subquery is the clearer tool.",
    "teaches": "Layering a scalar subquery threshold onto a fan-out-safe multi-CTE rollup.",
    "mode": "SQL"
  },
  {
    "id": "ce8",
    "ladder": "cte",
    "pos": 8,
    "stage": "Final boss",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "Stripe-interview-style",
    "module": "m5",
    "title": "Final boss (timed 12 min): merchant health in named steps",
    "concept": ["cte"],
    "obj": ["Charge", "Refund", "Dispute"],
    "metric": "merchant health",
    "edge": ["fan-out", "zero denominator", "volume floor", "assumptions"],
    "timed": true,
    "est": "12 min",
    "business": "\"Which merchants look unhealthy this month?\" Build a merchant-health view and defend every choice.",
    "schema": ["charges", "refunds", "disputes"],
    "prompt": "Produce one row per merchant for the last 30 days with attempts, success_rate, refund_rate, dispute_rate and a <code class='inline'>health</code> flag. Flag <code class='inline'>'at_risk'</code> when, on at least 100 attempts, success_rate &lt; 0.8 OR dispute_rate &gt; 0.01; else <code class='inline'>'ok'</code>. State assumptions, avoid fan-out, and guard every denominator.",
    "deliverable": "One row per merchant: merchant_id, attempts, success_rate, refund_rate, dispute_rate, health.",
    "why": "This is the assembled Stripe metric: eligible attempts, pre-aggregated refunds/disputes, composed rates, and a defensible threshold — exactly what a final-round SQL question looks like.",
    "harder": "Combines every earlier rung — windowed eligibility, two pre-aggregations, multiple guarded rates, and a volume-floored business rule under time pressure.",
    "before": [
      "Eligible attempts = all charges in the 30-day window (denominator for success_rate).",
      "refund_rate and dispute_rate use succeeded charges as the denominator — decide and state this.",
      "Put the 100-attempt floor in the health CASE, never in a WHERE that hides low-volume merchants."
    ],
    "howto": [
      "attempts CTE (windowed), succeeded derived from it.",
      "refunds_by_charge and disputes_by_charge CTEs at charge grain.",
      "rollup CTE: per-merchant attempts, succeeded, refunded, disputed via LEFT JOINs.",
      "final SELECT: guarded rates + the health CASE with the volume floor."
    ],
    "hints": [
      "COUNT(*) FILTER (WHERE status='succeeded') gives succeeded inside the same rollup.",
      "Guard every ratio with NULLIF(denominator, 0); COALESCE has no effect on COUNT but keep zero-activity merchants via LEFT JOIN.",
      "Volume floor lives in the CASE expression, not a row filter."
    ],
    "solution": "WITH attempts AS (\n  SELECT merchant_id, charge_id, status\n  FROM charges\n  WHERE created_at >= NOW() - INTERVAL '30 days'\n),\nrefunds_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM refunds GROUP BY charge_id\n),\ndisputes_by_charge AS (\n  SELECT charge_id, COUNT(*) AS n FROM disputes GROUP BY charge_id\n),\nrollup AS (\n  SELECT a.merchant_id,\n         COUNT(*) AS attempts,\n         COUNT(*) FILTER (WHERE a.status='succeeded') AS succeeded,\n         COUNT(rbc.charge_id) FILTER (WHERE a.status='succeeded') AS refunded,\n         COUNT(dbc.charge_id) FILTER (WHERE a.status='succeeded') AS disputed\n  FROM attempts a\n  LEFT JOIN refunds_by_charge rbc USING (charge_id)\n  LEFT JOIN disputes_by_charge dbc USING (charge_id)\n  GROUP BY a.merchant_id\n)\nSELECT merchant_id,\n       attempts,\n       ROUND(succeeded::numeric / NULLIF(attempts,0), 4) AS success_rate,\n       ROUND(refunded::numeric / NULLIF(succeeded,0), 4) AS refund_rate,\n       ROUND(disputed::numeric / NULLIF(succeeded,0), 4) AS dispute_rate,\n       CASE WHEN attempts >= 100\n             AND (succeeded::numeric / NULLIF(attempts,0) < 0.8\n                  OR disputed::numeric / NULLIF(succeeded,0) > 0.01)\n            THEN 'at_risk' ELSE 'ok' END AS health\nFROM rollup\nORDER BY success_rate;",
    "rubric": [
      "Eligible attempts defined in a windowed CTE (the success denominator)",
      "Refunds and disputes pre-aggregated to charge grain — no fan-out",
      "refund_rate / dispute_rate use the succeeded denominator, stated explicitly",
      "Every ratio guarded with NULLIF",
      "Volume floor (≥100 attempts) lives in the CASE, not a WHERE",
      "Assumptions named: window meaning, pending charges, which denominator"
    ],
    "verify": {
      "grain": "One row per merchant with activity in the window.",
      "columns": ["merchant_id", "attempts", "success_rate", "refund_rate", "dispute_rate", "health"],
      "sample": { "cols": ["merchant_id", "attempts", "success_rate", "refund_rate", "dispute_rate", "health"], "rows": [["108", "640", "0.7300", "0.0400", "0.0150", "at_risk"], ["101", "412", "0.9600", "0.0190", "0.0020", "ok"]] },
      "commonWrong": [
        "Raw-joining refunds/disputes so attempts/succeeded inflate.",
        "Putting the 100-attempt floor in WHERE, hiding small merchants entirely.",
        "Using attempts (not succeeded) as the refund/dispute denominator without saying so."
      ],
      "validation": ["all rates ∈ [0,1]", "no merchant under 100 attempts is flagged at_risk", "refunded/disputed ≤ succeeded"],
      "edgeCases": ["A merchant with 0 succeeded but many attempts → refund_rate NULL-guarded to NULL/0; explain.", "Late-arriving disputes can lag the charge window."],
      "checklist": ["windowed attempts CTE", "two pre-aggregations", "guarded rates", "volume floor in CASE", "assumptions stated"]
    },
    "confusion": "The success denominator is attempts; the refund/dispute denominator is succeeded — mixing them is the classic mistake. State which you chose.",
    "explain": "Walk the five CTEs and defend the threshold and the denominators as if to an interviewer.",
    "teaches": "Assembling a defensible, fan-out-safe multi-metric health view entirely from named CTE steps.",
    "mode": "SQL"
  }
];

import type { Module } from '@/types';

/* Learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m15: Module = {
  "id": "m15",
  "day": "Day 6",
  "badge": "advanced",
  "title": "Experimentation & A/B Testing",
  "skill": "experiment",
  "bcolor": "geekblue",
  "concept": "<p>An <strong>A/B test</strong> randomly splits exposed users into <strong>control</strong> and <strong>treatment</strong>, then compares a single <strong>primary metric</strong> between the arms. Randomisation is what lets a difference be read as causal — so the analysis is mostly disciplined counting, with a few traps that decide whether the read is honest.</p>\n<p><strong>Exposure and a conversion window.</strong> Each user is exposed once (take the first exposure), and conversions count only within a fixed window after exposure — exactly the funnel discipline. The denominator and window are decided <em>before</em> looking at results.</p>\n<p><strong>Lift and ITT.</strong> <code class=\"inline\">lift = (treatment_rate − control_rate) / control_rate</code>. Compute each rate as <strong>intention-to-treat (ITT)</strong>: the denominator is <em>everyone assigned</em> to the arm, converted or not. Switching the denominator to \"only those who acted\" (treatment-on-treated) re-introduces selection bias and usually inflates the effect.</p>\n<p><strong>Guardrails beat a single metric.</strong> A conversion win bought with more disputes or refunds isn't a win. Always report guardrail metrics (dispute rate, refund rate) alongside the primary.</p>\n<p><strong>Peeking, multiple comparisons, and significance.</strong> Checking results repeatedly and stopping the moment <code class=\"inline\">p &lt; 0.05</code> inflates false positives — fix a horizon or use a sequential test. Testing many metrics means some look \"significant\" by chance — pre-register one primary metric (or correct for the rest). And statistical significance ≠ business significance: a tiny lift can be significant on huge traffic yet not worth shipping.</p>\n<div class=\"callout warn\"><span class=\"t\">Pre-register: one metric, one denominator, one horizon</span>The honest read is decided up front: a single primary metric, ITT denominators, a fixed run length, and named guardrails. Peeking, metric-shopping, and treated-only denominators are how A/B results lie.</div>",
  "sqlPattern": "WITH exposed AS (\n  SELECT customer_id, variant, MIN(exposed_at) AS exposed_at\n  FROM experiment_exposures WHERE experiment='checkout_v2'\n  GROUP BY customer_id, variant\n),\nconverted AS (\n  SELECT DISTINCT e.variant, e.customer_id\n  FROM charges c JOIN exposed e ON e.customer_id = c.customer_id\n  WHERE c.status='succeeded'\n    AND c.created_at >= e.exposed_at\n    AND c.created_at <  e.exposed_at + INTERVAL '7 days'\n),\nper_variant AS (\n  SELECT e.variant,\n         COUNT(DISTINCT e.customer_id)  AS exposed,\n         COUNT(DISTINCT cv.customer_id) AS converted\n  FROM exposed e\n  LEFT JOIN converted cv ON cv.variant = e.variant AND cv.customer_id = e.customer_id\n  GROUP BY e.variant\n)\nSELECT\n  ROUND(MAX(converted::numeric/NULLIF(exposed,0)) FILTER (WHERE variant='control'),4)   AS control_rate,\n  ROUND(MAX(converted::numeric/NULLIF(exposed,0)) FILTER (WHERE variant='treatment'),4)  AS treatment_rate,\n  ROUND((MAX(converted::numeric/NULLIF(exposed,0)) FILTER (WHERE variant='treatment')\n         - MAX(converted::numeric/NULLIF(exposed,0)) FILTER (WHERE variant='control'))\n        / NULLIF(MAX(converted::numeric/NULLIF(exposed,0)) FILTER (WHERE variant='control'),0), 4) AS lift\nFROM per_variant;",
  "schemaRefs": [
    "experiment_exposures",
    "charges",
    "customers",
    "disputes"
  ],
  "pysupport": "# ITT conversion per variant: converted exposed customers / ALL exposed (in window).\nexposed = {}        # variant -> set(customer_id)\nfirst_seen = {}     # customer_id -> exposed_at\nfor e in exposures:\n    if e[\"experiment\"] != \"checkout_v2\":\n        continue\n    exposed.setdefault(e[\"variant\"], set()).add(e[\"customer_id\"])\n    first_seen.setdefault(e[\"customer_id\"], e[\"exposed_at\"])\n\nconverted = {v: set() for v in exposed}\nfor c in charges:\n    if c[\"status\"] != \"succeeded\":\n        continue\n    cust = c[\"customer_id\"]\n    for v, members in exposed.items():\n        if cust in members and c[\"created_at\"] >= first_seen[cust]:\n            converted[v].add(cust)\n\nrate = {v: len(converted[v]) / len(exposed[v]) for v in exposed}   # ITT denominator",
  "reasoning": {
    "question": "\"Did treatment beat control on the primary metric, and is the read trustworthy?\"",
    "grain": "One row per variant (or one summary row with control vs treatment pivoted).",
    "included": "Customers exposed to the experiment in the window; conversions inside the post-exposure window.",
    "excluded": "Events outside the window; duplicate exposures collapsed to the first; treated-only denominators rejected for the primary read.",
    "table": "<code class=\"inline\">experiment_exposures</code> for assignment; <code class=\"inline\">charges</code> for conversion; <code class=\"inline\">disputes</code>/<code class=\"inline\">refunds</code> for guardrails.",
    "metric": "Per-variant primary rate, the lift between arms, and guardrail rates.",
    "denom": "ITT: all exposed customers in the arm — never only those who converted/acted.",
    "wrong": "Treated-only denominators; peeking and stopping at significance; metric-shopping; ignoring guardrails.",
    "validate": "Arms are comparable in size; rates ∈ 0–1; lift sign matches the rates; guardrails reported; the read uses a pre-registered metric and horizon."
  },
  "predicts": [
    {
      "prompt": "Control converts 56%, treatment 60%. What is the lift, and on what denominator are these rates?",
      "query": "-- control_rate = 0.56, treatment_rate = 0.60 (ITT: of ALL exposed in each arm)",
      "options": [
        "Lift 4 percentage points; denominator = converters",
        "Lift ≈ 7.1% relative ((0.60 − 0.56)/0.56); denominator = all exposed in each arm (ITT)",
        "Lift 60%; denominator = treatment only",
        "Lift 0"
      ],
      "answer": 1,
      "explain": "Relative lift = (0.60 − 0.56)/0.56 ≈ 0.071 (7.1%). The rates are ITT — converters ÷ all exposed in the arm — so the comparison reflects the assignment, not a self-selected subset. (4 points is the absolute difference; lift is usually relative.)"
    },
    {
      "prompt": "You compute conversion as succeeded ÷ <em>customers who attempted</em>, per arm. Why is that a biased read of the experiment?",
      "query": "-- denominator = customers who attempted a charge (not all exposed)",
      "options": [
        "It isn't biased",
        "Conditioning on 'attempted' is post-randomisation selection: if treatment changes who attempts, the arms are no longer comparable — use ITT (all exposed)",
        "It's faster",
        "It double counts"
      ],
      "answer": 1,
      "explain": "Attempting is itself affected by the treatment, so dividing by attempters compares different sub-populations across arms (treatment-on-treated). ITT keeps the denominator as everyone assigned, preserving the randomised comparison."
    }
  ],
  "debugs": [
    {
      "title": "Treated-only denominator instead of ITT",
      "prompt": "Goal: per-variant conversion to compare arms. This divides by customers who attempted, not all exposed, biasing the comparison.",
      "broken": "WITH exposed AS (SELECT DISTINCT customer_id, variant FROM experiment_exposures WHERE experiment='checkout_v2'),\nattempted AS (SELECT DISTINCT e.variant, c.customer_id FROM charges c JOIN exposed e USING (customer_id))\nSELECT a.variant,\n       COUNT(DISTINCT a.customer_id) AS attempted,\n       COUNT(DISTINCT c.customer_id) FILTER (WHERE c.status='succeeded') AS converted\nFROM attempted a\nJOIN charges c ON c.customer_id=a.customer_id\nGROUP BY a.variant;",
      "hint": "The denominator should be everyone exposed (assigned), not just those who attempted — attempting is affected by the treatment.",
      "fixed": "WITH exposed AS (\n  SELECT DISTINCT customer_id, variant FROM experiment_exposures WHERE experiment='checkout_v2'\n),\nconverted AS (\n  SELECT DISTINCT e.variant, c.customer_id\n  FROM charges c JOIN exposed e USING (customer_id)\n  WHERE c.status='succeeded'\n)\nSELECT e.variant,\n       COUNT(DISTINCT e.customer_id)  AS exposed,\n       COUNT(DISTINCT cv.customer_id) AS converted,\n       ROUND(COUNT(DISTINCT cv.customer_id)::numeric / NULLIF(COUNT(DISTINCT e.customer_id),0), 4) AS conversion_itt\nFROM exposed e\nLEFT JOIN converted cv ON cv.variant=e.variant AND cv.customer_id=e.customer_id\nGROUP BY e.variant;",
      "why": "ITT divides by <em>all exposed</em> in each arm. Conditioning on 'attempted' is post-randomisation selection — if treatment changes who attempts, the arms aren't comparable and the lift is biased."
    },
    {
      "title": "Calling a winner without guardrails",
      "prompt": "Goal: decide if treatment wins. This reports only the conversion rate, ignoring that treatment may have raised disputes.",
      "broken": "SELECT variant,\n       ROUND(COUNT(DISTINCT cv.customer_id)::numeric / NULLIF(COUNT(DISTINCT e.customer_id),0),4) AS conversion\nFROM exposed e\nLEFT JOIN converted cv ON cv.variant=e.variant AND cv.customer_id=e.customer_id\nGROUP BY variant;",
      "hint": "A higher conversion bought with more disputes/refunds is not a real win. Report a guardrail alongside the primary.",
      "fixed": "SELECT e.variant,\n       ROUND(COUNT(DISTINCT cv.customer_id)::numeric / NULLIF(COUNT(DISTINCT e.customer_id),0),4) AS conversion,\n       ROUND(COUNT(DISTINCT d.charge_id)::numeric    / NULLIF(COUNT(DISTINCT s.charge_id),0),4)   AS dispute_rate\nFROM exposed e\nLEFT JOIN converted cv ON cv.variant=e.variant AND cv.customer_id=e.customer_id\nLEFT JOIN charges s ON s.customer_id=e.customer_id AND s.status='succeeded'\nLEFT JOIN disputes d ON d.charge_id=s.charge_id\nGROUP BY e.variant;",
      "why": "The decision needs a guardrail next to the primary metric. If treatment's conversion is up but its dispute or refund rate rose, the 'win' may be costing more than it earns — so you report both."
    }
  ],
  "exercises": [
    {
      "id": "m15e1",
      "lvl": 1,
      "priority": "required",
      "title": "Exposed per variant",
      "prompt": "For experiment 'checkout_v2', count the distinct exposed customers per variant. <em>Grain: one row per variant. Validation: arms roughly balanced.</em>",
      "hints": [
        "DISTINCT customer_id per variant from experiment_exposures.",
        "GROUP BY variant."
      ],
      "solution": "SELECT variant, COUNT(DISTINCT customer_id) AS exposed\nFROM experiment_exposures\nWHERE experiment='checkout_v2'\nGROUP BY variant\nORDER BY variant;"
    },
    {
      "id": "m15e2",
      "lvl": 2,
      "priority": "required",
      "title": "ITT conversion rate per variant",
      "prompt": "Per variant, the conversion rate = distinct exposed customers with a succeeded charge ÷ all exposed (ITT). <em>Grain: one row per variant. Validation: rate ∈ 0–1, denominator = all exposed.</em>",
      "hints": [
        "exposed CTE with variant; converted = distinct exposed customers with a succeeded charge.",
        "Divide by COUNT(DISTINCT exposed), not by converters."
      ],
      "solution": "WITH exposed AS (\n  SELECT DISTINCT customer_id, variant FROM experiment_exposures WHERE experiment='checkout_v2'\n),\nconverted AS (\n  SELECT DISTINCT e.variant, c.customer_id\n  FROM charges c JOIN exposed e USING (customer_id)\n  WHERE c.status='succeeded'\n)\nSELECT e.variant,\n       COUNT(DISTINCT e.customer_id)  AS exposed,\n       COUNT(DISTINCT cv.customer_id) AS converted,\n       ROUND(COUNT(DISTINCT cv.customer_id)::numeric / NULLIF(COUNT(DISTINCT e.customer_id),0), 4) AS conversion_itt\nFROM exposed e\nLEFT JOIN converted cv ON cv.variant=e.variant AND cv.customer_id=e.customer_id\nGROUP BY e.variant\nORDER BY e.variant;"
    },
    {
      "id": "m15e3",
      "lvl": 3,
      "priority": "should",
      "title": "Lift: treatment vs control",
      "prompt": "Return control_rate, treatment_rate and the relative lift = (treatment − control) ÷ control, in one row. <em>Grain: a single summary row. Guard the divide.</em>",
      "hints": [
        "Compute per-variant ITT rates in a CTE, then pivot control vs treatment with FILTER.",
        "lift = (treatment − control)/NULLIF(control,0)."
      ],
      "solution": "WITH exposed AS (\n  SELECT DISTINCT customer_id, variant FROM experiment_exposures WHERE experiment='checkout_v2'\n),\nconverted AS (\n  SELECT DISTINCT e.variant, c.customer_id FROM charges c JOIN exposed e USING (customer_id) WHERE c.status='succeeded'\n),\nrates AS (\n  SELECT e.variant,\n         COUNT(DISTINCT cv.customer_id)::numeric / NULLIF(COUNT(DISTINCT e.customer_id),0) AS rate\n  FROM exposed e\n  LEFT JOIN converted cv ON cv.variant=e.variant AND cv.customer_id=e.customer_id\n  GROUP BY e.variant\n)\nSELECT ROUND(MAX(rate) FILTER (WHERE variant='control'),4)   AS control_rate,\n       ROUND(MAX(rate) FILTER (WHERE variant='treatment'),4)  AS treatment_rate,\n       ROUND((MAX(rate) FILTER (WHERE variant='treatment') - MAX(rate) FILTER (WHERE variant='control'))\n             / NULLIF(MAX(rate) FILTER (WHERE variant='control'),0), 4) AS lift\nFROM rates;"
    },
    {
      "id": "m15e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "Primary metric plus a guardrail",
      "prompt": "Per variant, report ITT conversion AND a guardrail dispute rate (disputed succeeded charges ÷ succeeded charges). <em>Grain: one row per variant. Pre-aggregate to avoid fan-out.</em>",
      "hints": [
        "Conversion as before; for the guardrail, succeeded charges and disputed (distinct) per variant's exposed customers.",
        "Count distinct disputed charges to avoid fan-out."
      ],
      "solution": "WITH exposed AS (\n  SELECT DISTINCT customer_id, variant FROM experiment_exposures WHERE experiment='checkout_v2'\n),\nconverted AS (\n  SELECT DISTINCT e.variant, c.customer_id FROM charges c JOIN exposed e USING (customer_id) WHERE c.status='succeeded'\n),\ncharges_in_arm AS (\n  SELECT e.variant, c.charge_id\n  FROM charges c JOIN exposed e USING (customer_id)\n  WHERE c.status='succeeded'\n)\nSELECT e.variant,\n       ROUND(COUNT(DISTINCT cv.customer_id)::numeric / NULLIF(COUNT(DISTINCT e.customer_id),0),4) AS conversion_itt,\n       ROUND(COUNT(DISTINCT d.charge_id)::numeric / NULLIF(COUNT(DISTINCT ca.charge_id),0),4) AS dispute_rate\nFROM exposed e\nLEFT JOIN converted cv ON cv.variant=e.variant AND cv.customer_id=e.customer_id\nLEFT JOIN charges_in_arm ca ON ca.variant=e.variant\nLEFT JOIN disputes d ON d.charge_id=ca.charge_id\nGROUP BY e.variant\nORDER BY e.variant;"
    },
    {
      "id": "m15e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: experiment readout with guardrails and caveats",
      "prompt": "Produce a one-row-per-variant readout for 'checkout_v2': exposed, ITT conversion (succeeded within 7 days of first exposure), and a guardrail dispute rate. Then state, in words, the three things that would stop you shipping a positive result. <em>Validation: ITT denominators, conversion within the window, guardrail reported, peeking/multiple-comparisons/significance caveats named.</em>",
      "hints": [
        "First exposure per (customer, variant); conversion within 7 days; ITT denominator = all exposed.",
        "Guardrail: distinct disputed charges over succeeded charges in the arm.",
        "Caveats: peeking (fixed horizon), multiple comparisons (one pre-registered primary), statistical vs business significance."
      ],
      "solution": "WITH exposed AS (\n  SELECT customer_id, variant, MIN(exposed_at) AS exposed_at\n  FROM experiment_exposures WHERE experiment='checkout_v2'\n  GROUP BY customer_id, variant\n),\nconverted AS (\n  SELECT DISTINCT e.variant, e.customer_id\n  FROM charges c JOIN exposed e ON e.customer_id=c.customer_id\n  WHERE c.status='succeeded'\n    AND c.created_at >= e.exposed_at\n    AND c.created_at <  e.exposed_at + INTERVAL '7 days'\n),\narm_charges AS (\n  SELECT e.variant, c.charge_id\n  FROM charges c JOIN exposed e ON e.customer_id=c.customer_id\n  WHERE c.status='succeeded'\n    AND c.created_at >= e.exposed_at\n    AND c.created_at <  e.exposed_at + INTERVAL '7 days'\n)\nSELECT e.variant,\n       COUNT(DISTINCT e.customer_id) AS exposed,\n       ROUND(COUNT(DISTINCT cv.customer_id)::numeric / NULLIF(COUNT(DISTINCT e.customer_id),0),4) AS conversion_itt,\n       ROUND(COUNT(DISTINCT d.charge_id)::numeric / NULLIF(COUNT(DISTINCT ac.charge_id),0),4) AS dispute_rate\nFROM exposed e\nLEFT JOIN converted cv ON cv.variant=e.variant AND cv.customer_id=e.customer_id\nLEFT JOIN arm_charges ac ON ac.variant=e.variant\nLEFT JOIN disputes d ON d.charge_id=ac.charge_id\nGROUP BY e.variant\nORDER BY e.variant;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "In an A/B test, the primary metric should be:",
      "options": [
        "Whichever metric looks best after the test",
        "A single metric chosen before the test (pre-registered)",
        "All metrics at once",
        "The number of rows"
      ],
      "answer": 1,
      "why": "Pre-registering one primary metric prevents metric-shopping, where testing many metrics makes some look significant by chance.",
      "concept": "primary metric"
    },
    {
      "level": 1,
      "q": "Relative lift of treatment over control is:",
      "options": [
        "treatment_rate − control_rate",
        "(treatment_rate − control_rate) / control_rate",
        "treatment_rate / control_rate − control_rate",
        "control_rate / treatment_rate"
      ],
      "answer": 1,
      "why": "Relative lift expresses the difference as a fraction of the control rate.",
      "concept": "lift"
    },
    {
      "level": 2,
      "q": "Which denominator gives an intention-to-treat conversion rate?",
      "options": [
        "Customers who converted",
        "All exposed customers in the arm",
        "Customers who attempted",
        "Total charges"
      ],
      "answer": 1,
      "why": "ITT divides by everyone assigned to the arm, converted or not — preserving the randomised comparison.",
      "concept": "ITT"
    },
    {
      "level": 4,
      "q": "Why is peeking (stopping the test the moment p < 0.05) a problem?",
      "options": [
        "It's slower",
        "Repeated looks inflate the false-positive rate well above 5%, so a 'significant' result may be chance",
        "It uses too much memory",
        "It excludes control"
      ],
      "answer": 1,
      "why": "Each look is another chance to cross the threshold; stopping at the first crossing makes the effective false-positive rate much higher than the nominal 5%. Fix a horizon or use a sequential method.",
      "concept": "peeking"
    },
    {
      "level": 5,
      "q": "Treatment wins on conversion. Before shipping, what do you check?",
      "options": [
        "Nothing — ship it",
        "Guardrails (dispute/refund), that the read is ITT on a pre-registered metric and fixed horizon (no peeking), and whether the lift is both statistically and practically significant",
        "Whether control had more rows",
        "The chart colour"
      ],
      "answer": 1,
      "why": "A defensible ship decision pairs the primary lift with guardrails, an ITT read on a pre-registered metric and horizon, and a check that the effect is large enough to matter.",
      "concept": "interview judgment"
    }
  ],
  "mistakes": [
    "Treatment-on-treated: dividing by those who acted instead of all exposed (ITT), re-introducing selection bias.",
    "Peeking — checking repeatedly and stopping at significance — which inflates false positives.",
    "Metric-shopping: testing many metrics and reporting whichever is significant.",
    "Ignoring guardrails: a conversion win that raises disputes/refunds isn't a win.",
    "Confusing statistical significance (driven by n) with business significance (does the lift matter?)."
  ],
  "edges": [
    "Contamination: a customer exposed to both arms must be excluded or attributed by first exposure.",
    "Unequal arm sizes or a broken randomisation make the comparison invalid — check balance first.",
    "Novelty/primacy effects: an early lift can fade; confirm it persists before shipping."
  ],
  "interview": "<p>State the read up front: <em>\"Primary metric is checkout conversion, ITT — converters ÷ all exposed in each arm, within a 7-day window from first exposure. I report lift plus a dispute-rate guardrail. The result is only trustworthy if it's a pre-registered metric on a fixed horizon (no peeking), and I'd check the lift is practically, not just statistically, significant.\"</em> ITT, guardrails, and no peeking are the senior signals.</p>",
  "followup": {
    "prompt": "Interviewer: \"Lift is +1.2% and p = 0.03 on 8 metrics. Ship?\"",
    "answer": "Cautious. Eight metrics at α=0.05 means ~1 false positive expected by chance, so I'd want this to be the pre-registered primary (or apply a correction), confirm there was no peeking, check the guardrails held, and ask whether +1.2% clears the business bar to be worth the cost — statistical significance alone isn't a ship decision."
  }
};

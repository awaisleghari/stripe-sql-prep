import type { Module } from '@/types';

/* Learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m9: Module = {
  "id": "m9",
  "day": "Day 4",
  "badge": "intermediate",
  "title": "Funnel Analysis",
  "skill": "funnel",
  "bcolor": "volcano",
  "concept": "<p>A <strong>funnel</strong> is an ordered sequence of steps where the population can only shrink: <em>exposed → attempted → succeeded</em>. The key idea is that the <strong>denominator changes at each step</strong>, and a conversion rate is always \"this step ÷ the step you're measuring from.\"</p>\n<p><strong>Grain is everything: count entities, not events.</strong> Pick the entity once — usually one row per <code class=\"inline\">customer_id</code> (or merchant, or session) — and count it <em>once per step</em>. A customer who retries a failed payment five times is still <strong>one</strong> customer who attempted. Use <code class=\"inline\">COUNT(DISTINCT customer_id)</code> or reduce to the first event per entity; never count raw charge rows.</p>\n<p><strong>Two denominators, two different rates.</strong> From the same exposed → attempted → succeeded counts you can report: <em>attempt rate</em> = attempted ÷ exposed; <em>success-from-exposure</em> = succeeded ÷ exposed; <em>success-from-attempt</em> = succeeded ÷ attempted. They answer different questions — name which denominator you used.</p>\n<p><strong>Stripe funnels.</strong> Checkout: exposure → payment attempt → successful charge. Merchant onboarding: merchant created → first charge attempt → first successful charge. Billing: invoice open → paid; subscription trial → active → paid. Each is the same pattern: define the eligible base, then each subsequent step as a distinct-entity subset of the base.</p>\n<div class=\"callout warn\"><span class=\"t\">Denominator drift and order</span>Step conversion is always relative to the <em>immediately previous</em> step (or a stated base). Mixing denominators (success ÷ exposed called a \"checkout success rate\") and counting events instead of distinct entities are the two bugs that quietly inflate every funnel.</div>",
  "sqlPattern": "WITH exposed AS (\n  SELECT DISTINCT customer_id\n  FROM experiment_exposures\n  WHERE experiment = 'checkout_v2'\n),\nattempted AS (\n  SELECT DISTINCT c.customer_id\n  FROM charges c JOIN exposed e USING (customer_id)\n),\nsucceeded AS (\n  SELECT DISTINCT c.customer_id\n  FROM charges c JOIN exposed e USING (customer_id)\n  WHERE c.status = 'succeeded'\n)\nSELECT (SELECT COUNT(*) FROM exposed)   AS exposed,\n       (SELECT COUNT(*) FROM attempted) AS attempted,\n       (SELECT COUNT(*) FROM succeeded) AS succeeded,\n       ROUND((SELECT COUNT(*) FROM attempted)::numeric\n             / NULLIF((SELECT COUNT(*) FROM exposed),0), 4)  AS attempt_rate,\n       ROUND((SELECT COUNT(*) FROM succeeded)::numeric\n             / NULLIF((SELECT COUNT(*) FROM attempted),0), 4) AS success_from_attempt;",
  "schemaRefs": [
    "experiment_exposures",
    "customers",
    "charges",
    "merchants"
  ],
  "pysupport": "# Count DISTINCT customers per step with sets (no pandas).\nexposed = {e[\"customer_id\"] for e in exposures if e[\"experiment\"] == \"checkout_v2\"}\nattempted = {c[\"customer_id\"] for c in charges if c[\"customer_id\"] in exposed}\nsucceeded = {c[\"customer_id\"] for c in charges\n             if c[\"customer_id\"] in exposed and c[\"status\"] == \"succeeded\"}\n\nattempt_rate = len(attempted) / len(exposed)          # vs exposed\nsuccess_from_attempt = len(succeeded) / len(attempted) # vs attempted",
  "reasoning": {
    "question": "\"What fraction of <entity> moved from step A to step B?\" — e.g. exposed customers who went on to a successful payment.",
    "grain": "One row per entity per step. Choose the entity (customer, merchant, session) first and count it once per step.",
    "included": "The eligible base for the funnel — e.g. customers exposed to the checkout experiment in the window.",
    "excluded": "Out-of-window events, and repeated attempts by the same entity (collapse to distinct or first).",
    "table": "<code class=\"inline\">experiment_exposures</code> for the base; <code class=\"inline\">charges</code> for attempt/success steps, joined back to the base on <code class=\"inline\">customer_id</code>.",
    "metric": "Step counts plus conversion rates, each with its denominator named.",
    "denom": "Step-to-step conversion uses the previous step's distinct-entity count; success-from-exposure uses the base.",
    "wrong": "Counting charge events instead of distinct customers; reusing one denominator for every rate; ignoring step order or the conversion window.",
    "validate": "Counts are monotonically non-increasing (exposed ≥ attempted ≥ succeeded); every rate ∈ 0–1; the entity is distinct per step."
  },
  "predicts": [
    {
      "prompt": "1,000 customers are exposed, 700 attempt a payment, 560 succeed. Match each rate to its denominator.",
      "query": "-- exposed = 1000, attempted = 700, succeeded = 560\n-- attempt_rate            = attempted / exposed\n-- success_from_exposure   = succeeded / exposed\n-- success_from_attempt    = succeeded / attempted",
      "options": [
        "attempt 56%, success_from_exposure 70%, success_from_attempt 80%",
        "attempt 70%, success_from_exposure 56%, success_from_attempt 80%",
        "attempt 80%, success_from_exposure 70%, success_from_attempt 56%",
        "All three are 70%"
      ],
      "answer": 1,
      "explain": "attempt_rate = 700/1000 = 70%. success_from_exposure = 560/1000 = 56%. success_from_attempt = 560/700 = 80%. Same numerators, different denominators — always state which one you mean."
    },
    {
      "prompt": "A customer has 4 charge rows (3 failed retries, then 1 success). Counting attempts with <code class='inline'>COUNT(*)</code> vs <code class='inline'>COUNT(DISTINCT customer_id)</code> gives:",
      "query": "SELECT COUNT(*)                  AS by_event,\n       COUNT(DISTINCT customer_id) AS by_customer\nFROM charges\nWHERE customer_id = 7;",
      "options": [
        "Both 1",
        "by_event = 4, by_customer = 1",
        "by_event = 1, by_customer = 4",
        "Both 4"
      ],
      "answer": 1,
      "explain": "<code class='inline'>COUNT(*)</code> counts the 4 charge rows; <code class='inline'>COUNT(DISTINCT customer_id)</code> counts the one customer. A funnel attempt step wants the customer count — retries must not inflate it."
    }
  ],
  "debugs": [
    {
      "title": "Counting charge events instead of customers",
      "prompt": "Goal: how many exposed customers attempted a payment, and the attempt rate. The attempt count is far higher than the exposed count — impossible for a funnel.",
      "broken": "WITH exposed AS (\n  SELECT DISTINCT customer_id FROM experiment_exposures WHERE experiment='checkout_v2'\n)\nSELECT (SELECT COUNT(*) FROM exposed) AS exposed,\n       COUNT(*) AS attempted,\n       ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM exposed),0), 4) AS attempt_rate\nFROM charges c JOIN exposed e USING (customer_id);",
      "hint": "Each customer can have many charge rows (retries). COUNT(*) counts charge events, so attempted can exceed exposed and the rate goes above 1.",
      "fixed": "WITH exposed AS (\n  SELECT DISTINCT customer_id FROM experiment_exposures WHERE experiment='checkout_v2'\n),\nattempted AS (\n  SELECT DISTINCT c.customer_id\n  FROM charges c JOIN exposed e USING (customer_id)\n)\nSELECT (SELECT COUNT(*) FROM exposed)   AS exposed,\n       (SELECT COUNT(*) FROM attempted) AS attempted,\n       ROUND((SELECT COUNT(*) FROM attempted)::numeric\n             / NULLIF((SELECT COUNT(*) FROM exposed),0), 4) AS attempt_rate;",
      "why": "A funnel counts <em>distinct entities</em> per step. Collapsing charges to distinct customers in an <code class='inline'>attempted</code> CTE keeps attempted ≤ exposed and the rate in 0–1. Counting raw charge rows double-counts every retry."
    },
    {
      "title": "Wrong denominator for step conversion",
      "prompt": "Goal: the success rate of customers who attempted (step-to-step). This query divides successes by exposed, not by attempted.",
      "broken": "WITH exposed AS (SELECT DISTINCT customer_id FROM experiment_exposures WHERE experiment='checkout_v2'),\nattempted AS (SELECT DISTINCT c.customer_id FROM charges c JOIN exposed e USING (customer_id)),\nsucceeded AS (SELECT DISTINCT c.customer_id FROM charges c JOIN exposed e USING (customer_id) WHERE c.status='succeeded')\nSELECT ROUND((SELECT COUNT(*) FROM succeeded)::numeric\n             / NULLIF((SELECT COUNT(*) FROM exposed),0), 4) AS success_rate;",
      "hint": "Step-to-step conversion is relative to the previous step. 'Of those who attempted, how many succeeded?' uses the attempted count.",
      "fixed": "WITH exposed AS (SELECT DISTINCT customer_id FROM experiment_exposures WHERE experiment='checkout_v2'),\nattempted AS (SELECT DISTINCT c.customer_id FROM charges c JOIN exposed e USING (customer_id)),\nsucceeded AS (SELECT DISTINCT c.customer_id FROM charges c JOIN exposed e USING (customer_id) WHERE c.status='succeeded')\nSELECT ROUND((SELECT COUNT(*) FROM succeeded)::numeric\n             / NULLIF((SELECT COUNT(*) FROM attempted),0), 4) AS success_from_attempt;",
      "why": "Dividing succeeded by exposed is success-from-exposure, a different metric. The step conversion 'success given attempt' must use the <code class='inline'>attempted</code> denominator. Naming the denominator avoids this drift."
    }
  ],
  "exercises": [
    {
      "id": "m9e1",
      "lvl": 1,
      "priority": "required",
      "title": "Two rates from three counts",
      "prompt": "Given an exposed base and the charges table, return exposed, attempted (distinct customers who charged), succeeded (distinct customers with a succeeded charge), plus attempt_rate (vs exposed) and success_from_attempt (vs attempted). <em>Grain: a single summary row. Validation: exposed ≥ attempted ≥ succeeded.</em>",
      "hints": [
        "Three CTEs of DISTINCT customer_id: exposed, attempted, succeeded.",
        "Compute each rate with the correct denominator and a NULLIF guard."
      ],
      "solution": "WITH exposed AS (\n  SELECT DISTINCT customer_id FROM experiment_exposures WHERE experiment='checkout_v2'\n),\nattempted AS (\n  SELECT DISTINCT c.customer_id FROM charges c JOIN exposed e USING (customer_id)\n),\nsucceeded AS (\n  SELECT DISTINCT c.customer_id FROM charges c JOIN exposed e USING (customer_id) WHERE c.status='succeeded'\n)\nSELECT (SELECT COUNT(*) FROM exposed)   AS exposed,\n       (SELECT COUNT(*) FROM attempted) AS attempted,\n       (SELECT COUNT(*) FROM succeeded) AS succeeded,\n       ROUND((SELECT COUNT(*) FROM attempted)::numeric / NULLIF((SELECT COUNT(*) FROM exposed),0), 4)  AS attempt_rate,\n       ROUND((SELECT COUNT(*) FROM succeeded)::numeric / NULLIF((SELECT COUNT(*) FROM attempted),0), 4) AS success_from_attempt;"
    },
    {
      "id": "m9e2",
      "lvl": 2,
      "priority": "required",
      "title": "Checkout funnel by variant",
      "prompt": "For experiment 'checkout_v2', one row per variant with exposed, succeeded (distinct customers with a succeeded charge), and success_from_exposure. <em>Grain: one row per variant. Edge: a customer exposed to one variant only.</em>",
      "hints": [
        "Carry variant through the exposed CTE.",
        "Join charges to the exposed set on customer_id; COUNT(DISTINCT) per variant."
      ],
      "solution": "WITH exposed AS (\n  SELECT DISTINCT customer_id, variant\n  FROM experiment_exposures WHERE experiment='checkout_v2'\n),\nsucceeded AS (\n  SELECT DISTINCT e.variant, c.customer_id\n  FROM charges c JOIN exposed e USING (customer_id)\n  WHERE c.status='succeeded'\n)\nSELECT e.variant,\n       COUNT(DISTINCT e.customer_id) AS exposed,\n       COUNT(DISTINCT s.customer_id) AS succeeded,\n       ROUND(COUNT(DISTINCT s.customer_id)::numeric\n             / NULLIF(COUNT(DISTINCT e.customer_id),0), 4) AS success_from_exposure\nFROM exposed e\nLEFT JOIN succeeded s ON s.variant = e.variant AND s.customer_id = e.customer_id\nGROUP BY e.variant\nORDER BY e.variant;"
    },
    {
      "id": "m9e3",
      "lvl": 3,
      "priority": "should",
      "title": "Merchant onboarding funnel",
      "prompt": "Across all merchants: how many were created, how many made a first charge attempt, and how many a first successful charge — with the conversion at each step. <em>Grain: one summary row. Denominators: created → attempted, attempted → succeeded.</em>",
      "hints": [
        "Base = all merchants. attempted = DISTINCT merchant_id present in charges. succeeded = DISTINCT merchant_id with a succeeded charge.",
        "Each step is a distinct-merchant subset; conversions use the previous step."
      ],
      "solution": "WITH created AS (\n  SELECT merchant_id FROM merchants\n),\nattempted AS (\n  SELECT DISTINCT merchant_id FROM charges\n),\nsucceeded AS (\n  SELECT DISTINCT merchant_id FROM charges WHERE status='succeeded'\n)\nSELECT (SELECT COUNT(*) FROM created)   AS created,\n       (SELECT COUNT(*) FROM attempted) AS attempted,\n       (SELECT COUNT(*) FROM succeeded) AS succeeded,\n       ROUND((SELECT COUNT(*) FROM attempted)::numeric / NULLIF((SELECT COUNT(*) FROM created),0), 4)   AS attempt_rate,\n       ROUND((SELECT COUNT(*) FROM succeeded)::numeric / NULLIF((SELECT COUNT(*) FROM attempted),0), 4) AS first_success_rate;"
    },
    {
      "id": "m9e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "Debug: collapse retries to one attempt per customer",
      "prompt": "Rewrite a funnel that counts charge events so each customer counts once per step, and report attempt_rate and success_from_attempt for 'checkout_v2'. <em>Validation: rates ∈ 0–1; attempted ≤ exposed.</em>",
      "hints": [
        "The fix is DISTINCT customer_id per step CTE — retries collapse to one.",
        "Never COUNT(*) over raw charges for a funnel step."
      ],
      "solution": "WITH exposed AS (\n  SELECT DISTINCT customer_id FROM experiment_exposures WHERE experiment='checkout_v2'\n),\nattempted AS (\n  SELECT DISTINCT c.customer_id FROM charges c JOIN exposed e USING (customer_id)\n),\nsucceeded AS (\n  SELECT DISTINCT c.customer_id FROM charges c JOIN exposed e USING (customer_id) WHERE c.status='succeeded'\n)\nSELECT (SELECT COUNT(*) FROM attempted)::numeric / NULLIF((SELECT COUNT(*) FROM exposed),0) AS attempt_rate,\n       (SELECT COUNT(*) FROM succeeded)::numeric / NULLIF((SELECT COUNT(*) FROM attempted),0) AS success_from_attempt;"
    },
    {
      "id": "m9e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: control vs treatment checkout funnel",
      "prompt": "Compare control vs treatment for 'checkout_v2': per variant report exposed, attempted, succeeded and the step conversions, counting only charges within 7 days of exposure (the conversion window). State your windows and what guardrail you'd watch. <em>Grain: one row per variant. Validation: exposed ≥ attempted ≥ succeeded per variant; rates ∈ 0–1.</em>",
      "hints": [
        "Carry exposed_at into the exposed CTE; require <code class='inline'>c.created_at BETWEEN e.exposed_at AND e.exposed_at + INTERVAL '7 days'</code>.",
        "Count DISTINCT customer_id per (variant, step); never count charge events.",
        "Guardrail: dispute/refund rate of the treatment, so a 'win' isn't bought with bad charges."
      ],
      "solution": "WITH exposed AS (\n  SELECT customer_id, variant, MIN(exposed_at) AS exposed_at\n  FROM experiment_exposures\n  WHERE experiment='checkout_v2'\n  GROUP BY customer_id, variant\n),\nattempted AS (\n  SELECT DISTINCT e.variant, c.customer_id\n  FROM charges c\n  JOIN exposed e ON e.customer_id = c.customer_id\n  WHERE c.created_at >= e.exposed_at\n    AND c.created_at <  e.exposed_at + INTERVAL '7 days'\n),\nsucceeded AS (\n  SELECT DISTINCT e.variant, c.customer_id\n  FROM charges c\n  JOIN exposed e ON e.customer_id = c.customer_id\n  WHERE c.status='succeeded'\n    AND c.created_at >= e.exposed_at\n    AND c.created_at <  e.exposed_at + INTERVAL '7 days'\n)\nSELECT e.variant,\n       COUNT(DISTINCT e.customer_id) AS exposed,\n       COUNT(DISTINCT a.customer_id) AS attempted,\n       COUNT(DISTINCT s.customer_id) AS succeeded,\n       ROUND(COUNT(DISTINCT a.customer_id)::numeric / NULLIF(COUNT(DISTINCT e.customer_id),0), 4) AS attempt_rate,\n       ROUND(COUNT(DISTINCT s.customer_id)::numeric / NULLIF(COUNT(DISTINCT a.customer_id),0), 4) AS success_from_attempt\nFROM exposed e\nLEFT JOIN attempted a ON a.variant=e.variant AND a.customer_id=e.customer_id\nLEFT JOIN succeeded s ON s.variant=e.variant AND s.customer_id=e.customer_id\nGROUP BY e.variant\nORDER BY e.variant;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "What is a funnel?",
      "options": [
        "A way to sort rows by date",
        "An ordered sequence of steps where the population shrinks, with a conversion rate between steps",
        "A type of join",
        "A method to remove NULLs"
      ],
      "answer": 1,
      "why": "A funnel tracks how a fixed population moves through ordered steps (e.g. exposed → attempted → succeeded), measuring conversion at each step.",
      "concept": "funnel definition"
    },
    {
      "level": 1,
      "q": "Step-to-step conversion uses which denominator?",
      "options": [
        "The total population always",
        "The count of the immediately previous step",
        "The number of events",
        "The final step"
      ],
      "answer": 1,
      "why": "'Of those who reached step A, how many reached step B?' uses step A's count as the denominator.",
      "concept": "denominator"
    },
    {
      "level": 2,
      "q": "Which correctly counts customers who attempted a payment?",
      "options": [
        "COUNT(*) FROM charges",
        "COUNT(DISTINCT customer_id) FROM charges",
        "SUM(amount) FROM charges",
        "COUNT(charge_id) FROM charges"
      ],
      "answer": 1,
      "why": "A funnel step counts distinct entities; <code class='inline'>COUNT(DISTINCT customer_id)</code> collapses each customer's retries to one.",
      "concept": "distinct entities"
    },
    {
      "level": 4,
      "q": "What's wrong with counting charge events instead of customers in a funnel?",
      "options": [
        "Nothing",
        "Retries by the same customer inflate the step count, so a rate can exceed 100% and the funnel is meaningless",
        "It runs slower only",
        "It excludes succeeded charges"
      ],
      "answer": 1,
      "why": "One customer with several failed retries becomes many 'attempts', so attempted can exceed exposed and conversion rates break. Count distinct customers per step.",
      "concept": "events vs entities"
    },
    {
      "level": 5,
      "q": "How would you explain conversion-rate denominators in a Stripe interview?",
      "options": [
        "All rates share one denominator",
        "I name the entity and the base for each rate: attempt_rate = attempted ÷ exposed, success-from-attempt = succeeded ÷ attempted; counts are distinct customers, within the conversion window",
        "Denominators don't matter if numerators are right",
        "I'd count charge events for speed"
      ],
      "answer": 1,
      "why": "The senior signal is precision: state the entity (distinct customers), the window, and exactly which denominator each rate uses — so 'conversion' is unambiguous.",
      "concept": "interview judgment"
    }
  ],
  "mistakes": [
    "Counting charge events instead of distinct customers — retries inflate every step.",
    "Denominator drift: reusing one denominator (e.g. exposed) for a rate that should be step-to-step.",
    "Ignoring step order, or letting a later step's count exceed an earlier one.",
    "Forgetting the conversion window — counting a success that happened weeks after exposure.",
    "Not deduplicating to the first event per entity when the metric is 'reached the step'."
  ],
  "edges": [
    "A customer exposed to both variants (contamination) should be excluded or attributed by first exposure — decide and state it.",
    "A success outside the conversion window is not a conversion; pick the window deliberately.",
    "Exposed ≥ attempted ≥ succeeded must always hold; if it doesn't, you're counting events, not entities."
  ],
  "interview": "<p>Frame the funnel as named, distinct-entity steps: <em>\"My base is customers exposed to checkout_v2 in the window. <code class='inline'>attempted</code> is distinct exposed customers with a charge within 7 days of exposure; <code class='inline'>succeeded</code> is those with a succeeded charge in that window. I report attempt_rate vs exposed and success-from-attempt vs attempted, counting distinct customers so retries don't inflate anything.\"</em> Stating the entity, the windows, and each denominator is the whole skill.</p>",
  "followup": {
    "prompt": "Interviewer: \"Treatment wins on conversion — ship it?\"",
    "answer": "Not on conversion alone. I'd check guardrails first: did the treatment's refund or dispute rate rise (conversions bought with bad charges)? Is the lift outside noise given the exposed counts? Funnel conversion is the headline, but the decision needs the guardrails too — which is the experimentation module (m15)."
  }
};

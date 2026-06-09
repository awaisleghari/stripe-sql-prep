import type { Module } from '@/types';

/* Non-SQL learning module: the data-reasoning meta-skill. No sqlPattern → no SQL runner.
   Pairs with the `logic` Practice Gym ladder. */
export const m17: Module = {
  "id": "m17",
  "day": "Day 7",
  "badge": "intermediate",
  "title": "Data Problem Solving from First Principles",
  "skill": "reasoning",
  "bcolor": "geekblue",
  "concept": "<p>The hardest part of a data interview is not syntax; it is turning a vague sentence into a precise, defensible computation. Strong candidates run the same loop before writing a line of code, out loud, so the interviewer sees the reasoning.</p>\n<p><strong>The loop.</strong> (1) Restate the question. (2) Name the <strong>input</strong> (which tables/objects) and the <strong>output</strong> (what the answer looks like). (3) Define <strong>one row</strong> of the output — the grain. (4) Decide which rows <em>count</em> and which do <em>not</em>. (5) Name the <strong>metric</strong> and, for any rate, its <strong>denominator</strong>. (6) Pick the <strong>source of truth</strong> object. (7) List the <strong>edge cases</strong> that could break it. (8) State how you would <strong>validate</strong> the result. (9) Say how you would <strong>explain</strong> it.</p>\n<p><strong>Why this beats diving into code.</strong> Most wrong answers are not buggy SQL; they are the right SQL for the wrong question — a count where a rate was meant, the wrong denominator, a window that double counts, or a correlation read as a cause. Deciding the grain, the denominator, and the source of truth up front removes the majority of those errors before they happen.</p>\n<p><strong>Ambiguity is the test, not an obstacle.</strong> A vague prompt (\"are failures up?\") is deliberate. The senior move is to state your assumptions, pick a reasonable definition, name the trade-off, and proceed — not to freeze or to silently guess.</p>\n<div class=\"callout warn\"><span class=\"t\">Decide the grain, denominator, and source of truth before you type</span>One row of the output, the rows that count, and the table that is authoritative. Get those three right and the query almost writes itself; get them wrong and no amount of clean SQL saves the answer.</div>",
  "reasoning": {
    "question": "Worked example — \"What is our dispute rate, and is it getting worse?\"",
    "grain": "One row per period (e.g. per week) for a trend; or a single number for a point estimate.",
    "included": "Succeeded charges (the population that can be disputed) in the window.",
    "excluded": "Failed/pending charges; disputes whose charge is outside the window.",
    "table": "<code class=\"inline\">charges</code> for the denominator; <code class=\"inline\">disputes</code> joined by charge for the numerator.",
    "metric": "dispute_rate = disputed succeeded charges ÷ succeeded charges (a rate, not a count).",
    "denom": "All succeeded charges in the period — never the number of disputes.",
    "wrong": "Reporting a raw count of disputes (rises with volume); bucketing by the dispute date instead of the charge date; ignoring that disputes arrive late.",
    "validate": "Rate ∈ 0–1; the newest period is provisional (disputes lag); the trend is on rate, not count."
  },
  "predicts": [
    {
      "prompt": "Interviewer: \"How many customers do we have in Canada?\" Before any query, what is the FIRST thing to pin down?",
      "query": "-- request: \"how many customers in Canada?\"",
      "options": [
        "Just COUNT(*) — it's obvious",
        "The grain/definition: distinct customers? by billing country or card country? active or ever-existing? as of when?",
        "Which index to use",
        "The chart colour"
      ],
      "answer": 1,
      "explain": "\"How many customers\" hides several decisions: distinctness, which country field, the activity definition, and the as-of date. Naming those is the senior move; the COUNT is trivial once they're fixed."
    },
    {
      "prompt": "A PM says \"approval rate dropped 5 points.\" You compute approvals ÷ attempts and it's flat. What most likely explains the PM's number?",
      "query": "-- yours: approvals / attempts  (flat)\n-- PM's: ??? down 5 points",
      "options": [
        "The PM is wrong; ignore it",
        "A different denominator or segment — e.g. they measured a specific card type, region, or a window that includes a mix shift",
        "SQL rounding",
        "The database is broken"
      ],
      "answer": 1,
      "explain": "Two correct-looking rates usually differ because of the denominator, the segment, or the window. Reconcile definitions before declaring anyone wrong — that reconciliation is the actual analysis."
    }
  ],
  "debugs": [
    {
      "title": "Counting instead of rating",
      "prompt": "A dashboard claims 'disputes doubled, we have a fraud problem.' The reasoning is below — find the flaw.",
      "broken": "-- Claim: fraud is up because disputes doubled.\n-- Evidence: COUNT(disputes) this month = 2x last month.",
      "hint": "Counts scale with volume. If charges also doubled, the RATE is unchanged.",
      "fixed": "-- Compare the RATE: disputes / succeeded charges, same window definition.\n-- Then segment by reason/region and check whether VOLUME or MIX moved,\n-- and remember disputes lag, so the newest month is provisional.",
      "why": "A raw count rising is consistent with steady risk under growth. Only a rising <em>rate</em> (with a fixed denominator and mature window) supports a fraud-up conclusion."
    },
    {
      "title": "Survivorship / selection bias in the plan",
      "prompt": "Plan: 'Measure average lifetime value using customers who are still active.' Diagnose the bias.",
      "broken": "-- LTV = AVG(spend) over customers WHERE status = 'active'",
      "hint": "Conditioning on 'still active' drops everyone who churned — the very customers that pull LTV down.",
      "fixed": "-- Define the cohort up front (e.g. all customers who signed up in Q1),\n-- then measure spend over a fixed horizon for the WHOLE cohort,\n-- including churned and zero-spend customers.",
      "why": "Filtering to survivors biases the estimate upward. The cohort must be fixed at entry and followed regardless of later status — the same discipline as a retention curve."
    }
  ],
  "exercises": [
    {
      "id": "m17e1",
      "lvl": 1,
      "priority": "required",
      "title": "Restate input and output",
      "prompt": "Request: \"Give me revenue by merchant last month.\" In two lines, state the input (objects) and the output (shape) you will produce. Name one ambiguity you must resolve.",
      "hints": [
        "Input = which tables/objects; output = one row per what, which columns.",
        "Ambiguity: 'revenue' = GPV, net, or MRR? 'last month' = calendar or rolling?"
      ],
      "solution": "Input: charges (and balance_transactions if 'revenue' means net). Output: one row per merchant with a single revenue number for the period.\nAmbiguity to resolve: which 'revenue' (gross GPV vs net ledger vs MRR), and whether 'last month' is the prior calendar month or a trailing 30 days. State the choice before computing."
    },
    {
      "id": "m17e2",
      "lvl": 2,
      "priority": "required",
      "title": "Name the grain",
      "prompt": "Request: \"How are refunds trending?\" Define the output grain precisely, and say which date you bucket on.",
      "hints": [
        "Trend ⇒ one row per period. Choose the period (day/week/month).",
        "Bucket on the event you're measuring — the refund's date or the original charge's date? Decide and justify."
      ],
      "solution": "Grain: one row per week (or month) over the window. Metric: refund rate = refunded succeeded charges ÷ succeeded charges, or refund amount ÷ GPV — state which.\nBucket on the CHARGE's date if you want 'refund rate of charges made that week' (cohort view), or the REFUND's date for 'refunds processed that week' (operational view). They answer different questions; name yours."
    },
    {
      "id": "m17e3",
      "lvl": 3,
      "priority": "should",
      "title": "Metric and denominator",
      "prompt": "Request: \"What's our checkout conversion?\" Write the metric as numerator ÷ denominator, and state exactly what each is and the window.",
      "hints": [
        "Conversion is distinct entities, not events.",
        "Denominator = everyone who entered the step; numerator = those who completed within a window."
      ],
      "solution": "conversion = distinct customers who completed checkout within N days of starting ÷ distinct customers who started checkout, over the cohort window.\nKey decisions: distinct customers (not sessions/events); a conversion window (e.g. 7 days) so late completers count consistently; the denominator is everyone who STARTED, not everyone who attempted payment."
    },
    {
      "id": "m17e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "Edge cases and validation",
      "prompt": "You computed merchant-level success rate. List four edge cases that could make a 'correct' query wrong, and one validation check for each.",
      "hints": [
        "Think NULLs, late data, mix shifts, division by zero, immature windows, duplicates.",
        "Each edge gets a concrete check."
      ],
      "solution": "1) Integer division → rate of 0/1: cast to numeric; validate rate ∈ (0,1). 2) Zero-attempt merchants → divide by zero: NULLIF; validate no errors and sensible NULL/0. 3) Duplicate charges from retries inflate attempts: dedup by idempotency_key; validate distinct attempts. 4) Newest period immature (pending not resolved): flag the latest bucket provisional; validate by excluding it and re-checking the trend."
    },
    {
      "id": "m17e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: decompose an ambiguous investigation",
      "prompt": "Interviewer: \"Our payment failures look high this week. Can you look into it?\" Produce a full decomposition: restate, define the metric and denominator, the source of truth, the segments you'd cut, the confounders to rule out, and how you'd validate — before writing any query.",
      "hints": [
        "Rate not count; segment by cause (failure_code), method, country, merchant.",
        "Confounders: volume growth, traffic-mix shift, a single large merchant, a provider outage, retries.",
        "Validate like-for-like windows and mature data."
      ],
      "solution": "Restate: is the failure RATE (failed ÷ attempts) elevated vs a comparable prior week, beyond noise? Source of truth: charges (status, failure_code, created_at). Metric: failed ÷ attempts, deduped by idempotency_key. Segments: by failure_code, payment_method, card_country, merchant, and new-vs-returning. Confounders to rule out: overall volume up (count ≠ rate), a mix shift toward a riskier segment, one large merchant skewing the total, a processor/BIN outage, and retry storms double-counting. Validation: compare like-for-like windows (same days-of-week, mature data), confirm the rate move exceeds normal week-to-week variation, and check whether the movement is concentrated in one segment (a cause) or spread evenly (likely a mix/volume artifact). Deliver: 'the rate moved X in segment Y, driven by Z; here's the evidence and what I'd watch.'"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "Before writing any query, the single most important thing to define is:",
      "options": [
        "The database index",
        "What one row of the output means (the grain), plus the metric and its denominator",
        "The chart type",
        "The programming language"
      ],
      "answer": 1,
      "why": "Grain, metric, and denominator determine correctness; syntax is downstream of them.",
      "concept": "grain"
    },
    {
      "level": 1,
      "q": "\"Disputes doubled\" most strongly supports a fraud problem when:",
      "options": [
        "The raw count doubled",
        "The dispute RATE rose on a fixed denominator over a mature, like-for-like window",
        "Revenue also doubled",
        "It happened on a weekend"
      ],
      "answer": 1,
      "why": "Counts scale with volume; only a rising rate on a fixed denominator is evidence of higher risk.",
      "concept": "rate vs count"
    },
    {
      "level": 2,
      "q": "A conversion rate's denominator should be:",
      "options": [
        "Everyone who completed",
        "Distinct entities who ENTERED the step, within a defined window",
        "Total events",
        "Succeeded charges only"
      ],
      "answer": 1,
      "why": "Conversion divides completers by everyone who entered (distinct entities), over a conversion window.",
      "concept": "denominator"
    },
    {
      "level": 4,
      "q": "Measuring average LTV over only currently-active customers is biased because:",
      "options": [
        "Active customers are cheaper to query",
        "It conditions on survival, dropping churned/low-value customers and inflating the estimate",
        "LTV can't be averaged",
        "It double counts"
      ],
      "answer": 1,
      "why": "Survivorship bias: the cohort must be fixed at entry and followed regardless of later status.",
      "concept": "selection bias"
    },
    {
      "level": 5,
      "q": "Faced with a deliberately vague prompt, the strongest move is to:",
      "options": [
        "Refuse until it's fully specified",
        "State assumptions, pick a reasonable definition, name the trade-off, and proceed — making the reasoning visible",
        "Guess silently and start coding",
        "Ask the interviewer to write the SQL"
      ],
      "answer": 1,
      "why": "Ambiguity is the test. Senior analysts resolve it explicitly and proceed, rather than freezing or guessing silently.",
      "concept": "interview judgment"
    }
  ],
  "mistakes": [
    "Diving into SQL before deciding the grain, metric, and denominator.",
    "Reporting a count where a rate was meant (counts rise with volume).",
    "Reading correlation as causation without ruling out confounders.",
    "Conditioning on survivors/actors and biasing the estimate.",
    "Treating the newest period as final when the data is still arriving (disputes/refunds lag)."
  ],
  "edges": [
    "Immature recent windows: pending charges and late disputes make the latest bucket provisional.",
    "Mix shifts: a stable overall rate can hide opposite moves in two segments (Simpson's paradox).",
    "One large entity (merchant/customer) can dominate a 'total' and masquerade as a trend."
  ],
  "interview": "<p>Narrate the loop out loud: <em>\"Let me restate it, define one row of the output, name the metric and its denominator, pick the source-of-truth table, list the edge cases, and say how I'd validate — then I'll write it.\"</em> Interviewers are scoring the decomposition as much as the final query; making it audible is the differentiator.</p>",
  "followup": {
    "prompt": "Interviewer: \"You have ten minutes and a vague question. What do you do first?\"",
    "answer": "Spend the first minute restating the question and stating my assumptions and the grain/metric/denominator out loud, then confirm the definition with the interviewer before coding. That minute prevents the most common failure — a clean query answering the wrong question — and shows senior judgment under time pressure."
  }
};

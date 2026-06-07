import type { Problem } from '@/types';

/* MIGRATED DATA — edit a problem here, then it is auto-included via src/data/gym/index.ts.
   Source of truth migrated from the original single-file app (Repo-2). */
export const logicProblems: Problem[] = [
  {
    "id": "pl1",
    "title": "Name the input and output",
    "ladder": "logic",
    "pos": 1,
    "stage": "Identify input/output",
    "lvl": 0,
    "difficulty": "recognition",
    "priority": "required",
    "source": "data-science-interviews-style",
    "module": null,
    "mode": "DataLogic",
    "timed": false,
    "est": "3 min",
    "business": "A PM messages you: \"Are payments failing more this week?\" Before any SQL, you must say — out loud — what goes IN and what comes OUT.",
    "task": "This is a reasoning drill — <b>no code</b>. In plain English, state the <b>input</b> (what data you would pull) and the <b>output</b> (the exact shape of the answer) for \"are payments failing more this week?\".",
    "prereq": "none — this is the first rung",
    "harder": "It is the very first rung: name input and output before anything else.",
    "teaches": "Every data task is a function: input → output. Naming both first prevents you from writing a query that answers the wrong question.",
    "deliverable": "A two-sentence answer: \"Input is … Output is …\", plus the one clarifying question you would ask the PM.",
    "before": [
      "What raw records would you need to even answer this?",
      "What is the shape of the answer — a single number, a trend, a per-merchant table?",
      "Over what time window does 'this week' mean, and compared to what?",
      "What one clarifying question would you ask first?"
    ],
    "howto": [
      "Say the input in one sentence (which records).",
      "Say the output in one sentence (its shape and grain).",
      "State the comparison baseline ('this week vs last week').",
      "Name one clarifying question."
    ],
    "context": "You have access to the <span class=\"mono\">charges</span> records (each has status, created_at, merchant_id). \"Failing more\" implies a comparison over time.",
    "prompt": "Define the input and the output for this request. What is the comparison? What single clarifying question do you ask before writing anything?",
    "confusion": "\"Failing more\" is meaningless without a denominator and a baseline. More failures can simply mean more volume — you want the failure <i>rate</i>, this period vs a baseline.",
    "hints": [
      "Input = the raw records you read; output = the shape you return.",
      "A rate needs a denominator: failures ÷ attempts.",
      "'More' needs a baseline: this week vs the prior week (or same week last month)."
    ],
    "model": "<b>Input:</b> charge records for the relevant merchants over the last two weeks (status, created_at, merchant_id). <b>Output:</b> the <b>failure rate</b> = failed ÷ total attempts, for this week vs last week (optionally per merchant). <b>Comparison:</b> week-over-week. <b>Clarifying question:</b> \"Which merchants, and do you mean the failure <i>rate</i> or the raw <i>count</i> of failures?\" — because rising counts can just reflect rising volume.",
    "rubric": [
      "States input (raw records) and output (shape/grain) explicitly",
      "Frames it as a rate, not a raw count",
      "Names a baseline/comparison window",
      "Asks at least one clarifying question"
    ],
    "explain": "Say: \"Before I query anything, the input is charge records and the output is a failure rate compared to a baseline. Let me confirm the merchants and the window.\"",
    "next": "pl2"
  },
  {
    "id": "pl2",
    "title": "Define the output grain",
    "ladder": "logic",
    "pos": 2,
    "stage": "Define output grain",
    "lvl": 1,
    "difficulty": "easy",
    "priority": "required",
    "source": "data-science-interviews-style",
    "module": null,
    "mode": "DataLogic",
    "timed": false,
    "est": "4 min",
    "business": "You are asked to build a \"merchant health dashboard.\" The first decision is the grain.",
    "task": "State the <b>grain</b> of a merchant health dashboard — what does exactly one row represent? — and list the columns one row would carry.",
    "prereq": "pl1 (input/output)",
    "harder": "You now commit to a precise output shape: what one row IS. Grain mistakes corrupt every metric downstream.",
    "teaches": "The grain is the contract for the whole task. 'One row per merchant per day' and 'one row per merchant' produce very different SQL and very different numbers.",
    "deliverable": "A one-line grain statement (\"one row per …\") and the list of metric columns that row carries.",
    "before": [
      "What is the entity the dashboard is about?",
      "Is it a snapshot (one row per merchant) or a time series (one row per merchant per day)?",
      "Which metrics belong on each row?",
      "Would mixing two grains in one table double-count anything?"
    ],
    "howto": [
      "Pick the entity (merchant).",
      "Decide snapshot vs time series.",
      "Write 'one row per …' explicitly.",
      "List the columns that row carries."
    ],
    "context": "A health dashboard typically shows approval rate, refund rate, dispute rate, GPV and net revenue per merchant, often over time.",
    "prompt": "Define the grain in one sentence, then list the columns. If the PM wants trends too, how does the grain change?",
    "confusion": "Putting per-day metrics and per-merchant lifetime totals in the same table mixes two grains and silently double-counts. Pick one grain per table.",
    "hints": [
      "'Grain' = what one row uniquely represents.",
      "Snapshot = one row per merchant; trend = one row per merchant per day/week.",
      "Every column on the row must be a fact AT that grain."
    ],
    "model": "<b>Snapshot grain:</b> one row per merchant, columns = approval_rate, refund_rate, dispute_rate, gpv_usd, net_usd, attempts (the denominators). <b>Trend grain:</b> one row per (merchant, day) with the same metrics computed within that day. Keep them in separate tables/queries; never mix grains in one result.",
    "rubric": [
      "Writes an explicit 'one row per …' statement",
      "Distinguishes snapshot vs time-series grain",
      "Lists denominators alongside rates",
      "Notes the double-counting risk of mixing grains"
    ],
    "explain": "Say: \"One row per merchant for the snapshot; if you want trend, the grain becomes one row per merchant per day. I will not mix the two in one table.\"",
    "next": "pl3"
  },
  {
    "id": "pl3",
    "title": "Pin down the metric and denominator",
    "ladder": "logic",
    "pos": 3,
    "stage": "Choose metric and denominator",
    "lvl": 2,
    "difficulty": "medium",
    "priority": "required",
    "source": "data-science-interviews-style",
    "module": null,
    "mode": "DataLogic",
    "timed": false,
    "est": "5 min",
    "business": "Leadership says \"approval rate dropped 3% this week.\" Before writing SQL you must pin down the exact metric and denominator.",
    "task": "Define <b>approval rate</b> precisely: numerator, denominator, and which rows are excluded. Then state what \"dropped 3%\" could mean (3 points vs 3 percent relative).",
    "prereq": "pl2 (grain)",
    "harder": "You now must choose a denominator and disambiguate the metric — the step where most wrong answers are born.",
    "teaches": "A rate is only as good as its denominator. 'Approval rate' can exclude pending/in-flight charges, and '3%' is ambiguous (absolute points vs relative change).",
    "deliverable": "A precise definition: numerator, denominator, exclusions; plus the absolute-vs-relative clarification.",
    "before": [
      "What counts as an 'approval' (status = succeeded)?",
      "What is the denominator — all attempts, or settled attempts only?",
      "Do pending/in-flight charges belong in the denominator?",
      "Is 'dropped 3%' three percentage points, or 3% relative?"
    ],
    "howto": [
      "Define numerator: succeeded charges.",
      "Define denominator: eligible attempts (decide on pending).",
      "List exclusions (test charges, pending, $0 auths).",
      "Disambiguate the 3% (points vs relative)."
    ],
    "context": "charges.status is one of succeeded / failed / pending. Pending charges have not resolved yet.",
    "prompt": "Write the exact metric definition. Then explain the two readings of \"dropped 3%\" and which you would confirm.",
    "confusion": "Including unresolved <span class=\"mono\">pending</span> charges in the denominator drags the rate down artificially — they are not failures, just not done yet.",
    "hints": [
      "Numerator = succeeded; denominator = eligible attempts.",
      "Decide pending: usually exclude from the denominator (or report both).",
      "94% → 91% is 3 points; a '3% drop' could instead mean 0.94 × 0.97."
    ],
    "model": "<b>Approval rate</b> = COUNT(succeeded) ÷ COUNT(settled attempts), excluding still-<span class=\"mono\">pending</span> charges and $0 auth-only charges. \"Dropped 3%\" most likely means 3 percentage points (e.g., 94% → 91%); confirm it is not a 3% relative drop. Report the denominator alongside the rate so the reader can judge sample size.",
    "rubric": [
      "Numerator and denominator stated explicitly",
      "Handles pending/in-flight charges deliberately",
      "Disambiguates absolute points vs relative percent",
      "Mentions reporting the denominator for context"
    ],
    "explain": "Say: \"Approval rate is succeeded over settled attempts, excluding pending. And I will confirm whether the 3% is three points or a relative change before I trust it.\"",
    "next": "pl4"
  },
  {
    "id": "pl4",
    "title": "Pick the source-of-truth table",
    "ladder": "logic",
    "pos": 4,
    "stage": "Choose relevant tables/records",
    "lvl": 2,
    "difficulty": "medium",
    "priority": "required",
    "source": "Sigma-style",
    "module": null,
    "mode": "DataLogic",
    "timed": false,
    "est": "5 min",
    "business": "Finance asks for \"net revenue per merchant.\" You must choose the source of truth before writing SQL.",
    "task": "Decide which table is the source of truth for <b>net revenue</b> and justify it against the alternatives (charges, refunds, the ledger).",
    "prereq": "pl3 (metric & denominator)",
    "harder": "You now map a metric to the correct records — and reject the tempting-but-wrong sources.",
    "teaches": "Net revenue is not gross volume. The <span class=\"mono\">balance_transactions</span> ledger already nets out fees, refunds and disputes — reconstructing it from charges is error-prone.",
    "deliverable": "A one-paragraph answer naming the source-of-truth table and why charges alone is wrong.",
    "before": [
      "What does 'net' include that 'gross' does not? (fees, refunds, disputes)",
      "Which table records every money movement with its sign?",
      "Could you reconstruct net from charges − refunds − fees? What goes wrong?",
      "What is the join key back to the merchant?"
    ],
    "howto": [
      "Define net vs gross.",
      "Identify the ledger as the signed record of money movement.",
      "Explain why charges-only reconstruction misses fees/disputes/adjustments.",
      "Name the merchant join key."
    ],
    "context": "balance_transactions is the ledger: charges add (+), refunds/disputes/fees subtract (−); net_amount already accounts for everything.",
    "prompt": "Which table is the source of truth for net revenue, and why is summing charges.amount wrong?",
    "confusion": "SUM(charges.amount) is <b>gross volume</b>, not revenue. It ignores fees, refunds, disputes and adjustments — all of which live (signed) in the ledger.",
    "hints": [
      "Net = what the merchant actually keeps.",
      "The ledger has a signed net_amount per money movement.",
      "Charges-only reconstruction misses fees and any non-charge adjustments."
    ],
    "model": "Use <span class=\"mono\">balance_transactions</span> (the ledger): SUM(net_amount) per merchant is true net revenue because the ledger already subtracts processing fees, refunds and dispute losses, and includes adjustments that never appear in <span class=\"mono\">charges</span>. Summing <span class=\"mono\">charges.amount</span> gives gross volume and silently overstates revenue.",
    "rubric": [
      "Names balance_transactions as source of truth",
      "Explains net = gross − fees − refunds − disputes",
      "Identifies why charges-only reconstruction fails",
      "States the merchant join key"
    ],
    "explain": "Say: \"Net revenue lives in the ledger — SUM(net_amount). Charges give gross volume; using them as revenue would overstate the number by the fees and refunds.\"",
    "next": "pl5"
  },
  {
    "id": "pl5",
    "title": "SQL, Python, or mixed?",
    "ladder": "logic",
    "pos": 5,
    "stage": "SQL vs Python vs mixed",
    "lvl": 3,
    "difficulty": "hard",
    "priority": "should",
    "source": "data-science-interviews-style",
    "module": null,
    "mode": "Mixed",
    "timed": false,
    "est": "6 min",
    "business": "You must dedupe ~5M raw charge events by idempotency_key and then report per-merchant success rate.",
    "task": "Decide the approach — pure SQL, pure Python, or mixed — and justify it on correctness, scale and what tool each step suits.",
    "prereq": "pl4 (choosing records)",
    "harder": "You now choose an implementation strategy under a scale constraint, weighing tools instead of defaulting to one.",
    "teaches": "Tool choice is a real interview signal. Set-based dedup + aggregation is what SQL is best at; Python earns its place for streaming/parsing or when the data is not in a queryable store.",
    "deliverable": "A short recommendation with the reasoning (correctness + scale), and where Python would still help.",
    "before": [
      "Where do the 5M events live — a warehouse table, or flat log files?",
      "Which step is set-based (dedup, aggregate) vs streaming (parse logs)?",
      "What does 'dedupe by idempotency_key' mean — keep which row?",
      "At 5M rows, what are the memory implications of loading it all into Python?"
    ],
    "howto": [
      "State where the data lives (drives the choice).",
      "Map each step to the tool it suits.",
      "Decide: if in a warehouse, SQL window dedup + GROUP BY; if raw logs, stream in Python.",
      "Name the dedup rule (keep latest per key)."
    ],
    "context": "Dedup = keep one row per idempotency_key (the latest). Then success rate = succeeded ÷ attempts per merchant.",
    "prompt": "SQL, Python, or mixed? Justify against correctness and 5M-row scale, and say which step belongs to which tool.",
    "confusion": "\"Always Python\" or \"always SQL\" is the weak answer. If the data is already in a warehouse, SQL does dedup (ROW_NUMBER) and aggregation far more efficiently than loading 5M rows into Python.",
    "hints": [
      "If it is in a queryable store → SQL is best for set operations at scale.",
      "ROW_NUMBER() OVER (PARTITION BY idempotency_key ORDER BY created_at DESC) = 1 dedups.",
      "Python shines for streaming/parsing raw log files without loading everything."
    ],
    "model": "<b>If the events are in a warehouse:</b> pure SQL — dedup with <span class=\"mono\">ROW_NUMBER() OVER (PARTITION BY idempotency_key ORDER BY created_at DESC)=1</span>, then GROUP BY merchant for the rate. SQL is set-based and scales to 5M rows without loading them into memory. <b>If the events are raw log files:</b> stream them in Python (one pass, a dict keyed by idempotency_key keeping the latest), then aggregate — never load all 5M into a list at once. <b>Mixed</b> is right when you parse/clean in Python and push the cleaned rows to SQL for the heavy aggregation.",
    "rubric": [
      "Picks based on WHERE the data lives, not preference",
      "Maps dedup + aggregation to SQL's strengths",
      "Identifies streaming/parsing as Python's strength",
      "Names a concrete dedup rule (keep latest per key)"
    ],
    "explain": "Say: \"If it is in the warehouse I would do it in SQL — ROW_NUMBER dedup then GROUP BY — because that is set-based and scales. I would reach for Python only to stream raw logs.\"",
    "next": "pl6"
  },
  {
    "id": "pl6",
    "title": "Debug the flawed conclusion",
    "ladder": "logic",
    "pos": 6,
    "stage": "Debug flawed reasoning",
    "lvl": 3,
    "difficulty": "hard",
    "priority": "should",
    "source": "data-science-interviews-style",
    "module": null,
    "mode": "DataLogic",
    "timed": false,
    "est": "6 min",
    "business": "An analyst reports: \"Merchant 102's refunds dropped, so it is suddenly profitable.\" The dashboard does show higher net revenue this month.",
    "task": "Find the <b>flaw in the reasoning</b>. List the alternative explanations the analyst skipped and what you would check.",
    "prereq": "pl5 (approach choice)",
    "harder": "You switch from building to auditing a conclusion — spotting where the logic does not follow from the data.",
    "teaches": "Correlation/coincidence vs cause. A metric moving is not evidence for the analyst's preferred story; you must rule out denominator shifts, timing and mix.",
    "deliverable": "A critique naming at least three alternative explanations and the checks that would distinguish them.",
    "before": [
      "Did refunds drop, or did the refund RATE drop? (volume could have fallen too)",
      "Disputes arrive late — could this month look good only because disputes have not landed yet?",
      "Did the merchant change its product mix or pause risky sales?",
      "Is net revenue up because of one large charge, not lower refunds?"
    ],
    "howto": [
      "Separate raw refund count from refund rate.",
      "Check whether the denominator (volume) changed.",
      "Consider late-arriving disputes inflating recent net.",
      "List one validation per alternative explanation."
    ],
    "context": "Refund rate = refunded ÷ succeeded. Disputes can arrive 30–60 days after the charge.",
    "prompt": "What is wrong with \"refunds dropped, so it is profitable\"? Give the alternative explanations and how you would test each.",
    "confusion": "A falling refund <i>count</i> can simply mean falling <i>volume</i>. And this month's net always looks rosy because disputes for recent charges have not arrived yet — recent periods are systematically under-counted.",
    "hints": [
      "Count vs rate: fewer refunds with much less volume is not improvement.",
      "Late-arriving disputes make the most recent month look artificially good.",
      "One large succeeded charge can lift net without anything structural changing."
    ],
    "model": "The conclusion does not follow. Alternatives: (1) <b>Volume fell</b> — fewer refunds because fewer sales; check refund <i>rate</i>, not count. (2) <b>Late-arriving disputes</b> — recent net is overstated because disputes land 30–60 days later; compare cohorts at equal maturity. (3) <b>Mix shift</b> — the merchant paused a refund-heavy product; net up for a structural reason, not \"profitability.\" (4) <b>One big charge</b> — check the distribution, not just the total. Validate each with a rate, a maturity-matched comparison, and a look at the charge-size distribution.",
    "rubric": [
      "Distinguishes refund count from refund rate",
      "Raises late-arriving disputes / period immaturity",
      "Considers mix shift and outlier charges",
      "Pairs each alternative with a concrete check"
    ],
    "explain": "Say: \"I would not accept that. Refund count can fall just because volume fell, and recent net always looks high before disputes land. I would compare the refund rate at equal cohort maturity.\"",
    "next": "pl7"
  },
  {
    "id": "pl7",
    "title": "Validate a dispute-rate result",
    "ladder": "logic",
    "pos": 7,
    "stage": "Validate result and edge cases",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "data-science-interviews-style",
    "module": null,
    "mode": "DataLogic",
    "timed": false,
    "est": "6 min",
    "business": "You have computed dispute rate per merchant. Before you ship it, you must pressure-test it.",
    "task": "List the <b>validations</b> and <b>edge cases</b> you would run on a per-merchant dispute-rate result before trusting it.",
    "prereq": "pl6 (auditing reasoning)",
    "harder": "Now real-world messiness enters: you must enumerate what could make a plausible-looking number wrong.",
    "teaches": "Senior engineers validate before they present. Range checks, denominator checks, fan-out checks, small-sample and late-data checks are the standard battery.",
    "deliverable": "A checklist of validations and edge cases, each with the failure it catches.",
    "before": [
      "What range must every rate fall in? (0–1)",
      "Is the denominator succeeded charges only?",
      "Could a charge with two disputes have inflated the numerator (fan-out)?",
      "Are tiny-sample merchants producing noisy 0% or 100% rates?",
      "Have late-arriving disputes under-counted recent cohorts?"
    ],
    "howto": [
      "Range-check: every rate in [0,1].",
      "Denominator-check: succeeded charges only.",
      "Fan-out check: COUNT(DISTINCT charge_id) on both sides.",
      "Small-sample: flag merchants below a volume floor.",
      "Maturity: do not compare immature recent cohorts to old ones."
    ],
    "context": "Dispute rate = distinct disputed succeeded charges ÷ distinct succeeded charges. Disputes arrive late.",
    "prompt": "Give the validation + edge-case checklist for a per-merchant dispute rate. What does each check catch?",
    "confusion": "A rate above 1.0 is a red flag for fan-out (a charge with multiple disputes counted more than once). Use COUNT(DISTINCT charge_id) on both numerator and denominator.",
    "hints": [
      "Any rate outside [0,1] means a bug (usually fan-out or wrong denominator).",
      "Small samples produce extreme 0%/100% rates — apply a volume floor.",
      "Recent cohorts under-count disputes that have not arrived yet."
    ],
    "model": "<b>Validations:</b> every rate in [0,1]; denominator = distinct succeeded charges; sum of disputed ≤ succeeded; spot-check a known merchant (PixelForge ≈ 1.8%). <b>Edge cases:</b> (1) <b>fan-out</b> — a charge disputed twice; fix with COUNT(DISTINCT charge_id). (2) <b>small sample</b> — 1 dispute on 3 charges = 33%, noise; apply a ≥N volume floor. (3) <b>late-arriving disputes</b> — recent cohorts look artificially clean; compare at equal maturity. (4) <b>wrong denominator</b> — including failed charges understates the rate. (5) <b>NULLs / no disputes</b> — LEFT JOIN + COALESCE so zero-dispute merchants show 0, not vanish.",
    "rubric": [
      "Range check [0,1] and what it catches",
      "Denominator = succeeded, distinct on both sides",
      "Small-sample flag (volume floor)",
      "Late-arriving / cohort-maturity awareness",
      "Zero-dispute merchants preserved (LEFT JOIN/COALESCE)"
    ],
    "explain": "Say: \"Before trusting it I range-check to [0,1], confirm the denominator is distinct succeeded charges, flag small-sample merchants, and remember recent cohorts under-count late disputes.\"",
    "next": "pl8"
  },
  {
    "id": "pl8",
    "title": "Final boss: investigate rising failures",
    "ladder": "logic",
    "pos": 8,
    "stage": "Final boss · ambiguous investigation",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "data-science-interviews-style",
    "module": null,
    "mode": "DataLogic",
    "timed": true,
    "est": "15 min",
    "business": "Final boss. A PM pings you, no warning: \"Merchants are complaining that payments are failing more this week. Can you look into it?\" That is the entire prompt.",
    "task": "Run the full investigation <b>out loud</b>: clarify, define the metric and grain, decide the approach, segment, name confounders, and say how you would validate — as if live and timed.",
    "prereq": "pl1–pl7",
    "harder": "It is the capstone: ambiguous, timed, multiple valid readings. You must impose structure, not just answer.",
    "teaches": "The whole reasoning loop under pressure: clarify → define → decompose → segment → confounders → validate → recommend. This is the interview.",
    "deliverable": "A structured investigation plan: clarifying questions, metric definition, segmentation, likely confounders, validation, and a recommended next action.",
    "before": [
      "Which merchants, and what window is 'this week' vs the baseline?",
      "Is the complaint about the failure RATE or raw failures?",
      "Where would you segment first (merchant, method, card_country, failure_code)?",
      "What could fake a rise — volume growth, a new merchant onboarding, a single BIN failing?",
      "How will you confirm it is real before escalating?"
    ],
    "howto": [
      "Clarify scope: merchants, window, baseline, rate vs count.",
      "Define the metric: failure rate = failed ÷ attempts, this week vs last.",
      "Decompose by segment: merchant, payment_method, card_country, failure_code.",
      "Form hypotheses: mix shift, one merchant, one BIN/issuer, a deploy.",
      "Validate: maturity-matched, volume floors, range checks.",
      "Recommend the next action and who to loop in."
    ],
    "context": "charges has status, failure_code, payment_method, card_country, merchant_id, created_at. failure_code groups declines (insufficient_funds, do_not_honor, etc.).",
    "prompt": "Investigate \"payments are failing more this week.\" Talk through clarification, metric, grain, segmentation, confounders, validation and your recommended next step. State every assumption.",
    "confusion": "Jumping straight to SQL is the trap. State assumptions and a plan first — interviewers score the structured reasoning more than the query itself.",
    "hints": [
      "Open with clarifying questions and your assumptions — do not write SQL first.",
      "Define failure rate vs baseline before segmenting.",
      "Segment to localize: is it one merchant, one method, one country, one failure_code?",
      "Rule out volume growth and a single onboarding merchant skewing the aggregate."
    ],
    "model": "<b>1. Clarify / assume:</b> \"I will assume you mean the failure <i>rate</i> across your merchants, this week vs last week. Which merchants exactly?\" <b>2. Define:</b> failure_rate = failed ÷ (succeeded + failed), excluding pending; week-over-week. <b>3. Grain:</b> start at one row per merchant per week; drill to per (merchant, day). <b>4. Segment:</b> by merchant, payment_method, card_country, failure_code to localize the move. <b>5. Hypotheses / confounders:</b> volume growth (use rate), a new high-failure merchant dragging the aggregate (Simpson's paradox — check per-merchant), one issuer/BIN declining, a checkout deploy, more retries inflating attempts. <b>6. Validate:</b> range-check rates, apply a volume floor, compare maturity-matched windows. <b>7. Recommend:</b> if localized to one failure_code/issuer, flag risk/issuer team; if a deploy lines up, loop in eng; share the segmented breakdown, not just the global number.",
    "rubric": [
      "Asks clarifying questions and states assumptions BEFORE querying",
      "Defines failure rate + grain + baseline precisely",
      "Segments to localize (merchant/method/country/failure_code)",
      "Raises Simpson's paradox / mix shift explicitly",
      "Names validations (range, volume floor, maturity)",
      "Ends with a concrete, routed next action"
    ],
    "explain": "Open with: \"Let me make sure I am answering the right question and state my assumptions, then I will define the metric and decompose it before writing any SQL.\"",
    "next": null
  }
];

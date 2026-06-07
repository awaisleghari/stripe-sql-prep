import type { Problem } from '@/types';

/* MIGRATED DATA — edit a problem here, then it is auto-included via src/data/gym/index.ts.
   Source of truth migrated from the original single-file app (Repo-2). */
export const productProblems: Problem[] = [
  {
    "id": "pa1",
    "title": "Clarify a checkout funnel drop-off",
    "ladder": "pa",
    "pos": 1,
    "stage": "Clarify the question",
    "lvl": 1,
    "difficulty": "recognition",
    "priority": "required",
    "source": "DataLemur-style",
    "module": null,
    "mode": "Product",
    "timed": false,
    "est": "4 min",
    "business": "A PM says: \"Checkout conversion is down — can you dig in?\" Before any metric, you must lay out the funnel and clarify which step moved.",
    "task": "This is a product-investigation drill — <b>no SQL yet</b>. Lay out the checkout funnel steps, and list the clarifying questions you would ask before computing anything.",
    "prereq": "none — first rung of Product Analytics",
    "harder": "First rung: a vague product complaint that you must turn into a measurable funnel before touching data.",
    "teaches": "Conversion is never one number — it is a funnel of step-to-step rates. Diagnosis starts by finding WHICH step dropped, which means defining the steps first.",
    "deliverable": "The funnel steps (in order), the step-to-step conversion you would measure, and 3 clarifying questions.",
    "before": [
      "What are the ordered steps from intent to a successful payment?",
      "Is 'conversion' overall (intent→success) or a specific step?",
      "What window and which merchants/segments?",
      "Did volume change, or only the rate?"
    ],
    "howto": [
      "Write the funnel steps in order.",
      "Define conversion as a step-to-step rate, not one number.",
      "Ask which step the PM means and over what window.",
      "Decide the baseline to compare against."
    ],
    "context": "A typical Stripe checkout funnel: PaymentIntent created → payment details submitted → authorized by the bank → charge succeeded. Each arrow is a conversion rate.",
    "prompt": "Lay out the checkout funnel and the step-to-step rates you would measure. What do you ask the PM before computing anything?",
    "confusion": "\"Conversion is down\" hides WHERE. A drop at submit→authorize (bank declines) is a totally different problem from intent→submit (a broken checkout UI).",
    "hints": [
      "Break the funnel into ordered steps; each gap is a rate.",
      "A drop localizes the problem — UI vs bank declines vs post-auth failures.",
      "Confirm the window and the comparison baseline before querying."
    ],
    "model": "<b>Funnel:</b> PaymentIntent created → details submitted → bank authorized → charge succeeded. <b>Measure</b> each step-to-step rate plus end-to-end (created→succeeded). <b>Clarify:</b> (1) Which step does \"conversion\" mean, or end-to-end? (2) Which merchants/segments and what window — and compared to what baseline (last week, same week last month)? (3) Did total volume change, or only the rate? Localizing the dropping step tells you whether to look at checkout UI, bank declines (failure_code), or post-auth failures.",
    "rubric": [
      "Defines the funnel as ordered steps with step-to-step rates",
      "Asks which step / end-to-end before computing",
      "Names a baseline and window",
      "Distinguishes a rate drop from a volume change"
    ],
    "explain": "Say: \"Conversion is a funnel, not a number. Before I query, I want to know which step dropped, for whom, over what window, versus what baseline — that decides where I even look.\"",
    "next": "pa2"
  },
  {
    "id": "pa2",
    "title": "Define merchant activation + metric tree",
    "ladder": "pa",
    "pos": 2,
    "stage": "Define the metric & tree",
    "lvl": 2,
    "difficulty": "easy",
    "priority": "required",
    "source": "StrataScratch-style",
    "module": null,
    "mode": "Product",
    "timed": false,
    "est": "5 min",
    "business": "Leadership: \"New-merchant activation is slowing.\" You must define activation precisely and break it into a metric tree.",
    "task": "Define an <b>activation</b> metric for new merchants (numerator, denominator, window), then decompose it into a simple metric tree of the drivers.",
    "prereq": "pa1 (clarify the question)",
    "harder": "You now commit to a precise metric AND decompose it, so you can later attribute a change to a specific driver.",
    "teaches": "A metric tree turns one KPI into a product of stage rates, so when the top number moves you can attribute it to the stage that moved.",
    "deliverable": "A one-line activation definition and a metric tree (top metric = product of stage rates).",
    "before": [
      "What event marks a merchant as 'activated'? (e.g., first live successful charge)",
      "Within what window of signup?",
      "What is the denominator — all signups in a cohort?",
      "What stages sit between signup and activation?"
    ],
    "howto": [
      "Define activation: a concrete event within N days of signup.",
      "Set the denominator: the signup cohort.",
      "List stages: signup → onboarding done → first charge attempted → first charge succeeded.",
      "Express activation as the product of the stage rates."
    ],
    "context": "merchants has a signup timestamp; charges has the first live charge. 'Activated' commonly = first successful live charge within 14 or 30 days of signup.",
    "prompt": "Define activation precisely, then write the metric tree of stage rates whose product equals activation.",
    "confusion": "\"Activation rate fell\" is not actionable until you know which stage fell — onboarding completion, first-charge attempt, or first-charge success.",
    "hints": [
      "Pick a concrete activation event and a window (e.g., 14 days).",
      "Denominator = the signup cohort, not all merchants ever.",
      "activation = onboarding-complete rate × attempt rate × first-charge success rate."
    ],
    "model": "<b>Activation</b> = share of a signup cohort that makes a <b>first successful live charge within 14 days</b> of signup. Denominator = merchants who signed up in that cohort. <b>Metric tree:</b> activation = (onboarding completed ÷ signups) × (attempted a charge ÷ onboarded) × (first charge succeeded ÷ attempted). When activation moves, walk the tree to the stage rate that moved, then segment that stage by acquisition channel / country / business type.",
    "rubric": [
      "Concrete activation event + window + cohort denominator",
      "Decomposes into a product of stage rates",
      "Each stage rate has a clear numerator/denominator",
      "Notes you would segment the stage that moved"
    ],
    "explain": "Say: \"Activation is first successful charge within 14 days of a signup cohort. I express it as a product of stage rates so a drop points me at the exact stage to investigate.\"",
    "next": "pa3"
  },
  {
    "id": "pa3",
    "title": "Segment a refund-rate spike",
    "ladder": "pa",
    "pos": 3,
    "stage": "Segment to localize",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "required",
    "source": "DataLemur-style",
    "module": null,
    "mode": "Product",
    "timed": false,
    "est": "6 min",
    "business": "The global refund rate jumped this month. Is it a product problem, a merchant-mix shift, or fraud?",
    "task": "Lay out how you would <b>segment</b> the refund-rate spike to decide among: a broad product issue, one merchant dragging the aggregate, or a fraud pattern.",
    "prereq": "pa2 (define metric)",
    "harder": "You now decompose a moving aggregate across several dimensions to localize the cause — the core analyst move.",
    "teaches": "Segmentation is how you tell a broad regression from a mix shift. Cut by merchant, category, country and refund_reason and see whether the rise is everywhere or concentrated.",
    "deliverable": "The segmentation dimensions, what each would reveal, and the test that distinguishes mix shift from a real broad increase.",
    "before": [
      "Refund rate = refunded ÷ succeeded — is the denominator right?",
      "Did one large merchant's volume or refunds grow (mix shift)?",
      "Which dimensions could localize it: merchant, category, card_country, refund_reason?",
      "Is the spike concentrated or broad across segments?"
    ],
    "howto": [
      "Confirm the rate definition and denominator.",
      "Segment by merchant — is one merchant driving the aggregate?",
      "Segment by category / country / refund_reason.",
      "Decide: concentrated (mix or one bad actor) vs broad (product/policy)."
    ],
    "context": "refunds links to charges by charge_id; charges has merchant_id, card_country and a category/MCC; refunds has a reason. Refund rate = distinct refunded charges ÷ distinct succeeded charges.",
    "prompt": "How do you segment to decide product vs merchant-mix vs fraud? What pattern points to each?",
    "confusion": "A higher global refund rate can be pure mix shift: a high-refund merchant simply grew its share. The aggregate moved without any merchant's own rate changing.",
    "hints": [
      "Always segment by merchant first — concentration vs broad.",
      "Mix shift: each merchant's rate is flat, but the volume weighting changed.",
      "Fraud often shows up in refund_reason (fraudulent) and clusters by BIN/country."
    ],
    "model": "Confirm refund rate = distinct refunded ÷ distinct succeeded (avoid fan-out). Then segment: (1) <b>by merchant</b> — if one or two merchants' rates rose, it is local; if their <i>share</i> rose while their rates held, it is <b>mix shift</b>. (2) <b>by category &amp; country</b> — a broad rise across all merchants points to product/policy. (3) <b>by refund_reason</b> — a spike in 'fraudulent' or 'duplicate' clustered by BIN/country points to fraud. <b>Distinguishing test:</b> recompute the global rate holding last month's merchant mix fixed — if the spike disappears, it was mix shift, not a real increase.",
    "rubric": [
      "Confirms the rate definition / distinct denominator",
      "Segments by merchant first to test concentration",
      "Explicitly tests for mix shift (hold mix fixed)",
      "Uses refund_reason / BIN clustering to flag fraud"
    ],
    "explain": "Say: \"I segment by merchant first. If the aggregate rose only because a high-refund merchant grew, that is mix shift — I would hold the mix fixed and see if the spike survives before calling it a product problem.\"",
    "next": "pa4"
  },
  {
    "id": "pa4",
    "title": "Payout delays vs merchant retention",
    "ladder": "pa",
    "pos": 4,
    "stage": "Baseline + confounders",
    "lvl": 3,
    "difficulty": "hard",
    "priority": "should",
    "source": "Mode-style",
    "module": null,
    "mode": "Product",
    "timed": false,
    "est": "7 min",
    "business": "Average payout delay rose about a day this quarter. A VP asks whether that is hurting merchant retention.",
    "task": "Define the retention metric, the baseline comparison, and the <b>confounders</b> you must rule out before claiming payout delay affects retention.",
    "prereq": "pa3 (segmentation)",
    "harder": "You now compare against a baseline and must separate a real effect from confounders and seasonality — correlation vs causation enters.",
    "teaches": "Observational 'X moved and Y moved' is weak evidence. You define retention precisely, pick a fair baseline, and enumerate confounders before implying causation.",
    "deliverable": "A retention definition, a baseline/cohort comparison plan, the confounders to rule out, and the causal caveat.",
    "before": [
      "What is 'retention' here — merchant still processing N days later? churned GPV?",
      "What is the baseline — prior cohorts, or merchants with low vs high delay?",
      "What else changed this quarter (pricing, seasonality, merchant mix)?",
      "Is delay even comparable across merchant sizes/countries?"
    ],
    "howto": [
      "Define retention concretely (active/processing at day 90, or GPV retained).",
      "Compare cohorts: high-delay vs low-delay merchants, matched on size/country.",
      "List confounders: seasonality, pricing changes, mix shift, size correlation.",
      "State that this is correlational; name what an experiment would settle."
    ],
    "context": "payouts has scheduled vs actual timestamps (delay); merchants has size/country; retention = still processing / GPV retained over a window.",
    "prompt": "Define retention, the baseline comparison, the confounders to rule out, and why this stays correlational without an experiment.",
    "confusion": "Bigger or riskier merchants may both have longer payout delays AND different retention for unrelated reasons — size/risk is a confounder, not the delay itself.",
    "hints": [
      "Pick one retention definition and stick to it.",
      "Compare high- vs low-delay merchants matched on size and country.",
      "Confounders: seasonality, a pricing change, merchant mix, size/risk correlation.",
      "Only a randomized payout-timing test (or a clean natural experiment) proves causation."
    ],
    "model": "<b>Retention:</b> a merchant is retained if it is still processing (or retains ≥X% of GPV) 90 days later. <b>Baseline:</b> compare high-delay vs low-delay merchants, matched on size and country, and compare this quarter's cohort to prior cohorts. <b>Confounders:</b> seasonality, a concurrent pricing/policy change, merchant-mix shift, and the fact that larger or higher-risk merchants tend to have longer delays AND different baseline retention. <b>Caveat:</b> any association is correlational; to claim causation you would need a randomized payout-timing experiment or a clean natural experiment (e.g., a delay change that hit some merchants for exogenous reasons).",
    "rubric": [
      "One concrete retention definition",
      "Fair baseline / matched comparison",
      "Names ≥3 plausible confounders incl. size/risk",
      "States correlation ≠ causation and what would settle it"
    ],
    "explain": "Say: \"I would compare matched high- vs low-delay merchants, but I would not claim the delay caused churn — size and risk confound it. Only a randomized payout-timing test settles causation.\"",
    "next": "pa5"
  },
  {
    "id": "pa5",
    "title": "Approval up overall, down in every segment",
    "ladder": "pa",
    "pos": 5,
    "stage": "Validation & mix shift",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "StrataScratch-style",
    "module": null,
    "mode": "Product",
    "timed": false,
    "est": "7 min",
    "business": "Edge case. The weekly report shows overall approval rate <b>rose</b>, but the risk team insists it <b>fell for every card brand</b>. Both are true. Explain it and say what to report.",
    "task": "Explain how the aggregate can rise while every segment falls (Simpson's paradox), and recommend how to <b>validate</b> and report the metric.",
    "prereq": "pa4 (baseline & confounders)",
    "harder": "Real-world messiness: a textbook Simpson's-paradox trap that makes a naive aggregate actively misleading.",
    "teaches": "Aggregates are mix-weighted. When the mix shifts toward a higher-approval segment, the overall rate can rise even as every segment declines. Mix-adjusted reporting fixes it.",
    "deliverable": "A plain-English explanation of the paradox here, the validation you would run, and the reporting recommendation.",
    "before": [
      "Is the overall rate a simple average or volume-weighted?",
      "Did the volume MIX across card brands shift this week?",
      "Which brand has the highest baseline approval, and did its share grow?",
      "What single number would not mislead — segment-weighted or mix-held-constant?"
    ],
    "howto": [
      "Recognize the aggregate is volume-weighted across brands.",
      "Check whether traffic shifted toward a high-approval brand.",
      "Recompute approval holding last week's brand mix constant.",
      "Recommend reporting per-segment + a mix-adjusted overall."
    ],
    "context": "approval rate per card brand, weighted by each brand's share of attempts. If a high-approval brand's share grows, the weighted overall can rise even as each brand's own rate falls.",
    "prompt": "Why can overall approval rise while every brand falls? How do you validate it, and what do you report so leadership is not misled?",
    "confusion": "The overall number is not wrong — it is mix-weighted. Reporting it alone is misleading; you must show the segments or hold the mix constant.",
    "hints": [
      "This is Simpson's paradox: the mix moved, not just the rates.",
      "Recompute the overall with last week's mix to remove the mix effect.",
      "Report per-brand rates plus a mix-adjusted overall, not the raw aggregate alone."
    ],
    "model": "The overall approval rate is <b>volume-weighted</b> across card brands. If traffic shifted toward a brand with a high baseline approval rate (say more domestic Visa, fewer high-decline international cards), the weighted average can rise even though <i>each brand's own rate fell</i> — that is Simpson's paradox. <b>Validate:</b> recompute the overall rate holding last week's brand mix constant; if the rise vanishes, it was mix shift. <b>Report:</b> show per-brand approval rates plus a <b>mix-adjusted</b> overall, and flag that the raw aggregate is being driven by mix, not genuine improvement — because the real signal (every brand declining) is the one that needs action.",
    "rubric": [
      "Names Simpson's paradox and that the aggregate is mix-weighted",
      "Identifies the mix shift toward a high-approval segment",
      "Validates by holding the mix constant",
      "Recommends segment-level + mix-adjusted reporting"
    ],
    "explain": "Say: \"The aggregate is mix-weighted, so a shift toward a high-approval brand lifted it even as every brand fell — Simpson's paradox. I would hold the mix constant to confirm, and report mix-adjusted plus per-segment so we act on the real decline.\"",
    "next": "pa6"
  },
  {
    "id": "pa6",
    "title": "Final boss: approval rate dropped 3% globally",
    "ladder": "pa",
    "pos": 6,
    "stage": "Final boss · diagnose & recommend",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "DataLemur-style",
    "module": null,
    "mode": "Product",
    "timed": true,
    "est": "15 min",
    "business": "Final boss. Leadership: \"Global approval rate dropped 3 points this week. Diagnose it and tell us what to do.\" That is the whole brief — timed.",
    "task": "Run the full investigation <b>out loud</b>: clarify, define the metric, segment to localize, rule out confounders/mix shift, validate, and recommend a routed next action.",
    "prereq": "pa1–pa5",
    "harder": "The capstone: ambiguous, timed, multiple valid causes. You must impose the whole investigation loop and end with a decision, not just a number.",
    "teaches": "The end-to-end product-analytics loop under pressure: clarify → define → segment → confounders → validate → recommend and route to the right team.",
    "deliverable": "A structured diagnosis: clarifying questions, metric definition, segmentation plan, hypotheses/confounders, validation, and a concrete recommended next step with an owner.",
    "before": [
      "3 points absolute or 3% relative? Which window and baseline?",
      "Is it broad or concentrated (one merchant, issuer, country, method)?",
      "Could it be mix shift (Simpson's), a checkout deploy, or one big issuer declining?",
      "More retries inflating attempts? Pending charges miscounted?",
      "What is the smallest change that would confirm the cause?"
    ],
    "howto": [
      "Clarify scope: absolute vs relative, window, baseline, which merchants.",
      "Define approval = succeeded ÷ settled attempts (exclude pending).",
      "Segment: merchant, payment_method, card_country, issuer/BIN, failure_code.",
      "Form hypotheses: mix shift, one issuer, a deploy, a new high-decline merchant.",
      "Validate: hold mix constant, range-check, volume floors, maturity.",
      "Recommend + route: issuer/risk team, eng (if a deploy), or merchant-mix comms."
    ],
    "context": "charges has status, failure_code, payment_method, card_country, merchant_id, created_at. Approval = succeeded ÷ (succeeded + failed), excluding pending.",
    "prompt": "Diagnose the 3-point global approval drop end-to-end and recommend the next step. State assumptions; do not jump to SQL.",
    "confusion": "The weak answer writes one global query. The strong answer clarifies, segments to localize, explicitly rules out mix shift, validates, and ends with a routed recommendation.",
    "hints": [
      "Open with assumptions: absolute points, this week vs last, your merchants.",
      "Segment immediately — global numbers hide the cause.",
      "Rule out mix shift (Simpson's) by holding last week's mix constant.",
      "Localize to a failure_code/issuer/deploy, then route to the owning team."
    ],
    "model": "<b>1. Clarify/assume:</b> \"I will assume 3 percentage points, this week vs last, across all merchants.\" <b>2. Define:</b> approval = succeeded ÷ settled attempts, excluding pending. <b>3. Segment</b> by merchant, payment_method, card_country, issuer/BIN and failure_code to localize. <b>4. Hypotheses/confounders:</b> mix shift toward high-decline traffic (Simpson's — hold mix constant), one issuer or BIN declining more, a checkout/risk-model deploy this week, a new high-decline merchant dragging the aggregate, or more retries inflating failed attempts. <b>5. Validate:</b> recompute holding last week's mix; range-check rates; apply volume floors; compare maturity-matched windows. <b>6. Recommend &amp; route:</b> if concentrated in one failure_code/issuer → risk/issuer team; if it lines up with a deploy → eng rollback/inspection; if it is mix shift → it is not a real decline, report mix-adjusted and reassure. Deliver the segmented breakdown and the single most likely cause, not just the global number.",
    "rubric": [
      "Clarifies assumptions (absolute vs relative, window, scope) before querying",
      "Defines approval + denominator precisely",
      "Segments across the right dimensions to localize",
      "Explicitly rules out mix shift / Simpson's paradox",
      "Validates (mix-hold, range, volume floor, maturity)",
      "Ends with a concrete recommendation routed to an owner"
    ],
    "explain": "Open with: \"Let me confirm it is 3 points week-over-week and state assumptions. I will segment to localize before writing any SQL, rule out mix shift, validate, and come back with the likely cause and who should own the fix.\"",
    "next": null
  }
];

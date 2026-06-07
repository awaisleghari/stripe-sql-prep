import type { Problem } from '@/types';

/* MIGRATED DATA — edit a problem here, then it is auto-included via src/data/gym/index.ts.
   Source of truth migrated from the original single-file app (Repo-2). */
export const experimentProblems: Problem[] = [
  {
    "id": "exp1",
    "title": "Define treatment, control & unit of randomization",
    "ladder": "exp",
    "pos": 1,
    "stage": "Treatment/control + unit",
    "lvl": 1,
    "difficulty": "recognition",
    "priority": "required",
    "source": "experimentation-style",
    "module": null,
    "mode": "Experiment",
    "timed": false,
    "est": "4 min",
    "business": "You are testing a redesigned checkout layout. Before anything else you must define treatment, control, and the unit of randomization.",
    "task": "This is a design drill — <b>no code</b>. Define treatment and control for the checkout test, choose the <b>unit of randomization</b>, and justify the choice.",
    "prereq": "none — first rung of Experimentation",
    "harder": "First rung: get the experimental scaffolding right, because the unit of randomization decides what you can analyze.",
    "teaches": "You must randomize at the same unit you analyze and that contains the interference. Wrong unit (e.g., randomize by session when behavior spans sessions) contaminates the comparison.",
    "deliverable": "A definition of treatment/control and a justified unit of randomization (customer vs session vs merchant).",
    "before": [
      "What exactly is the change (treatment) and the status quo (control)?",
      "Who experiences it — a customer, a session, or a whole merchant's traffic?",
      "Could one unit's behavior spill into another (interference)?",
      "At what unit will you compute the metric?"
    ],
    "howto": [
      "State treatment (new layout) and control (current layout).",
      "Pick the unit: customer, session, or merchant.",
      "Check for interference / spillover at that unit.",
      "Randomize at the same unit you analyze."
    ],
    "context": "A checkout layout change can be randomized per customer, per session, or per merchant. Returning customers span sessions, so session-level splits can leak.",
    "prompt": "Define treatment and control, pick the unit of randomization, and justify it. What goes wrong with the wrong unit?",
    "confusion": "Randomizing per session but analyzing per customer leaks: a returning customer can see both layouts, blurring the comparison and biasing the estimate.",
    "hints": [
      "Treatment = new layout; control = current; keep everything else equal.",
      "If customers return across sessions, randomize at the customer level.",
      "Randomize at merchant level only if the change is merchant-wide (and accept fewer units)."
    ],
    "model": "<b>Treatment:</b> the redesigned checkout; <b>control:</b> the current checkout, everything else held equal. <b>Unit:</b> randomize per <b>customer</b> (stable across their sessions) so a returning shopper always sees one variant — randomizing per session would let the same person see both and contaminate the estimate. If the layout must be consistent for a whole merchant (or there is cross-customer interference), randomize per <b>merchant</b>, accepting fewer units and lower power. Analyze at the same unit you randomized.",
    "rubric": [
      "Clearly defines treatment vs control",
      "Chooses a unit and justifies it against spillover",
      "Notes randomize-and-analyze at the same unit",
      "Acknowledges the power tradeoff of coarser units"
    ],
    "explain": "Say: \"Treatment is the new layout, control the old. I would randomize per customer so returning shoppers do not see both variants, and analyze at that same unit.\"",
    "next": "exp2"
  },
  {
    "id": "exp2",
    "title": "Primary metric & guardrails for a fraud-model test",
    "ladder": "exp",
    "pos": 2,
    "stage": "Primary metric + guardrails",
    "lvl": 2,
    "difficulty": "easy",
    "priority": "required",
    "source": "experimentation-style",
    "module": null,
    "mode": "Experiment",
    "timed": false,
    "est": "5 min",
    "business": "Risk wants to A/B test a new fraud model (treatment = new model). You must choose the primary metric and the guardrails.",
    "task": "Choose the <b>primary metric</b> and the <b>guardrail metrics</b> for the fraud-model experiment, and state the decision rule.",
    "prereq": "exp1 (treatment/control)",
    "harder": "You now pick the metric you will decide on AND the guardrails that prevent winning on one number while quietly harming another.",
    "teaches": "Guardrails protect against a metric improving at another's expense. A fraud model that blocks more fraud must not also block too many good customers — you commit to both before launch.",
    "deliverable": "One primary metric, 2–3 guardrails (with directions), and the ship/no-ship rule.",
    "before": [
      "What is the model meant to improve — dispute/fraud rate?",
      "What could it harm — good customers wrongly declined?",
      "Which guardrails capture that harm — false-decline rate, approval rate, latency?",
      "What is the pre-committed decision rule?"
    ],
    "howto": [
      "Primary: the fraud/dispute outcome the model targets.",
      "Guardrails: good-customer block (false declines), overall approval rate, latency.",
      "Set directions and thresholds for each.",
      "Pre-commit: ship only if primary improves and no guardrail regresses beyond X."
    ],
    "context": "A stricter fraud model lowers fraud/disputes but may decline legitimate customers (false positives) and add latency. dispute rate and approval rate live in charges/disputes.",
    "prompt": "Define the primary metric and guardrails (with directions) for the fraud-model test, and the pre-committed decision rule.",
    "confusion": "Optimizing fraud rate alone is a trap: a model that declines everyone has zero fraud. Guardrails on good-customer impact are mandatory.",
    "hints": [
      "Primary should be the fraud/dispute outcome the model targets.",
      "Guardrail the harm: false-decline / good-customer block rate, overall approval rate, latency.",
      "Pre-register the decision rule so you cannot move the goalposts later."
    ],
    "model": "<b>Primary metric:</b> fraud/dispute rate on accepted charges (lower is better). <b>Guardrails:</b> (1) good-customer false-decline rate or overall approval rate (must not drop more than a small pre-set margin); (2) decision latency (must stay within budget); (3) total authorized GPV (must not fall materially). <b>Decision rule (pre-committed):</b> ship only if the primary improves with adequate power AND no guardrail regresses beyond its threshold. This stops the degenerate \"block everything\" win and forces an explicit fraud-vs-friction tradeoff.",
    "rubric": [
      "Primary metric is the targeted fraud/dispute outcome",
      "Guardrails capture good-customer harm + latency/GPV",
      "Directions and thresholds are stated",
      "Decision rule is pre-committed (no goalpost-moving)"
    ],
    "explain": "Say: \"Primary is dispute/fraud rate, but I guardrail false declines, approval rate and latency — otherwise a model that blocks everyone 'wins'. I pre-commit the ship rule before launch.\"",
    "next": "exp3"
  },
  {
    "id": "exp3",
    "title": "Read an A/B result without fooling yourself",
    "ladder": "exp",
    "pos": 3,
    "stage": "Peeking & multiple comparisons",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "required",
    "source": "experimentation-style",
    "module": null,
    "mode": "Experiment",
    "timed": false,
    "est": "6 min",
    "business": "An analyst reports: \"New checkout: +1.2% conversion, p = 0.04. We checked daily and it crossed significance, across the 8 metrics we track.\" Ship it?",
    "task": "Critique the result. Identify the statistical pitfalls (peeking, multiple comparisons, novelty) and say what you would require before trusting it.",
    "prereq": "exp2 (metric & guardrails)",
    "harder": "You now read a result critically — the failure modes are subtle and a naive 'p<0.05, ship' is the trap.",
    "teaches": "Daily peeking and many metrics massively inflate false positives. A trustworthy result needs a pre-registered primary metric, a fixed horizon (or a sequential method), and correction for multiple looks/metrics.",
    "deliverable": "A list of the pitfalls present here and the conditions you would require before shipping.",
    "before": [
      "Was there a single pre-registered primary metric, or 8?",
      "Was the stopping time fixed, or did they peek daily and stop when significant?",
      "Is +1.2% practically meaningful and adequately powered?",
      "Could a novelty/primacy effect explain an early bump?"
    ],
    "howto": [
      "Flag peeking: stopping at the first significant day inflates Type-I error.",
      "Flag multiple comparisons: 8 metrics need correction (or one primary).",
      "Question power and practical significance of +1.2%.",
      "Require: pre-registered primary, fixed horizon or sequential test, correction."
    ],
    "context": "Repeated significance testing (\"peeking\") and testing many metrics both inflate the false-positive rate well above the nominal 5%.",
    "prompt": "What is wrong with \"+1.2%, p=0.04, peeked daily, 8 metrics\"? What would you require before shipping?",
    "confusion": "p = 0.04 from daily peeking across 8 metrics is not a real 5% false-positive rate — the effective rate is far higher. The nominal p-value is misleading here.",
    "hints": [
      "Peeking = repeated looks; stopping when significant inflates Type-I error.",
      "8 metrics = multiple comparisons; correct (Bonferroni/FDR) or pre-register ONE primary.",
      "Ask about power, run-length and a novelty effect on the early days."
    ],
    "model": "Do not ship on this evidence. Pitfalls: (1) <b>Peeking</b> — testing daily and stopping the moment p<0.05 inflates the false-positive rate well above 5%; use a fixed horizon or a proper sequential test. (2) <b>Multiple comparisons</b> — 8 metrics means ~1 false positive expected by chance at α=0.05; pre-register a single primary metric or correct (Bonferroni/FDR). (3) <b>Novelty/primacy</b> — a new layout can bump conversion briefly; check whether the lift persists. (4) <b>Power/practical significance</b> — is +1.2% meaningful and was the test powered for it? <b>Require</b> a pre-registered primary metric, a fixed run length (or sequential method), correction for the other metrics, and a persistence check before shipping.",
    "rubric": [
      "Identifies peeking and its inflation of Type-I error",
      "Identifies multiple comparisons across 8 metrics",
      "Raises novelty effect and power/practical significance",
      "Specifies pre-registration + fixed horizon/correction before shipping"
    ],
    "explain": "Say: \"p=0.04 after daily peeking across 8 metrics is not a true 5% error rate. I would want a pre-registered primary metric, a fixed horizon, multiple-comparison correction, and a check that the lift persists past novelty.\"",
    "next": "exp4"
  },
  {
    "id": "exp4",
    "title": "Define ITT when some treated users never see treatment",
    "ladder": "exp",
    "pos": 4,
    "stage": "ITT vs treatment-on-treated",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "Causal Inference (Brave & True)-style",
    "module": null,
    "mode": "Causal",
    "timed": false,
    "est": "7 min",
    "business": "In a checkout experiment, some customers assigned to treatment abandon before the payment step, so they never actually see the new layout. How do you analyze it?",
    "task": "Define <b>Intent-to-Treat (ITT)</b> here versus treatment-on-treated, and explain why ITT is the right default and why dropping the non-exposed is biased.",
    "prereq": "exp1 (assignment), exp3 (reading results)",
    "harder": "You now reason about non-compliance — analyzing by exposure instead of assignment silently reintroduces selection bias.",
    "teaches": "ITT analyzes by random assignment regardless of whether the unit complied; it stays unbiased because the randomization is intact. Conditioning on post-randomization exposure breaks randomization and biases the estimate.",
    "deliverable": "Definitions of ITT and treatment-on-treated, why ITT is the default, and the bias from analyzing only the exposed.",
    "before": [
      "Who was randomized vs who actually saw the new layout?",
      "Is reaching payment (exposure) affected by other things (a confounder)?",
      "What question does ITT answer vs treatment-on-treated?",
      "Why does filtering to the exposed break randomization?"
    ],
    "howto": [
      "ITT: analyze everyone by their assigned group, exposed or not.",
      "Treatment-on-treated/CACE: effect among those who actually complied.",
      "Explain ITT answers 'what happens if we ship the assignment'.",
      "Show that conditioning on exposure (post-randomization) reintroduces selection bias."
    ],
    "context": "Assignment is random; exposure (reaching the payment step) is NOT random — it depends on customer behavior, which correlates with conversion.",
    "prompt": "Define ITT vs treatment-on-treated for this experiment. Why is ITT the default, and why is \"analyze only those who saw the layout\" biased?",
    "confusion": "\"Just compare customers who actually saw each layout\" feels right but is wrong: exposure happens AFTER randomization and is self-selected, so filtering on it breaks the random comparison.",
    "hints": [
      "ITT keeps every assigned unit in its assigned group, compliant or not.",
      "Exposure (reaching payment) is post-randomization and self-selected.",
      "Conditioning on a post-treatment variable reintroduces confounding.",
      "Treatment-on-treated (CACE) estimates the effect on compliers, e.g., via IV."
    ],
    "model": "<b>ITT</b> analyzes every customer by their <b>assigned</b> group — treatment vs control — regardless of whether they reached the payment step. It stays unbiased because the randomization is untouched, and it answers the decision question: \"if we ship this to everyone, what is the effect?\" <b>Treatment-on-treated / CACE</b> is the effect among <b>compliers</b> (those who actually saw the layout); it is larger but requires an IV-style adjustment to estimate without bias. <b>Why not just compare the exposed:</b> reaching payment is post-randomization and self-selected (more motivated buyers get there), so filtering on it breaks the random balance and reintroduces selection bias. Report ITT as the primary; use CACE only as a carefully-estimated secondary.",
    "rubric": [
      "Defines ITT (analyze by assignment) and CACE/treatment-on-treated",
      "Explains ITT is unbiased because randomization is preserved",
      "Explains conditioning on exposure is post-randomization selection bias",
      "Recommends ITT as primary, CACE as adjusted secondary"
    ],
    "explain": "Say: \"ITT compares by assignment, exposed or not, so randomization holds and it answers the ship decision. Filtering to those who saw the layout conditions on a self-selected post-randomization variable — that reintroduces bias.\"",
    "next": "exp5"
  },
  {
    "id": "exp5",
    "title": "Difference-in-differences for a staggered payout change",
    "ladder": "exp",
    "pos": 5,
    "stage": "Difference-in-differences",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "Causal Inference (Brave & True)-style",
    "module": null,
    "mode": "Causal",
    "timed": false,
    "est": "8 min",
    "business": "Faster payouts launched in Germany first, then everywhere. With no randomization, estimate the effect of faster payouts on merchant GPV.",
    "task": "Design a <b>difference-in-differences (DiD)</b> estimate using the staggered rollout: define treated/control, the periods, the estimator, and the key assumption.",
    "prereq": "exp4 (causal reasoning)",
    "harder": "You now build a causal estimate from observational, non-random rollout — DiD with its parallel-trends assumption.",
    "teaches": "DiD compares the before→after change in the treated group to the same change in an untreated control, cancelling fixed differences and common time trends — valid only if trends would have been parallel absent treatment.",
    "deliverable": "The DiD setup (treated/control, pre/post), the estimator in words, the parallel-trends assumption, and how you would check it.",
    "before": [
      "Who is treated (Germany, early) and who is control (not-yet-treated countries)?",
      "What are the pre and post periods relative to the German launch?",
      "What does DiD subtract out — fixed country differences and common time trends?",
      "Is the parallel-trends assumption plausible, and how would you test it?"
    ],
    "howto": [
      "Treated = Germany; control = countries not yet switched in that window.",
      "Pre = before German launch; post = after, before others switch.",
      "DiD = (DE post − DE pre) − (control post − control pre).",
      "Check parallel pre-trends; watch for confounds coinciding with the German launch."
    ],
    "context": "payouts/balance_transactions give per-merchant GPV over time by country. Germany switched first, giving a treated group and a not-yet-treated control window.",
    "prompt": "Set up the DiD: treated/control, periods, estimator, the parallel-trends assumption, and your validity checks.",
    "confusion": "Just comparing Germany before vs after attributes any nationwide trend (seasonality, a global product change) to payouts. DiD nets that out using the control group — but only if their trends were parallel.",
    "hints": [
      "Treated = Germany; control = countries that had not switched yet.",
      "DiD = (treated after − treated before) − (control after − control before).",
      "The identifying assumption is parallel trends absent treatment.",
      "Plot pre-period trends; if they already diverged, DiD is suspect."
    ],
    "model": "<b>Setup:</b> treated = German merchants (switched first); control = merchants in countries not yet switched during that window. <b>Periods:</b> pre = before the German launch; post = after launch but before the others switch. <b>Estimator:</b> DiD = (GPV_DE,post − GPV_DE,pre) − (GPV_control,post − GPV_control,pre); the second term removes common time trends (seasonality, global product changes), and the design removes fixed country-level differences. <b>Assumption:</b> <b>parallel trends</b> — absent the payout change, German and control GPV would have moved together. <b>Checks:</b> plot pre-period trends for parallelism, run a placebo on a fake pre-launch date, and confirm nothing else hit Germany at launch (a confound). Prefer a staggered-adoption DiD estimator since rollout was phased.",
    "rubric": [
      "Correct treated/control and pre/post definition",
      "States the DiD estimator (double difference)",
      "Names parallel trends as the identifying assumption",
      "Proposes checks: pre-trends, placebo, coincident-confound check"
    ],
    "explain": "Say: \"I would treat Germany as treated and not-yet-switched countries as control, and take the double difference — that nets out common time trends. It is valid only if their pre-trends were parallel, which I would plot and placebo-test.\"",
    "next": "exp6"
  },
  {
    "id": "exp6",
    "title": "Final boss: retry feature 'improves' success, adoption non-random",
    "ladder": "exp",
    "pos": 6,
    "stage": "Final boss · selection bias",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "Causal Inference (Brave & True)-style",
    "module": null,
    "mode": "Causal",
    "timed": true,
    "est": "15 min",
    "business": "Final boss. Merchants who enabled the new smart-retry feature show higher payment success. A VP wants to announce \"retries boost success by 4%.\" Can you claim causality? Timed.",
    "task": "Decide whether causality can be claimed, name the bias, and propose how you would actually estimate the causal effect — out loud, structured, timed.",
    "prereq": "exp1–exp5",
    "harder": "The capstone: an observational, self-selected adoption story that looks causal but is not — you must diagnose it and propose a credible identification strategy.",
    "teaches": "Self-selected adoption is the classic confounding trap: sophisticated, high-volume, lower-risk merchants both adopt features and have higher success anyway. You need randomization or a credible quasi-experiment to claim causality.",
    "deliverable": "A verdict (can/can't claim causality), the named bias, and a concrete identification plan (experiment or quasi-experiment) with assumptions.",
    "before": [
      "Who chose to enable retries — is adoption random?",
      "What merchant traits drive BOTH adoption and success (confounders)?",
      "What would a clean experiment look like here?",
      "If you cannot randomize, what quasi-experimental designs apply (DiD, IV, matching)?"
    ],
    "howto": [
      "State that adoption is self-selected, so the comparison is confounded.",
      "Name confounders: merchant sophistication, volume, risk profile, customer base.",
      "Propose the gold standard: randomize retry availability (ITT).",
      "If impossible: DiD on a staggered rollout, IV (an as-good-as-random nudge), or matching on observables with sensitivity analysis."
    ],
    "context": "Adoption of the retry feature is a merchant choice, not random. Adopters skew toward larger, more sophisticated, lower-risk merchants who already convert better.",
    "prompt": "Can you claim \"retries boost success by 4%\"? Name the bias and propose how to estimate the true causal effect. State assumptions and limits.",
    "confusion": "\"Adopters succeed more, so retries cause success\" ignores that adopters were already different. The 4% gap is confounded by who chose to adopt — it is not the causal effect.",
    "hints": [
      "Adoption is self-selected → selection bias / confounding, not causation.",
      "List traits that drive both adoption and success (size, sophistication, risk).",
      "Gold standard: randomize who gets retries, analyze ITT.",
      "No randomization? DiD on a staggered launch, an IV (random encouragement), or matching + sensitivity analysis."
    ],
    "model": "<b>Verdict:</b> no — you cannot claim causality from this. <b>Bias:</b> <b>selection bias / confounding</b> — retry adoption is a merchant choice, and adopters skew larger, more sophisticated and lower-risk, so they would convert better <i>with or without</i> retries. The raw 4% conflates the feature's effect with who chose it. <b>How to estimate the causal effect:</b> (1) <b>Gold standard</b> — randomize retry availability across comparable merchants and report ITT. (2) <b>If you cannot randomize</b> — exploit a <b>staggered rollout with DiD</b> (treated vs not-yet-enabled, parallel-trends checked), an <b>instrument</b> (e.g., a randomized prompt that nudges adoption but does not otherwise affect success), or <b>matching</b> on observable confounders with a sensitivity analysis for unobserved ones. <b>Communicate:</b> tell the VP the 4% is an upper-bound association; commit to a randomized rollout to get a shippable causal number.",
    "rubric": [
      "States causality cannot be claimed from self-selected adoption",
      "Names selection bias/confounding and the specific confounders",
      "Proposes randomization (ITT) as the gold standard",
      "Offers a credible quasi-experiment (DiD/IV/matching) with assumptions",
      "Frames the 4% as association and manages the stakeholder"
    ],
    "explain": "Open with: \"I would not announce that. Adoption is self-selected — adopters are bigger and lower-risk, so they convert better regardless. The 4% is association, not causation. To get a real number I would randomize retry availability and report ITT, or use the staggered rollout as a difference-in-differences.\"",
    "next": null
  }
];

import type { Module } from '@/types';

/* Non-SQL learning module: statistics & ML evaluation for a Stripe DS/MLE screen. No sqlPattern.
   Pairs with the `exp` (Experimentation & Causal) Practice Gym ladder. */
export const m19: Module = {
  "id": "m19",
  "day": "Day 7",
  "badge": "advanced",
  "title": "MLE & Statistics",
  "skill": "statistics",
  "bcolor": "volcano",
  "concept": "<p>Stripe's DS/MLE screens probe whether you reason about <strong>uncertainty</strong> and <strong>evaluation</strong> correctly — especially for fraud, where classes are wildly imbalanced and a wrong metric hides a useless model.</p>\n<p><strong>Inference vocabulary, said precisely.</strong> A <strong>p-value</strong> is P(data at least this extreme | the null is true) — <em>not</em> the probability the null is true. A <strong>95% confidence interval</strong> means the procedure captures the true parameter 95% of the time across repeated samples; a wide interval signals you simply lack data. <strong>Type I</strong> error is a false positive (reject a true null, rate α); <strong>Type II</strong> is a false negative (miss a real effect, rate β); <strong>power</strong> = 1 − β rises with sample size and effect size.</p>\n<p><strong>Classification metrics for imbalanced data.</strong> With 0.1% fraud, a model that predicts \"never fraud\" is 99.9% accurate and worthless — so <strong>accuracy is the wrong metric</strong>. Use <strong>precision</strong> = TP/(TP+FP) and <strong>recall</strong> = TP/(TP+FN), trade them with the decision threshold, and prefer <strong>PR-AUC</strong> over ROC-AUC when positives are rare. Pick the operating threshold by the <em>business cost</em> of a false decline vs a missed fraud, not by default 0.5.</p>\n<p><strong>Bias–variance and leakage.</strong> Underfitting is high bias; overfitting is high variance — diagnose with train-vs-validation gap and fix with regularization, more data, or simpler features. Guard against <strong>leakage</strong>: fit scalers/encoders/feature-selection on the training fold only, and for fraud/time-series use a <strong>temporal split</strong> so the model never trains on the future.</p>\n<div class=\"callout warn\"><span class=\"t\">The metric is the model decision</span>On imbalanced problems the choice of metric and threshold determines whether a model is shippable. Accuracy and a default 0.5 cutoff are how good-looking models fail in production.</div>",
  "pysupport": "import math\n\n# Two-proportion z-test sketch (e.g. A/B conversion) — stdlib only, no scipy.\ndef two_proportion_z(succ_a, n_a, succ_b, n_b):\n    p_a, p_b = succ_a / n_a, succ_b / n_b\n    p_pool = (succ_a + succ_b) / (n_a + n_b)\n    se = math.sqrt(p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b))\n    z = (p_b - p_a) / se if se else 0.0\n    # |z| > 1.96 ~ significant at alpha=0.05 (two-sided); report the lift too, not just z\n    return z, p_b - p_a",
  "predicts": [
    {
      "prompt": "A test returns p = 0.03. Which statement is correct?",
      "query": "-- two-sided test, alpha = 0.05, p = 0.03",
      "options": [
        "There's a 3% chance the null hypothesis is true",
        "If the null were true, data this extreme (or more) would occur 3% of the time",
        "There's a 97% chance the effect is real",
        "The effect size is 0.03"
      ],
      "answer": 1,
      "explain": "A p-value is computed ASSUMING the null is true: P(data at least this extreme | null). It is not the probability the null (or the alternative) is true, and it says nothing about the effect's size or importance."
    },
    {
      "prompt": "Your fraud classifier is 99.8% accurate on data that is 0.2% fraud. What should you check first?",
      "query": "-- fraud prevalence ~0.2%, accuracy 99.8%",
      "options": [
        "Nothing — 99.8% is excellent",
        "Precision and recall — a 'predict never-fraud' baseline already scores ~99.8% accuracy",
        "The training time",
        "The learning rate"
      ],
      "answer": 1,
      "explain": "Under heavy imbalance, accuracy is dominated by the majority class; always-negative already hits ~99.8%. Recall (did we catch fraud?) and precision (were our flags real?) reveal whether the model does anything useful."
    }
  ],
  "debugs": [
    {
      "title": "Misreading the p-value",
      "prompt": "A write-up concludes: 'p = 0.04, so there's a 96% chance our new model is better.' Diagnose the error.",
      "broken": "-- p = 0.04  ⇒  'P(model is better) = 96%'",
      "hint": "The p-value is a probability about the DATA under the null, not a probability about the hypothesis.",
      "fixed": "-- p = 0.04 means: IF there were no real difference, we'd see data this\n-- extreme 4% of the time. It does NOT give P(hypothesis is true).\n-- Report the effect SIZE + confidence interval, and whether it clears the\n-- business bar — not just that p < 0.05.",
      "why": "Confusing P(data | null) with P(hypothesis | data) is the classic inversion. Significance also isn't importance: pair the p-value with an effect size and interval, and ask whether the lift is worth shipping."
    },
    {
      "title": "Data leakage in the evaluation",
      "prompt": "A pipeline standardizes features, then splits into train/test. Validation looks great; production is worse. Find the leak.",
      "broken": "X = standardize(all_data)        # fit mean/std on EVERYTHING\nX_train, X_test = split(X)\nmodel.fit(X_train); score(X_test)",
      "hint": "The scaler learned statistics from the test rows too, so the test set isn't truly unseen.",
      "fixed": "X_train, X_test = split(all_data)\nscaler = fit_scaler(X_train)           # fit on TRAIN only\nX_train = scaler.transform(X_train)\nX_test  = scaler.transform(X_test)     # apply, don't refit\n# for fraud/time-series, split by TIME so train predates test",
      "why": "Fitting any transform (scaling, encoding, feature selection, imputation) on the full data leaks test information into training and inflates validation scores. Fit on train, apply to test; for temporal problems split chronologically so the model never sees the future."
    }
  ],
  "exercises": [
    {
      "id": "m19e1",
      "lvl": 1,
      "priority": "required",
      "title": "State the hypotheses",
      "prompt": "You're testing whether a new checkout lifts conversion. Write the null and alternative hypotheses and name the Type I and Type II errors in plain terms.",
      "hints": [
        "Null = no difference; alternative = there is a difference (or a positive lift).",
        "Type I = shipping a change that doesn't help; Type II = missing a real improvement."
      ],
      "solution": "H0: conversion_treatment = conversion_control (no effect).  H1: conversion_treatment ≠ control (two-sided) or > control (one-sided, if you only care about lift).\nType I error (α): conclude the new checkout helps when it doesn't — ship a non-improvement. Type II error (β): conclude it doesn't help when it actually does — miss a real win. Power = 1 − β."
    },
    {
      "id": "m19e2",
      "lvl": 2,
      "priority": "required",
      "title": "Interpret a confidence interval",
      "prompt": "Treatment lift is +1.2% with a 95% CI of [−0.3%, +2.7%]. State what the interval means and what you'd conclude.",
      "hints": [
        "The CI is about the procedure's long-run capture rate, and whether it straddles zero.",
        "Crossing zero ⇒ not significant at 0.05."
      ],
      "solution": "The 95% CI [−0.3%, +2.7%] means the estimation procedure captures the true lift 95% of the time across repeated samples; here it includes 0, so the result is not significant at α=0.05 — we cannot rule out 'no effect'. The point estimate is +1.2%, but the interval is wide, which signals we likely need more data (more power) before deciding. Don't ship on this alone."
    },
    {
      "id": "m19e3",
      "lvl": 3,
      "priority": "should",
      "title": "Precision vs recall at a threshold",
      "prompt": "A fraud model at threshold 0.5 gives TP=80, FP=20, FN=120, TN=99780. Compute precision and recall, and say which you'd raise to catch more fraud and at what cost.",
      "hints": [
        "Precision = TP/(TP+FP); recall = TP/(TP+FN).",
        "Lowering the threshold raises recall but lowers precision (more false declines)."
      ],
      "solution": "Precision = 80/(80+20) = 0.80. Recall = 80/(80+120) = 0.40. The model catches only 40% of fraud. To catch more, LOWER the threshold: recall rises, but precision falls — more legitimate customers are falsely declined. The right operating point depends on the cost of a missed fraud (chargeback + fees) vs a false decline (lost sale + customer friction); choose the threshold on the PR curve that optimizes that business cost, not 0.5."
    },
    {
      "id": "m19e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "Pick the metric for imbalanced classes",
      "prompt": "Two fraud models: A has higher ROC-AUC, B has higher PR-AUC. Fraud is 0.2% of traffic and you operate at very low false-positive rates. Which do you trust, and why is accuracy excluded?",
      "hints": [
        "ROC-AUC can look optimistic under heavy imbalance because true negatives dominate.",
        "PR-AUC focuses on the positive (fraud) class and the precision/recall regime you actually operate in."
      ],
      "solution": "Trust B (higher PR-AUC). Under 0.2% prevalence, ROC-AUC is inflated by the huge true-negative mass and the FPR denominator, so it can look strong even when precision at usable recall is poor. PR-AUC summarizes precision vs recall on the rare positive class — the regime you ship in. Accuracy is excluded because an always-negative baseline already scores ~99.8%; it measures nothing about fraud detection. Final check: evaluate at the actual operating threshold (e.g. precision at the recall you need), not just the summary curve."
    },
    {
      "id": "m19e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: design the evaluation for a fraud model",
      "prompt": "You're asked to evaluate a new fraud model before launch. Specify: the split, the offline metric and threshold choice, the leakage risks, the online test, and the guardrails — and how you'd detect drift after launch.",
      "hints": [
        "Temporal split; PR-AUC + precision at a target recall; threshold by business cost.",
        "Leakage: fit transforms on train only; no post-event features.",
        "Online: a holdout/A-B with guardrails (false-decline rate); monitor drift."
      ],
      "solution": "Split: TEMPORAL — train on earlier weeks, validate on later weeks — so the model never trains on the future; never random-split time-ordered fraud. Offline metric: PR-AUC plus precision at the target recall (or recall at a max false-positive rate), reported at the threshold set by the cost of a missed fraud vs a false decline. Leakage: fit scalers/encoders/feature-selection on train only; exclude any feature only known AFTER the label (e.g. chargeback outcome) and any post-authorization signal. Online: launch behind an A/B or holdout, primary metric = fraud caught (recall/$ blocked), GUARDRAIL = false-decline rate and approval rate so you don't block good customers; pre-register the metric and horizon (no peeking). Drift: monitor score distribution, feature distributions, prevalence, and precision/recall over time; alarm on shifts and retrain on a schedule or trigger. Significance ≠ shippability: confirm the lift clears the business bar with guardrails intact."
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "A p-value is:",
      "options": [
        "The probability the null hypothesis is true",
        "P(data at least this extreme | the null is true)",
        "The effect size",
        "1 minus the confidence level"
      ],
      "answer": 1,
      "why": "The p-value is computed assuming the null; it is not the probability of a hypothesis and says nothing about effect size.",
      "concept": "p-value"
    },
    {
      "level": 1,
      "q": "Statistical power (1 − β) increases when:",
      "options": [
        "The sample size and/or true effect size increase",
        "You lower the sample size",
        "You raise α to 0.5",
        "The data is more imbalanced"
      ],
      "answer": 0,
      "why": "More data and a larger true effect both make a real effect easier to detect, raising power.",
      "concept": "power"
    },
    {
      "level": 2,
      "q": "On data that is 0.2% fraud, the least useful single metric is:",
      "options": [
        "Recall",
        "Precision",
        "Overall accuracy",
        "PR-AUC"
      ],
      "answer": 2,
      "why": "Accuracy is dominated by the majority class; an always-negative model already scores ~99.8%.",
      "concept": "imbalanced metrics"
    },
    {
      "level": 4,
      "q": "Lowering a classifier's decision threshold generally:",
      "options": [
        "Raises both precision and recall",
        "Raises recall but lowers precision (more false positives)",
        "Has no effect",
        "Only changes accuracy"
      ],
      "answer": 1,
      "why": "A lower threshold flags more positives — catching more true positives (higher recall) at the cost of more false positives (lower precision).",
      "concept": "threshold"
    },
    {
      "level": 5,
      "q": "For a fraud model on time-ordered data, the correct evaluation split is:",
      "options": [
        "Random train/test split",
        "A temporal split (train on the past, test on the future), with all transforms fit on train only",
        "Fit the scaler on all data, then split",
        "Use the test set for early stopping and reporting"
      ],
      "answer": 1,
      "why": "Random splits and full-data transforms leak future/test information; a temporal split with train-only preprocessing mirrors production.",
      "concept": "leakage"
    }
  ],
  "mistakes": [
    "Reading the p-value as P(hypothesis true), or treating significance as importance (ignoring effect size).",
    "Using accuracy on imbalanced data instead of precision/recall/PR-AUC.",
    "Shipping at a default 0.5 threshold instead of one chosen by business cost.",
    "Leakage: fitting scalers/encoders/feature selection on all data, or random-splitting time-ordered data.",
    "Peeking / multiple comparisons inflating false positives without correction."
  ],
  "edges": [
    "Tiny positive class: a few labels swing precision/recall wildly — report confidence intervals on the metrics.",
    "Concept drift: prevalence and feature distributions shift after launch, silently degrading precision.",
    "Calibration: a model can rank well (good AUC) yet output miscalibrated probabilities, breaking cost-based thresholds."
  ],
  "interview": "<p>Lead with the metric and the uncertainty: <em>\"Fraud is rare, so I'll evaluate with PR-AUC and precision at a target recall, set the threshold by the cost of a false decline vs a missed fraud, split temporally, fit all transforms on train only, and launch behind an A/B with a false-decline guardrail.\"</em> Saying p-values precisely (data under the null, not P(hypothesis)) and naming leakage signals real maturity.</p>",
  "followup": {
    "prompt": "Interviewer: \"Your model's AUC is 0.95 but it performs poorly in production. What happened?\"",
    "answer": "Most likely some combination of: leakage inflating offline AUC (a transform or feature used the future/label), a random split on time-ordered data, an operating threshold or class prevalence that differs from production, miscalibrated probabilities so the cost-based threshold misbehaves, or concept drift since training. I'd re-split temporally, audit every feature for post-label information, re-fit transforms on train only, recalibrate, and re-evaluate at the real operating point with PR-AUC and precision-at-recall."
  }
};

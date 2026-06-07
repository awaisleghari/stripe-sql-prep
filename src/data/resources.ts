import type { Resource, ResourceMapping } from '@/types';

/* MIGRATED resources. Secondary by design — the Gym adapts these patterns into Stripe drills. */
export const RESOURCES: Resource[] = [
  {
    "name": "SQLBolt",
    "url": "https://sqlbolt.com",
    "day": "Day 1",
    "use": "Interactive in-browser SQL lessons. Blast through SELECT→joins to build muscle memory fast."
  },
  {
    "name": "PostgreSQL Exercises",
    "url": "https://pgexercises.com",
    "day": "Days 1–3",
    "use": "Serious progressive practice: basics → joins → aggregation → window → recursive. Postgres-flavoured, like Stripe."
  },
  {
    "name": "DataLemur",
    "url": "https://datalemur.com",
    "day": "Days 4–6",
    "use": "Interview-style SQL & DS questions (many ex-FAANG). Use once syntax is comfortable for timed reps."
  },
  {
    "name": "Mode SQL Tutorial",
    "url": "https://mode.com/sql-tutorial",
    "day": "Days 3–5",
    "use": "Analytics-SQL reference. Best for window functions, funnels, and retention thinking."
  },
  {
    "name": "WindowFunctions.com",
    "url": "https://www.windowfunctions.com",
    "day": "Day 3",
    "use": "A focused gym purely for window functions — pair it with M6."
  },
  {
    "name": "Stripe Sigma docs",
    "url": "https://docs.stripe.com/stripe-data/sigma",
    "day": "Days 5–6",
    "use": "How Stripe exposes transactional data as SQL tables — schema intuition for the real thing."
  },
  {
    "name": "Stripe transactional data docs",
    "url": "https://docs.stripe.com/payments/payment-intents",
    "day": "Days 5–6",
    "use": "Balance transactions, payments, refunds, fees, payouts — the money-movement ledger model."
  },
  {
    "name": "Stripe product pages",
    "url": "https://stripe.com/products",
    "day": "Throughout",
    "use": "Business context: payments, billing, Connect platforms, fraud, subscriptions. Grounds every metric in a real product."
  },
  {
    "name": "StrataScratch (free tier)",
    "url": "https://www.stratascratch.com",
    "day": "Days 4–6",
    "use": "Multi-table product-analytics question STYLE only. Do the StrataScratch-style Gym problems first; use the site afterward for extra reps."
  },
  {
    "name": "Community SQL interview repos (GitHub)",
    "url": "https://github.com/topics/sql-interview-questions",
    "day": "Days 4–6",
    "use": "Public time-series and user-metric PATTERNS, adapted here into Stripe-flavoured GitHub-repo-style Gym problems. Use the repos only as extra practice."
  },
  {
    "name": "stripe-interview / python-interview-prep",
    "url": "https://github.com/stripe/stripe-interview",
    "day": "Days 3–6",
    "use": "Stripe's own Python interview-prep STYLE — clean function boundaries, simple tests, no notebooks. The Python Production Scripting ladder is built from this style. Do the internal drills first."
  },
  {
    "name": "alexeygrigorev / data-science-interviews",
    "url": "https://github.com/alexeygrigorev/data-science-interviews",
    "day": "Days 3–6",
    "use": "Production DS interview THEMES (decomposition, validation, pipelines). Inspired the Data Logic / Reasoning ladder and parts of Python Production Scripting — not Product Analytics. Use after you can decompose a Stripe prompt unaided."
  },
  {
    "name": "sernur / probability_stats interview questions",
    "url": "https://github.com/sernur/probability_stats_interveiw_questions",
    "day": "Days 5–6",
    "use": "Probability / MLE / Bernoulli question STYLE, rewritten here as payment-success and dispute-rate problems. Will map to the Statistics / MLE ladder (later turn)."
  },
  {
    "name": "Causal Inference for the Brave and True",
    "url": "https://matheusfacure.github.io/python-causality-handbook/",
    "day": "Days 5–6",
    "use": "ITT, difference-in-differences, selection bias THEMES, rewritten as Stripe rollout/experiment problems. Will map to the Experimentation & Causal ladder (later turn)."
  }
];

/** External resource name -> internal Gym filter (source / mode / ladder). */
export const RESOURCE_MAP: Record<string, ResourceMapping> = {
  "SQLBolt": {
    "source": "SQLBolt-style"
  },
  "PostgreSQL Exercises": {
    "source": "pgexercises-style"
  },
  "DataLemur": {
    "source": "DataLemur-style"
  },
  "Mode SQL Tutorial": {
    "source": "Mode-style"
  },
  "WindowFunctions.com": {
    "source": "WindowFunctions-style",
    "concept": "windows"
  },
  "Stripe Sigma docs": {
    "source": "Sigma-style"
  },
  "Stripe transactional data docs": {
    "source": "StripeAPI-style"
  },
  "StrataScratch (free tier)": {
    "source": "StrataScratch-style"
  },
  "Community SQL interview repos (GitHub)": {
    "source": "GitHub-repo-style"
  },
  "stripe-interview / python-interview-prep": {
    "mode": "Python",
    "label": "Python Production Scripting"
  },
  "alexeygrigorev / data-science-interviews": {
    "ladder": "logic",
    "label": "Problem Solving & Data Logic"
  },
  "sernur / probability_stats interview questions": {
    "mode": "Statistics",
    "label": "Statistics / MLE"
  },
  "Causal Inference for the Brave and True": {
    "mode": "Causal",
    "label": "Causal inference"
  }
};

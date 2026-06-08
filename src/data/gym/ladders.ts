import type { Ladder } from '@/types';

/* MIGRATED DATA — add a ladder here; its problemIds must resolve in gym/index.ts (integrity-tested). */
export const LADDERS: Ladder[] = [
  {
    "id": "cond",
    "title": "Conditional Aggregation",
    "category": "sql",
    "module": "m3",
    "concept": "case",
    "blurb": "Turn a 0/1 indicator into a rate. The denominator is everything.",
    "problemIds": [
      "ca1",
      "ca2",
      "ca3",
      "ca4",
      "ca5",
      "ca6",
      "ca7",
      "ca8"
    ]
  },
  {
    "id": "joins",
    "title": "Joins & Grain",
    "category": "sql",
    "module": "m4",
    "concept": "joins",
    "blurb": "Combine tables without fan-out; keep zero-activity rows.",
    "problemIds": [
      "jn1",
      "jn2",
      "jn3",
      "jn4",
      "jn5",
      "jn6",
      "jn7",
      "jn8"
    ]
  },
  {
    "id": "cte",
    "title": "CTEs & Subqueries",
    "category": "sql",
    "module": "m5",
    "concept": "cte",
    "blurb": "Break a metric into named steps; pre-aggregate refunds/disputes before joining to avoid fan-out.",
    "problemIds": [
      "ce1",
      "ce2",
      "ce3",
      "ce4",
      "ce5",
      "ce6",
      "ce7",
      "ce8"
    ]
  },
  {
    "id": "win",
    "title": "Window Functions",
    "category": "sql",
    "module": "m6",
    "concept": "windows",
    "blurb": "Keep row-level detail while comparing across rows: rank, LAG, running, dedup.",
    "problemIds": [
      "wn1",
      "wn2",
      "wn3",
      "wn4",
      "wn5",
      "wn6",
      "wn7",
      "wn8"
    ]
  },
  {
    "id": "dt",
    "title": "Date / Time Logic",
    "category": "sql",
    "module": "m7",
    "concept": "datetime",
    "blurb": "Calendar vs rolling windows, DATE_TRUNC buckets, and choosing the right timestamp.",
    "problemIds": [
      "dt1",
      "dt2",
      "dt3",
      "dt4",
      "dt5",
      "dt6",
      "dt7",
      "dt8"
    ]
  },
  {
    "id": "fun",
    "title": "Funnel Analysis",
    "category": "sql",
    "module": "m9",
    "concept": "funnel",
    "blurb": "Count distinct entities per step; name the denominator; apply a conversion window.",
    "problemIds": [
      "fu1",
      "fu2",
      "fu3",
      "fu4",
      "fu5",
      "fu6",
      "fu7",
      "fu8"
    ]
  },
  {
    "id": "rev",
    "title": "Revenue / Ledger",
    "category": "sql",
    "module": "m11",
    "concept": "revenue",
    "blurb": "GPV vs net vs MRR; the balance_transactions ledger is the source of truth.",
    "problemIds": [
      "rv1",
      "rv2",
      "rv3",
      "rv4",
      "rv5",
      "rv6",
      "rv7",
      "rv8"
    ]
  },
  {
    "id": "ref",
    "title": "Refunds / Disputes",
    "category": "sql",
    "module": "m12",
    "concept": "disputes",
    "blurb": "Refund vs dispute; denominator discipline; late-arriving data.",
    "problemIds": [
      "rf1",
      "rf2",
      "rf3",
      "rf4",
      "rf5",
      "rf6",
      "rf7",
      "rf8"
    ]
  },
  {
    "id": "logic",
    "title": "Problem Solving & Data Logic",
    "category": "skill",
    "module": null,
    "concept": "reasoning",
    "blurb": "Decompose any data question before you code: input, output, grain, metric, denominator, approach, validation.",
    "problemIds": [
      "pl1",
      "pl2",
      "pl3",
      "pl4",
      "pl5",
      "pl6",
      "pl7",
      "pl8"
    ]
  },
  {
    "id": "py",
    "title": "Python Production Scripting",
    "category": "skill",
    "module": null,
    "concept": "python",
    "blurb": "Clean Python for data tasks with lists, dicts, loops and sets — no pandas assumed.",
    "problemIds": [
      "py1",
      "py2",
      "py3",
      "py4",
      "py5",
      "py6",
      "py7",
      "py8"
    ]
  },
  {
    "id": "pa",
    "title": "Product Analytics",
    "category": "skill",
    "module": null,
    "concept": "product",
    "blurb": "Investigate before you query: clarify, define the metric, segment, baseline, confounders, then recommend.",
    "problemIds": [
      "pa1",
      "pa2",
      "pa3",
      "pa4",
      "pa5",
      "pa6"
    ]
  },
  {
    "id": "exp",
    "title": "Experimentation & Causal",
    "category": "skill",
    "module": null,
    "concept": "causal",
    "blurb": "A/B design and causal inference: treatment/control, guardrails, peeking, ITT, diff-in-diff, selection bias.",
    "problemIds": [
      "exp1",
      "exp2",
      "exp3",
      "exp4",
      "exp5",
      "exp6"
    ]
  }
];

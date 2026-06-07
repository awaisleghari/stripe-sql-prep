import type { Rubric } from '@/types';

/* MIGRATED interview scoring rubrics. */
export const RUBRICS: Rubric[] = [
  {
    "id": "sql",
    "name": "SQL answer",
    "max": 14,
    "criteria": [
      {
        "c": "Metric definition",
        "two": "States exactly what's being measured before coding."
      },
      {
        "c": "Grain",
        "two": "Names the output grain: 'one row per ___'."
      },
      {
        "c": "Joins & keys",
        "two": "Correct keys; flags fan-out and aggregates the many-side first."
      },
      {
        "c": "Filters",
        "two": "Right window, status, and currency scoping; pending decision explicit."
      },
      {
        "c": "CTE structure",
        "two": "Layered, readable CTEs rather than one tangled block."
      },
      {
        "c": "Edge cases",
        "two": "Handles NULLs, dupes, integer division, multi-currency."
      },
      {
        "c": "Validation",
        "two": "Sanity-checks the result (range, totals, a known merchant)."
      }
    ]
  },
  {
    "id": "prod",
    "name": "Product analytics answer",
    "max": 12,
    "criteria": [
      {
        "c": "Problem decomposition",
        "two": "Breaks the vague ask into measurable sub-questions."
      },
      {
        "c": "Metric tree",
        "two": "Top metric → drivers (rate = numerator/denominator → segments)."
      },
      {
        "c": "Hypotheses",
        "two": "Offers plausible causes before touching data."
      },
      {
        "c": "Segmentation",
        "two": "Slices by merchant/country/method/time to localise the effect."
      },
      {
        "c": "Data needed",
        "two": "Names the tables, grain, and joins required."
      },
      {
        "c": "Recommendation",
        "two": "Ends with a clear action and its tradeoffs."
      }
    ]
  },
  {
    "id": "exp",
    "name": "Experimentation / stats answer",
    "max": 16,
    "criteria": [
      {
        "c": "Hypothesis",
        "two": "Crisp, directional, falsifiable."
      },
      {
        "c": "Unit of randomization",
        "two": "Names it (customer? merchant?) and matches the analysis unit."
      },
      {
        "c": "Treatment/control",
        "two": "Clean assignment; no leakage or contamination."
      },
      {
        "c": "Primary metric",
        "two": "One pre-registered primary; defined precisely."
      },
      {
        "c": "Guardrails",
        "two": "Names counter-metrics that must not regress."
      },
      {
        "c": "Power intuition",
        "two": "Reasons about effect size vs sample/runtime."
      },
      {
        "c": "Bias / confounding",
        "two": "Flags peeking, novelty, seasonality, network effects."
      },
      {
        "c": "Interpretation",
        "two": "Distinguishes statistical from practical significance."
      }
    ]
  },
  {
    "id": "comm",
    "name": "Communication",
    "max": 12,
    "criteria": [
      {
        "c": "Clarify",
        "two": "Asks the key clarifying question before coding."
      },
      {
        "c": "Define metric & grain",
        "two": "States both explicitly."
      },
      {
        "c": "Denominator discipline",
        "two": "Names the right base, not just the numerator."
      },
      {
        "c": "Tables & keys",
        "two": "Walks the join plan out loud."
      },
      {
        "c": "Build in steps",
        "two": "Narrates CTE-by-CTE rather than dumping a query."
      },
      {
        "c": "Edge cases + validation",
        "two": "Closes with ≥2 edge cases and a validation plan."
      }
    ]
  }
];

import type { Module } from '@/types';

/* MIGRATED learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m8: Module = {
  "id": "m8",
  "day": "Day 4",
  "badge": "advanced",
  "title": "Deduplication",
  "skill": "dedup",
  "bcolor": "volcano",
  "concept": "<p>Payments data is full of duplicates: client retries, idempotency replays, double webhook deliveries, and fan-out from joins. Before any metric, you often must collapse to one row per logical entity.</p>\n<p>The canonical pattern: number rows within each key by a tiebreaker, then keep number 1.</p>\n<div class=\"code\"><pre>ROW_NUMBER() OVER (PARTITION BY <span class=\"cm\">/*dup key*/</span> ORDER BY <span class=\"cm\">/*which to keep*/</span>) = 1</pre></div>\n<p>In Stripe, the dup key is often <code class=\"inline\">idempotency_key</code> (CloudDesk, merchant 107). \"Which to keep\" matters: latest by <code class=\"inline\">created_at</code>? the succeeded one over the failed retry? Be explicit — and always add a <strong>deterministic tiebreaker</strong> (like <code class=\"inline\">charge_id</code>) so the result is reproducible.</p>",
  "sqlPattern": "SELECT *\nFROM (\n  SELECT c.*,\n    ROW_NUMBER() OVER (PARTITION BY idempotency_key ORDER BY created_at) AS rn\n  FROM charges c\n) t\nWHERE rn = 1;",
  "schemaRefs": [
    "charges"
  ],
  "pysupport": "# keep the latest row per idempotency_key\nlatest = {}\nfor c in sorted(charges, key=lambda c: c[\"created_at\"]):\n    latest[c[\"idempotency_key\"]] = c        # last write wins\ndeduped = list(latest.values())",
  "reasoning": {
    "question": "\"Keep one logical record per key before counting — e.g. one row per idempotency_key.\"",
    "grain": "One row per logical entity (the dedup key) — not per raw row.",
    "included": "The single chosen (\"kept\") row per key, selected by an explicit rule.",
    "excluded": "Duplicate retries and replayed webhooks for the same key.",
    "table": "<code class=\"inline\">charges</code>, deduplicated on <code class=\"inline\">idempotency_key</code>.",
    "metric": "Whatever you then count or sum — but only after deduping.",
    "denom": "<code class=\"inline\">COUNT(DISTINCT idempotency_key)</code> for the true number of attempts.",
    "wrong": "<code class=\"inline\">DISTINCT</code> can't \"keep the latest\"; no deterministic tiebreaker; lumping all NULL keys into one group.",
    "validate": "Deduped totals are ≤ the naive totals; CloudDesk (our replay merchant) shrinks."
  },
  "predicts": [
    {
      "prompt": "CloudDesk retried a payment 3 times under one idempotency_key (1 succeeded, 2 failed). You GROUP BY merchant and SUM(amount) on succeeded only. Is that deduped?",
      "query": "SELECT merchant_id, SUM(amount)\nFROM charges\nWHERE merchant_id=107 AND status='succeeded'\nGROUP BY merchant_id;",
      "options": [
        "Yes, fully deduped",
        "Only if each idempotency_key had exactly one succeeded row — otherwise you may double-count",
        "No, it's always wrong",
        "It errors"
      ],
      "answer": 1,
      "explain": "Filtering to succeeded helps, but if a retry storm produced TWO succeeded rows for one idempotency_key (e.g. a webhook replay), you'd still double-count. True dedup keys on idempotency_key and keeps one row."
    }
  ],
  "debugs": [
    {
      "prompt": "Keep one row per idempotency_key (the latest). This returns duplicates anyway.",
      "broken": "SELECT DISTINCT idempotency_key, charge_id, amount, created_at\nFROM charges\nWHERE merchant_id = 107;",
      "hint": "DISTINCT dedups on ALL selected columns, not just the key — different charge_ids make rows 'distinct'.",
      "fixed": "SELECT idempotency_key, charge_id, amount, created_at\nFROM (\n  SELECT *, ROW_NUMBER() OVER (\n           PARTITION BY idempotency_key\n           ORDER BY created_at DESC, charge_id DESC) AS rn\n  FROM charges\n  WHERE merchant_id = 107\n) t\nWHERE rn = 1;",
      "why": "<code class='inline'>DISTINCT</code> can't 'keep the latest' — it just removes wholly identical rows. ROW_NUMBER lets you define the key AND the keep-rule."
    }
  ],
  "exercises": [
    {
      "id": "m8e1",
      "lvl": 1,
      "priority": "required",
      "title": "Latest row per key",
      "prompt": "For merchant 107, keep one row per <code class='inline'>idempotency_key</code> — the most recent. Return idempotency_key, charge_id, status.",
      "hints": [
        "ROW_NUMBER partitioned by idempotency_key, ordered created_at DESC.",
        "Filter rn=1 in an outer query."
      ],
      "solution": "SELECT idempotency_key, charge_id, status\nFROM (\n  SELECT *, ROW_NUMBER() OVER (\n           PARTITION BY idempotency_key\n           ORDER BY created_at DESC, charge_id DESC) rn\n  FROM charges WHERE merchant_id=107\n) t\nWHERE rn=1;"
    },
    {
      "id": "m8e2",
      "lvl": 2,
      "priority": "required",
      "title": "Count true unique attempts",
      "prompt": "For merchant 107, count distinct logical payment attempts (one per idempotency_key), and how many of those ultimately succeeded.",
      "hints": [
        "COUNT(DISTINCT idempotency_key) for attempts.",
        "For 'ultimately succeeded': dedup keeping the best status, then count succeeded — or use a bool_or."
      ],
      "solution": "SELECT COUNT(*) AS unique_attempts,\n       COUNT(*) FILTER (WHERE ever_succeeded) AS succeeded_attempts\nFROM (\n  SELECT idempotency_key,\n         bool_or(status='succeeded') AS ever_succeeded\n  FROM charges\n  WHERE merchant_id=107\n  GROUP BY idempotency_key\n) t;"
    },
    {
      "id": "m8e3",
      "lvl": 3,
      "priority": "should",
      "title": "Deduped GPV",
      "prompt": "Compute merchant 107's true GPV (USD), counting each idempotency_key at most once and only if it ultimately succeeded. Use the succeeded row's amount.",
      "hints": [
        "Dedup to the succeeded row per key (rn=1 over succeeded rows).",
        "Then SUM that amount."
      ],
      "solution": "WITH dedup AS (\n  SELECT idempotency_key, amount,\n         ROW_NUMBER() OVER (PARTITION BY idempotency_key\n                            ORDER BY created_at DESC, charge_id DESC) rn\n  FROM charges\n  WHERE merchant_id=107 AND status='succeeded' AND currency='usd'\n)\nSELECT SUM(amount)/100.0 AS gpv_usd\nFROM dedup\nWHERE rn=1;"
    },
    {
      "id": "m8e4",
      "lvl": 4,
      "priority": "should",
      "title": "Edge-heavy dedup",
      "prompt": "Across the WHOLE platform, find idempotency_keys that produced MORE THAN ONE succeeded charge (a replay bug). Return idempotency_key, merchant_id, n_succeeded, total double-counted dollars.",
      "hints": [
        "GROUP BY key, count succeeded rows, HAVING > 1.",
        "Double-counted = (n-1) × amount, roughly — define it."
      ],
      "solution": "SELECT idempotency_key,\n       MIN(merchant_id) AS merchant_id,\n       COUNT(*) AS n_succeeded,\n       (COUNT(*) - 1) * MIN(amount) / 100.0 AS overcount_usd\nFROM charges\nWHERE status='succeeded'\n  AND idempotency_key IS NOT NULL\nGROUP BY idempotency_key\nHAVING COUNT(*) > 1\nORDER BY overcount_usd DESC;"
    },
    {
      "id": "m8e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final-boss (timed 8 min): clean charges view",
      "prompt": "Produce a 'clean charges' result deduped to one logical row per idempotency_key (preferring a succeeded row, else latest), keeping keyless rows untouched, then report clean succeeded count and clean USD GPV per merchant. Defend every keep-rule.",
      "hints": [
        "Order the ROW_NUMBER by status preference first, then recency.",
        "Handle NULL idempotency_key separately (UNION ALL) so they aren't all collapsed."
      ],
      "solution": "WITH ranked AS (\n  SELECT *,\n         ROW_NUMBER() OVER (\n           PARTITION BY idempotency_key\n           ORDER BY (status='succeeded') DESC,   -- prefer a succeeded row\n                    created_at DESC, charge_id DESC) AS rn\n  FROM charges\n  WHERE idempotency_key IS NOT NULL\n),\nclean AS (\n  SELECT * FROM ranked WHERE rn = 1\n  UNION ALL\n  SELECT *, 1 AS rn FROM charges WHERE idempotency_key IS NULL  -- keep keyless rows as-is\n)\nSELECT merchant_id,\n       COUNT(*) FILTER (WHERE status='succeeded') AS clean_succeeded,\n       SUM(amount) FILTER (WHERE status='succeeded' AND currency='usd')/100.0 AS clean_gpv_usd\nFROM clean\nGROUP BY merchant_id\nORDER BY clean_gpv_usd DESC NULLS LAST;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "Why does payments data usually need deduplication before summing?",
      "options": [
        "For speed only",
        "Retries and duplicate webhook deliveries create duplicate rows that double-count",
        "SQL requires it syntactically",
        "To sort the output"
      ],
      "answer": 1,
      "why": "Idempotency retries and replays produce duplicate rows; sum them and you overstate volume.",
      "concept": "why dedup"
    },
    {
      "level": 1,
      "q": "Best tool to keep \"the latest row per key\":",
      "options": [
        "DISTINCT",
        "ROW_NUMBER() = 1 with an ORDER BY",
        "GROUP BY key",
        "LIMIT 1"
      ],
      "answer": 1,
      "why": "ROW_NUMBER lets you define both the dedup key and the keep-rule. DISTINCT can't 'keep latest'.",
      "concept": "row_number dedup"
    },
    {
      "level": 2,
      "q": "Dedup to one logical attempt per retry — PARTITION BY which column?",
      "options": [
        "charge_id",
        "idempotency_key",
        "merchant_id",
        "created_at"
      ],
      "answer": 1,
      "why": "charge_id is already unique; the logical dup key is idempotency_key.",
      "concept": "dup key"
    },
    {
      "level": 3,
      "q": "GROUP BY idempotency_key when some keys are NULL:",
      "options": [
        "Errors out",
        "Treats each NULL as its own group",
        "Lumps ALL NULL keys into one group",
        "Silently ignores NULL rows"
      ],
      "answer": 2,
      "why": "GROUP BY collapses all NULLs together — usually wrong for dedup; handle keyless rows separately.",
      "concept": "NULL grouping"
    },
    {
      "level": 5,
      "q": "Two succeeded rows share an idempotency_key but have different amounts. Safest approach:",
      "options": [
        "Pick one at random",
        "State a business keep-rule (prefer succeeded, then latest, charge_id tiebreaker) and disclose the amount conflict",
        "Sum both amounts",
        "Drop both rows"
      ],
      "answer": 1,
      "why": "A reproducible result needs a total order and an explicit, defended keep-rule.",
      "concept": "deterministic keep-rule"
    }
  ],
  "mistakes": [
    "Using DISTINCT to 'keep the latest' (it can't).",
    "No deterministic tiebreaker → non-reproducible results.",
    "Grouping NULL keys into one bucket.",
    "Deduping on the wrong grain (charge_id is already unique — dedup on the LOGICAL key)."
  ],
  "edges": [
    "A correct keep-rule needs a total order: created_at DESC, then a unique tiebreaker.",
    "Keyless (NULL) rows must be handled separately, not lumped together."
  ],
  "interview": "<p>Say: <em>\"Payments retry, so I'll dedup to one logical attempt per idempotency_key before any sum. My keep-rule prefers a succeeded row, then the latest, with charge_id as a deterministic tiebreaker. Keyless legacy rows I keep as-is. I'd validate by confirming deduped GPV is at or below the naive sum and that CloudDesk — our known replay merchant — shrinks.\"</em></p>",
  "followup": {
    "prompt": "PM: \"Where do these duplicate succeeded rows even come from?\"",
    "answer": "Usually duplicate webhook deliveries or a client retry that didn't reuse the idempotency_key. The fix upstream is enforcing idempotency keys; downstream, every metric query should dedup defensively. This is why production Stripe analytics almost always starts from a deduped 'clean charges' CTE."
  }
};

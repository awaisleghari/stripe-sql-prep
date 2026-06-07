import type { Module } from '@/types';

/* MIGRATED learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m1: Module = {
  "id": "m1",
  "day": "Day 1",
  "badge": "beginner",
  "title": "SELECT · WHERE · ORDER BY · LIMIT",
  "skill": "select",
  "bcolor": "blue",
  "concept": "<p>The four clauses that filter and shape a single table. <code class=\"inline\">WHERE</code> keeps rows that match a condition. Conditions combine with <code class=\"inline\">AND</code> / <code class=\"inline\">OR</code> (mind precedence — <code class=\"inline\">AND</code> binds tighter, so parenthesise). Useful predicates: <code class=\"inline\">IN (...)</code>, <code class=\"inline\">BETWEEN a AND b</code>, <code class=\"inline\">LIKE 'pat%'</code>, and <code class=\"inline\">IS NULL</code>.</p>\n<p><strong>NULL is not a value — it's \"unknown.\"</strong> <code class=\"inline\">x = NULL</code> is never true; <code class=\"inline\">x &lt;&gt; 'failed'</code> silently drops NULL rows. This is the #1 source of wrong Stripe answers (e.g. <code class=\"inline\">failure_code</code> is NULL on succeeded charges).</p>",
  "sqlPattern": "SELECT charge_id, amount, created_at\nFROM charges\nWHERE status = 'succeeded' AND amount > 5000\nORDER BY created_at DESC\nLIMIT 10;",
  "schemaRefs": [
    "charges"
  ],
  "pysupport": "# WHERE merchant=101 AND method='card' AND status='failed'\nresult = [c for c in charges\n          if c[\"merchant_id\"] == 101\n          and c[\"payment_method\"] == \"card\"\n          and c[\"status\"] == \"failed\"]\n# ORDER BY created_at DESC, then LIMIT 10\nresult.sort(key=lambda c: c[\"created_at\"], reverse=True)\nresult = result[:10]",
  "reasoning": {
    "question": "\"Show the 10 newest failed card charges for one merchant.\"",
    "grain": "One row per charge.",
    "included": "Charges matching every filter: merchant 101, method = card, status = failed.",
    "excluded": "Other merchants, non-card methods, and succeeded/pending charges.",
    "table": "<code class=\"inline\">charges</code> — one row per payment attempt.",
    "metric": "No aggregation here — we are selecting and ordering rows, not computing a rate.",
    "denom": "Not applicable (row-level query), but note NULL <code class=\"inline\">failure_code</code> on succeeded charges breaks naive inequalities.",
    "wrong": "<code class=\"inline\">&lt;&gt;</code>/<code class=\"inline\">NOT IN</code> silently dropping NULL rows; ORDER BY placed after LIMIT; missing parentheses around an OR group.",
    "validate": "At most 10 rows, newest first, and every row truly matches all filters."
  },
  "predicts": [
    {
      "prompt": "<code class='inline'>failure_code</code> is NULL for succeeded charges. What does this return?",
      "query": "SELECT COUNT(*)\nFROM charges\nWHERE failure_code <> 'card_declined';",
      "options": [
        "All charges except card_declined ones",
        "Only failed charges that aren't card_declined — NULL (succeeded) rows are EXCLUDED",
        "Succeeded + failed non-declines",
        "An error"
      ],
      "answer": 1,
      "explain": "<code class='inline'>NULL &lt;&gt; 'card_declined'</code> evaluates to NULL (not true), so every succeeded charge is dropped. To keep them: <code class='inline'>failure_code IS DISTINCT FROM 'card_declined'</code> or add <code class='inline'>OR failure_code IS NULL</code>."
    },
    {
      "prompt": "charges has 6 rows for merchant 101 with statuses: succeeded, failed, failed, pending, succeeded, failed (no NULLs). What does this return?",
      "query": "SELECT COUNT(*) FROM charges\nWHERE merchant_id = 101 AND status <> 'succeeded';",
      "options": [
        "6",
        "4",
        "3",
        "2"
      ],
      "answer": 1,
      "explain": "<> 'succeeded' keeps the 3 failed + 1 pending = 4 rows. (Watch out: if any status were NULL, <> would silently drop it — there are none here.)"
    }
  ],
  "debugs": [
    {
      "prompt": "Find card charges that are either failed OR over $500. This returns too many rows.",
      "broken": "SELECT charge_id, status, amount\nFROM charges\nWHERE payment_method = 'card'\n  AND status = 'failed'\n  OR amount > 50000;",
      "hint": "AND binds tighter than OR. Read it as (A AND B) OR C.",
      "fixed": "SELECT charge_id, status, amount\nFROM charges\nWHERE payment_method = 'card'\n  AND (status = 'failed' OR amount > 50000);",
      "why": "Without parentheses, <code class='inline'>amount > 50000</code> matches across <em>all</em> payment methods, not just cards. Parenthesise the OR group."
    },
    {
      "title": "NOT IN with a NULL",
      "prompt": "This should list charges whose id is NOT in the flags table, but it returns nothing.",
      "broken": "SELECT charge_id FROM charges\nWHERE charge_id NOT IN (SELECT flagged_id FROM flags);",
      "hint": "What happens if flags.flagged_id contains even one NULL?",
      "fixed": "SELECT c.charge_id FROM charges c\nWHERE NOT EXISTS (\n  SELECT 1 FROM flags f WHERE f.flagged_id = c.charge_id\n);",
      "why": "If the subquery returns any NULL, NOT IN evaluates to UNKNOWN for every row → zero results. NOT EXISTS is NULL-safe and usually faster."
    }
  ],
  "exercises": [
    {
      "id": "m1e1",
      "lvl": 1,
      "priority": "required",
      "title": "Multiple conditions",
      "prompt": "Return failed <code class='inline'>card</code> charges for merchant 101: <code class='inline'>charge_id</code>, <code class='inline'>failure_code</code>, dollars.",
      "hints": [
        "Three ANDed conditions."
      ],
      "solution": "SELECT charge_id, failure_code, amount/100.0 AS amount_usd\nFROM charges\nWHERE merchant_id = 101\n  AND payment_method = 'card'\n  AND status = 'failed';"
    },
    {
      "id": "m1e2",
      "lvl": 2,
      "priority": "required",
      "title": "IN + BETWEEN",
      "prompt": "Return succeeded charges from the UK or Germany (<code class='inline'>card_country</code> in GB, DE) with amount between $10 and $100, newest 20 first.",
      "hints": [
        "<code class='inline'>card_country IN ('GB','DE')</code>.",
        "BETWEEN works on cents: 1000 AND 10000."
      ],
      "solution": "SELECT charge_id, card_country, amount/100.0 AS amount_usd, created_at\nFROM charges\nWHERE status = 'succeeded'\n  AND card_country IN ('GB','DE')\n  AND amount BETWEEN 1000 AND 10000\nORDER BY created_at DESC\nLIMIT 20;"
    },
    {
      "id": "m1e3",
      "lvl": 3,
      "priority": "should",
      "title": "NULL-safe exclusion",
      "prompt": "Count charges for merchant 101 whose failure_code is anything OTHER than <code class='inline'>insufficient_funds</code> — including succeeded charges (failure_code NULL).",
      "hints": [
        "A plain <code class='inline'>&lt;&gt;</code> drops NULLs.",
        "Use <code class='inline'>IS DISTINCT FROM</code>."
      ],
      "solution": "SELECT COUNT(*) AS n\nFROM charges\nWHERE merchant_id = 101\n  AND failure_code IS DISTINCT FROM 'insufficient_funds';"
    },
    {
      "id": "m1e4",
      "lvl": 4,
      "priority": "should",
      "title": "Edge-heavy filter",
      "prompt": "For merchant 101, return succeeded card charges in the last 7 days, excluding test emails (customer email ends in <code class='inline'>@test.com</code>) — but a join isn't allowed yet, so assume a <code class='inline'>charges.email</code> column exists. Handle NULL emails (real customers) so they are KEPT.",
      "hints": [
        "LIKE for the pattern; combine with IS NULL.",
        "Time window: created_at >= NOW() - INTERVAL '7 days'."
      ],
      "solution": "SELECT charge_id, amount/100.0 AS amount_usd\nFROM charges\nWHERE merchant_id = 101\n  AND status = 'succeeded'\n  AND payment_method = 'card'\n  AND created_at >= NOW() - INTERVAL '7 days'\n  AND (email NOT LIKE '%@test.com' OR email IS NULL);"
    },
    {
      "id": "m1e5",
      "lvl": 2,
      "priority": "should",
      "title": "Newest 5 high-value succeeded charges",
      "prompt": "Return the 5 most recent succeeded charges over $500 (50000 cents) for merchant 102: charge_id, amount (USD), created_at — newest first.",
      "hints": [
        "Filter on merchant, status and amount in WHERE.",
        "ORDER BY created_at DESC, then LIMIT 5."
      ],
      "solution": "SELECT charge_id, amount/100.0 AS amount_usd, created_at\nFROM charges\nWHERE merchant_id = 102 AND status='succeeded' AND amount > 50000\nORDER BY created_at DESC\nLIMIT 5;"
    },
    {
      "id": "m1e6",
      "lvl": 3,
      "priority": "should",
      "title": "Failed card charges missing a failure_code",
      "prompt": "Data-quality check: find failed charges paid by card that have no failure_code recorded. Return charge_id, merchant_id.",
      "hints": [
        "status='failed' AND payment_method='card'.",
        "Use IS NULL — never = NULL."
      ],
      "solution": "SELECT charge_id, merchant_id\nFROM charges\nWHERE status='failed' AND payment_method='card'\n  AND failure_code IS NULL;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "What is the output grain of: SELECT charge_id, amount FROM charges WHERE status='failed'?",
      "options": [
        "One row per merchant",
        "One row per failed charge",
        "A single total number",
        "One row per status"
      ],
      "answer": 1,
      "why": "No aggregation → the grain is the row level of the table: one row per failed charge.",
      "concept": "output grain"
    },
    {
      "level": 1,
      "q": "Which keeps rows whose failure_code is NOT 'card_declined', INCLUDING succeeded charges (NULL code)?",
      "options": [
        "failure_code <> 'card_declined'",
        "failure_code NOT IN ('card_declined')",
        "failure_code IS DISTINCT FROM 'card_declined'",
        "NOT (failure_code = 'card_declined')"
      ],
      "answer": 2,
      "why": "Plain <> / NOT IN drop NULL rows. IS DISTINCT FROM is the NULL-safe inequality.",
      "concept": "NULL-safe inequality"
    },
    {
      "level": 2,
      "q": "Succeeded charges from the UK or Germany — which predicate?",
      "options": [
        "card_country = 'GB' OR 'DE'",
        "card_country IN ('GB','DE')",
        "card_country BETWEEN 'GB' AND 'DE'",
        "card_country LIKE 'GB,DE'"
      ],
      "answer": 1,
      "why": "IN lists the set. 'GB' OR 'DE' is a bug ('DE' is always truthy).",
      "concept": "IN predicate"
    },
    {
      "level": 3,
      "q": "WHERE status NOT IN ('failed', NULL) returns what?",
      "options": [
        "All non-failed rows",
        "Zero rows — a NULL inside NOT IN nullifies the predicate",
        "Only NULL rows",
        "Succeeded rows only"
      ],
      "answer": 1,
      "why": "Any NULL in NOT IN makes the comparison NULL (not true) for every row. Use NOT EXISTS.",
      "concept": "NOT IN + NULL"
    },
    {
      "level": 5,
      "q": "Filtering charges \"in the last 7 days\" — most defensible approach?",
      "options": [
        "created_at > '2024-06-23' hard-coded",
        "created_at >= NOW() - INTERVAL '7 days', and clarify the reporting time zone",
        "LIMIT by row count",
        "WHERE created_at = 'last week'"
      ],
      "answer": 1,
      "why": "Relative intervals don't go stale; the time-zone caveat matters at day boundaries.",
      "concept": "relative window"
    }
  ],
  "mistakes": [
    "<code class='inline'>&lt;&gt;</code> / <code class='inline'>NOT IN</code> silently dropping NULL rows.",
    "Missing parentheses around OR groups.",
    "Hard-coding date strings instead of relative intervals."
  ],
  "edges": [
    "<code class='inline'>NOT IN (subquery)</code> returns zero rows if the subquery contains a single NULL — use NOT EXISTS.",
    "<code class='inline'>LIKE</code> is case-sensitive in Postgres; use <code class='inline'>ILIKE</code> for case-insensitive."
  ],
  "interview": "<p>Say it out loud: <em>\"Grain is one row per charge. My denominator/row-set is succeeded card charges in the trailing 7 days. I'm being NULL-careful on failure_code and email because succeeded charges have NULL failure codes.\"</em> Naming NULL handling unprompted signals seniority.</p>",
  "followup": {
    "prompt": "PM: \"Does this include pending charges?\"",
    "answer": "No — I filtered <code class='inline'>status='succeeded'</code>. Pending charges are in-flight authorizations; whether they belong in a 'volume' view depends on the metric. I'd clarify before including them."
  }
};

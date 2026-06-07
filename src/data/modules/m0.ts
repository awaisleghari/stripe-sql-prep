import type { Module } from '@/types';

/* MIGRATED learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m0: Module = {
  "id": "m0",
  "day": "Day 1",
  "badge": "beginner",
  "title": "SQL Mental Model from First Principles",
  "skill": "mindset",
  "bcolor": "blue",
  "concept": "<p><strong>A database is a set of tables.</strong> A table is a grid: each <em>row</em> is one record (one charge, one customer, one refund), and each <em>column</em> holds one kind of value with a fixed type — an amount, a status, a timestamp. That picture is all you need to start.</p>\n<p><strong>Every query begins the same way:</strong> <code class=\"inline\">SELECT</code> the columns you want <code class=\"inline\">FROM</code> a table. Add <code class=\"inline\">WHERE</code> to keep only rows that match a condition. Add <code class=\"inline\">GROUP BY</code> to fold many rows into one summary row per group, with totals like <code class=\"inline\">COUNT</code> or <code class=\"inline\">SUM</code>.</p>\n<p><strong>SQL is declarative.</strong> You don't write the step-by-step loop a program would use — you describe the result you want and the database plans how to produce it efficiently, even across hundreds of millions of rows. That's why SQL is the default language for large, structured business data like Stripe's.</p>\n<p><strong>What you type is not the order things run.</strong> The engine evaluates clauses in this logical order — memorise it, it explains most beginner bugs:</p>\n<p style=\"font-family:var(--mono);font-size:12.5px;background:var(--fill);padding:10px 12px;border-radius:6px;border:1px solid var(--border)\">FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</p>\n<p>So a name you invent in <code class=\"inline\">SELECT</code> can't be used back in <code class=\"inline\">WHERE</code> (WHERE already ran), and <code class=\"inline\">WHERE</code> filters individual rows while <code class=\"inline\">HAVING</code> filters whole groups.</p>\n<div class=\"callout tip\"><span class=\"t\">How to think before writing SQL</span>Don't start typing. First answer, in plain English: <em>what question am I answering, what does one output row represent (the grain), which rows count, which don't, which table holds the event, what's the metric and its denominator, what could make it wrong, and how will I check it?</em> The panel below walks every module through exactly these questions — that habit is the whole skill.</div>",
  "sqlPattern": "SELECT merchant_id, SUM(amount) AS gross\nFROM charges\nWHERE amount > 1000\nGROUP BY merchant_id;",
  "schemaRefs": [
    "charges"
  ],
  "pysupport": "# A table is just a list of records (dicts).\ncharges = [\n  {\"charge_id\": 1, \"merchant_id\": 101, \"amount\": 1250, \"status\": \"succeeded\"},\n  {\"charge_id\": 2, \"merchant_id\": 101, \"amount\": 600,  \"status\": \"failed\"},\n]\n# SELECT id FROM charges WHERE status = 'succeeded'\nrows = [{\"id\": c[\"charge_id\"]} for c in charges if c[\"status\"] == \"succeeded\"]",
  "reasoning": {
    "question": "Turn the request into a precise data question first. Example: \"Which merchants have the worst payment success rate?\"",
    "grain": "Decide what one output row represents — here, one row per merchant.",
    "included": "Decide which rows count — e.g. charge attempts in a chosen time window.",
    "excluded": "Decide which rows do NOT count — e.g. in-flight pending charges.",
    "table": "Find the table holding the event — <code class=\"inline\">charges</code> holds payment attempts.",
    "metric": "Define the metric in words — success rate = succeeded ÷ eligible attempts.",
    "denom": "Name the denominator out loud — all eligible attempts, not just the successes.",
    "wrong": "List what could break it — NULLs, duplicate rows, integer division, mixed currencies.",
    "validate": "Decide your check in advance — rates land in 0–1; a known-bad merchant should rank poorly."
  },
  "predicts": [
    {
      "prompt": "This query runs against <code class='inline'>charges</code>. WHERE runs before SELECT — so what happens?",
      "query": "SELECT merchant_id, amount/100.0 AS dollars\nFROM charges\nWHERE dollars > 50;",
      "options": [
        "Returns charges over $50",
        "Error: column \"dollars\" does not exist",
        "Returns all charges",
        "Returns charges where amount > 50 cents"
      ],
      "answer": 1,
      "explain": "WHERE is evaluated before SELECT, so the alias <code class='inline'>dollars</code> doesn't exist yet. You must repeat the expression: <code class='inline'>WHERE amount/100.0 > 50</code>, or wrap it in a subquery/CTE."
    }
  ],
  "debugs": [
    {
      "prompt": "A teammate wants the 5 most recent succeeded charges but gets a syntax error.",
      "broken": "SELECT charge_id, amount\nFROM charges\nWHERE status = 'succeeded'\nLIMIT 5\nORDER BY created_at DESC;",
      "hint": "Check the clause order against the logical-order line above. LIMIT is the very last thing that runs.",
      "fixed": "SELECT charge_id, amount\nFROM charges\nWHERE status = 'succeeded'\nORDER BY created_at DESC\nLIMIT 5;",
      "why": "<code class='inline'>ORDER BY</code> must come before <code class='inline'>LIMIT</code>. Otherwise you'd limit to an arbitrary 5 rows and <em>then</em> try to sort, which the parser rejects."
    }
  ],
  "exercises": [
    {
      "id": "m0e1",
      "lvl": 1,
      "priority": "required",
      "title": "Select specific columns",
      "prompt": "From <code class='inline'>charges</code>, return only <code class='inline'>charge_id</code>, <code class='inline'>merchant_id</code>, and <code class='inline'>amount</code>.",
      "hints": [
        "This is pure SELECT — no WHERE, no GROUP BY."
      ],
      "solution": "SELECT charge_id, merchant_id, amount\nFROM charges;"
    },
    {
      "id": "m0e2",
      "lvl": 2,
      "priority": "required",
      "title": "Convert cents to dollars",
      "prompt": "Return <code class='inline'>charge_id</code> and the amount in <strong>dollars</strong> (Stripe stores cents) as <code class='inline'>amount_usd</code>, for merchant 101 (Northwind Coffee).",
      "hints": [
        "Divide by 100.0 — the <code class='inline'>.0</code> forces float division.",
        "Filter with WHERE on merchant_id."
      ],
      "solution": "SELECT charge_id, amount / 100.0 AS amount_usd\nFROM charges\nWHERE merchant_id = 101;"
    },
    {
      "id": "m0e3",
      "lvl": 3,
      "priority": "should",
      "title": "Recent succeeded charges",
      "prompt": "Return the 10 most recent <strong>succeeded</strong> charges for merchant 101: <code class='inline'>charge_id</code>, dollars, and <code class='inline'>created_at</code>, newest first.",
      "hints": [
        "Filter status first.",
        "ORDER BY created_at DESC, then LIMIT 10."
      ],
      "solution": "SELECT charge_id, amount / 100.0 AS amount_usd, created_at\nFROM charges\nWHERE merchant_id = 101\n  AND status = 'succeeded'\nORDER BY created_at DESC\nLIMIT 10;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "SQL is \"declarative.\" What does that mean versus writing Python steps?",
      "options": [
        "You spell out the exact loop steps to run",
        "You describe the result you want and the engine plans the steps",
        "It always runs literally top-to-bottom",
        "It cannot filter rows"
      ],
      "answer": 1,
      "why": "You declare the desired result; the planner decides how to execute it. That's why clause order on the page ≠ execution order.",
      "concept": "declarative model"
    },
    {
      "level": 1,
      "q": "Which is the correct LOGICAL evaluation order?",
      "options": [
        "SELECT → FROM → WHERE → GROUP BY",
        "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT",
        "WHERE → FROM → SELECT → LIMIT",
        "ORDER BY → WHERE → GROUP BY → SELECT"
      ],
      "answer": 1,
      "why": "FROM/JOIN builds the rows, WHERE filters them, GROUP BY/HAVING aggregate, SELECT computes outputs, then ORDER BY and LIMIT.",
      "concept": "logical clause order"
    },
    {
      "level": 2,
      "q": "You want the 10 newest succeeded charges. Which is correct?",
      "options": [
        "… LIMIT 10 ORDER BY created_at DESC",
        "WHERE status='succeeded' … ORDER BY created_at DESC LIMIT 10",
        "WHERE status='succeeded' LIMIT 10",
        "SELECT TOP 10 … WHERE succeeded"
      ],
      "answer": 1,
      "why": "ORDER BY must precede LIMIT, and the status filter belongs in WHERE.",
      "concept": "order + limit"
    },
    {
      "level": 3,
      "q": "WHERE dollars > 50 fails when dollars is a SELECT alias for amount/100.0. Why?",
      "options": [
        "Aliases are illegal everywhere",
        "WHERE runs before SELECT, so the alias doesn't exist yet",
        "Division isn't allowed in WHERE",
        "It's just too slow"
      ],
      "answer": 1,
      "why": "WHERE is evaluated before SELECT. Repeat the expression (WHERE amount/100.0 > 50) or wrap it in a CTE.",
      "concept": "alias scope"
    },
    {
      "level": 5,
      "q": "An interviewer says \"show recent big charges.\" What matters MOST to clarify first?",
      "options": [
        "The output font",
        "The \"recent\" time window, the \"big\" amount threshold, and which currency",
        "Whether to use Postgres or MySQL",
        "Nothing — just start typing"
      ],
      "answer": 1,
      "why": "Definitions drive correctness: window, threshold, and currency (you can't compare cents across currencies).",
      "concept": "clarify ambiguity"
    }
  ],
  "mistakes": [
    "Assuming clauses run top-to-bottom. They don't — learn the logical order.",
    "Using a SELECT alias inside WHERE.",
    "Integer division on cents (<code class='inline'>amount/100</code>)."
  ],
  "edges": [
    "NULLs: <code class='inline'>amount = NULL</code> is never true in WHERE — use <code class='inline'>IS NULL</code>.",
    "Ties in ORDER BY produce non-deterministic order without a unique tiebreaker."
  ],
  "interview": "<p>Open by naming the grain: <em>\"The output is one row per charge.\"</em> Then state filters explicitly: <em>\"I'm restricting to merchant 101 and succeeded status.\"</em> If asked why you divide by 100.0, say: <em>\"Stripe amounts are in the currency's minor unit — cents for USD — and I use a float divisor to avoid integer truncation.\"</em></p>",
  "followup": {
    "prompt": "PM: \"Can you also show the customer's country next to each charge?\"",
    "answer": "That requires a JOIN to <code class='inline'>customers</code> on <code class='inline'>customer_id</code> — which we cover in M4. Flagging it now: the grain stays one row per charge as long as each charge maps to exactly one customer."
  }
};

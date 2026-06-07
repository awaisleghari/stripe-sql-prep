import type { Module } from '@/types';

/* MIGRATED learning module — full pedagogy (concept, predicts, debugs, exercises, 5-question quiz). */
export const m4: Module = {
  "id": "m4",
  "day": "Day 2",
  "badge": "intermediate",
  "title": "Joins: INNER · LEFT · Anti · Self",
  "skill": "joins",
  "bcolor": "gold",
  "concept": "<p>Joins combine tables on a key. <strong>INNER JOIN</strong> keeps only matched rows. <strong>LEFT JOIN</strong> keeps all left rows, filling NULLs where the right side has no match — essential when you must show entities with zero activity (a merchant with no refunds).</p>\n<p>An <strong>anti-join</strong> finds rows in A with <em>no</em> match in B: <code class=\"inline\">LEFT JOIN ... WHERE b.key IS NULL</code> (or <code class=\"inline\">NOT EXISTS</code>). A <strong>self-join</strong> joins a table to itself (e.g. comparing a charge to a later charge for the same customer).</p>\n<div class=\"callout warn\"><span class=\"t\">Fan-out (the silent killer)</span>If the right table has multiple matches per left key, the join <em>multiplies</em> left rows. Joining <code class=\"inline\">charges</code> to <code class=\"inline\">refunds</code> turns a 1-refund charge into 1 row but a 2-refund charge into 2 rows — and now <code class=\"inline\">SUM(amount)</code> double-counts. Aggregate the \"many\" side first, or COUNT(DISTINCT).</div>",
  "sqlPattern": "SELECT m.merchant_id, COUNT(c.charge_id) AS succeeded\nFROM merchants m\nLEFT JOIN charges c\n  ON c.merchant_id = m.merchant_id AND c.status = 'succeeded'\nGROUP BY m.merchant_id;",
  "schemaRefs": [
    "charges",
    "refunds",
    "customers",
    "merchants"
  ],
  "pysupport": "# JOIN = look up related rows by key\ncust_by_id = {cu[\"customer_id\"]: cu for cu in customers}\nfor c in charges:\n    cu = cust_by_id.get(c[\"customer_id\"])     # None = no match (LEFT JOIN)\n    c[\"country\"] = cu[\"country\"] if cu else None",
  "reasoning": {
    "question": "\"Attach related facts across tables — each charge's customer, or each merchant's refund count.\"",
    "grain": "Choose the output grain first; a LEFT JOIN preserves the left table's grain.",
    "included": "With LEFT JOIN, all left rows survive — so merchants with zero activity still appear.",
    "excluded": "With INNER JOIN, unmatched rows drop — which silently loses zero-activity merchants.",
    "table": "Join on shared keys: <code class=\"inline\">charges.customer_id = customers.customer_id</code>; <code class=\"inline\">refunds.charge_id = charges.charge_id</code>.",
    "metric": "Whatever you aggregate after joining — but remember the join may have changed the row count.",
    "denom": "If it's a rate, confirm fan-out didn't inflate the denominator (aggregate the many-side first).",
    "wrong": "Fan-out from a one-to-many join; a WHERE on the right table turning LEFT into INNER; <code class=\"inline\">NOT IN</code> with NULLs returning nothing.",
    "validate": "Row count matches the intended grain; zero-activity entities are present; sums aren't doubled."
  },
  "predicts": [
    {
      "prompt": "A charge has 0, 1, or 2 refunds. After <code class='inline'>charges LEFT JOIN refunds</code>, how many rows for a charge with 2 refunds?",
      "query": "SELECT c.charge_id, r.refund_id\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nWHERE c.charge_id = 88002;",
      "options": [
        "1 row",
        "2 rows (one per refund) — fan-out",
        "0 rows",
        "3 rows"
      ],
      "answer": 1,
      "explain": "LEFT JOIN produces one output row per matching right row. Two refunds → two rows. Any <code class='inline'>SUM(c.amount)</code> would now double the charge amount. This is fan-out."
    },
    {
      "prompt": "charges has 3 rows for customer 7; customers has exactly 1 row for id 7. How many rows does this return?",
      "query": "SELECT COUNT(*)\nFROM charges c\nJOIN customers cu ON cu.customer_id = c.customer_id\nWHERE c.customer_id = 7;",
      "options": [
        "1",
        "3",
        "4",
        "0"
      ],
      "answer": 1,
      "explain": "Each of the 3 charges matches the single customer row → 3 rows. The join doesn't multiply because the customer side has just one match (3 × 1)."
    },
    {
      "prompt": "Charge 500 is $100 and has 2 refund rows. After LEFT JOIN to refunds, what does SUM(c.amount) give for it?",
      "query": "SELECT SUM(c.amount)/100.0 AS total\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nWHERE c.charge_id = 500;",
      "options": [
        "$100",
        "$200",
        "$0",
        "NULL"
      ],
      "answer": 1,
      "explain": "Fan-out: the join produced 2 rows for the charge, so SUM(c.amount) counts $100 twice → $200. Pre-aggregate the charge side to avoid this."
    }
  ],
  "debugs": [
    {
      "prompt": "Goal: total gross volume per merchant, plus their refund count. The gross numbers are inflated.",
      "broken": "SELECT c.merchant_id,\n       SUM(c.amount) AS gross,\n       COUNT(r.refund_id) AS refunds\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id;",
      "hint": "Each refund duplicates its charge row, so SUM(c.amount) counts the charge once per refund.",
      "fixed": "WITH g AS (\n  SELECT merchant_id, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded'\n  GROUP BY merchant_id\n),\nref AS (\n  SELECT c.merchant_id, COUNT(*) AS refunds\n  FROM refunds r JOIN charges c ON c.charge_id=r.charge_id\n  GROUP BY c.merchant_id\n)\nSELECT g.merchant_id, g.gross, COALESCE(ref.refunds,0) AS refunds\nFROM g LEFT JOIN ref USING (merchant_id);",
      "why": "Aggregate each side to the merchant grain <em>before</em> joining, so neither metric fans out the other. <code class='inline'>COALESCE</code> turns 'no refunds' into 0 instead of NULL."
    },
    {
      "title": "WHERE turns LEFT into INNER",
      "prompt": "Intended: every merchant with their succeeded-charge count, including zeros. Merchants with no succeeded charges disappear.",
      "broken": "SELECT m.merchant_id, COUNT(c.charge_id) AS n\nFROM merchants m\nLEFT JOIN charges c ON c.merchant_id = m.merchant_id\nWHERE c.status = 'succeeded'\nGROUP BY m.merchant_id;",
      "hint": "A predicate on the right table in WHERE removes the unmatched NULL rows.",
      "fixed": "SELECT m.merchant_id, COUNT(c.charge_id) AS n\nFROM merchants m\nLEFT JOIN charges c\n  ON c.merchant_id = m.merchant_id AND c.status = 'succeeded'\nGROUP BY m.merchant_id;",
      "why": "WHERE c.status='succeeded' drops rows where c.* is NULL (no match) → the LEFT JOIN collapses to INNER. Move the filter into the ON clause."
    },
    {
      "title": "refund fan-out inflates GPV",
      "prompt": "Intended: per-merchant succeeded GPV. Merchants with many refunds show inflated GPV.",
      "broken": "SELECT c.merchant_id, SUM(c.amount)/100.0 AS gpv\nFROM charges c\nLEFT JOIN refunds r ON r.charge_id = c.charge_id\nWHERE c.status='succeeded'\nGROUP BY c.merchant_id;",
      "hint": "How many rows does a charge with 2 refunds produce after the join?",
      "fixed": "SELECT merchant_id, SUM(amount)/100.0 AS gpv\nFROM charges\nWHERE status='succeeded'\nGROUP BY merchant_id;",
      "why": "The refunds join multiplies each charge by its refund count, so SUM(amount) double-counts. GPV doesn't need refunds at all — drop the join (or pre-aggregate each side)."
    }
  ],
  "exercises": [
    {
      "id": "m4e1",
      "lvl": 1,
      "priority": "required",
      "title": "INNER join basics",
      "prompt": "Return charge_id, the customer's <code class='inline'>email</code> and <code class='inline'>country</code>, for merchant 101's succeeded charges.",
      "hints": [
        "Join charges to customers on customer_id."
      ],
      "solution": "SELECT c.charge_id, cu.email, cu.country\nFROM charges c\nJOIN customers cu ON cu.customer_id = c.customer_id\nWHERE c.merchant_id = 101 AND c.status='succeeded';"
    },
    {
      "id": "m4e2",
      "lvl": 2,
      "priority": "required",
      "title": "LEFT join to keep zeros",
      "prompt": "List every merchant and their count of succeeded charges, INCLUDING merchants with zero. One row per merchant.",
      "hints": [
        "Start FROM merchants, LEFT JOIN charges.",
        "Filter succeeded inside the join condition, not WHERE, or you'll drop the zero-merchants."
      ],
      "solution": "SELECT m.merchant_id, m.name,\n       COUNT(c.charge_id) AS succeeded_charges\nFROM merchants m\nLEFT JOIN charges c\n  ON c.merchant_id = m.merchant_id\n AND c.status = 'succeeded'\nGROUP BY m.merchant_id, m.name\nORDER BY succeeded_charges DESC;"
    },
    {
      "id": "m4e3",
      "lvl": 3,
      "priority": "should",
      "title": "Anti-join: customers who never paid",
      "prompt": "Find customers of merchant 105 (StreamBox) who have NEVER had a succeeded charge.",
      "hints": [
        "NOT EXISTS is NULL-safe; NOT IN is risky.",
        "Correlate on customer_id."
      ],
      "solution": "SELECT cu.customer_id, cu.email\nFROM customers cu\nWHERE cu.merchant_id = 105\n  AND NOT EXISTS (\n    SELECT 1 FROM charges c\n    WHERE c.customer_id = cu.customer_id\n      AND c.status = 'succeeded'\n  );"
    },
    {
      "id": "m4e4",
      "lvl": 4,
      "priority": "should",
      "title": "Self-join: repeat purchasers",
      "prompt": "For merchant 102, find customers who made a second succeeded charge within 7 days of their first. Return customer_id, first_at, second_at.",
      "hints": [
        "Join charges to itself on customer_id where the second is later.",
        "Constrain the gap with an interval; pick the earliest pair."
      ],
      "solution": "WITH s AS (\n  SELECT customer_id, charge_id, created_at\n  FROM charges\n  WHERE merchant_id = 102 AND status='succeeded'\n)\nSELECT a.customer_id,\n       a.created_at AS first_at,\n       b.created_at AS second_at\nFROM s a\nJOIN s b\n  ON b.customer_id = a.customer_id\n AND b.created_at > a.created_at\n AND b.created_at <= a.created_at + INTERVAL '7 days'\n AND b.charge_id <> a.charge_id;"
    },
    {
      "id": "m4e5",
      "lvl": 2,
      "priority": "should",
      "title": "Enrich charges with customer country",
      "prompt": "For merchant 106's succeeded charges, return charge_id, amount (USD), and the customer's country.",
      "hints": [
        "JOIN customers on customer_id."
      ],
      "solution": "SELECT c.charge_id, c.amount/100.0 AS amount_usd, cu.country\nFROM charges c\nJOIN customers cu ON cu.customer_id = c.customer_id\nWHERE c.merchant_id = 106 AND c.status='succeeded';"
    },
    {
      "id": "m4e6",
      "lvl": 3,
      "priority": "should",
      "title": "Customers never refunded",
      "prompt": "List merchant 102 customers who have at least one succeeded charge but have never had any refund. Return customer_id.",
      "hints": [
        "EXISTS for 'has a succeeded charge'.",
        "NOT EXISTS over ALL their charges for 'never refunded'."
      ],
      "solution": "SELECT cu.customer_id\nFROM customers cu\nWHERE cu.merchant_id = 102\n  AND EXISTS (\n    SELECT 1 FROM charges c\n    WHERE c.customer_id = cu.customer_id AND c.status='succeeded')\n  AND NOT EXISTS (\n    SELECT 1 FROM refunds r\n    JOIN charges c ON c.charge_id = r.charge_id\n    WHERE c.customer_id = cu.customer_id);"
    },
    {
      "id": "m4e7",
      "lvl": 4,
      "priority": "stretch",
      "title": "Scorecard: GPV + refunds without fan-out",
      "prompt": "Per merchant: succeeded USD GPV and refund count, including merchants with zero refunds, with no double counting.",
      "hints": [
        "Aggregate GPV and refunds in separate CTEs at merchant grain.",
        "LEFT JOIN them; COALESCE refunds to 0."
      ],
      "solution": "WITH g AS (\n  SELECT merchant_id, SUM(amount) AS gross\n  FROM charges WHERE status='succeeded' AND currency='USD'\n  GROUP BY merchant_id),\nr AS (\n  SELECT c.merchant_id, COUNT(*) AS refunds\n  FROM refunds rf JOIN charges c ON c.charge_id = rf.charge_id\n  GROUP BY c.merchant_id)\nSELECT g.merchant_id, g.gross/100.0 AS gpv_usd, COALESCE(r.refunds,0) AS refunds\nFROM g LEFT JOIN r USING (merchant_id)\nORDER BY gpv_usd DESC;"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "To show merchants with ZERO charges in the result, you need:",
      "options": [
        "INNER JOIN",
        "LEFT JOIN from merchants (status filter in ON)",
        "RIGHT JOIN charges",
        "WHERE charges IS NULL"
      ],
      "answer": 1,
      "why": "LEFT JOIN keeps all merchants; the filter must sit in ON or it silently drops the zero-merchants.",
      "concept": "LEFT JOIN preserves"
    },
    {
      "level": 1,
      "q": "Safest way to find \"rows in A with no match in B\":",
      "options": [
        "NOT IN (subquery)",
        "NOT EXISTS, or LEFT JOIN … WHERE b.key IS NULL",
        "INNER JOIN",
        "EXCEPT only"
      ],
      "answer": 1,
      "why": "NOT EXISTS / anti-join is NULL-safe; NOT IN breaks on NULLs.",
      "concept": "anti-join"
    },
    {
      "level": 2,
      "q": "Attach each charge's customer email — which join condition?",
      "options": [
        "ON charges.merchant_id = customers.customer_id",
        "ON charges.customer_id = customers.customer_id",
        "ON charges.charge_id = customers.customer_id",
        "CROSS JOIN"
      ],
      "answer": 1,
      "why": "Join on the shared key: charges.customer_id = customers.customer_id.",
      "concept": "join key"
    },
    {
      "level": 3,
      "q": "Joining charges → refunds (1-to-many) before SUM(amount) causes:",
      "options": [
        "Nothing",
        "Under-counting",
        "Fan-out: the charge amount is duplicated per refund",
        "A syntax error"
      ],
      "answer": 2,
      "why": "Each refund duplicates its charge row, double-counting the amount. Aggregate the many-side first.",
      "concept": "fan-out"
    },
    {
      "level": 5,
      "q": "Report GPV + refund count + dispute count per merchant. Safest structure:",
      "options": [
        "Chain joins charges→refunds→disputes then SUM",
        "Aggregate GPV, refunds, and disputes each in its own merchant-grain CTE, then LEFT JOIN",
        "One big join with DISTINCT",
        "Subtract counts at the end"
      ],
      "answer": 1,
      "why": "Two 1-to-many joins fan out twice. Pre-aggregate each metric to merchant grain, then join.",
      "concept": "pre-aggregate"
    }
  ],
  "mistakes": [
    "Fan-out: joining a one-to-many table before aggregating.",
    "WHERE on the right table silently converting LEFT to INNER.",
    "NOT IN with NULLs returning nothing.",
    "COUNT(*) vs COUNT(right_col) when counting after a LEFT JOIN."
  ],
  "edges": [
    "<code class='inline'>USING (col)</code> requires identical column names and merges them into one output column.",
    "Self-joins need a strict inequality (<code class='inline'>b.created_at &gt; a.created_at</code>) to avoid duplicate/mirror pairs."
  ],
  "interview": "<p>Always state the join plan: <em>\"Tables are charges and refunds, joined on charge_id. Because a charge can have multiple refunds, I'll aggregate refunds to the merchant grain first to avoid fan-out, then LEFT JOIN so merchants with no refunds still appear as 0.\"</em> Naming fan-out before it bites you is exactly what Stripe interviewers look for.</p>",
  "followup": {
    "prompt": "PM: \"Now add each merchant's dispute count too.\"",
    "answer": "Disputes are another one-to-many table, so I'd aggregate disputes to merchant grain in its own CTE and LEFT JOIN it alongside refunds — never join charges→refunds→disputes directly, or you'd fan out twice and corrupt both counts. That multi-CTE assembly is exactly M5."
  }
};

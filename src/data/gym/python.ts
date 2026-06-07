import type { Problem } from '@/types';

/* MIGRATED DATA — edit a problem here, then it is auto-included via src/data/gym/index.ts.
   Source of truth migrated from the original single-file app (Repo-2). */
export const pythonProblems: Problem[] = [
  {
    "id": "py1",
    "title": "Read list-of-dict charge records",
    "ladder": "py",
    "pos": 1,
    "stage": "Read list-of-dict records",
    "lvl": 0,
    "difficulty": "recognition",
    "priority": "required",
    "source": "python-interview-prep-style",
    "module": null,
    "mode": "Python",
    "timed": false,
    "est": "3 min",
    "business": "In a Python round you are handed transaction data as a list of dictionaries (parsed from JSON), not a SQL table.",
    "task": "This is a recognition drill — <b>no full solution needed</b>. Describe the shape of one charge record, the fields you would read for a success-rate task, and how you would iterate the list safely.",
    "prereq": "none — first rung",
    "harder": "First rung: get comfortable with the in-memory data shape before writing logic.",
    "teaches": "Python interview data is usually a list of dicts. Knowing the shape and reading fields with .get() (not bracket access) prevents KeyError crashes on messy rows.",
    "deliverable": "A plain-English description of the record shape and which fields you read, plus why you would use row.get('status') over row['status'].",
    "inputSpec": "<div class=\"prose\" style=\"font-size:13px\">A list of dicts, e.g.:</div><div class=\"code\"><button class=\"copy\" onclick=\"copySnip(0,this)\">Copy</button><pre>charges = [\n  {\"charge_id\": \"ch_1\", \"merchant_id\": \"m_101\", \"status\": \"succeeded\",\n   \"amount\": 4200, \"currency\": \"usd\", \"idempotency_key\": \"k1\", \"created_at\": 1717000000},\n  {\"charge_id\": \"ch_2\", \"merchant_id\": \"m_101\", \"status\": \"failed\",\n   \"amount\": 1500, \"currency\": \"usd\", \"idempotency_key\": \"k2\", \"created_at\": 1717000100},\n]</pre></div>",
    "prompt": "Describe one record's shape, name the fields you need for success rate, and explain how you iterate safely over a list of dicts.",
    "confusion": "row[\"status\"] raises KeyError if a record is missing that field; row.get(\"status\") returns None instead. Real event data has missing fields.",
    "hints": [
      "Each record is a dict; the list is the table.",
      "For success rate you need status and merchant_id.",
      "Prefer row.get(key) so a missing field does not crash the loop."
    ],
    "model": "Each record is a dict with keys like charge_id, merchant_id, status, amount, currency, idempotency_key, created_at. For success rate you only need <span class=\"mono\">status</span> and <span class=\"mono\">merchant_id</span>. Iterate with <span class=\"mono\">for row in charges:</span> and read fields with <span class=\"mono\">row.get(\"status\")</span> so a missing key yields None instead of a KeyError.",
    "explain": "Say: \"The list is the table and each dict is a row. I will read status and merchant_id with .get() so a malformed record does not crash the loop.\"",
    "next": "py2"
  },
  {
    "id": "py2",
    "title": "Filter to succeeded charges",
    "ladder": "py",
    "pos": 2,
    "stage": "Filter records cleanly",
    "lvl": 1,
    "difficulty": "easy",
    "priority": "required",
    "source": "python-interview-prep-style",
    "module": null,
    "mode": "Python",
    "timed": false,
    "est": "4 min",
    "business": "Step one of most Python data tasks: cleanly select the records you care about.",
    "task": "Write a function that returns only the <b>succeeded</b> charges from a list of charge dicts.",
    "prereq": "py1 (record shape)",
    "harder": "You now write real syntax — a single clean filter — before any aggregation.",
    "teaches": "A list comprehension with a .get() guard is the clean, interview-friendly way to filter; it also tolerates missing fields.",
    "deliverable": "A small pure function returning the filtered list, plus one test.",
    "signature": "def succeeded(charges: list[dict]) -> list[dict]:\n    ...",
    "inputSpec": "<div class=\"prose\" style=\"font-size:13px\">A list of charge dicts, each with a <span class=\"mono\">status</span> key (sometimes missing).</div>",
    "prompt": "Implement <span class=\"mono\">succeeded(charges)</span> returning only rows whose status is exactly \"succeeded\".",
    "confusion": "Mutating the input list while iterating it (e.g. list.remove in a loop) skips elements. Build a new list instead.",
    "hints": [
      "A list comprehension reads cleanly: [c for c in charges if …].",
      "Use c.get('status') so a missing status does not crash.",
      "Return a NEW list; do not mutate the input."
    ],
    "solution": "def succeeded(charges):\n    return [c for c in charges if c.get(\"status\") == \"succeeded\"]",
    "tests": "def test_succeeded():\n    rows = [\n        {\"status\": \"succeeded\"}, {\"status\": \"failed\"},\n        {\"status\": \"succeeded\"}, {},  # missing status\n    ]\n    out = succeeded(rows)\n    assert len(out) == 2\n    assert all(c[\"status\"] == \"succeeded\" for c in out)\n\ntest_succeeded()\nprint(\"ok\")",
    "complexity": {
      "time": "O(n)",
      "memory": "O(k) for the k matches",
      "note": "One pass over the list; output holds only the matches."
    },
    "verify": {
      "grain": "Return value: a new list of the succeeded charge dicts.",
      "columns": [
        "(list of dicts)"
      ],
      "sample": {
        "cols": [
          "input statuses",
          "output length"
        ],
        "rows": [
          [
            "succeeded, failed, succeeded, (missing)",
            "2"
          ]
        ]
      },
      "commonWrong": [
        "c['status'] (KeyError on missing field) instead of c.get('status').",
        "Mutating the input list while looping over it."
      ],
      "validation": [
        "Output length ≤ input length.",
        "Every returned row has status == 'succeeded'."
      ],
      "edgeCases": [
        "A row with no status key must not crash.",
        "Empty input returns []."
      ],
      "checklist": [
        ".get() guard used",
        "new list returned",
        "handles missing status"
      ]
    },
    "explain": "Say: \"I filter with a comprehension and a .get() guard so missing fields return None and the loop never crashes; I return a new list rather than mutating the input.\"",
    "next": "py3"
  },
  {
    "id": "py3",
    "title": "Aggregate counts by merchant",
    "ladder": "py",
    "pos": 3,
    "stage": "Aggregate by merchant with dicts",
    "lvl": 2,
    "difficulty": "medium",
    "priority": "required",
    "source": "python-interview-prep-style",
    "module": null,
    "mode": "Python",
    "timed": false,
    "est": "5 min",
    "business": "You need per-merchant counts — the Python equivalent of GROUP BY merchant_id.",
    "task": "Write a function returning, per merchant, the number of <b>attempts</b> (all rows) and the number of <b>successes</b>, as a dict keyed by merchant_id.",
    "prereq": "py2 (filtering)",
    "harder": "You move from filtering to grouping: accumulating two counts per key in one pass.",
    "teaches": "A dict keyed by the group is the Python GROUP BY. Use dict.get(key, default) or setdefault to accumulate without KeyErrors.",
    "deliverable": "A function returning {merchant_id: {\"attempts\": int, \"successes\": int}} and one test.",
    "signature": "def by_merchant(charges: list[dict]) -> dict:\n    # -> {merchant_id: {\"attempts\": int, \"successes\": int}}\n    ...",
    "inputSpec": "<div class=\"prose\" style=\"font-size:13px\">A list of charge dicts with <span class=\"mono\">merchant_id</span> and <span class=\"mono\">status</span>.</div>",
    "prompt": "Implement <span class=\"mono\">by_merchant(charges)</span> accumulating attempts and successes per merchant in a single pass.",
    "confusion": "Counting successes as the denominator (or filtering to succeeded before counting attempts) is the classic bug — attempts must include failed and pending rows.",
    "hints": [
      "Initialise each merchant's bucket with setdefault(mid, {'attempts':0,'successes':0}).",
      "Increment attempts for every row, successes only when status == 'succeeded'.",
      "One pass over the list is enough — O(n)."
    ],
    "solution": "def by_merchant(charges):\n    out = {}\n    for c in charges:\n        mid = c.get(\"merchant_id\")\n        if mid is None:\n            continue\n        bucket = out.setdefault(mid, {\"attempts\": 0, \"successes\": 0})\n        bucket[\"attempts\"] += 1\n        if c.get(\"status\") == \"succeeded\":\n            bucket[\"successes\"] += 1\n    return out",
    "tests": "def test_by_merchant():\n    rows = [\n        {\"merchant_id\": \"a\", \"status\": \"succeeded\"},\n        {\"merchant_id\": \"a\", \"status\": \"failed\"},\n        {\"merchant_id\": \"b\", \"status\": \"succeeded\"},\n    ]\n    out = by_merchant(rows)\n    assert out[\"a\"] == {\"attempts\": 2, \"successes\": 1}\n    assert out[\"b\"] == {\"attempts\": 1, \"successes\": 1}\n\ntest_by_merchant()\nprint(\"ok\")",
    "complexity": {
      "time": "O(n)",
      "memory": "O(m) for m distinct merchants",
      "note": "Single pass; the dict holds one bucket per merchant."
    },
    "verify": {
      "grain": "Return value: dict merchant_id -> {attempts, successes}.",
      "columns": [
        "merchant_id (key)",
        "attempts",
        "successes"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "attempts",
          "successes"
        ],
        "rows": [
          [
            "a",
            "2",
            "1"
          ],
          [
            "b",
            "1",
            "1"
          ]
        ]
      },
      "commonWrong": [
        "Filtering to succeeded before counting attempts (denominator becomes successes).",
        "Forgetting to count rows with a missing/None status as attempts."
      ],
      "validation": [
        "successes <= attempts for every merchant.",
        "sum(attempts) == number of rows with a merchant_id."
      ],
      "edgeCases": [
        "Rows with no merchant_id are skipped.",
        "Empty input returns {}."
      ],
      "checklist": [
        "attempts counts ALL rows",
        "setdefault for safe init",
        "single pass"
      ]
    },
    "explain": "Say: \"I keep a dict keyed by merchant, increment attempts on every row and successes only on succeeded — that keeps the denominator honest in one pass.\"",
    "next": "py4"
  },
  {
    "id": "py4",
    "title": "Compute success rate safely",
    "ladder": "py",
    "pos": 4,
    "stage": "Compute success rate",
    "lvl": 2,
    "difficulty": "medium",
    "priority": "required",
    "source": "python-interview-prep-style",
    "module": null,
    "mode": "Python",
    "timed": false,
    "est": "5 min",
    "business": "Turn the per-merchant counts into the actual metric — success rate — safely.",
    "task": "Write a function returning <b>success rate</b> per merchant (successes ÷ attempts), guarding against division by zero.",
    "prereq": "py3 (dict aggregation)",
    "harder": "You compute a real rate, which forces float division and a divide-by-zero guard.",
    "teaches": "Rates need float division and a zero-denominator guard. In Python 3, / is already float; the real trap is attempts == 0.",
    "deliverable": "A function returning {merchant_id: rate_float} and one test covering the zero-attempts case.",
    "signature": "def success_rates(charges: list[dict]) -> dict:\n    # -> {merchant_id: float in [0, 1]}\n    ...",
    "inputSpec": "<div class=\"prose\" style=\"font-size:13px\">Reuse <span class=\"mono\">by_merchant</span> from the previous step (attempts + successes per merchant).</div>",
    "prompt": "Implement <span class=\"mono\">success_rates(charges)</span> = successes ÷ attempts per merchant, returning a float in [0,1]; skip or zero-guard merchants with no attempts.",
    "confusion": "In other languages successes // attempts (integer division) truncates 7/10 to 0. In Python, / is float — but attempts == 0 still raises ZeroDivisionError; guard it.",
    "hints": [
      "Build on by_merchant(charges).",
      "rate = successes / attempts — but only if attempts > 0.",
      "Decide: skip zero-attempt merchants, or report 0.0; state which."
    ],
    "solution": "def success_rates(charges):\n    counts = by_merchant(charges)\n    rates = {}\n    for mid, b in counts.items():\n        attempts = b[\"attempts\"]\n        rates[mid] = (b[\"successes\"] / attempts) if attempts > 0 else 0.0\n    return rates",
    "tests": "def test_success_rates():\n    rows = [\n        {\"merchant_id\": \"a\", \"status\": \"succeeded\"},\n        {\"merchant_id\": \"a\", \"status\": \"failed\"},\n        {\"merchant_id\": \"b\", \"status\": \"succeeded\"},\n    ]\n    r = success_rates(rows)\n    assert abs(r[\"a\"] - 0.5) < 1e-9\n    assert abs(r[\"b\"] - 1.0) < 1e-9\n\ntest_success_rates()\nprint(\"ok\")",
    "complexity": {
      "time": "O(n)",
      "memory": "O(m) merchants",
      "note": "One aggregation pass + one pass over m merchants."
    },
    "verify": {
      "grain": "Return value: dict merchant_id -> success_rate (float).",
      "columns": [
        "merchant_id (key)",
        "success_rate"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "success_rate"
        ],
        "rows": [
          [
            "a",
            "0.5"
          ],
          [
            "b",
            "1.0"
          ]
        ]
      },
      "commonWrong": [
        "Integer/floor division truncating the rate to 0.",
        "No guard when attempts == 0 (ZeroDivisionError)."
      ],
      "validation": [
        "Every rate is in [0,1].",
        "A merchant with all successes gives 1.0; half gives 0.5."
      ],
      "edgeCases": [
        "attempts == 0 must not crash.",
        "Float comparison in tests uses a tolerance."
      ],
      "checklist": [
        "float division",
        "zero guard",
        "rate in [0,1]"
      ]
    },
    "explain": "Say: \"Rate is successes over attempts as a float, with an explicit guard for zero attempts so it returns 0.0 instead of crashing.\"",
    "next": "py5"
  },
  {
    "id": "py5",
    "title": "Deduplicate by idempotency_key",
    "ladder": "py",
    "pos": 5,
    "stage": "Deduplicate by idempotency_key",
    "lvl": 3,
    "difficulty": "hard",
    "priority": "should",
    "source": "python-interview-prep-style",
    "module": null,
    "mode": "Python",
    "timed": false,
    "est": "6 min",
    "business": "Webhook retries deliver the same logical charge several times with the same idempotency_key. Counting them all overstates everything.",
    "task": "Write a function that deduplicates charge events by <b>idempotency_key</b>, keeping the <b>latest</b> (max created_at) record per key.",
    "prereq": "py3 (dict aggregation)",
    "harder": "You now keep one record per logical key by a tie-break rule — a real data-quality step, not just counting.",
    "teaches": "Dedup = a dict keyed by the logical id, overwriting only when a later record arrives. This is the Python form of ROW_NUMBER()=1.",
    "deliverable": "A function returning the deduped list (one record per idempotency_key) and a test proving the latest wins.",
    "signature": "def dedupe_latest(charges: list[dict]) -> list[dict]:\n    # one record per idempotency_key, keeping max(created_at)\n    ...",
    "inputSpec": "<div class=\"prose\" style=\"font-size:13px\">A list of charge dicts; some share an <span class=\"mono\">idempotency_key</span> with different <span class=\"mono\">created_at</span> values.</div>",
    "prompt": "Implement <span class=\"mono\">dedupe_latest(charges)</span>: one record per idempotency_key, keeping the one with the greatest created_at.",
    "confusion": "Keeping the FIRST seen record (instead of the latest) is a silent bug if events arrive out of order. Compare created_at, do not just keep the first.",
    "hints": [
      "Use a dict keyed by idempotency_key.",
      "Only overwrite when the new record's created_at is greater.",
      "Return list(best.values()) at the end."
    ],
    "solution": "def dedupe_latest(charges):\n    best = {}\n    for c in charges:\n        key = c.get(\"idempotency_key\")\n        if key is None:\n            continue\n        cur = best.get(key)\n        if cur is None or c.get(\"created_at\", 0) > cur.get(\"created_at\", 0):\n            best[key] = c\n    return list(best.values())",
    "tests": "def test_dedupe_latest():\n    rows = [\n        {\"idempotency_key\": \"k1\", \"created_at\": 10, \"status\": \"failed\"},\n        {\"idempotency_key\": \"k1\", \"created_at\": 20, \"status\": \"succeeded\"},\n        {\"idempotency_key\": \"k2\", \"created_at\": 5,  \"status\": \"succeeded\"},\n    ]\n    out = dedupe_latest(rows)\n    assert len(out) == 2\n    k1 = [c for c in out if c[\"idempotency_key\"] == \"k1\"][0]\n    assert k1[\"status\"] == \"succeeded\"  # the later one won\n\ntest_dedupe_latest()\nprint(\"ok\")",
    "complexity": {
      "time": "O(n)",
      "memory": "O(u) for u unique keys",
      "note": "Single pass; dict holds one record per unique key."
    },
    "verify": {
      "grain": "Return value: list with one record per idempotency_key (latest).",
      "columns": [
        "idempotency_key",
        "created_at",
        "status"
      ],
      "sample": {
        "cols": [
          "idempotency_key",
          "kept created_at",
          "status"
        ],
        "rows": [
          [
            "k1",
            "20",
            "succeeded"
          ],
          [
            "k2",
            "5",
            "succeeded"
          ]
        ]
      },
      "commonWrong": [
        "Keeping the first-seen record regardless of created_at.",
        "Dropping records that have no idempotency_key without deciding what that means."
      ],
      "validation": [
        "Output has exactly one record per distinct idempotency_key.",
        "For each key, the kept created_at is the maximum."
      ],
      "edgeCases": [
        "Out-of-order arrival (later created_at appears first in the list).",
        "Missing idempotency_key — decide: skip or treat as unique."
      ],
      "checklist": [
        "dict keyed by idempotency_key",
        "keeps max created_at",
        "one row per key out"
      ]
    },
    "explain": "Say: \"I keep a dict keyed by idempotency_key and overwrite only when a later created_at arrives — the Python version of ROW_NUMBER ordered by time, keeping rank 1.\"",
    "next": "py6"
  },
  {
    "id": "py6",
    "title": "Debug a wrong-denominator function",
    "ladder": "py",
    "pos": 6,
    "stage": "Debug flawed Python",
    "lvl": 3,
    "difficulty": "hard",
    "priority": "should",
    "source": "python-interview-prep-style",
    "module": null,
    "mode": "Python",
    "timed": false,
    "est": "5 min",
    "broken": "def success_rate(charges):\n    succeeded = [c for c in charges if c.get(\"status\") == \"succeeded\"]\n    # rate = successes / successes  -- bug: wrong denominator\n    return len(succeeded) / len(succeeded)",
    "business": "A teammate's success-rate function always returns 1.0. You must find and fix the bug.",
    "task": "Diagnose why <span class=\"mono\">success_rate</span> always returns 1.0, then write the corrected function.",
    "prereq": "py4 (success rate)",
    "harder": "You switch from writing to reading: locate a denominator bug and an empty-input crash.",
    "teaches": "The denominator must be ALL attempts, not the successes. And len(charges)==0 must be guarded or it raises ZeroDivisionError.",
    "deliverable": "A one-sentence diagnosis plus the corrected function with a zero-guard.",
    "inputSpec": "<div class=\"prose\" style=\"font-size:13px\">A list of charge dicts with a <span class=\"mono\">status</span> field.</div>",
    "prompt": "Find the bug in the function on the right (shown below), explain it in one sentence, and write the fix.",
    "confusion": "len(succeeded) / len(succeeded) is always 1.0 (or a crash if empty). The denominator should be the total number of attempts, not the successes.",
    "hints": [
      "Look at the denominator: it is the successes, not the attempts.",
      "The numerator should be successes; the denominator len(charges).",
      "Guard the empty-list case to avoid ZeroDivisionError."
    ],
    "solution": "def success_rate(charges):\n    if not charges:\n        return 0.0\n    succeeded = sum(1 for c in charges if c.get(\"status\") == \"succeeded\")\n    return succeeded / len(charges)",
    "tests": "def test_success_rate():\n    assert success_rate([]) == 0.0\n    rows = [{\"status\": \"succeeded\"}, {\"status\": \"failed\"},\n            {\"status\": \"succeeded\"}, {\"status\": \"pending\"}]\n    assert abs(success_rate(rows) - 0.5) < 1e-9  # 2 of 4\n\ntest_success_rate()\nprint(\"ok\")",
    "complexity": {
      "time": "O(n)",
      "memory": "O(1)",
      "note": "A generator sum avoids building an intermediate list."
    },
    "verify": {
      "grain": "Return value: a single float success rate in [0,1].",
      "columns": [
        "(scalar float)"
      ],
      "sample": {
        "cols": [
          "statuses",
          "rate"
        ],
        "rows": [
          [
            "succeeded, failed, succeeded, pending",
            "0.5"
          ]
        ]
      },
      "commonWrong": [
        "Dividing successes by successes (always 1.0).",
        "No guard for an empty list (ZeroDivisionError)."
      ],
      "validation": [
        "Empty input returns 0.0, not a crash.",
        "2 of 4 succeeded → 0.5 (pending counts in the denominator)."
      ],
      "edgeCases": [
        "Empty list.",
        "All-pending list returns 0.0 with attempts counted."
      ],
      "checklist": [
        "denominator = len(charges)",
        "empty-list guard",
        "pending counted as attempt"
      ]
    },
    "explain": "Say: \"The denominator is the successes, so it is always 1.0. The fix divides successes by total attempts and guards the empty list.\"",
    "next": "py7"
  },
  {
    "id": "py7",
    "title": "Handle bad rows and missing fields",
    "ladder": "py",
    "pos": 7,
    "stage": "Handle bad rows / missing fields",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "should",
    "source": "data-science-interviews-style",
    "module": null,
    "mode": "Python",
    "timed": false,
    "est": "7 min",
    "business": "Real event streams contain junk: rows missing merchant_id, non-numeric amounts, missing status. Your aggregator must not crash and must report what it skipped.",
    "task": "Write a robust per-merchant success-rate aggregator that <b>skips bad rows</b> (missing merchant_id or status), <b>counts</b> how many it skipped, and never divides by zero.",
    "prereq": "py4 (success rate), py3 (aggregation)",
    "harder": "Now real-world messiness enters: you must defend every field access and surface data-quality counts.",
    "teaches": "Production data code validates inputs, skips-and-counts bad rows rather than crashing, and reports data quality alongside the metric.",
    "deliverable": "A function returning per-merchant rates AND a skipped-row count; a test that feeds it junk.",
    "signature": "def safe_rates(charges: list[dict]) -> tuple[dict, int]:\n    # -> ({merchant_id: rate}, skipped_count)\n    ...",
    "inputSpec": "<div class=\"prose\" style=\"font-size:13px\">A messy list of dicts: some rows lack <span class=\"mono\">merchant_id</span> or <span class=\"mono\">status</span>; some are not dicts at all.</div>",
    "prompt": "Implement <span class=\"mono\">safe_rates(charges)</span>: skip rows that are not dicts or lack merchant_id/status, count the skips, and return per-merchant success rates with a zero guard.",
    "confusion": "Silently dropping bad rows hides data-quality problems. Skip them, but RETURN the skipped count so the caller knows how dirty the input was.",
    "hints": [
      "Validate each row: isinstance(c, dict), and merchant_id/status present.",
      "Increment a skipped counter for anything you drop.",
      "Reuse the attempts/successes dict, then guard division by zero."
    ],
    "solution": "def safe_rates(charges):\n    counts = {}\n    skipped = 0\n    for c in charges:\n        if not isinstance(c, dict):\n            skipped += 1\n            continue\n        mid = c.get(\"merchant_id\")\n        status = c.get(\"status\")\n        if mid is None or status is None:\n            skipped += 1\n            continue\n        b = counts.setdefault(mid, {\"attempts\": 0, \"successes\": 0})\n        b[\"attempts\"] += 1\n        if status == \"succeeded\":\n            b[\"successes\"] += 1\n    rates = {}\n    for mid, b in counts.items():\n        rates[mid] = b[\"successes\"] / b[\"attempts\"] if b[\"attempts\"] else 0.0\n    return rates, skipped",
    "tests": "def test_safe_rates():\n    rows = [\n        {\"merchant_id\": \"a\", \"status\": \"succeeded\"},\n        {\"merchant_id\": \"a\", \"status\": \"failed\"},\n        {\"status\": \"succeeded\"},      # missing merchant_id -> skip\n        {\"merchant_id\": \"b\"},          # missing status -> skip\n        \"not_a_dict\",                  # skip\n    ]\n    rates, skipped = safe_rates(rows)\n    assert abs(rates[\"a\"] - 0.5) < 1e-9\n    assert \"b\" not in rates\n    assert skipped == 3\n\ntest_safe_rates()\nprint(\"ok\")",
    "complexity": {
      "time": "O(n)",
      "memory": "O(m) merchants",
      "note": "Single pass; validation is O(1) per row."
    },
    "verify": {
      "grain": "Return value: (dict merchant_id -> rate, skipped_count int).",
      "columns": [
        "merchant_id (key)",
        "rate",
        "skipped (separate int)"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "rate"
        ],
        "rows": [
          [
            "a",
            "0.5"
          ]
        ]
      },
      "commonWrong": [
        "Letting a non-dict row or missing key raise an exception.",
        "Dropping bad rows silently without reporting the count."
      ],
      "validation": [
        "skipped equals the number of invalid rows.",
        "Valid merchants still produce rates in [0,1]."
      ],
      "edgeCases": [
        "Non-dict element in the list.",
        "Row missing merchant_id or status.",
        "A merchant whose every row was skipped should not appear."
      ],
      "checklist": [
        "isinstance/None guards",
        "skipped counted & returned",
        "zero-division guard"
      ]
    },
    "explain": "Say: \"I validate each row, skip-and-count the bad ones, and return the skipped total alongside the rates so data-quality problems are visible rather than hidden.\"",
    "next": "py8"
  },
  {
    "id": "py8",
    "title": "Final boss: stream events to a health summary",
    "ladder": "py",
    "pos": 8,
    "stage": "Final boss · stream events → health summary",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "python-interview-prep-style",
    "module": null,
    "mode": "Python",
    "timed": true,
    "est": "15 min",
    "business": "Final boss. You are given an iterator that yields charge events one at a time — possibly millions, too many to hold in memory. Produce a per-merchant health summary in a single pass.",
    "task": "Write a function that consumes an <b>iterator</b> of charge events and returns, per merchant, attempts, successes, success rate and total succeeded amount — in <b>one pass, O(number-of-merchants) memory</b>. State assumptions, handle bad rows, and explain complexity.",
    "prereq": "py3, py4, py7 (aggregation, rates, robustness)",
    "harder": "The capstone: a streaming constraint (cannot materialise the data), robustness, and a clear complexity argument — under time pressure.",
    "teaches": "Streaming aggregation: never build a giant list; keep only O(merchants) accumulators and update them as events arrive. This is the bounded-memory pattern interviewers probe for.",
    "deliverable": "A streaming function + a test using a generator, plus a one-line time/memory complexity statement and your stated assumptions.",
    "signature": "def merchant_health(events) -> dict:\n    # events: an iterator of charge dicts (cannot be re-read)\n    # -> {merchant_id: {\"attempts\",\"successes\",\"rate\",\"succeeded_amount\"}}\n    ...",
    "inputSpec": "<div class=\"prose\" style=\"font-size:13px\">An <b>iterator</b> (generator) yielding charge dicts. You may iterate it <b>once</b>; you cannot len() it or index it.</div>",
    "prompt": "Implement <span class=\"mono\">merchant_health(events)</span> in a single pass with memory proportional to the number of merchants. Skip malformed rows. Afterwards, state the time and memory complexity and any assumptions.",
    "confusion": "Calling list(events) to \"make it easier\" defeats the entire point — it loads everything into memory. Iterate once and keep only per-merchant accumulators.",
    "hints": [
      "Loop 'for e in events:' exactly once — do not list() it.",
      "Keep a dict merchant_id -> running {attempts, successes, succeeded_amount}.",
      "Compute the rate at the END from the accumulators.",
      "Guard bad rows and zero attempts."
    ],
    "solution": "def merchant_health(events):\n    acc = {}\n    for e in events:\n        if not isinstance(e, dict):\n            continue\n        mid = e.get(\"merchant_id\")\n        status = e.get(\"status\")\n        if mid is None or status is None:\n            continue\n        b = acc.setdefault(mid, {\"attempts\": 0, \"successes\": 0, \"succeeded_amount\": 0})\n        b[\"attempts\"] += 1\n        if status == \"succeeded\":\n            b[\"successes\"] += 1\n            amt = e.get(\"amount\") or 0\n            b[\"succeeded_amount\"] += amt\n    out = {}\n    for mid, b in acc.items():\n        rate = b[\"successes\"] / b[\"attempts\"] if b[\"attempts\"] else 0.0\n        out[mid] = {\n            \"attempts\": b[\"attempts\"],\n            \"successes\": b[\"successes\"],\n            \"rate\": rate,\n            \"succeeded_amount\": b[\"succeeded_amount\"],\n        }\n    return out",
    "tests": "def gen():\n    yield {\"merchant_id\": \"a\", \"status\": \"succeeded\", \"amount\": 100}\n    yield {\"merchant_id\": \"a\", \"status\": \"failed\",    \"amount\": 50}\n    yield {\"merchant_id\": \"b\", \"status\": \"succeeded\", \"amount\": 200}\n    yield \"junk\"  # skipped\n\ndef test_merchant_health():\n    out = merchant_health(gen())\n    assert out[\"a\"][\"attempts\"] == 2\n    assert abs(out[\"a\"][\"rate\"] - 0.5) < 1e-9\n    assert out[\"a\"][\"succeeded_amount\"] == 100\n    assert out[\"b\"][\"rate\"] == 1.0\n\ntest_merchant_health()\nprint(\"ok\")",
    "complexity": {
      "time": "O(n) over n events",
      "memory": "O(m) for m merchants",
      "note": "Single pass; memory is bounded by the number of distinct merchants, not the number of events — that is the whole point of streaming."
    },
    "verify": {
      "grain": "Return value: dict merchant_id -> {attempts, successes, rate, succeeded_amount}.",
      "columns": [
        "merchant_id",
        "attempts",
        "successes",
        "rate",
        "succeeded_amount"
      ],
      "sample": {
        "cols": [
          "merchant_id",
          "attempts",
          "rate",
          "succ_amount"
        ],
        "rows": [
          [
            "a",
            "2",
            "0.5",
            "100"
          ],
          [
            "b",
            "1",
            "1.0",
            "200"
          ]
        ]
      },
      "commonWrong": [
        "Calling list(events) and defeating the memory constraint.",
        "Trying to iterate the generator twice (it is exhausted after one pass)."
      ],
      "validation": [
        "Memory does not grow with event count, only with merchant count.",
        "successes <= attempts; rate in [0,1]; succeeded_amount sums only succeeded rows."
      ],
      "edgeCases": [
        "Malformed / non-dict events are skipped.",
        "A merchant with zero successes returns rate 0.0.",
        "amount missing on a succeeded row treated as 0."
      ],
      "checklist": [
        "single pass / no list()",
        "O(merchants) memory",
        "rate computed at end",
        "bad rows skipped"
      ]
    },
    "explain": "Open with: \"I will iterate the stream once and keep only per-merchant accumulators, so memory is O(merchants), not O(events). I will compute rates at the end and skip malformed rows.\" Then state the complexity explicitly.",
    "next": null
  }
];

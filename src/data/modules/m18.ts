import type { Module } from '@/types';

/* Non-SQL learning module: clean, production-style Python for data tasks. No pandas, no
   sqlPattern (so no SQL runner). Pairs with the `py` Practice Gym ladder. */
export const m18: Module = {
  "id": "m18",
  "day": "Day 7",
  "badge": "intermediate",
  "title": "Python Production Scripting",
  "skill": "python",
  "bcolor": "green",
  "concept": "<p>Stripe's Python screens are not pandas puzzles. They hand you a <strong>list of dictionaries</strong> (records that look like API objects) and ask you to filter, aggregate, deduplicate, and summarize with the standard library. Clean, correct, readable Python beats clever one-liners.</p>\n<p><strong>The toolkit.</strong> List/dict comprehensions for filtering and shaping; <code class=\"inline\">dict</code> (or <code class=\"inline\">collections.defaultdict</code> / <code class=\"inline\">Counter</code>) for grouped aggregation; <code class=\"inline\">set</code> for distinctness and deduplication; <code class=\"inline\">.get(key, default)</code> for fields that may be missing; small pure functions you can test. That is enough for almost every screen.</p>\n<p><strong>The habits that score.</strong> Guard division (<code class=\"inline\">x / n if n else 0</code>) exactly like NULLIF in SQL. Count <em>distinct</em> logical events, not raw rows, when retries can duplicate them. Read fields defensively with <code class=\"inline\">.get</code> so one bad record doesn't crash the run. Prefer a single streaming pass (O(n), constant memory) over building giant intermediate lists when the input could be large.</p>\n<div class=\"callout warn\"><span class=\"t\">Same data discipline as SQL — just in Python</span>A rate still needs the right denominator and a zero-guard; \"distinct attempts\" still means dedup by a key; a missing field still must not crash the job. The language changed; the reasoning did not.</div>",
  "pysupport": "from collections import defaultdict\n\n# Success rate per merchant from a list of charge dicts — the canonical screen shape.\ndef success_rate_by_merchant(charges):\n    attempts = defaultdict(int)\n    succeeded = defaultdict(int)\n    for c in charges:\n        m = c.get(\"merchant_id\")\n        if m is None or c.get(\"status\") not in (\"succeeded\", \"failed\"):\n            continue                      # skip in-flight / malformed rows\n        attempts[m] += 1\n        if c[\"status\"] == \"succeeded\":\n            succeeded[m] += 1\n    # guard the divide, exactly like NULLIF(attempts, 0) in SQL\n    return {m: succeeded[m] / attempts[m] for m in attempts}",
  "predicts": [
    {
      "prompt": "What does this print?",
      "query": "rows = [{\"amt\": 10}, {\"amt\": 0}, {\"amt\": 5}]\ntotal = sum(r[\"amt\"] for r in rows if r[\"amt\"] > 0)\nprint(total)",
      "options": [
        "15",
        "15 (0 is filtered out by the > 0 guard)",
        "0",
        "Error"
      ],
      "answer": 1,
      "explain": "The generator keeps amounts strictly greater than 0 (10 and 5) and sums them to 15. The zero row is excluded by the filter."
    },
    {
      "prompt": "A record is missing the 'country' key. What does this evaluate to?",
      "query": "c = {\"id\": 1, \"status\": \"succeeded\"}\nval = c.get(\"country\", \"unknown\")",
      "options": [
        "Raises KeyError",
        "'unknown' — .get returns the default when the key is absent",
        "None",
        "''"
      ],
      "answer": 1,
      "explain": ".get(key, default) returns the default instead of raising KeyError. Using .get for possibly-missing fields keeps one malformed record from crashing the whole run; c['country'] would raise."
    }
  ],
  "debugs": [
    {
      "title": "Wrong denominator (counting successes, not attempts)",
      "prompt": "This success rate is always 1.0. Find and fix the bug.",
      "broken": "def rate(charges):\n    succ = [c for c in charges if c[\"status\"] == \"succeeded\"]\n    return sum(1 for _ in succ) / len(succ)   # divides successes by successes",
      "hint": "The denominator is the successes themselves, so it can only ever be 1.0. The denominator should be all attempts.",
      "fixed": "def rate(charges):\n    attempts = [c for c in charges if c[\"status\"] in (\"succeeded\", \"failed\")]\n    succ = sum(1 for c in attempts if c[\"status\"] == \"succeeded\")\n    return succ / len(attempts) if attempts else 0.0",
      "why": "A rate divides the numerator by the population it came from. Here the denominator must be all attempts (succeeded + failed), and the divide is guarded so an empty input returns 0.0 instead of raising ZeroDivisionError."
    },
    {
      "title": "Mutating a dict while iterating it",
      "prompt": "This raises 'RuntimeError: dictionary changed size during iteration'. Fix it.",
      "broken": "counts = {\"a\": 0, \"b\": 2, \"c\": 0}\nfor k in counts:\n    if counts[k] == 0:\n        del counts[k]            # mutates during iteration",
      "hint": "You cannot add or remove keys while looping over the same dict. Iterate over a snapshot, or build a new dict.",
      "fixed": "counts = {\"a\": 0, \"b\": 2, \"c\": 0}\ncounts = {k: v for k, v in counts.items() if v != 0}   # build a new dict\n# or: for k in list(counts): ...   # iterate a copy of the keys",
      "why": "Mutating a dict mid-iteration is undefined and raises at runtime. Either iterate over <code class='inline'>list(counts)</code> (a snapshot of the keys) or, cleaner, build a filtered new dict with a comprehension."
    }
  ],
  "exercises": [
    {
      "id": "m18e1",
      "lvl": 1,
      "priority": "required",
      "title": "Filter succeeded charges",
      "prompt": "Given <code class='inline'>charges</code> (a list of dicts with a 'status'), return a list of just the succeeded ones. Use a comprehension.",
      "hints": [
        "[c for c in charges if c.get('status') == 'succeeded']",
        "Use .get so a record missing 'status' doesn't crash."
      ],
      "solution": "def succeeded(charges):\n    return [c for c in charges if c.get(\"status\") == \"succeeded\"]"
    },
    {
      "id": "m18e2",
      "lvl": 2,
      "priority": "required",
      "title": "Count attempts by merchant",
      "prompt": "Return a dict of merchant_id → number of charge attempts. Use defaultdict or .get to accumulate.",
      "hints": [
        "from collections import defaultdict; counts = defaultdict(int).",
        "counts[c['merchant_id']] += 1 inside the loop."
      ],
      "solution": "from collections import defaultdict\n\ndef attempts_by_merchant(charges):\n    counts = defaultdict(int)\n    for c in charges:\n        m = c.get(\"merchant_id\")\n        if m is not None:\n            counts[m] += 1\n    return dict(counts)"
    },
    {
      "id": "m18e3",
      "lvl": 3,
      "priority": "should",
      "title": "Success rate per merchant, guarded",
      "prompt": "Return merchant_id → success rate (succeeded ÷ attempts), counting only succeeded/failed as attempts, with the divide guarded.",
      "hints": [
        "Track attempts and successes per merchant in two dicts (or a dict of [succ, att]).",
        "rate = succ / att if att else 0.0."
      ],
      "solution": "from collections import defaultdict\n\ndef success_rate(charges):\n    att = defaultdict(int)\n    suc = defaultdict(int)\n    for c in charges:\n        if c.get(\"status\") not in (\"succeeded\", \"failed\"):\n            continue\n        m = c[\"merchant_id\"]\n        att[m] += 1\n        if c[\"status\"] == \"succeeded\":\n            suc[m] += 1\n    return {m: suc[m] / att[m] for m in att}"
    },
    {
      "id": "m18e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "Deduplicate by idempotency_key (keep latest)",
      "prompt": "Retries create duplicate charges sharing an idempotency_key. Return one charge per key — the one with the largest created_at. Then count distinct logical attempts.",
      "hints": [
        "Walk the list, keep a dict key → record, replace when created_at is newer.",
        "Distinct attempts = len(of that dict)."
      ],
      "solution": "def dedupe_latest(charges):\n    best = {}\n    for c in charges:\n        k = c.get(\"idempotency_key\")\n        if k is None:\n            continue\n        if k not in best or c[\"created_at\"] > best[k][\"created_at\"]:\n            best[k] = c\n    return list(best.values())\n\ndef distinct_attempts(charges):\n    return len(dedupe_latest(charges))"
    },
    {
      "id": "m18e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: stream events to a health summary",
      "prompt": "You get a possibly-huge iterable of charge events (some malformed). In a SINGLE pass and constant extra memory per merchant, produce per-merchant: attempts, success_rate, and the dominant failure_code. Skip bad records without crashing.",
      "hints": [
        "One loop; per merchant keep attempts, successes, and a Counter of failure_codes.",
        "Guard every field access with .get; guard the final divide.",
        "Dominant code = the Counter's most_common(1)."
      ],
      "solution": "from collections import defaultdict, Counter\n\ndef health_summary(events):\n    att = defaultdict(int)\n    suc = defaultdict(int)\n    codes = defaultdict(Counter)\n    for e in events:\n        status = e.get(\"status\")\n        m = e.get(\"merchant_id\")\n        if m is None or status not in (\"succeeded\", \"failed\"):\n            continue                       # skip malformed / in-flight\n        att[m] += 1\n        if status == \"succeeded\":\n            suc[m] += 1\n        else:\n            code = e.get(\"failure_code\") or \"unknown\"\n            codes[m][code] += 1\n    out = {}\n    for m in att:\n        top = codes[m].most_common(1)\n        out[m] = {\n            \"attempts\": att[m],\n            \"success_rate\": suc[m] / att[m] if att[m] else 0.0,\n            \"top_failure_code\": top[0][0] if top else None,\n        }\n    return out"
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "For grouped aggregation over a list of dicts, the idiomatic standard-library tool is:",
      "options": [
        "A third-party pandas data structure",
        "A dict / collections.defaultdict (or Counter) accumulated in a loop",
        "A global variable per group",
        "Nested lists"
      ],
      "answer": 1,
      "why": "defaultdict/Counter give clean grouped counts and sums without pandas — the expected style on these screens.",
      "concept": "aggregation"
    },
    {
      "level": 1,
      "q": "To read a field that may be missing without crashing, use:",
      "options": [
        "c['field'] and hope it exists",
        "c.get('field', default)",
        "try/except around every access only",
        "del c['field']"
      ],
      "answer": 1,
      "why": ".get(key, default) returns the default for absent keys, so one malformed record doesn't raise KeyError and abort the run.",
      "concept": "defensive access"
    },
    {
      "level": 2,
      "q": "To guard a success-rate divide when a merchant has zero attempts:",
      "options": [
        "Ignore it; Python won't error",
        "succ / att if att else 0.0",
        "round(succ / att, 2)",
        "att / succ"
      ],
      "answer": 1,
      "why": "Dividing by zero raises ZeroDivisionError; the guard returns 0.0 — the Python equivalent of NULLIF(att, 0).",
      "concept": "zero guard"
    },
    {
      "level": 4,
      "q": "Counting distinct payment attempts when retries duplicate rows means:",
      "options": [
        "len(charges)",
        "Deduplicate by idempotency_key (e.g. into a dict/set), then count",
        "Count only succeeded",
        "Count failure_codes"
      ],
      "answer": 1,
      "why": "Raw rows overcount retries; distinct logical attempts = unique idempotency_keys, the same dedup discipline as in SQL.",
      "concept": "dedup"
    },
    {
      "level": 5,
      "q": "For a possibly-huge event stream, the memory-safe shape is:",
      "options": [
        "Load all events into a list, then group",
        "A single pass that updates small per-group accumulators (O(n) time, O(groups) memory)",
        "Sort everything first",
        "Recurse over the events"
      ],
      "answer": 1,
      "why": "Streaming one pass with compact per-group state avoids holding the whole input in memory and is the production-safe pattern.",
      "concept": "streaming"
    }
  ],
  "mistakes": [
    "Dividing successes by successes (or by the wrong population) instead of by all attempts.",
    "Indexing c['field'] for fields that may be missing, crashing on one bad record (use .get).",
    "Mutating a dict/list while iterating over it.",
    "Counting raw rows as 'attempts' when retries duplicate them (dedup by idempotency_key).",
    "Building giant intermediate lists when a single streaming pass would do."
  ],
  "edges": [
    "Empty input or a group with zero attempts → guard the divide, return 0.0/None deliberately.",
    "Missing or null failure_code on a failed charge → bucket as 'unknown' rather than dropping it.",
    "Mixed/None types in a field → validate or coerce before comparing, or the comparison misbehaves."
  ],
  "interview": "<p>Talk through the shape before typing: <em>\"It's a list of dicts; I'll loop once, accumulate attempts and successes per merchant in defaultdicts, guard the divide, and read fields with .get so a bad record can't crash it.\"</em> Then write small, testable functions. Naming the zero-guard and the dedup-by-key out loud signals the same data discipline as your SQL.</p>",
  "followup": {
    "prompt": "Interviewer: \"Now the input is 50 million events and won't fit in memory. What changes?\"",
    "answer": "Nothing about the logic, only the shape: I keep the single streaming pass and the small per-merchant accumulators (counts and a Counter of failure codes), so memory is O(number of merchants), not O(events). I avoid materializing the full list, process the iterable lazily, and if even the per-group state were too large I'd shard by merchant or aggregate in chunks and merge."
  }
};

import type { Module } from '@/types';

/* Non-SQL learning module: the Stripe data model — objects, relationships, money semantics.
   No sqlPattern. Pairs with the new `obj` Practice Gym ladder (Object mode). */
export const m20: Module = {
  "id": "m20",
  "day": "Day 7",
  "badge": "intermediate",
  "title": "Stripe Object Literacy",
  "skill": "object",
  "bcolor": "gold",
  "concept": "<p>Most Stripe analytics mistakes are not SQL errors; they are <strong>object errors</strong> — answering with the wrong table because the data model was misunderstood. Knowing which object owns which fact is half the job.</p>\n<p><strong>The core objects.</strong> A <strong>charge</strong> is a single payment attempt (succeeded / failed / pending) and is the workhorse table. A <strong>customer</strong> belongs to a <strong>merchant</strong>; a charge references both. A <strong>refund</strong> and a <strong>dispute</strong> each attach to a charge (one charge can have several). A <strong>subscription</strong> generates <strong>invoices</strong> per cycle. The <strong>balance_transactions</strong> ledger books every money movement — charge, refund, dispute, fee, payout — and is the source of truth for <em>net</em>. A <strong>payout</strong> is money wired to the merchant's bank, reconciled through the ledger.</p>\n<p><strong>Money semantics that trip people up.</strong> Amounts are in <strong>cents</strong> (divide by 100). <strong>GPV</strong> (sum of succeeded charge amounts) is gross and ignores refunds, disputes, and fees; <strong>net revenue</strong> lives only in <code class=\"inline\">balance_transactions.net_amount</code>. You cannot blend currencies — filter or convert first. <strong>Disputes arrive late</strong> (days to weeks after the charge), so recent dispute rates are provisional. Retried payments share an <strong>idempotency_key</strong>, so raw charge rows overcount logical attempts.</p>\n<div class=\"callout warn\"><span class=\"t\">Pick the object before the query</span>Net revenue ⇒ the ledger, not charges. Disputes/refunds ⇒ join to the charge. \"Revenue\" ⇒ ask GPV vs net vs MRR. Choosing the right object is the difference between a right answer and a confident wrong one.</div>",
  "predicts": [
    {
      "prompt": "Finance asks for NET revenue per merchant (after fees, refunds, disputes). Which object is the source of truth?",
      "query": "-- candidates: charges.amount  vs  balance_transactions.net_amount",
      "options": [
        "charges.amount — sum the succeeded charges",
        "balance_transactions.net_amount — the ledger nets out fees, refunds, and disputes",
        "invoices.amount_paid",
        "payouts.amount"
      ],
      "answer": 1,
      "explain": "charges.amount is GROSS (GPV). Only the balance_transactions ledger books fees, refunds, and disputes into net_amount, so net revenue is summed there. Reading net from charges overstates it."
    },
    {
      "prompt": "You need 'dispute rate per merchant.' A dispute row has no merchant_id. How do you attribute it?",
      "query": "-- disputes(dispute_id, charge_id, amount, reason, status, created_at)",
      "options": [
        "Disputes can't be attributed to a merchant",
        "Join the dispute to its charge by charge_id; the charge carries merchant_id",
        "Use the dispute's created_at",
        "Sum dispute amounts directly"
      ],
      "answer": 1,
      "explain": "A dispute attaches to a charge via charge_id, and the charge carries merchant_id (and customer_id). You reach the merchant by going through the charge — the same pattern for refunds."
    }
  ],
  "debugs": [
    {
      "title": "GPV mistaken for net revenue",
      "prompt": "A board slide reports 'revenue' as the sum of succeeded charges. Why is that wrong, and what is it actually?",
      "broken": "-- 'Revenue' = SUM(charges.amount) WHERE status='succeeded'",
      "hint": "That number ignores Stripe fees, refunds, and disputes. It has a name — but it isn't net revenue.",
      "fixed": "-- That's GPV (gross payment volume), not revenue.\n-- Net revenue = SUM(balance_transactions.net_amount),\n--   which already subtracts fees, refunds, and disputes.\n-- Decide up front which the audience wants: GPV, net, or MRR.",
      "why": "GPV, net revenue, and MRR are three different numbers. Summing succeeded charges gives gross volume; net is only in the ledger; MRR is a run-rate of active subscriptions. Naming which one is the actual analysis."
    },
    {
      "title": "Blending currencies and forgetting cents",
      "prompt": "A 'total revenue' query sums amount across all charges. Two bugs hide here — find them.",
      "broken": "SELECT SUM(amount) AS revenue FROM charges WHERE status='succeeded';",
      "hint": "Amounts are in cents, and they span multiple currencies that can't be added.",
      "fixed": "SELECT currency, SUM(amount)/100.0 AS revenue\nFROM charges WHERE status='succeeded'\nGROUP BY currency;   -- per currency, converted from cents",
      "why": "Amounts are stored in cents (÷100 for dollars), and summing across usd/eur/gbp adds incommensurable units. Report per currency (or convert via FX first), and never present a blended cents total as 'revenue'."
    }
  ],
  "exercises": [
    {
      "id": "m20e1",
      "lvl": 1,
      "priority": "required",
      "title": "Map the question to the object",
      "prompt": "For each ask, name the primary object: (a) 'how many payment attempts failed?' (b) 'how much did we pay out to merchant 107?' (c) 'what's our MRR?'",
      "hints": [
        "Attempts ⇒ charges; cash to bank ⇒ payouts; recurring run-rate ⇒ subscriptions.",
        "MRR is a snapshot of active subscriptions, not a sum of payments."
      ],
      "solution": "(a) charges (status='failed'). (b) payouts (or the ledger's payout entries) for merchant 107. (c) subscriptions — sum the monthly-normalised amount of ACTIVE subs (annual ÷ 12); not charges, not invoices."
    },
    {
      "id": "m20e2",
      "lvl": 2,
      "priority": "required",
      "title": "Trace a refund to a merchant",
      "prompt": "Describe the join path from a refund to the merchant that issued it, and the grain risk if you sum naively.",
      "hints": [
        "refund → charge (charge_id) → merchant_id.",
        "A charge can have multiple refunds; joining can fan out."
      ],
      "solution": "Path: refunds.charge_id → charges.charge_id → charges.merchant_id. Grain risk: one charge can have several refunds, so joining charges to refunds multiplies (fans out) charge rows; if you then SUM charge amounts you double-count. Pre-aggregate refunds to the charge grain (SUM per charge_id) before joining, or aggregate refunds separately by merchant."
    },
    {
      "id": "m20e3",
      "lvl": 3,
      "priority": "should",
      "title": "Why disputes need a maturity caveat",
      "prompt": "A weekly dispute-rate chart shows this week far below last week. Before alarming (or celebrating), what object property must you account for?",
      "hints": [
        "Disputes attach to a charge but arrive days-to-weeks later.",
        "Bucket on the charge date; the newest buckets are incomplete."
      ],
      "solution": "Disputes lag the charge by days to weeks (banks raise them late). If you bucket by the charge's date, the most recent weeks have not yet accumulated all their disputes, so their rate is artificially low and provisional. Flag the newest buckets as immature, or only compare fully-matured weeks; a 'drop' in the latest week is usually just incomplete data."
    },
    {
      "id": "m20e4",
      "lvl": 4,
      "priority": "stretch",
      "title": "Distinct attempts vs rows",
      "prompt": "A merchant's 'attempt count' looks inflated. Which object field explains retries, and how do you count true logical attempts?",
      "hints": [
        "Retried payments reuse the idempotency_key.",
        "Distinct attempts = distinct idempotency_keys."
      ],
      "solution": "Retries create multiple charge rows that share an idempotency_key. Raw COUNT(*) overcounts. Count true logical attempts as COUNT(DISTINCT idempotency_key) (or dedup to one row per key — e.g. the latest — before counting). This mirrors deduplication discipline: the unit is the logical attempt, not the row."
    },
    {
      "id": "m20e5",
      "lvl": 5,
      "priority": "boss",
      "title": "Final boss: reconcile a payout",
      "prompt": "A merchant disputes their payout amount. Explain, object by object, how a payout is built from underlying activity and where each piece is booked — so you could reconcile the number end to end.",
      "hints": [
        "Charges add (minus fees); refunds and disputes subtract; the ledger records each as a balance_transaction.",
        "A payout sweeps the available net balance to the bank."
      ],
      "solution": "Every money movement is booked in balance_transactions: a succeeded CHARGE posts +gross with a −fee (net_amount = amount − fee); a REFUND posts −amount; a DISPUTE posts −amount (often −a dispute fee too). Funds become available on balance_transactions.available_on (settlement lag). A PAYOUT sweeps the available net balance to the merchant's bank and is itself a ledger entry (−amount). To reconcile: sum the net_amount of all balance_transactions that settled into this payout's window (charges − fees − refunds − disputes) and confirm it equals the payout amount. The charges table alone (GPV) will NOT reconcile, because it ignores fees, refunds, disputes, and settlement timing — only the ledger does."
    }
  ],
  "quiz": [
    {
      "level": 0,
      "q": "The source of truth for NET revenue is:",
      "options": [
        "charges.amount",
        "balance_transactions.net_amount (the ledger)",
        "invoices.amount_due",
        "payouts.amount"
      ],
      "answer": 1,
      "why": "Only the ledger books fees, refunds, and disputes into net_amount; charges give gross (GPV).",
      "concept": "ledger"
    },
    {
      "level": 1,
      "q": "A dispute is attributed to a merchant by:",
      "options": [
        "A merchant_id on the dispute",
        "Joining the dispute to its charge (charge_id), which carries merchant_id",
        "The dispute's created_at",
        "It can't be"
      ],
      "answer": 1,
      "why": "Disputes (and refunds) reach the merchant through their charge via charge_id.",
      "concept": "relationships"
    },
    {
      "level": 2,
      "q": "Charge amounts are stored as:",
      "options": [
        "Dollars",
        "Cents (divide by 100 for dollars), and currencies can't be summed together",
        "Floats in the merchant's locale",
        "Strings"
      ],
      "answer": 1,
      "why": "Money is in cents; blending currencies adds incommensurable units, so group or convert first.",
      "concept": "money semantics"
    },
    {
      "level": 4,
      "q": "Recent weekly dispute rates look low mainly because:",
      "options": [
        "Fraud actually dropped",
        "Disputes arrive late, so the newest buckets haven't accumulated all disputes (immature data)",
        "The query is wrong",
        "Refunds were higher"
      ],
      "answer": 1,
      "why": "Disputes lag the charge; the latest buckets are provisional until they mature.",
      "concept": "late-arriving data"
    },
    {
      "level": 5,
      "q": "GPV, net revenue, and MRR are:",
      "options": [
        "The same number from different tables",
        "Three different metrics: gross charge volume, ledger net after fees/refunds/disputes, and active-subscription run-rate",
        "All summed from charges",
        "All read from payouts"
      ],
      "answer": 1,
      "why": "They answer different questions and live in different objects; conflating them is a classic object error.",
      "concept": "metric vs object"
    }
  ],
  "mistakes": [
    "Reading net revenue from charges instead of the balance_transactions ledger.",
    "Trying to attribute refunds/disputes without joining through the charge.",
    "Treating cents as dollars, or summing amounts across currencies.",
    "Counting charge rows as attempts when retries share an idempotency_key.",
    "Trusting the newest dispute/refund buckets as final despite late arrival."
  ],
  "edges": [
    "One charge → many refunds/disputes: pre-aggregate to charge grain before joining to avoid fan-out.",
    "Settlement lag: available_on differs from created_at, so 'available' balance ≠ today's gross.",
    "Connected accounts (Stripe Connect): platform vs connected-account attribution changes who owns a charge."
  ],
  "interview": "<p>Before querying, name the object: <em>\"Net revenue is the ledger, not charges; disputes and refunds reach the merchant through the charge; amounts are cents and per-currency; retries share an idempotency_key; disputes arrive late so recent rates are provisional.\"</em> Demonstrating the data model — and which object owns each fact — is what separates a Stripe-fluent analyst from someone who just writes SQL.</p>",
  "followup": {
    "prompt": "Interviewer: \"A merchant says our dashboard's revenue doesn't match their bank deposits. Where do you look?\"",
    "answer": "The dashboard is almost certainly showing GPV (gross succeeded charges) while their bank sees payouts, which are net of fees, refunds, disputes, and subject to settlement timing. I'd reconcile through balance_transactions: sum net_amount of the entries that settled into the relevant payouts and compare to the deposits, and explain the gap as fees + refunds + disputes + in-transit timing — not a data error."
  }
};

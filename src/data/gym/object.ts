import type { Problem } from '@/types';

/* Practice Gym ladder: Stripe Object Literacy (module m20). Reasoning drills (mode 'Object'),
   no SQL execution. Auto-included via src/data/gym/index.ts; referenced by the `obj` ladder. */
export const objectProblems: Problem[] = [
  {
    "id": "ob1",
    "title": "Which object answers the question?",
    "ladder": "obj",
    "pos": 1,
    "stage": "Recognition",
    "lvl": 1,
    "difficulty": "recognition",
    "priority": "required",
    "source": "interview-style",
    "module": "m20",
    "mode": "Object",
    "timed": false,
    "est": "4 min",
    "business": "A new analyst keeps querying the wrong table. The first skill is mapping a question to the object that owns the fact.",
    "task": "No SQL. For each ask, name the primary object and why: (a) failed payment attempts, (b) net revenue after fees, (c) money wired to a merchant's bank, (d) monthly recurring run-rate.",
    "deliverable": "Four (ask → object) mappings, each with a one-line reason.",
    "why": "Choosing the right object is half of every Stripe analysis; the wrong table gives a confident wrong answer.",
    "harder": "First rung — recognise which object owns each fact.",
    "before": [
      "Attempts live on charges; net lives in the ledger; bank transfers are payouts; run-rate is subscriptions.",
      "GPV vs net vs MRR are different objects."
    ],
    "context": "Objects: charges (attempts), customers→merchants, refunds/disputes (attach to a charge), subscriptions→invoices, balance_transactions (the ledger), payouts (to the bank).",
    "prompt": "Map each ask to its primary object and justify in one line.",
    "hints": [
      "\"Attempts\" and \"failed\" ⇒ charges.status.",
      "\"Net\" / \"after fees\" ⇒ balance_transactions.net_amount.",
      "\"Run-rate\" ⇒ active subscriptions, normalized monthly."
    ],
    "model": "(a) charges — status='failed' counts attempts. (b) balance_transactions — net_amount nets fees/refunds/disputes; charges give only gross. (c) payouts — the transfer to the bank (reconciled via the ledger's payout entries). (d) subscriptions — sum the monthly-normalized amount of ACTIVE subs (annual ÷ 12), a snapshot, not a sum of payments.",
    "confusion": "Reading net revenue off charges, or treating MRR as a sum of invoice payments, are the classic object errors.",
    "explain": "Say each mapping aloud: ask → object → the field that owns the fact.",
    "teaches": "Mapping questions to the object that owns the fact.",
    "next": "ob2"
  },
  {
    "id": "ob2",
    "title": "Reach the merchant from a dispute",
    "ladder": "obj",
    "pos": 2,
    "stage": "Relationships",
    "lvl": 2,
    "difficulty": "easy",
    "priority": "required",
    "source": "interview-style",
    "module": "m20",
    "mode": "Object",
    "timed": false,
    "est": "5 min",
    "business": "You need dispute rate per merchant, but a dispute row has no merchant_id.",
    "task": "No SQL. State the join path from a dispute (and a refund) to its merchant, and the grain risk when one charge has several.",
    "deliverable": "The join path dispute→charge→merchant, plus the fan-out risk and its fix.",
    "why": "Refunds and disputes only reach the merchant through the charge; getting the grain wrong double counts money.",
    "harder": "Adds the one-to-many fan-out risk to the join path.",
    "before": [
      "disputes.charge_id → charges.charge_id → charges.merchant_id.",
      "A charge can have multiple refunds/disputes."
    ],
    "context": "disputes(dispute_id, charge_id, amount, ...); refunds(refund_id, charge_id, amount, ...); charges(charge_id, merchant_id, customer_id, ...).",
    "prompt": "Describe how to attribute a dispute (and a refund) to a merchant, and what breaks if you SUM after joining.",
    "hints": [
      "Both disputes and refunds carry charge_id, not merchant_id.",
      "Joining charges → refunds multiplies charge rows when a charge has several refunds."
    ],
    "model": "Path: dispute.charge_id → charge.charge_id → charge.merchant_id (same for refunds). Grain risk: one charge can have many refunds/disputes, so joining charges to them fans out the charge rows; a later SUM(charge.amount) then double-counts. Fix: pre-aggregate refunds/disputes to the charge grain (one row per charge_id) before joining, or aggregate them by merchant separately and combine.",
    "confusion": "Disputes/refunds have no merchant_id; you must route through the charge — and guard the fan-out.",
    "explain": "Trace the two hops and name where fan-out would double-count.",
    "teaches": "Routing child objects to the merchant and avoiding fan-out.",
    "next": "ob3"
  },
  {
    "id": "ob3",
    "title": "GPV vs net vs MRR",
    "ladder": "obj",
    "pos": 3,
    "stage": "Metric vs object",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "required",
    "source": "interview-style",
    "module": "m20",
    "mode": "Object",
    "timed": false,
    "est": "6 min",
    "business": "Leadership says 'revenue' and three people compute three different numbers.",
    "task": "No SQL. Define GPV, net revenue, and MRR, name the object each comes from, and say which is largest and why.",
    "deliverable": "Three definitions, their source objects, and the ordering GPV ≥ net with MRR as a separate run-rate.",
    "why": "Conflating the three is the most common Stripe analytics error; each lives in a different object.",
    "harder": "Forces the distinction between gross volume, ledger net, and a subscription run-rate.",
    "before": [
      "GPV = succeeded charge amounts (gross); net = ledger after fees/refunds/disputes.",
      "MRR = active subscriptions normalized monthly — not a payment sum."
    ],
    "context": "charges (GPV), balance_transactions.net_amount (net), subscriptions (MRR).",
    "prompt": "Define and source each of GPV, net revenue, and MRR; which is largest, and why is MRR not comparable to the other two?",
    "hints": [
      "Net subtracts fees, refunds, disputes from gross.",
      "MRR is a run-rate snapshot, a different unit from a period's volume."
    ],
    "model": "GPV (gross payment volume) = SUM of succeeded charges, from charges — ignores fees/refunds/disputes. Net revenue = SUM(balance_transactions.net_amount), the ledger after fees, refunds, and disputes. MRR = monthly-normalized SUM of ACTIVE subscriptions (annual ÷ 12), from subscriptions. Ordering: GPV ≥ net (deductions only reduce it). MRR is not comparable — it's a forward run-rate snapshot, not a realized volume over a period, so you never add it to GPV or net.",
    "confusion": "GPV is not revenue; net is only in the ledger; MRR is a run-rate, not a payment total.",
    "explain": "State which object owns each number and why GPV ≥ net.",
    "teaches": "Separating three revenue metrics by their source object.",
    "next": "ob4"
  },
  {
    "id": "ob4",
    "title": "Cents, currencies, and a wrong total",
    "ladder": "obj",
    "pos": 4,
    "stage": "Money semantics",
    "lvl": 3,
    "difficulty": "medium",
    "priority": "should",
    "source": "interview-style",
    "module": "m20",
    "mode": "Object",
    "timed": false,
    "est": "5 min",
    "business": "A 'total revenue' figure is off by 100x and mixes currencies.",
    "task": "No SQL. Explain the two money-semantics bugs in SUM(amount) over all charges, and the correct presentation.",
    "deliverable": "The cents bug, the currency-blending bug, and the corrected per-currency, dollar-scaled output.",
    "why": "Money-in-cents and multi-currency are Stripe-specific traps that silently corrupt totals.",
    "harder": "Two simultaneous semantic bugs in a one-line query.",
    "before": [
      "amount is in cents (÷100 for dollars).",
      "usd/eur/gbp can't be summed into one number."
    ],
    "context": "charges.amount is BIGINT cents; charges.currency is a 3-letter code.",
    "prompt": "Name both bugs in SUM(amount) across all charges and give the correct shape.",
    "hints": [
      "Divide by 100 to get dollars.",
      "Group by currency (or convert via FX) — never blend."
    ],
    "model": "Bug 1: amount is in CENTS, so SUM(amount) is 100× the dollar figure — divide by 100.0. Bug 2: summing across currencies (usd+eur+gbp) adds incommensurable units. Correct: GROUP BY currency and report SUM(amount)/100.0 per currency, or convert each to a common currency via an FX rate first. Never present a single blended cents total as 'revenue'.",
    "confusion": "A blended cents total looks like a huge revenue number but is meaningless.",
    "explain": "Call out cents and currency-blending as two separate bugs.",
    "teaches": "Cents conversion and per-currency aggregation.",
    "next": "ob5"
  },
  {
    "id": "ob5",
    "title": "Distinct attempts under retries",
    "ladder": "obj",
    "pos": 5,
    "stage": "Identity & dedup",
    "lvl": 4,
    "difficulty": "hard",
    "priority": "stretch",
    "source": "interview-style",
    "module": "m20",
    "mode": "Object",
    "timed": false,
    "est": "7 min",
    "business": "A merchant's attempt count looks inflated after a retry storm.",
    "task": "No SQL. Identify the field that ties retries together and define 'true logical attempts', plus how it changes a success rate.",
    "deliverable": "The idempotency_key explanation, the distinct-attempt definition, and the effect on the rate's denominator.",
    "why": "Retries duplicate charge rows; counting rows overstates attempts and distorts every rate built on them.",
    "harder": "Connects object identity to the denominator of a downstream rate.",
    "before": [
      "Retried payments share an idempotency_key.",
      "Distinct attempts = distinct idempotency_keys."
    ],
    "context": "charges(charge_id, idempotency_key, status, ...) — a retry reuses the same idempotency_key across rows.",
    "prompt": "Which field groups retries, how do you count true attempts, and how does that change a success rate?",
    "hints": [
      "COUNT(DISTINCT idempotency_key), or dedup to one row per key (e.g. latest).",
      "Both numerator and denominator should be at the logical-attempt grain."
    ],
    "model": "Retries reuse the idempotency_key, so multiple charge rows represent ONE logical attempt. Count true attempts as COUNT(DISTINCT idempotency_key) (or collapse to one row per key — typically the latest/most-successful — then count). For a success rate, both parts move to the logical-attempt grain: an attempt 'succeeded' if any of its rows succeeded (bool_or), divided by distinct attempts. Counting raw rows inflates the denominator and understates the success rate.",
    "confusion": "Raw COUNT(*) treats every retry as a new attempt; the unit is the logical attempt, not the row.",
    "explain": "Define the attempt unit, then show numerator and denominator at that grain.",
    "teaches": "Object identity (idempotency_key) driving correct denominators.",
    "next": "ob6"
  },
  {
    "id": "ob6",
    "title": "Final boss: reconcile a payout to the ledger",
    "ladder": "obj",
    "pos": 6,
    "stage": "Final boss",
    "lvl": 5,
    "difficulty": "final-boss",
    "priority": "boss",
    "source": "Stripe-interview-style",
    "module": "m20",
    "mode": "Object",
    "timed": true,
    "est": "10 min",
    "business": "A merchant disputes their payout amount versus what they think they earned (their GPV).",
    "task": "No SQL. Walk object-by-object how a payout is built from activity and where each piece is booked, so you can reconcile it end to end and explain the gap to GPV.",
    "deliverable": "The ledger reconciliation (charges − fees − refunds − disputes, settled) equalling the payout, and why GPV won't match.",
    "why": "Payout reconciliation is the capstone of object literacy: it forces the full charge→ledger→payout chain and the gross-vs-net gap.",
    "harder": "Combines every object, money semantics, and settlement timing into one explanation under time pressure.",
    "before": [
      "Every money movement is a balance_transaction: charge (+gross −fee), refund (−), dispute (−, often −fee).",
      "A payout sweeps the available net balance; available_on encodes settlement lag."
    ],
    "context": "balance_transactions(type, gross_amount, fee, net_amount, source_id, available_on); payouts(payout_id, merchant_id, amount, arrival_date).",
    "prompt": "Explain, object by object, how the payout amount is built and reconciled, and why it differs from the merchant's GPV.",
    "hints": [
      "Sum net_amount of the ledger entries that settled into the payout's window.",
      "GPV ignores fees, refunds, disputes, and settlement timing."
    ],
    "model": "Each succeeded CHARGE books a balance_transaction of +gross with a −fee (net_amount = amount − fee). Each REFUND books −amount; each DISPUTE books −amount (often a −dispute fee too). Funds become available on balance_transactions.available_on (a settlement lag after created_at). A PAYOUT sweeps the available NET balance to the bank and is itself a ledger entry (−amount). To reconcile: SUM(net_amount) of the balance_transactions that settled into this payout's window (charges − fees − refunds − disputes) should equal the payout amount. It will NOT match the merchant's GPV, because GPV is gross succeeded charges only — it omits Stripe fees, refunds, disputes, and the timing of settlement. The gap = fees + refunds + disputes + in-transit/timing differences, all visible in the ledger.",
    "rubric": [
      "Each object's ledger entry named (charge +gross −fee, refund −, dispute −)",
      "Payout = swept available net balance, itself a ledger entry",
      "Reconciliation via SUM(net_amount) over the settled window",
      "Explains the GPV gap as fees + refunds + disputes + settlement timing",
      "Notes available_on / settlement lag"
    ],
    "confusion": "Charges alone (GPV) never reconcile to a payout; only the net ledger does.",
    "explain": "Defend the reconciliation and the gross-vs-net gap as if to the merchant.",
    "teaches": "End-to-end payout reconciliation through the ledger."
  }
];

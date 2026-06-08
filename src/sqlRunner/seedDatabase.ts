/*
 * Deterministic synthetic Stripe-style dataset for the in-browser PGlite sandbox.
 *
 * Why a generator, not a static blob (§18): the source stays compact and the ~30k rows
 * are built in memory at seed time. A seeded PRNG (mulberry32) makes the STRUCTURE
 * deterministic; timestamps are emitted relative to `now()` so every rolling-window query
 * (`now() - interval '60 days'`) always has in-window data regardless of when the app runs.
 *
 * Schema mirrors src/data/schema.ts exactly (column names and order). Foreign keys are not
 * enforced — the generator already produces referentially consistent ids, and skipping FK
 * constraints keeps insert order free and seeding fast.
 */

/* ---- seeded PRNG (deterministic, no Math.random at runtime) ---- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 0x5713c0de;

/* ---- SQL value helpers ---- */
const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const ts = (hoursAgo: number) => `now() - interval '${Math.max(1, Math.round(hoursAgo))} hours'`;
const dt = (hoursAgo: number) => `(now() - interval '${Math.max(1, Math.round(hoursAgo))} hours')::date`;

/* ---- categorical pools ---- */
const COUNTRIES = ['US', 'US', 'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IN', 'SG'];
const CURRENCIES = ['usd', 'usd', 'usd', 'usd', 'gbp', 'eur', 'cad', 'aud'];
const PAYMENT_METHODS = ['card', 'card', 'card', 'card', 'ach', 'wallet'];
const FAILURE_CODES = ['card_declined', 'insufficient_funds', 'expired_card', 'processing_error', 'lost_card', 'incorrect_cvc'];
const DISPUTE_REASONS = ['fraudulent', 'product_not_received', 'duplicate', 'subscription_canceled', 'unrecognized'];
const DISPUTE_STATUS = ['won', 'lost', 'needs_response', 'under_review'];
const REFUND_REASONS = ['requested_by_customer', 'requested_by_customer', 'duplicate', 'fraudulent'];
const SUB_STATUS = ['active', 'active', 'active', 'canceled', 'past_due', 'trialing'];
const INVOICE_STATUS = ['paid', 'paid', 'paid', 'open', 'void', 'uncollectible'];
const PLAN_IDS = ['basic_m', 'pro_m', 'scale_m', 'basic_y', 'pro_y'];
const MCC = ['5045', '5732', '5812', '7372', '5999', '8999'];
const AMOUNTS = [999, 1500, 1999, 2500, 2999, 4999, 5000, 7900, 9900, 12000, 19900, 25000];

/* ---- volume knobs (tuned so boot stays ~2s while floors/anomalies are demonstrable) ---- */
const N_MERCHANTS = 25;
const N_ACCOUNTS = 12;
const N_CUSTOMERS = 1200;
const RECENT_DAYS = 60;      // dense window the rolling-metric queries operate over
const RECENT_PER_DAY = 140;
const OLDER_DAYS = 340;      // sparse long tail for 12-month lookbacks (retention/revenue)
const OLDER_PER_DAY = 12;
const N_SUBSCRIPTIONS = 400;
const EXPERIMENT = 'checkout_v2';

type ChargeRow = { id: number; merchantId: number; customerId: number; amount: number; status: string; hoursAgo: number };

function buildSeedSql(): string {
  const rnd = mulberry32(SEED);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
  const randInt = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
  const chance = (p: number) => rnd() < p;

  /* DDL — column order matches src/data/schema.ts. `interval` is quoted (keyword). */
  const ddl = `
CREATE TABLE merchants (merchant_id BIGINT PRIMARY KEY, name TEXT, country CHAR(2), mcc TEXT, created_at TIMESTAMPTZ, is_platform BOOLEAN);
CREATE TABLE connected_accounts (account_id BIGINT PRIMARY KEY, platform_merchant_id BIGINT, country CHAR(2), created_at TIMESTAMPTZ, charges_enabled BOOLEAN, payouts_enabled BOOLEAN);
CREATE TABLE customers (customer_id BIGINT PRIMARY KEY, merchant_id BIGINT, email TEXT, country CHAR(2), created_at TIMESTAMPTZ);
CREATE TABLE charges (charge_id BIGINT PRIMARY KEY, merchant_id BIGINT, customer_id BIGINT, amount BIGINT, currency CHAR(3), status TEXT, captured BOOLEAN, payment_method TEXT, card_country CHAR(2), failure_code TEXT, idempotency_key TEXT, created_at TIMESTAMPTZ);
CREATE TABLE refunds (refund_id BIGINT PRIMARY KEY, charge_id BIGINT, amount BIGINT, reason TEXT, created_at TIMESTAMPTZ);
CREATE TABLE disputes (dispute_id BIGINT PRIMARY KEY, charge_id BIGINT, amount BIGINT, reason TEXT, status TEXT, created_at TIMESTAMPTZ);
CREATE TABLE subscriptions (subscription_id BIGINT PRIMARY KEY, customer_id BIGINT, merchant_id BIGINT, plan_id TEXT, amount BIGINT, "interval" TEXT, status TEXT, started_at TIMESTAMPTZ, canceled_at TIMESTAMPTZ);
CREATE TABLE invoices (invoice_id BIGINT PRIMARY KEY, subscription_id BIGINT, customer_id BIGINT, merchant_id BIGINT, amount_due BIGINT, amount_paid BIGINT, status TEXT, created_at TIMESTAMPTZ, paid_at TIMESTAMPTZ);
CREATE TABLE balance_transactions (balance_transaction_id BIGINT PRIMARY KEY, merchant_id BIGINT, source_id BIGINT, type TEXT, gross_amount BIGINT, fee BIGINT, net_amount BIGINT, currency CHAR(3), created_at TIMESTAMPTZ, available_on DATE);
CREATE TABLE payouts (payout_id BIGINT PRIMARY KEY, merchant_id BIGINT, amount BIGINT, status TEXT, arrival_date DATE, created_at TIMESTAMPTZ);
CREATE TABLE experiment_exposures (exposure_id BIGINT PRIMARY KEY, customer_id BIGINT, experiment TEXT, variant TEXT, exposed_at TIMESTAMPTZ);
`;

  /* ---- merchants ---- */
  const merchants: string[] = [];
  for (let i = 1; i <= N_MERCHANTS; i++) {
    merchants.push(`(${i}, ${q('Merchant ' + i)}, ${q(pick(COUNTRIES))}, ${q(pick(MCC))}, ${ts(randInt(400, 900) * 24)}, ${i <= 4})`);
  }

  /* ---- connected accounts (under the platform merchants 1..4) ---- */
  const accounts: string[] = [];
  for (let i = 1; i <= N_ACCOUNTS; i++) {
    accounts.push(`(${i}, ${randInt(1, 4)}, ${q(pick(COUNTRIES))}, ${ts(randInt(100, 600) * 24)}, ${chance(0.9)}, ${chance(0.8)})`);
  }

  /* ---- customers (each scoped to a merchant) ---- */
  const customers: string[] = [];
  const custMerchant: number[] = [0]; // 1-indexed
  for (let i = 1; i <= N_CUSTOMERS; i++) {
    const m = randInt(1, N_MERCHANTS);
    custMerchant[i] = m;
    const signupDaysAgo = randInt(1, 400);
    customers.push(`(${i}, ${m}, ${q('c' + i + '@example.com')}, ${q(pick(COUNTRIES))}, ${ts(signupDaysAgo * 24)})`);
  }

  /* ---- charges (the workhorse) ---- */
  const charges: ChargeRow[] = [];
  const chargeValues: string[] = [];
  let chargeId = 0;
  const addCharge = (daysAgo: number, opts: { forceStatus?: string; forceFailureCode?: string; customerId?: number; hoursAgo?: number } = {}): ChargeRow => {
    chargeId++;
    const customerId = opts.customerId ?? randInt(1, N_CUSTOMERS);
    const merchantId = custMerchant[customerId];
    const amount = pick(AMOUNTS) + randInt(0, 400);
    let status = opts.forceStatus;
    if (!status) {
      const r = rnd();
      status = r < 0.78 ? 'succeeded' : r < 0.95 ? 'failed' : 'pending';
    }
    const hoursAgo = opts.hoursAgo ?? daysAgo * 24 - randInt(0, 23);
    const row: ChargeRow = { id: chargeId, merchantId, customerId, amount, status, hoursAgo };
    charges.push(row);
    const failureCode = status === 'failed' ? opts.forceFailureCode ?? pick(FAILURE_CODES) : null;
    const captured = status === 'succeeded';
    chargeValues.push(
      `(${chargeId}, ${merchantId}, ${customerId}, ${amount}, ${q(pick(CURRENCIES))}, ${q(status)}, ${captured}, ${q(pick(PAYMENT_METHODS))}, ${q(pick(COUNTRIES))}, ${failureCode ? q(failureCode) : 'NULL'}, ${q('idem_' + chargeId)}, ${ts(hoursAgo)})`
    );
    return row;
  };

  // baseline volume: dense recent window, sparse long tail
  for (let d = 0; d < RECENT_DAYS; d++) for (let k = 0; k < RECENT_PER_DAY; k++) addCharge(d + 1);
  for (let d = RECENT_DAYS; d < RECENT_DAYS + OLDER_DAYS; d++) for (let k = 0; k < OLDER_PER_DAY; k++) addCharge(d + 1);

  // engineered anomalies — each pinned to a single instant (12h into the day, maximally far
  // from either midnight boundary) so the whole spike lands in ONE DATE_TRUNC day bucket
  // regardless of the wall-clock time the sandbox boots; the z-score then spikes hard.
  const band = (day: number) => day * 24 - 12;
  for (let k = 0; k < 80; k++) addCharge(8, { forceStatus: 'failed', hoursAgo: band(8) });            // failure-count spike, ~8 days ago
  for (let k = 0; k < 65; k++) addCharge(12, { forceStatus: 'failed', forceFailureCode: 'card_declined', hoursAgo: band(12) }); // failure-code spike, ~12 days ago
  const day6Charges: ChargeRow[] = [];
  for (let k = 0; k < 220; k++) day6Charges.push(addCharge(6, { forceStatus: 'succeeded', hoursAgo: band(6) })); // dispute-rate spike: volume over the 200 floor

  // a few duplicate idempotency keys (retry storms) for dedup-style queries
  for (let k = 0; k < 30; k++) {
    chargeId++;
    const src = charges[randInt(0, charges.length - 1)];
    chargeValues.push(
      `(${chargeId}, ${src.merchantId}, ${src.customerId}, ${src.amount}, 'usd', 'succeeded', true, 'card', 'US', NULL, ${q('idem_' + src.id)}, ${ts(src.hoursAgo - 1)})`
    );
  }

  /* ---- refunds (~3% of succeeded charges) ---- */
  const refunds: string[] = [];
  let refundId = 0;
  for (const c of charges) {
    if (c.status === 'succeeded' && chance(0.03)) {
      refundId++;
      const amt = chance(0.7) ? c.amount : Math.round(c.amount * (0.3 + rnd() * 0.5));
      refunds.push(`(${refundId}, ${c.id}, ${amt}, ${q(pick(REFUND_REASONS))}, ${ts(Math.max(1, c.hoursAgo - randInt(12, 240)))})`);
    }
  }

  /* ---- disputes (~1.2% of succeeded; lag the charge) + a dispute-rate spike on day -6 ---- */
  const disputes: string[] = [];
  let disputeId = 0;
  const addDispute = (c: ChargeRow) => {
    disputeId++;
    disputes.push(`(${disputeId}, ${c.id}, ${c.amount}, ${q(pick(DISPUTE_REASONS))}, ${q(pick(DISPUTE_STATUS))}, ${ts(Math.max(1, c.hoursAgo - randInt(48, 480)))})`);
  };
  for (const c of charges) if (c.status === 'succeeded' && chance(0.012)) addDispute(c);
  // spike: dispute a chunk of the clustered day -6 succeeded charges (an5 buckets by charge day)
  for (let i = 0; i < 30 && i < day6Charges.length; i++) addDispute(day6Charges[i]);

  /* ---- subscriptions ---- */
  const subscriptions: string[] = [];
  for (let i = 1; i <= N_SUBSCRIPTIONS; i++) {
    const customerId = randInt(1, N_CUSTOMERS);
    const merchantId = custMerchant[customerId];
    const status = pick(SUB_STATUS);
    const startedDaysAgo = randInt(20, 380);
    const canceled = status === 'canceled';
    subscriptions.push(
      `(${i}, ${customerId}, ${merchantId}, ${q(pick(PLAN_IDS))}, ${pick(AMOUNTS)}, ${q(chance(0.8) ? 'month' : 'year')}, ${q(status)}, ${ts(startedDaysAgo * 24)}, ${canceled ? ts(randInt(1, startedDaysAgo) * 24) : 'NULL'})`
    );
  }

  /* ---- invoices (a few per subscription) ---- */
  const invoices: string[] = [];
  let invoiceId = 0;
  for (let s = 1; s <= N_SUBSCRIPTIONS; s++) {
    const n = randInt(1, 4);
    const customerId = randInt(1, N_CUSTOMERS);
    const merchantId = custMerchant[customerId];
    for (let k = 0; k < n; k++) {
      invoiceId++;
      const due = pick(AMOUNTS);
      const status = pick(INVOICE_STATUS);
      const paid = status === 'paid' ? due : 0;
      const createdHrs = randInt(5, 360) * 24;
      invoices.push(`(${invoiceId}, ${s}, ${customerId}, ${merchantId}, ${due}, ${paid}, ${q(status)}, ${ts(createdHrs)}, ${status === 'paid' ? ts(createdHrs - 24) : 'NULL'})`);
    }
  }

  /* ---- balance_transactions (the ledger: source of truth for net) ---- */
  const bts: string[] = [];
  let btId = 0;
  const FEE_PCT = 0.029, FEE_FIXED = 30;
  for (const c of charges) {
    if (c.status !== 'succeeded') continue;
    btId++;
    const fee = Math.round(c.amount * FEE_PCT) + FEE_FIXED;
    bts.push(`(${btId}, ${c.merchantId}, ${c.id}, 'charge', ${c.amount}, ${fee}, ${c.amount - fee}, 'usd', ${ts(c.hoursAgo)}, ${dt(Math.max(1, c.hoursAgo - 48))})`);
  }

  /* ---- payouts (weekly per merchant) + their ledger rows ---- */
  const payouts: string[] = [];
  let payoutId = 0;
  for (let m = 1; m <= N_MERCHANTS; m++) {
    for (let w = 0; w < 12; w++) {
      payoutId++;
      const amount = randInt(50000, 800000);
      const hrs = (w * 7 + 2) * 24;
      payouts.push(`(${payoutId}, ${m}, ${amount}, ${q(chance(0.92) ? 'paid' : 'in_transit')}, ${dt(hrs)}, ${ts(hrs)})`);
      btId++;
      bts.push(`(${btId}, ${m}, ${payoutId}, 'payout', ${-amount}, 0, ${-amount}, 'usd', ${ts(hrs)}, ${dt(hrs)})`);
    }
  }

  /* ---- experiment_exposures: checkout_v2, ITT lift baked in, with contamination ---- */
  const exposures: string[] = [];
  let exposureId = 0;
  const CONTROL_RATE = 0.55, TREATMENT_RATE = 0.61;
  const exposedCustomers = new Set<number>();
  // assign ~2000 distinct customers; reuse customer ids (some repeats are fine, dedup by query)
  const assignCount = 2000;
  for (let i = 0; i < assignCount; i++) {
    const customerId = randInt(1, N_CUSTOMERS);
    if (exposedCustomers.has(customerId)) continue;
    exposedCustomers.add(customerId);
    const variant = chance(0.5) ? 'control' : 'treatment';
    const exposedDaysAgo = randInt(8, 30); // leave room for a 7-day conversion window in the past
    const exposedHoursAgo = exposedDaysAgo * 24 - randInt(0, 23);
    exposureId++;
    exposures.push(`(${exposureId}, ${customerId}, ${q(EXPERIMENT)}, ${q(variant)}, ${ts(exposedHoursAgo)})`);
    // bake a conversion: a succeeded charge within 7 days AFTER exposure, at the variant's rate
    const rate = variant === 'treatment' ? TREATMENT_RATE : CONTROL_RATE;
    if (chance(rate)) {
      const convHoursAgo = exposedHoursAgo - randInt(2, 6) * 24; // strictly after exposure, within 7 days, still in the past
      const c = addCharge(0, { forceStatus: 'succeeded', customerId, hoursAgo: convHoursAgo });
      // treatment guardrail: slightly higher dispute rate on its conversions
      if (chance(variant === 'treatment' ? 0.02 : 0.008)) addDispute(c);
    }
  }
  // contamination: ~15 customers exposed to BOTH arms (ab7 must exclude them)
  const contaminated = Array.from(exposedCustomers).slice(0, 15);
  for (const customerId of contaminated) {
    exposureId++;
    exposures.push(`(${exposureId}, ${customerId}, ${q(EXPERIMENT)}, 'treatment', ${ts(randInt(8, 30) * 24)})`);
  }

  /* ---- assemble: batched multi-row INSERTs (chunks of 1000) ---- */
  const insertBatched = (table: string, cols: string, rows: string[]): string => {
    if (!rows.length) return '';
    const out: string[] = [];
    for (let i = 0; i < rows.length; i += 1000) {
      out.push(`INSERT INTO ${table} (${cols}) VALUES\n${rows.slice(i, i + 1000).join(',\n')};`);
    }
    return out.join('\n');
  };

  /* Indexes created AFTER bulk insert. Without these, the correlated-subquery solutions
     (recovery EXISTS, A/B joins) seq-scan ~14k rows per probe and are slow in WASM. With them,
     every gold solution runs in well under a second in the browser. ANALYZE so the planner uses them. */
  const indexes = `
CREATE INDEX idx_charges_customer ON charges(customer_id);
CREATE INDEX idx_charges_created ON charges(created_at);
CREATE INDEX idx_charges_status ON charges(status);
CREATE INDEX idx_charges_merchant ON charges(merchant_id);
CREATE INDEX idx_charges_failcode ON charges(failure_code);
CREATE INDEX idx_charges_idem ON charges(idempotency_key);
CREATE INDEX idx_disputes_charge ON disputes(charge_id);
CREATE INDEX idx_refunds_charge ON refunds(charge_id);
CREATE INDEX idx_exp_customer ON experiment_exposures(customer_id);
CREATE INDEX idx_exp_experiment ON experiment_exposures(experiment);
CREATE INDEX idx_bt_merchant ON balance_transactions(merchant_id);
CREATE INDEX idx_bt_source ON balance_transactions(source_id);
CREATE INDEX idx_inv_sub ON invoices(subscription_id);
CREATE INDEX idx_inv_customer ON invoices(customer_id);
CREATE INDEX idx_sub_customer ON subscriptions(customer_id);
CREATE INDEX idx_sub_merchant ON subscriptions(merchant_id);
CREATE INDEX idx_customers_merchant ON customers(merchant_id);
ANALYZE;`;

  return [
    ddl,
    insertBatched('merchants', 'merchant_id, name, country, mcc, created_at, is_platform', merchants),
    insertBatched('connected_accounts', 'account_id, platform_merchant_id, country, created_at, charges_enabled, payouts_enabled', accounts),
    insertBatched('customers', 'customer_id, merchant_id, email, country, created_at', customers),
    insertBatched('charges', 'charge_id, merchant_id, customer_id, amount, currency, status, captured, payment_method, card_country, failure_code, idempotency_key, created_at', chargeValues),
    insertBatched('refunds', 'refund_id, charge_id, amount, reason, created_at', refunds),
    insertBatched('disputes', 'dispute_id, charge_id, amount, reason, status, created_at', disputes),
    insertBatched('subscriptions', 'subscription_id, customer_id, merchant_id, plan_id, amount, "interval", status, started_at, canceled_at', subscriptions),
    insertBatched('invoices', 'invoice_id, subscription_id, customer_id, merchant_id, amount_due, amount_paid, status, created_at, paid_at', invoices),
    insertBatched('balance_transactions', 'balance_transaction_id, merchant_id, source_id, type, gross_amount, fee, net_amount, currency, created_at, available_on', bts),
    insertBatched('payouts', 'payout_id, merchant_id, amount, status, arrival_date, created_at', payouts),
    insertBatched('experiment_exposures', 'exposure_id, customer_id, experiment, variant, exposed_at', exposures),
    indexes,
  ].join('\n');
}

/** The full DDL + INSERT script, built once (deterministic structure, now()-relative timestamps). */
export const SEED_SQL: string = buildSeedSql();

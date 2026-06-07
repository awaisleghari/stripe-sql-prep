import type { SchemaTables } from '@/types';

/**
 * Synthetic Stripe-style schema. All money is stored in CENTS.
 * balance_transactions is the ledger source of truth for net revenue.
 * (Repo-1 includes a representative subset; full migration lands in Repo-2.)
 */
export const SCHEMA: SchemaTables = [
  {
    name: 'merchants',
    grain: 'one row per merchant (Stripe account)',
    whenToUse: 'Merchant attributes, country, platform flag. The dimension you group metrics by.',
    joinKeys: ['merchant_id'],
    mistake: 'Treating a platform row and its connected accounts as the same grain.',
    columns: [
      { name: 'merchant_id', type: 'text', note: 'PK' },
      { name: 'name', type: 'text' },
      { name: 'country', type: 'text', note: 'ISO-2' },
      { name: 'is_platform', type: 'boolean' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'charges',
    grain: 'one row per charge (payment attempt)',
    whenToUse: 'Approval/failure rates, GPV (gross), payment-method and decline analysis.',
    joinKeys: ['charge_id', 'merchant_id', 'customer_id'],
    mistake: 'Using SUM(amount) as revenue — that is gross volume, not net.',
    columns: [
      { name: 'charge_id', type: 'text', note: 'PK' },
      { name: 'merchant_id', type: 'text', note: 'FK -> merchants' },
      { name: 'customer_id', type: 'text', note: 'FK -> customers' },
      { name: 'status', type: 'text', note: 'succeeded | failed | pending' },
      { name: 'amount', type: 'integer', note: 'CENTS' },
      { name: 'currency', type: 'text' },
      { name: 'payment_method', type: 'text', note: 'card | ach | ...' },
      { name: 'card_country', type: 'text' },
      { name: 'failure_code', type: 'text', note: 'null unless failed' },
      { name: 'idempotency_key', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'refunds',
    grain: 'one row per refund',
    whenToUse: 'Refund rate, refund reasons. Merchant/CS-initiated returns of funds.',
    joinKeys: ['refund_id', 'charge_id'],
    mistake: 'Confusing refunds (merchant-initiated) with disputes (bank chargebacks).',
    columns: [
      { name: 'refund_id', type: 'text', note: 'PK' },
      { name: 'charge_id', type: 'text', note: 'FK -> charges' },
      { name: 'amount', type: 'integer', note: 'CENTS' },
      { name: 'reason', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'disputes',
    grain: 'one row per dispute (chargeback)',
    whenToUse: 'Dispute/chargeback rate, fraud signals. Cardholder/bank-initiated.',
    joinKeys: ['dispute_id', 'charge_id'],
    mistake: 'Forgetting disputes arrive 30–60 days late — recent cohorts look artificially clean.',
    columns: [
      { name: 'dispute_id', type: 'text', note: 'PK' },
      { name: 'charge_id', type: 'text', note: 'FK -> charges' },
      { name: 'status', type: 'text', note: 'won | lost | under_review' },
      { name: 'amount', type: 'integer', note: 'CENTS' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'balance_transactions',
    grain: 'one row per money movement (ledger entry)',
    whenToUse: 'Net revenue, fees, settlement. THE source of truth for money kept.',
    joinKeys: ['balance_transaction_id', 'merchant_id', 'source_id'],
    mistake: 'created_at (when it happened) vs available_on (when it settles) are different.',
    columns: [
      { name: 'balance_transaction_id', type: 'text', note: 'PK' },
      { name: 'merchant_id', type: 'text', note: 'FK -> merchants' },
      { name: 'source_id', type: 'text', note: 'charge/refund/dispute id' },
      { name: 'type', type: 'text', note: 'charge | refund | dispute | fee | payout' },
      { name: 'gross_amount', type: 'integer', note: 'CENTS, signed' },
      { name: 'fee', type: 'integer', note: 'CENTS' },
      { name: 'net_amount', type: 'integer', note: 'CENTS, signed (gross - fee)' },
      { name: 'currency', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
      { name: 'available_on', type: 'timestamptz' },
    ],
  },
];

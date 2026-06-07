import type { SchemaTables } from '@/types';

/* MIGRATED synthetic Stripe-style schema. Money is in CENTS; balance_transactions is the ledger source of truth. */
export const SCHEMA: SchemaTables = [
  {
    "name": "merchants",
    "desc": "Businesses on the platform.",
    "columns": [
      {
        "name": "merchant_id",
        "type": "BIGINT PK"
      },
      {
        "name": "name",
        "type": "TEXT"
      },
      {
        "name": "country",
        "type": "CHAR(2)"
      },
      {
        "name": "mcc",
        "type": "TEXT"
      },
      {
        "name": "created_at",
        "type": "TIMESTAMPTZ"
      },
      {
        "name": "is_platform",
        "type": "BOOLEAN"
      }
    ]
  },
  {
    "name": "connected_accounts",
    "desc": "Sub-accounts under a platform (Stripe Connect).",
    "columns": [
      {
        "name": "account_id",
        "type": "BIGINT PK"
      },
      {
        "name": "platform_merchant_id",
        "type": "BIGINT → merchants"
      },
      {
        "name": "country",
        "type": "CHAR(2)"
      },
      {
        "name": "created_at",
        "type": "TIMESTAMPTZ"
      },
      {
        "name": "charges_enabled",
        "type": "BOOLEAN"
      },
      {
        "name": "payouts_enabled",
        "type": "BOOLEAN"
      }
    ]
  },
  {
    "name": "customers",
    "desc": "Buyers, scoped to a merchant.",
    "columns": [
      {
        "name": "customer_id",
        "type": "BIGINT PK"
      },
      {
        "name": "merchant_id",
        "type": "BIGINT → merchants"
      },
      {
        "name": "email",
        "type": "TEXT"
      },
      {
        "name": "country",
        "type": "CHAR(2)"
      },
      {
        "name": "created_at",
        "type": "TIMESTAMPTZ"
      }
    ]
  },
  {
    "name": "charges",
    "desc": "Every payment attempt. The workhorse table.",
    "columns": [
      {
        "name": "charge_id",
        "type": "BIGINT PK"
      },
      {
        "name": "merchant_id",
        "type": "BIGINT → merchants"
      },
      {
        "name": "customer_id",
        "type": "BIGINT → customers"
      },
      {
        "name": "amount",
        "type": "BIGINT (cents)"
      },
      {
        "name": "currency",
        "type": "CHAR(3)"
      },
      {
        "name": "status",
        "type": "'succeeded'|'failed'|'pending'"
      },
      {
        "name": "captured",
        "type": "BOOLEAN"
      },
      {
        "name": "payment_method",
        "type": "'card'|'ach'|'wallet'"
      },
      {
        "name": "card_country",
        "type": "CHAR(2)"
      },
      {
        "name": "failure_code",
        "type": "TEXT (nullable)"
      },
      {
        "name": "idempotency_key",
        "type": "TEXT"
      },
      {
        "name": "created_at",
        "type": "TIMESTAMPTZ"
      }
    ]
  },
  {
    "name": "refunds",
    "desc": "Merchant-initiated givebacks. Joins to a charge.",
    "columns": [
      {
        "name": "refund_id",
        "type": "BIGINT PK"
      },
      {
        "name": "charge_id",
        "type": "BIGINT → charges"
      },
      {
        "name": "amount",
        "type": "BIGINT (cents)"
      },
      {
        "name": "reason",
        "type": "'requested_by_customer'|'duplicate'|'fraudulent'"
      },
      {
        "name": "created_at",
        "type": "TIMESTAMPTZ"
      }
    ]
  },
  {
    "name": "disputes",
    "desc": "Bank-forced chargebacks. Arrive late.",
    "columns": [
      {
        "name": "dispute_id",
        "type": "BIGINT PK"
      },
      {
        "name": "charge_id",
        "type": "BIGINT → charges"
      },
      {
        "name": "amount",
        "type": "BIGINT (cents)"
      },
      {
        "name": "reason",
        "type": "'fraudulent'|'product_not_received'|..."
      },
      {
        "name": "status",
        "type": "'won'|'lost'|'needs_response'|'under_review'"
      },
      {
        "name": "created_at",
        "type": "TIMESTAMPTZ (lags charge)"
      }
    ]
  },
  {
    "name": "subscriptions",
    "desc": "Recurring billing agreements.",
    "columns": [
      {
        "name": "subscription_id",
        "type": "BIGINT PK"
      },
      {
        "name": "customer_id",
        "type": "BIGINT → customers"
      },
      {
        "name": "merchant_id",
        "type": "BIGINT → merchants"
      },
      {
        "name": "plan_id",
        "type": "TEXT"
      },
      {
        "name": "amount",
        "type": "BIGINT (cents / period)"
      },
      {
        "name": "interval",
        "type": "'month'|'year'"
      },
      {
        "name": "status",
        "type": "'active'|'canceled'|'past_due'|'trialing'"
      },
      {
        "name": "started_at",
        "type": "TIMESTAMPTZ"
      },
      {
        "name": "canceled_at",
        "type": "TIMESTAMPTZ (nullable)"
      }
    ]
  },
  {
    "name": "invoices",
    "desc": "Bills generated per billing cycle.",
    "columns": [
      {
        "name": "invoice_id",
        "type": "BIGINT PK"
      },
      {
        "name": "subscription_id",
        "type": "BIGINT (nullable) → subscriptions"
      },
      {
        "name": "customer_id",
        "type": "BIGINT → customers"
      },
      {
        "name": "merchant_id",
        "type": "BIGINT → merchants"
      },
      {
        "name": "amount_due",
        "type": "BIGINT"
      },
      {
        "name": "amount_paid",
        "type": "BIGINT"
      },
      {
        "name": "status",
        "type": "'paid'|'open'|'void'|'uncollectible'"
      },
      {
        "name": "created_at",
        "type": "TIMESTAMPTZ"
      },
      {
        "name": "paid_at",
        "type": "TIMESTAMPTZ (nullable)"
      }
    ]
  },
  {
    "name": "balance_transactions",
    "desc": "The LEDGER. Net revenue truly lives here.",
    "columns": [
      {
        "name": "balance_transaction_id",
        "type": "BIGINT PK"
      },
      {
        "name": "merchant_id",
        "type": "BIGINT → merchants"
      },
      {
        "name": "source_id",
        "type": "BIGINT (charge/refund/payout id)"
      },
      {
        "name": "type",
        "type": "'charge'|'refund'|'dispute'|'payout'|'fee'|'adjustment'"
      },
      {
        "name": "gross_amount",
        "type": "BIGINT"
      },
      {
        "name": "fee",
        "type": "BIGINT"
      },
      {
        "name": "net_amount",
        "type": "BIGINT"
      },
      {
        "name": "currency",
        "type": "CHAR(3)"
      },
      {
        "name": "created_at",
        "type": "TIMESTAMPTZ"
      },
      {
        "name": "available_on",
        "type": "DATE (settlement)"
      }
    ]
  },
  {
    "name": "payouts",
    "desc": "Money wired to the merchant bank.",
    "columns": [
      {
        "name": "payout_id",
        "type": "BIGINT PK"
      },
      {
        "name": "merchant_id",
        "type": "BIGINT → merchants"
      },
      {
        "name": "amount",
        "type": "BIGINT"
      },
      {
        "name": "status",
        "type": "'paid'|'pending'|'failed'|'in_transit'"
      },
      {
        "name": "arrival_date",
        "type": "DATE"
      },
      {
        "name": "created_at",
        "type": "TIMESTAMPTZ"
      }
    ]
  },
  {
    "name": "experiment_exposures",
    "desc": "A/B test assignments (e.g. Northwind checkout).",
    "columns": [
      {
        "name": "exposure_id",
        "type": "BIGINT PK"
      },
      {
        "name": "customer_id",
        "type": "BIGINT → customers"
      },
      {
        "name": "experiment",
        "type": "TEXT"
      },
      {
        "name": "variant",
        "type": "'control'|'treatment'"
      },
      {
        "name": "exposed_at",
        "type": "TIMESTAMPTZ"
      }
    ]
  }
];

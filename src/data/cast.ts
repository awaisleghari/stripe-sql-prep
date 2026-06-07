import type { TagColor } from '@/types';

export interface CastMerchant {
  id: number;
  name: string;
  country: string;
  role: string;
  tag: TagColor;
  story: string;
}

/* MIGRATED recurring merchant cast used across problem prompts for continuity. */
export const CAST: CastMerchant[] = [
  {
    "id": 101,
    "name": "Northwind Coffee",
    "country": "US",
    "role": "High-failure merchant",
    "tag": "volcano",
    "story": "~22% of charges fail; declines skew to insufficient_funds and card declines. Also runs the checkout A/B test."
  },
  {
    "id": 102,
    "name": "Velvet Apparel",
    "country": "US",
    "role": "High-refund merchant",
    "tag": "gold",
    "story": "~9% refund rate, mostly requested_by_customer. Great for net-revenue vs gross-volume lessons."
  },
  {
    "id": 103,
    "name": "PixelForge Games",
    "country": "GB",
    "role": "High-dispute + late data",
    "tag": "red",
    "story": "~1.8% dispute rate, many fraudulent. Disputes arrive 30–60 days AFTER the charge — late-arriving data."
  },
  {
    "id": 104,
    "name": "MarketHub",
    "country": "US",
    "role": "Platform (Connect)",
    "tag": "geekblue",
    "story": "is_platform = true, with ~40 connected accounts across US/CA/GB. Roll-ups differ at platform vs account grain."
  },
  {
    "id": 105,
    "name": "StreamBox",
    "country": "US",
    "role": "Subscription merchant",
    "tag": "blue",
    "story": "$9.99 / $19.99 monthly plans. Churn, past_due dunning, MRR cohorts."
  },
  {
    "id": 106,
    "name": "GlobalGoods",
    "country": "DE",
    "role": "Multi-currency merchant",
    "tag": "green",
    "story": "Charges in USD/EUR/GBP/JPY. You cannot SUM cents across currencies."
  },
  {
    "id": 107,
    "name": "CloudDesk",
    "country": "US",
    "role": "Duplicate / idempotency",
    "tag": "grey",
    "story": "Retried charges share an idempotency_key, producing duplicate rows. The dedup workhorse."
  }
];

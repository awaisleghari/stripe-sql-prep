/** A tiny recurring "cast" of merchants used in problem prompts for continuity. */
export interface CastMerchant {
  merchant_id: string;
  name: string;
  country: string;
  trait: string;
}

export const CAST: CastMerchant[] = [
  { merchant_id: 'm_101', name: 'Northwind Coffee', country: 'US', trait: 'high failure rate; runs a checkout A/B test' },
  { merchant_id: 'm_103', name: 'PixelForge Games', country: 'GB', trait: 'elevated, late-arriving disputes (~1.8%)' },
  { merchant_id: 'm_105', name: 'StreamBox', country: 'US', trait: 'subscriptions; MRR analysis' },
];

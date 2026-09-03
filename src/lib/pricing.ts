// Per-section listing price. NOT charged yet — the whole site is free.
// When payments go live, a listing becomes public only while its `paid_until`
// is in the future; these numbers drive the checkout amount.
export const PRICING = {
  boat: { cents: 500, days: 60 }, // €5 for 60 days
  berth: { cents: 500, days: 60 }, // €5 for 60 days
  captain: { cents: 300, days: 90 }, // €3 for 90 days — symbolic
  charter: { cents: 500, days: 60 }, // €5 for 60 days
  fishing: { cents: 300, days: 90 }, // €3 for 90 days — symbolic
} as const;

export type PricedSection = keyof typeof PRICING;

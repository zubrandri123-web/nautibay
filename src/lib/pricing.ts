// Per-section listing price. NOT charged yet — the whole site is free.
// When payments go live, a listing becomes public only while its `paid_until`
// is in the future; these numbers drive the checkout amount.
export const PRICING = {
  boat: { cents: 500, days: 60 }, // €5 for 60 days
  berth: { cents: 500, days: 60 }, // €5 for 60 days
  // Crew profiles: symbolic fee from launch (not free-until-threshold like the
  // rest). Keeps the CV catalogue from filling with abandoned profiles; the
  // real draw is the repeat traffic it brings to the paid sections.
  crew: { cents: 300, days: 90 }, // €3 for 90 days
  captain: { cents: 300, days: 90 }, // €3 for 90 days — legacy alias for crew
  charter: { cents: 500, days: 60 }, // €5 for 60 days
  fishing: { cents: 300, days: 90 }, // €3 for 90 days — symbolic
} as const;

export type PricedSection = keyof typeof PRICING;

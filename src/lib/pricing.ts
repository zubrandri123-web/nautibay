// Per-section price to POST a listing. NOT charged yet — the whole site is
// free until each section has volume (~70 listings), then these amounts apply
// and a listing is public only while its `paid_until` is in the future.
// Browsing, filtering and seeing contacts is always free for everyone — only
// the person publishing a listing / CV ever pays, never the person searching.
export const PRICING = {
  boat: { cents: 500, days: 60 }, // €5 for 60 days
  berth: { cents: 500, days: 60 }, // €5 for 60 days
  // Crew CV: same model as the rest — free until the catalogue has volume,
  // then a symbolic fee from the person who posts the CV. The recruiter /
  // boat owner browsing crew never pays. The draw is the repeat traffic.
  crew: { cents: 300, days: 90 }, // €3 for 90 days
  captain: { cents: 300, days: 90 }, // €3 for 90 days — legacy alias for crew
  charter: { cents: 500, days: 60 }, // €5 for 60 days
  fishing: { cents: 300, days: 90 }, // €3 for 90 days — symbolic
} as const;

export type PricedSection = keyof typeof PRICING;

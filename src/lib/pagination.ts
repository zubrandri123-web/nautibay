// Shared by every catalog: fixed page size, and a free "bump to top" cooldown
// for the manual refresh button in "My listings" (becomes the paid action
// later — same mechanism, just gated by payment instead of a timer).
export const PAGE_SIZE = 10;
export const BUMP_COOLDOWN_HOURS = 24;

export function parsePage(v: string | string[] | undefined): number {
  const raw = Array.isArray(v) ? v[0] : v;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

export function pageRange(page: number): { from: number; to: number } {
  const from = (page - 1) * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE - 1 };
}

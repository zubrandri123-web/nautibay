import { Link } from "@/i18n/navigation";

type SearchParams = { [key: string]: string | string[] | undefined };

// Page links carry the current filters in the query string, so bookmarking
// or hitting Back returns to the exact same page — no client-side state.
function hrefFor(searchParams: SearchParams, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value == null) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: SearchParams;
}) {
  if (totalPages <= 1) return null;

  const windowSize = 2;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= windowSize,
  );

  const items: (number | "gap")[] = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) items.push("gap");
    items.push(p);
    prev = p;
  }

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      {items.map((it, i) =>
        it === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <Link
            key={it}
            href={hrefFor(searchParams, it)}
            aria-current={it === page ? "page" : undefined}
            className={`min-w-[2.25rem] rounded-md border px-2.5 py-1.5 text-center text-sm ${
              it === page
                ? "border-sky-500 bg-sky-500 text-white"
                : "border-slate-300 text-slate-700 hover:border-slate-500"
            }`}
          >
            {it}
          </Link>
        ),
      )}
    </nav>
  );
}

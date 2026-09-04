import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pagination } from "@/components/pagination";
import { parsePage, totalPages } from "@/lib/pagination";
import { CREW_AVAILABILITY, CREW_ROLES } from "@/lib/crew/constants";
import { crewFiltersSchema, type CrewFilters } from "@/lib/crew/schema";
import { searchCrew, type CrewSummary } from "@/lib/crew/queries";

type Props = {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cover = (
  photos: { storage_path: string; sort_order: number }[] | null,
): string | null => {
  if (!photos?.length || !SUPABASE_URL) return null;
  const p = [...photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  return `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p.storage_path}`;
};

export default async function CrewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const t = await getTranslations("Crew");
  const tRole = await getTranslations("CrewRole");
  const tAvail = await getTranslations("CrewAvailability");
  const tRate = await getTranslations("RatePeriod");
  const tCommon = await getTranslations("Common");

  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const parsed = crewFiltersSchema.safeParse({
    role: one(sp.role),
    availability: one(sp.availability),
    worldwide: one(sp.worldwide),
    expMin: one(sp.expMin),
    q: one(sp.q),
  });
  const filters: CrewFilters = parsed.success ? parsed.data : {};

  const page = parsePage(sp.page);
  let listings: CrewSummary[] = [];
  let total = 0;
  try {
    const result = await searchCrew(filters, page);
    listings = result.listings;
    total = result.total;
  } catch {
    listings = [];
  }

  const inputCls =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t("title")}</h1>
        <Link href="/crew/new" className="btn-3d btn-3d-blue px-4 py-2 text-sm">
          {t("newListing")}
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>

      <form className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-3">
        <label className="col-span-2 text-xs font-medium text-slate-600 sm:col-span-3">
          {t("searchCv")}
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder={t("searchCvHint")}
            className={inputCls}
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          {t("role")}
          <select name="role" defaultValue={filters.role ?? ""} className={inputCls}>
            <option value="">{t("anyRole")}</option>
            {CREW_ROLES.map((v) => (
              <option key={v} value={v}>
                {tRole(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          {t("availability")}
          <select name="availability" defaultValue={filters.availability ?? ""} className={inputCls}>
            <option value="">{t("anyAvailability")}</option>
            {CREW_AVAILABILITY.map((v) => (
              <option key={v} value={v}>
                {tAvail(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          {t("expMin")}
          <input
            type="number"
            name="expMin"
            min={0}
            inputMode="numeric"
            defaultValue={filters.expMin ?? ""}
            className={inputCls}
          />
        </label>
        <label className="col-span-2 flex items-center gap-2 text-xs font-medium text-slate-600 sm:col-span-3">
          <input
            type="checkbox"
            name="worldwide"
            value="true"
            defaultChecked={Boolean(filters.worldwide)}
          />
          <span>{t("worldwideOnly")}</span>
        </label>

        <div className="col-span-2 sm:col-span-3">
          <button type="submit" className="btn-3d btn-3d-blue px-4 py-2 text-sm">
            {tCommon("search")}
          </button>
        </div>
      </form>

      {listings.length === 0 ? (
        <p className="mt-8 text-slate-600">{t("empty")}</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const img = cover(l.crew_listing_photos);
            const title =
              [l.role ? tRole(l.role as never) : null, l.display_name]
                .filter(Boolean)
                .join(" · ") || t("title");
            const priceLine =
              l.price != null
                ? `${l.currency} ${Number(l.price).toLocaleString()}` +
                  (l.rate_period ? ` / ${tRate(l.rate_period as never)}` : "")
                : t("rateOnRequest");
            return (
              <li key={l.id}>
                <Link
                  href={`/crew/${l.id}`}
                  className="block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-400 hover:shadow-md"
                >
                  <div className="aspect-[4/3] w-full bg-slate-100">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">
                        🧭
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-slate-900">{title}</p>
                    {l.headline ? (
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">
                        {l.headline}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-slate-500">
                      {[
                        l.availability ? tAvail(l.availability as never) : null,
                        l.years_experience != null
                          ? t("yearsShort", { count: l.years_experience })
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {l.available_worldwide
                        ? `🌍 ${t("worldwideBadge")}`
                        : l.home_base || ""}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {priceLine}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages(total)} searchParams={sp} />
    </div>
  );
}

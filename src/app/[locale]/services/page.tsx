import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pagination } from "@/components/pagination";
import { parsePage, totalPages } from "@/lib/pagination";
import { COUNTRIES, countryName } from "@/lib/boats/constants";
import { SERVICE_CATEGORIES } from "@/lib/services/constants";
import { serviceFiltersSchema, type ServiceFilters } from "@/lib/services/schema";
import { searchServices, type ServiceSummary } from "@/lib/services/queries";

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

export default async function ServicesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("Services");
  const tCat = await getTranslations("ServiceCategory");
  const tCommon = await getTranslations("Common");

  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const parsed = serviceFiltersSchema.safeParse({
    category: one(sp.category),
    country: one(sp.country),
    q: one(sp.q),
  });
  const filters: ServiceFilters = parsed.success ? parsed.data : {};

  const countryOptions = [...COUNTRIES]
    .map((code) => ({ code, name: countryName(code, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  const page = parsePage(sp.page);
  let listings: ServiceSummary[] = [];
  let total = 0;
  try {
    const result = await searchServices(filters, page);
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
        <Link href="/services/new" className="btn-3d btn-3d-blue px-4 py-2 text-sm">
          {t("newListing")}
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>

      <form className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-3">
        <label className="col-span-2 text-xs font-medium text-slate-600 sm:col-span-3">
          {t("searchName")}
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            className={inputCls}
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          {t("category")}
          <select name="category" defaultValue={filters.category ?? ""} className={inputCls}>
            <option value="">{t("anyCategory")}</option>
            {SERVICE_CATEGORIES.map((v) => (
              <option key={v} value={v}>
                {tCat(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-1 text-xs font-medium text-slate-600 sm:col-span-2">
          {t("country")}
          <select name="country" defaultValue={filters.country ?? ""} className={inputCls}>
            <option value="">{t("anyCountry")}</option>
            {countryOptions.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
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
            const img = cover(l.service_listing_photos);
            const place = [
              l.city,
              l.region,
              l.country ? countryName(l.country, locale) : null,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <li key={l.id}>
                <Link
                  href={`/services/${l.id}`}
                  className={`block overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md ${
                    l.pinned
                      ? "border-amber-300 hover:border-amber-400"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="aspect-[4/3] w-full bg-slate-100">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">
                        🛠️
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-slate-900">{l.name}</p>
                    {l.category ? (
                      <p className="mt-0.5 text-sm text-slate-600">
                        {tCat(l.category as never)}
                      </p>
                    ) : null}
                    {place ? (
                      <p className="mt-1 truncate text-sm text-slate-500">{place}</p>
                    ) : null}
                    {l.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {l.description}
                      </p>
                    ) : null}
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

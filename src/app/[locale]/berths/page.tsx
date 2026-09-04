import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pagination } from "@/components/pagination";
import { parsePage, totalPages } from "@/lib/pagination";
import { COUNTRIES, countryName, formatLength } from "@/lib/boats/constants";
import { DEALS, PLACE_TYPES } from "@/lib/berths/constants";
import { berthFiltersSchema, type BerthFilters } from "@/lib/berths/schema";
import { searchBerths, type BerthSummary } from "@/lib/berths/queries";

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

export default async function BerthsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("Berths");
  const tPlace = await getTranslations("PlaceType");
  const tDeal = await getTranslations("Deal");
  const tPeriod = await getTranslations("RentPeriod");
  const tCommon = await getTranslations("Common");

  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const parsed = berthFiltersSchema.safeParse({
    placeType: one(sp.placeType),
    deal: one(sp.deal),
    country: one(sp.country),
    priceMin: sp.priceMin,
    priceMax: sp.priceMax,
  });
  const filters: BerthFilters = parsed.success ? parsed.data : {};

  const countryOptions = [...COUNTRIES]
    .map((code) => ({ code, name: countryName(code, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  const page = parsePage(sp.page);
  let listings: BerthSummary[] = [];
  let total = 0;
  try {
    const result = await searchBerths(filters, page);
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
        <Link href="/berths/new" className="btn-3d btn-3d-blue px-4 py-2 text-sm">
          {t("newListing")}
        </Link>
      </div>

      <form className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-4">
        <label className="text-xs font-medium text-slate-600">
          {t("placeType")}
          <select name="placeType" defaultValue={filters.placeType ?? ""} className={inputCls}>
            <option value="">{t("anyPlace")}</option>
            {PLACE_TYPES.map((v) => (
              <option key={v} value={v}>
                {tPlace(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          {t("deal")}
          <select name="deal" defaultValue={filters.deal ?? ""} className={inputCls}>
            <option value="">{t("anyDeal")}</option>
            {DEALS.map((v) => (
              <option key={v} value={v}>
                {tDeal(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          {t("priceMin")}
          <input name="priceMin" type="number" defaultValue={sp.priceMin as string} className={inputCls} />
        </label>
        <label className="text-xs font-medium text-slate-600">
          {t("priceMax")}
          <input name="priceMax" type="number" defaultValue={sp.priceMax as string} className={inputCls} />
        </label>

        <label className="col-span-2 text-xs font-medium text-slate-600 sm:col-span-4">
          {t("country")}
          <select
            name="country"
            defaultValue={filters.country ?? ""}
            className={inputCls}
          >
            <option value="">{t("anyCountry")}</option>
            {countryOptions.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <div className="col-span-2 sm:col-span-4">
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
            const img = cover(l.berth_listing_photos);
            const place = [
              l.marina,
              l.city,
              l.region,
              l.country ? countryName(l.country, locale) : null,
            ]
              .filter(Boolean)
              .join(", ");
            const priceLine =
              `${l.currency} ${Number(l.price).toLocaleString()}` +
              (l.deal === "rent" && l.rent_period
                ? ` / ${tPeriod(l.rent_period as never)}`
                : "");
            return (
              <li key={l.id}>
                <Link
                  href={`/berths/${l.id}`}
                  className="block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-400 hover:shadow-md"
                >
                  <div className="aspect-[4/3] w-full bg-slate-100">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">
                        ⚓
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-slate-900">
                      {tPlace(l.place_type as never)} · {tDeal(l.deal as never)}
                    </p>
                    {l.length_m ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {formatLength(l.length_m, tCommon("unitM"), tCommon("unitFt"))}
                      </p>
                    ) : null}
                    {place ? (
                      <p className="mt-1 truncate text-sm text-slate-500">{place}</p>
                    ) : null}
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

import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pagination } from "@/components/pagination";
import { parsePage, totalPages } from "@/lib/pagination";
import { countryName, formatLength } from "@/lib/boats/constants";
import { CountryCombobox } from "@/components/country-combobox";
import { CHARTER_BOAT_TYPES, CHARTER_TYPES } from "@/lib/charter/constants";
import { charterFiltersSchema, type CharterFilters } from "@/lib/charter/schema";
import { searchCharters, type CharterSummary } from "@/lib/charter/queries";

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

export default async function CharterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("Charter");
  const tType = await getTranslations("CharterType");
  const tRate = await getTranslations("RatePeriod");
  const tBoat = await getTranslations("BoatType");
  const tCommon = await getTranslations("Common");

  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const parsed = charterFiltersSchema.safeParse({
    charterType: one(sp.charterType),
    boatType: one(sp.boatType),
    country: one(sp.country),
    priceMin: sp.priceMin,
    priceMax: sp.priceMax,
  });
  const filters: CharterFilters = parsed.success ? parsed.data : {};

  const page = parsePage(sp.page);
  let listings: CharterSummary[] = [];
  let total = 0;
  try {
    const result = await searchCharters(filters, page);
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
        <Link href="/charter/new" className="btn-3d btn-3d-blue px-4 py-2 text-sm">
          {t("newListing")}
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>

      <form className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-4">
        <label className="text-xs font-medium text-slate-600">
          {t("charterType")}
          <select name="charterType" defaultValue={filters.charterType ?? ""} className={inputCls}>
            <option value="">{t("anyType")}</option>
            {CHARTER_TYPES.map((v) => (
              <option key={v} value={v}>
                {tType(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          {t("boatType")}
          <select name="boatType" defaultValue={filters.boatType ?? ""} className={inputCls}>
            <option value="">{t("anyBoat")}</option>
            {CHARTER_BOAT_TYPES.map((v) => (
              <option key={v} value={v}>
                {tBoat(v)}
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
          <CountryCombobox
            name="country"
            locale={locale}
            defaultValue={filters.country ?? ""}
            placeholder={t("anyCountry")}
            className={inputCls}
          />
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
            const img = cover(l.charter_listing_photos);
            const place = [
              l.marina,
              l.city,
              l.region,
              l.country ? countryName(l.country, locale) : null,
            ]
              .filter(Boolean)
              .join(", ");
            const boatLabel =
              l.boat_name || (l.boat_type ? tBoat(l.boat_type as never) : null);
            const priceLine =
              l.price != null
                ? `${l.currency} ${Number(l.price).toLocaleString()}` +
                  (l.rate_period ? ` / ${tRate(l.rate_period as never)}` : "")
                : t("priceOnRequest");
            return (
              <li key={l.id}>
                <Link
                  href={`/charter/${l.id}`}
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
                      {tType(l.charter_type as never)}
                    </p>
                    {boatLabel ? (
                      <p className="mt-0.5 truncate text-sm text-slate-600">{boatLabel}</p>
                    ) : null}
                    {l.length_m ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {formatLength(l.length_m, tCommon("unitM"), tCommon("unitFt"))}
                        {l.max_people ? ` · ${t("upToPeople", { count: l.max_people })}` : ""}
                      </p>
                    ) : l.max_people ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {t("upToPeople", { count: l.max_people })}
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

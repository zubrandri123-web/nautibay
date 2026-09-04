import { getLocale, getTranslations } from "next-intl/server";
import { BoatCard } from "@/components/boat-card";
import { NearMeButton } from "@/components/near-me-button";
import { Pagination } from "@/components/pagination";
import { parsePage, totalPages } from "@/lib/pagination";
import {
  BOAT_TYPES,
  CONDITIONS,
  COUNTRIES,
  countryName,
  FUEL_TYPES,
  HULL_MATERIALS,
} from "@/lib/boats/constants";
import {
  searchBoatListings,
  searchNearbyListings,
  type BoatListingSummary,
} from "@/lib/boats/queries";
import type { SearchFilters } from "@/lib/boats/schema";

type RawSearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function parseFilters(sp: RawSearchParams): SearchFilters {
  return {
    type: (Array.isArray(sp.type) ? sp.type[0] : sp.type) as SearchFilters["type"],
    priceMin: toNumber(sp.priceMin),
    priceMax: toNumber(sp.priceMax),
    yearMin: toNumber(sp.yearMin),
    yearMax: toNumber(sp.yearMax),
    lengthMin: toNumber(sp.lengthMin),
    lengthMax: toNumber(sp.lengthMax),
    country: (Array.isArray(sp.country)
      ? sp.country[0]
      : sp.country) as SearchFilters["country"],
    hullMaterial: (Array.isArray(sp.hullMaterial)
      ? sp.hullMaterial[0]
      : sp.hullMaterial) as SearchFilters["hullMaterial"],
    fuelType: (Array.isArray(sp.fuelType)
      ? sp.fuelType[0]
      : sp.fuelType) as SearchFilters["fuelType"],
    condition: (Array.isArray(sp.condition)
      ? sp.condition[0]
      : sp.condition) as SearchFilters["condition"],
    q: Array.isArray(sp.q) ? sp.q[0] : sp.q,
  };
}

export default async function BoatsSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const locale = await getLocale();
  const t = await getTranslations("Search");
  const tType = await getTranslations("BoatType");
  const tHull = await getTranslations("HullMaterial");
  const tFuel = await getTranslations("FuelType");
  const tCondition = await getTranslations("Condition");
  const tCommon = await getTranslations("Common");

  const lat = toNumber(sp.lat);
  const lng = toNumber(sp.lng);
  const radiusKm = toNumber(sp.radiusKm) ?? 50;
  const isNearMe = lat !== undefined && lng !== undefined;
  const page = parsePage(sp.page);

  let listings: BoatListingSummary[] = [];
  let total = 0;
  try {
    if (isNearMe) {
      listings = await searchNearbyListings(lat, lng, radiusKm);
      total = listings.length;
    } else {
      const result = await searchBoatListings(filters, page);
      listings = result.listings;
      total = result.total;
    }
  } catch {
    listings = [];
    total = 0;
  }

  const countryOptions = [...COUNTRIES]
    .map((code) => ({ code, name: countryName(code, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  const hasActiveFilters =
    Boolean(filters.type) ||
    Boolean(filters.country) ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.yearMin !== undefined ||
    filters.yearMax !== undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">{t("title")}</h1>

      <form
        method="get"
        className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4"
      >
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-slate-600">
            {t("type")}
          </label>
          <select
            name="type"
            defaultValue={filters.type ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">{t("anyType")}</option>
            {BOAT_TYPES.map((type) => (
              <option key={type} value={type}>
                {tType(type)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("priceMin")}
          </label>
          <input
            type="number"
            name="priceMin"
            defaultValue={filters.priceMin ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("priceMax")}
          </label>
          <input
            type="number"
            name="priceMax"
            defaultValue={filters.priceMax ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("yearMin")}
          </label>
          <input
            type="number"
            name="yearMin"
            defaultValue={filters.yearMin ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("yearMax")}
          </label>
          <input
            type="number"
            name="yearMax"
            defaultValue={filters.yearMax ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("lengthMin")}
          </label>
          <input
            type="number"
            name="lengthMin"
            defaultValue={filters.lengthMin ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("lengthMax")}
          </label>
          <input
            type="number"
            name="lengthMax"
            defaultValue={filters.lengthMax ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("condition")}
          </label>
          <select
            name="condition"
            defaultValue={filters.condition ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">{t("anyCondition")}</option>
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {tCondition(condition)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("hullMaterial")}
          </label>
          <select
            name="hullMaterial"
            defaultValue={filters.hullMaterial ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">{t("anyMaterial")}</option>
            {HULL_MATERIALS.map((material) => (
              <option key={material} value={material}>
                {tHull(material)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("fuelType")}
          </label>
          <select
            name="fuelType"
            defaultValue={filters.fuelType ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">{t("anyFuel")}</option>
            {FUEL_TYPES.map((fuel) => (
              <option key={fuel} value={fuel}>
                {tFuel(fuel)}
              </option>
            ))}
          </select>
        </div>

        <label className="block text-xs font-medium text-slate-600">
          {t("country")}
          <select
            name="country"
            defaultValue={filters.country ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{t("anyCountry")}</option>
            {countryOptions.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <div className="col-span-2 flex items-end gap-2 sm:col-span-4">
          <button type="submit" className="btn-3d btn-3d-blue px-4 py-2 text-sm">
            {t("apply")}
          </button>
          <a href="?" className="btn-3d btn-3d-red px-4 py-2 text-sm">
            {tCommon("clearFilters")}
          </a>
          <NearMeButton label={t("nearMe")} />
        </div>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {t("resultsCount", { count: total })}
      </p>

      {listings.length === 0 ? (
        <p className="mt-2 text-slate-600">{t("noResults")}</p>
      ) : null}

      {!isNearMe && hasActiveFilters && total < 5 ? (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t("expandRegionHint")}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <BoatCard key={listing.id} listing={listing} />
        ))}
      </div>

      {!isNearMe ? (
        <Pagination page={page} totalPages={totalPages(total)} searchParams={sp} />
      ) : null}
    </div>
  );
}

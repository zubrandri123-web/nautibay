import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { FishingRowActions } from "@/components/fishing-row-actions";
import { countryName } from "@/lib/boats/constants";
import { getMyFishing } from "@/lib/fishing/queries";

type Props = { params: Promise<{ locale: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cover = (
  photos: { storage_path: string; sort_order: number }[] | null,
): string | null => {
  if (!photos?.length || !SUPABASE_URL) return null;
  const p = [...photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  return `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p.storage_path}`;
};

export default async function MyFishingPage({ params }: Props) {
  await params;
  const locale = await getLocale();
  const t = await getTranslations("Fishing");
  const tMine = await getTranslations("MyListings");
  const tTrip = await getTranslations("TripType");
  const tRate = await getTranslations("RatePeriod");
  const tAuth = await getTranslations("Auth");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-slate-700">{tMine("signInRequired")}</p>
        <Link href="/sign-in" className="btn-3d btn-3d-blue mt-4 inline-block px-4 py-2">
          {tAuth("signInButton")}
        </Link>
      </div>
    );
  }

  const listings = (await getMyFishing()) as unknown as Array<{
    id: string;
    trip_type: string | null;
    boat_name: string | null;
    price: number | null;
    currency: string;
    rate_period: string | null;
    status: string;
    country: string | null;
    region: string | null;
    city: string | null;
    marina: string | null;
    fishing_listing_photos: { storage_path: string; sort_order: number }[] | null;
  }>;

  const labels = {
    edit: tMine("edit"),
    archive: t("archive"),
    reactivate: t("reactivate"),
    del: tMine("delete"),
    confirmDelete: tMine("confirmDelete"),
  };

  const statusLabel = (s: string) =>
    s === "active" ? t("statusActive") : t("statusArchived");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t("myTitle")}</h1>
        <Link href="/fishing/new" className="btn-3d btn-3d-blue px-4 py-2 text-sm">
          {t("newListing")}
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="mt-8 text-slate-600">{tMine("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {listings.map((l) => {
            const img = cover(l.fishing_listing_photos);
            const place = [
              l.marina,
              l.city,
              l.region,
              l.country ? countryName(l.country, locale) : null,
            ]
              .filter(Boolean)
              .join(", ");
            const title =
              l.boat_name ||
              (l.trip_type ? tTrip(l.trip_type as never) : t("title"));
            const priceLine =
              l.price != null
                ? `${l.currency} ${Number(l.price).toLocaleString()}` +
                  (l.rate_period ? ` / ${tRate(l.rate_period as never)}` : "")
                : t("priceOnRequest");
            return (
              <li key={l.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex gap-3">
                  <div className="h-20 w-28 flex-none overflow-hidden rounded bg-slate-100">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/fishing/${l.id}`}
                        className="truncate font-medium text-slate-900 hover:underline"
                      >
                        {title}
                      </Link>
                      <span
                        className={`flex-none rounded-full px-2 py-0.5 text-xs ${
                          l.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {statusLabel(l.status)}
                      </span>
                    </div>
                    {place ? (
                      <p className="truncate text-sm text-slate-500">{place}</p>
                    ) : null}
                    <p className="text-sm font-semibold text-slate-900">{priceLine}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <FishingRowActions id={l.id} status={l.status} labels={labels} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

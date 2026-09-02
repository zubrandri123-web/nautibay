import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingRowActions } from "@/components/listing-row-actions";
import { countryName } from "@/lib/boats/constants";
import { getMyListings } from "@/lib/boats/queries";

type Props = { params: Promise<{ locale: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function coverUrl(
  photos: { storage_path: string; sort_order: number }[] | null,
): string | null {
  if (!photos || photos.length === 0 || !SUPABASE_URL) return null;
  const p = [...photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  return `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p.storage_path}`;
}

export default async function MyListingsPage({ params }: Props) {
  await params;
  const locale = await getLocale();
  const t = await getTranslations("MyListings");
  const tType = await getTranslations("BoatType");
  const tAuth = await getTranslations("Auth");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-slate-700">{t("signInRequired")}</p>
        <Link
          href="/sign-in"
          className="btn-3d btn-3d-blue mt-4 inline-block px-4 py-2"
        >
          {tAuth("signInButton")}
        </Link>
      </div>
    );
  }

  const listings = (await getMyListings()) as unknown as Array<{
    id: string;
    boat_type: string;
    brand: string | null;
    model: string | null;
    price: number;
    currency: string;
    status: string;
    country: string | null;
    region: string | null;
    city: string | null;
    boat_listing_photos: { storage_path: string; sort_order: number }[] | null;
  }>;

  const labels = {
    edit: t("edit"),
    markSold: t("markSold"),
    archive: t("archive"),
    reactivate: t("reactivate"),
    del: t("delete"),
    confirmDelete: t("confirmDelete"),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t("title")}</h1>
        <Link
          href="/boats/new"
          className="btn-3d btn-3d-blue px-4 py-2 text-sm"
        >
          {t("newListing")}
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="mt-8 text-slate-600">{t("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {listings.map((l) => {
            const cover = coverUrl(l.boat_listing_photos);
            const title =
              [l.brand, l.model].filter(Boolean).join(" ") ||
              tType(l.boat_type as never);
            const place = [
              l.city,
              l.region,
              l.country ? countryName(l.country, locale) : null,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <li
                key={l.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex gap-3">
                  <div className="h-20 w-28 flex-none overflow-hidden rounded bg-slate-100">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/boats/${l.id}`}
                        className="truncate font-medium text-slate-900 hover:underline"
                      >
                        {title}
                      </Link>
                      <span
                        className={`flex-none rounded-full px-2 py-0.5 text-xs ${
                          l.status === "active"
                            ? "bg-green-100 text-green-800"
                            : l.status === "sold"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {t(`status_${l.status}` as never)}
                      </span>
                    </div>
                    {place ? (
                      <p className="truncate text-sm text-slate-500">{place}</p>
                    ) : null}
                    <p className="text-sm font-semibold text-slate-900">
                      {l.currency} {Number(l.price).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <ListingRowActions
                    id={l.id}
                    status={l.status}
                    labels={labels}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { BerthRowActions } from "@/components/berth-row-actions";
import { countryName } from "@/lib/boats/constants";
import { getMyBerths } from "@/lib/berths/queries";

type Props = { params: Promise<{ locale: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cover = (
  photos: { storage_path: string; sort_order: number }[] | null,
): string | null => {
  if (!photos?.length || !SUPABASE_URL) return null;
  const p = [...photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  return `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p.storage_path}`;
};

export default async function MyBerthsPage({ params }: Props) {
  await params;
  const locale = await getLocale();
  const t = await getTranslations("Berths");
  const tMine = await getTranslations("MyListings");
  const tPlace = await getTranslations("PlaceType");
  const tDeal = await getTranslations("Deal");
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

  const listings = (await getMyBerths()) as unknown as Array<{
    id: string;
    place_type: string;
    deal: string;
    price: number;
    currency: string;
    status: string;
    country: string | null;
    region: string | null;
    city: string | null;
    marina: string | null;
    berth_listing_photos: { storage_path: string; sort_order: number }[] | null;
  }>;

  const labels = {
    edit: tMine("edit"),
    markTaken: t("markTaken"),
    archive: tMine("archive"),
    reactivate: tMine("reactivate"),
    del: tMine("delete"),
    confirmDelete: tMine("confirmDelete"),
  };

  const statusLabel = (s: string) =>
    s === "rented"
      ? t("status_rented")
      : tMine(`status_${s}` as never);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t("myTitle")}</h1>
        <Link href="/berths/new" className="btn-3d btn-3d-blue px-4 py-2 text-sm">
          {t("newListing")}
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="mt-8 text-slate-600">{tMine("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-4">
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
                        href={`/berths/${l.id}`}
                        className="truncate font-medium text-slate-900 hover:underline"
                      >
                        {tPlace(l.place_type as never)} · {tDeal(l.deal as never)}
                      </Link>
                      <span
                        className={`flex-none rounded-full px-2 py-0.5 text-xs ${
                          l.status === "active"
                            ? "bg-green-100 text-green-800"
                            : l.status === "sold" || l.status === "rented"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {statusLabel(l.status)}
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
                  <BerthRowActions
                    id={l.id}
                    status={l.status}
                    deal={l.deal}
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

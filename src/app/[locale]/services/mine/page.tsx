import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceRowActions } from "@/components/service-row-actions";
import { countryName } from "@/lib/boats/constants";
import { getMyServices } from "@/lib/services/queries";

type Props = { params: Promise<{ locale: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cover = (
  photos: { storage_path: string; sort_order: number }[] | null,
): string | null => {
  if (!photos?.length || !SUPABASE_URL) return null;
  const p = [...photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  return `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p.storage_path}`;
};

export default async function MyServicesPage({ params }: Props) {
  await params;
  const locale = await getLocale();
  const t = await getTranslations("Services");
  const tMine = await getTranslations("MyListings");
  const tCat = await getTranslations("ServiceCategory");
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

  const listings = (await getMyServices()) as unknown as Array<{
    id: string;
    category: string | null;
    name: string;
    status: string;
    country: string | null;
    region: string | null;
    city: string | null;
    pinned: boolean;
    service_listing_photos: { storage_path: string; sort_order: number }[] | null;
  }>;

  const labels = {
    edit: tMine("edit"),
    archive: t("archive"),
    resubmit: t("resubmit"),
    del: tMine("delete"),
    confirmDelete: tMine("confirmDelete"),
  };

  const statusLabel = (s: string) =>
    s === "active"
      ? t("statusActive")
      : s === "pending_review"
        ? tMine("status_pending_review")
        : t("statusArchived");

  const statusCls = (s: string) =>
    s === "active"
      ? "bg-green-100 text-green-800"
      : s === "pending_review"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-200 text-slate-700";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t("myTitle")}</h1>
        <Link href="/services/new" className="btn-3d btn-3d-blue px-4 py-2 text-sm">
          {t("newListing")}
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="mt-8 text-slate-600">{tMine("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-4">
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
                        href={`/services/${l.id}`}
                        className="truncate font-medium text-slate-900 hover:underline"
                      >
                        {l.name}
                      </Link>
                      <span
                        className={`flex-none rounded-full px-2 py-0.5 text-xs ${statusCls(l.status)}`}
                      >
                        {statusLabel(l.status)}
                      </span>
                      {l.pinned ? (
                        <span className="flex-none rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                          ★
                        </span>
                      ) : null}
                    </div>
                    {l.category ? (
                      <p className="truncate text-sm text-slate-500">
                        {tCat(l.category as never)}
                      </p>
                    ) : null}
                    {place ? (
                      <p className="truncate text-sm text-slate-500">{place}</p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3">
                  <ServiceRowActions id={l.id} status={l.status} labels={labels} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

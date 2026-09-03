import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { getPendingServices } from "@/lib/services/queries";
import { countryName } from "@/lib/boats/constants";
import { AdminServiceActions } from "@/components/admin-service-actions";

type Props = { params: Promise<{ locale: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cover = (
  photos: { storage_path: string; sort_order: number }[] | null,
): string | null => {
  if (!photos?.length || !SUPABASE_URL) return null;
  const p = [...photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  return `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p.storage_path}`;
};

export default async function AdminServicesPage({ params }: Props) {
  await params;
  const locale = await getLocale();
  const t = await getTranslations("Admin");
  const tCat = await getTranslations("ServiceCategory");
  const tAuth = await getTranslations("Auth");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-slate-700">{t("signInRequired")}</p>
        <Link href="/sign-in" className="btn-3d btn-3d-blue mt-4 inline-block px-4 py-2">
          {tAuth("signInButton")}
        </Link>
      </div>
    );
  }

  if (!(await isAdmin())) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-slate-700">{t("notAuthorized")}</p>
      </div>
    );
  }

  const rows = (await getPendingServices()) as unknown as Array<{
    id: string;
    name: string;
    category: string | null;
    description: string | null;
    website: string | null;
    address: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    contact_note: string | null;
    created_at: string;
    service_listing_photos: { storage_path: string; sort_order: number }[] | null;
    profiles: { full_name: string | null } | null;
  }>;

  const labels = {
    approve: t("approve"),
    reject: t("reject"),
    confirmReject: t("confirmReject"),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">{t("title")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          {t("empty")}
        </p>
      ) : (
        <ul className="mt-6 space-y-5">
          {rows.map((l) => {
            const img = cover(l.service_listing_photos);
            const place = [
              l.address,
              l.city,
              l.region,
              l.country ? countryName(l.country, locale) : null,
            ]
              .filter(Boolean)
              .join(", ");
            const href = l.website
              ? /^https?:\/\//i.test(l.website)
                ? l.website
                : `https://${l.website}`
              : null;
            return (
              <li key={l.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex gap-3">
                  {img ? (
                    <div className="h-16 w-24 flex-none overflow-hidden rounded bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{l.name}</p>
                    {l.category ? (
                      <p className="text-sm text-slate-600">{tCat(l.category as never)}</p>
                    ) : null}
                    {place ? (
                      <p className="text-sm text-slate-500">{place}</p>
                    ) : null}
                  </div>
                </div>

                {href ? (
                  <p className="mt-3 text-sm">
                    <span className="text-slate-400">{t("website")}: </span>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-medium text-sky-700 underline"
                    >
                      {l.website}
                    </a>
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-amber-700">{t("noWebsite")}</p>
                )}

                {l.description ? (
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                    {l.description}
                  </p>
                ) : null}

                <p className="mt-2 text-xs text-slate-500">
                  {[
                    l.contact_phone,
                    l.contact_email,
                    l.contact_note,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {t("submittedBy", {
                    name: l.profiles?.full_name || "—",
                    date: new Date(l.created_at).toLocaleDateString(locale),
                  })}
                </p>

                <div className="mt-3">
                  <AdminServiceActions id={l.id} labels={labels} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

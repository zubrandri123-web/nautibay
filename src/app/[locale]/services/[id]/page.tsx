import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/photo-gallery";
import { BackToSearch } from "@/components/back-to-search";
import { countryName } from "@/lib/boats/constants";
import { getServiceListing } from "@/lib/services/queries";

type Props = { params: Promise<{ locale: string; id: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const photoUrl = (p: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p}`;

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const tCat = await getTranslations("ServiceCategory");
  const tForm = await getTranslations("ServiceForm");
  const tDet = await getTranslations("BoatDetail");
  const tCommon = await getTranslations("Common");
  const tAuth = await getTranslations("Auth");

  const l = await getServiceListing(id);
  if (!l) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const photos = [...(l.service_listing_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => photoUrl(p.storage_path));

  const place = [
    l.address,
    l.city,
    l.region,
    l.country ? countryName(l.country, locale) : null,
  ]
    .filter(Boolean)
    .join(", ");

  const phoneDigits =
    user && l.contact_phone
      ? String(l.contact_phone).replace(/[^\d]/g, "")
      : "";

  const websiteHref = l.website
    ? /^https?:\/\//i.test(l.website)
      ? l.website
      : `https://${l.website}`
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {photos.length > 0 ? (
        <PhotoGallery
          photos={photos}
          alt={l.name}
          labels={{
            close: tCommon("close"),
            previous: tCommon("previous"),
            next: tCommon("next"),
          }}
        />
      ) : null}

      <h1 className="mt-6 text-2xl font-semibold text-slate-900">{l.name}</h1>
      {l.category ? (
        <p className="text-slate-600">{tCat(l.category)}</p>
      ) : null}
      {place ? <p className="text-slate-500">{place}</p> : null}
      {websiteHref ? (
        <p className="mt-1">
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-700 underline"
          >
            {l.website}
          </a>
        </p>
      ) : null}

      <div className="mt-6 rounded-lg border-2 border-sky-500 bg-sky-50 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-800">
          {tDet("contactSeller")}
        </h2>
        {user ? (
          <div className="mt-2 space-y-1 text-sm text-slate-800">
            {l.contact_phone ? (
              <p>
                <a href={`tel:${l.contact_phone}`} className="font-medium text-slate-900 underline">
                  {l.contact_phone}
                </a>
                {l.contact_phone_whatsapp && phoneDigits ? (
                  <>
                    {" · "}
                    <a
                      href={`https://wa.me/${phoneDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {tDet("whatsapp")}
                    </a>
                  </>
                ) : null}
                {l.contact_phone_telegram ? ` · ${tDet("telegram")}` : null}
              </p>
            ) : null}
            {l.contact_email ? (
              <p>
                <a href={`mailto:${l.contact_email}`} className="text-slate-900 underline">
                  {l.contact_email}
                </a>
              </p>
            ) : null}
            {l.contact_note ? (
              <p className="whitespace-pre-line text-slate-600">{l.contact_note}</p>
            ) : null}
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-slate-600">{tDet("signInToContact")}</p>
            <Link
              href="/sign-in"
              className="btn-3d btn-3d-blue mt-3 inline-block px-4 py-2 text-sm"
            >
              {tAuth("signInButton")}
            </Link>
          </div>
        )}
      </div>

      {l.description ? (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-wide text-slate-400">
            {tForm("description")}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
            {l.description}
          </p>
        </div>
      ) : null}

      <BackToSearch href="/services" label={tCommon("continueSearch")} />
    </div>
  );
}

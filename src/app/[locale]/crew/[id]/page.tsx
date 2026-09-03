import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/photo-gallery";
import { countryName } from "@/lib/boats/constants";
import { getCrewListing } from "@/lib/crew/queries";

type Props = { params: Promise<{ locale: string; id: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const photoUrl = (p: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p}`;

export default async function CrewDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations("Crew");
  const tRole = await getTranslations("CrewRole");
  const tAvail = await getTranslations("CrewAvailability");
  const tRate = await getTranslations("RatePeriod");
  const tForm = await getTranslations("CrewForm");
  const tDet = await getTranslations("BoatDetail");
  const tCommon = await getTranslations("Common");
  const tAuth = await getTranslations("Auth");

  const l = await getCrewListing(id);
  if (!l) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const photos = [...(l.crew_listing_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => photoUrl(p.storage_path));

  const name = l.display_name || l.profiles?.full_name || null;
  const heading =
    [l.role ? tRole(l.role) : null, name].filter(Boolean).join(" · ") ||
    t("title");

  const place = [
    l.home_base,
    l.city,
    l.region,
    l.country ? countryName(l.country, locale) : null,
  ]
    .filter(Boolean)
    .join(", ");

  const priceLine =
    l.price != null
      ? `${l.currency} ${Number(l.price).toLocaleString()}` +
        (l.rate_period ? ` / ${tRate(l.rate_period)}` : "")
      : t("rateOnRequest");

  const phoneDigits =
    user && l.contact_phone
      ? String(l.contact_phone).replace(/[^\d]/g, "")
      : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {photos.length > 0 ? (
        <PhotoGallery
          photos={photos}
          alt={heading}
          labels={{
            close: tCommon("close"),
            previous: tCommon("previous"),
            next: tCommon("next"),
          }}
        />
      ) : null}

      <h1 className="mt-6 text-2xl font-semibold text-slate-900">{heading}</h1>
      {l.headline ? <p className="text-slate-600">{l.headline}</p> : null}
      {place ? <p className="text-slate-500">{place}</p> : null}
      <p className="mt-2 text-2xl font-semibold text-slate-900">{priceLine}</p>

      <div className="mt-6 rounded-lg border-2 border-sky-500 bg-sky-50 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-800">
          {t("contactPerson")}
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

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {l.availability ? (
          <Detail label={tForm("availability")} value={tAvail(l.availability)} />
        ) : null}
        {l.years_experience != null ? (
          <Detail label={tForm("yearsExperience")} value={l.years_experience} />
        ) : null}
        {l.languages ? <Detail label={tForm("languages")} value={l.languages} /> : null}
        {l.willing_to_travel ? (
          <Detail label={tForm("willingToTravel")} value="✓" />
        ) : null}
      </dl>

      {l.licenses ? (
        <Block title={tForm("licenses")} text={l.licenses} />
      ) : null}
      {l.vessel_experience ? (
        <Block title={tForm("vesselExperience")} text={l.vessel_experience} />
      ) : null}
      {l.about ? <Block title={tForm("sectionAboutText")} text={l.about} /> : null}

      <p className="mt-8 text-sm">
        <Link href="/crew" className="text-slate-500 hover:underline">
          ← {t("title")}
        </Link>
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-8">
      <h2 className="text-xs uppercase tracking-wide text-slate-400">{title}</h2>
      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{text}</p>
    </div>
  );
}

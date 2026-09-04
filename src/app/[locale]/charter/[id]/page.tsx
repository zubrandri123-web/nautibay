import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/photo-gallery";
import { SpecDetail } from "@/components/spec-detail";
import { countryName, formatLength } from "@/lib/boats/constants";
import { getCharterListing } from "@/lib/charter/queries";

type Props = { params: Promise<{ locale: string; id: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const photoUrl = (p: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p}`;

export default async function CharterDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations("Charter");
  const tType = await getTranslations("CharterType");
  const tRate = await getTranslations("RatePeriod");
  const tBoat = await getTranslations("BoatType");
  const tForm = await getTranslations("CharterForm");
  const tToilet = await getTranslations("ToiletType");
  const tDet = await getTranslations("BoatDetail");
  const tCommon = await getTranslations("Common");
  const tAuth = await getTranslations("Auth");

  const l = await getCharterListing(id);
  if (!l) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const photos = [...(l.charter_listing_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => photoUrl(p.storage_path));

  const place = [
    l.marina,
    l.city,
    l.region,
    l.country ? countryName(l.country, locale) : null,
  ]
    .filter(Boolean)
    .join(", ");

  const fmt = (m: number | null) =>
    m == null ? "" : formatLength(m, tCommon("unitM"), tCommon("unitFt"));

  const priceLine =
    l.price != null
      ? `${l.currency} ${Number(l.price).toLocaleString()}` +
        (l.rate_period ? ` / ${tRate(l.rate_period)}` : "")
      : t("priceOnRequest");

  const phoneDigits =
    user && l.contact_phone
      ? String(l.contact_phone).replace(/[^\d]/g, "")
      : "";

  const boatLabel = l.boat_name || (l.boat_type ? tBoat(l.boat_type) : null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PhotoGallery
        photos={photos}
        alt={tType(l.charter_type)}
        labels={{
          close: tCommon("close"),
          previous: tCommon("previous"),
          next: tCommon("next"),
        }}
      />

      <h1 className="mt-6 text-2xl font-semibold text-slate-900">
        {tType(l.charter_type)}
        {boatLabel ? ` · ${boatLabel}` : ""}
      </h1>
      {place ? <p className="text-slate-500">{place}</p> : null}
      <p className="mt-2 text-3xl font-semibold text-slate-900">{priceLine}</p>

      <div className="mt-6 rounded-lg border-2 border-sky-500 bg-sky-50 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-800">
          {tDet("contactSeller")}
        </h2>
        {user ? (
          <div className="mt-2 space-y-1 text-sm text-slate-800">
            {l.profiles?.full_name ? (
              <p className="font-medium">{l.profiles.full_name}</p>
            ) : null}
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
        {l.length_m ? (
          <SpecDetail icon="length" label={tForm("lengthM")} value={fmt(l.length_m)} />
        ) : null}
        {l.year_built ? (
          <SpecDetail icon="calendar" label={tForm("yearBuilt")} value={l.year_built} />
        ) : null}
        {l.cabins != null ? (
          <SpecDetail icon="cabins" label={tForm("cabins")} value={l.cabins} />
        ) : null}
        {l.berths_count != null ? (
          <SpecDetail icon="berths" label={tForm("berthsCount")} value={l.berths_count} />
        ) : null}
        {l.max_people ? (
          <SpecDetail icon="guests" label={tForm("maxPeople")} value={l.max_people} />
        ) : null}
        {l.min_days ? (
          <SpecDetail icon="duration" label={tForm("minDays")} value={l.min_days} />
        ) : null}
        {l.season ? (
          <SpecDetail icon="season" label={tForm("season")} value={l.season} />
        ) : null}
        {l.skipper_included ? (
          <SpecDetail icon="skipper" label={tForm("skipperIncluded")} value="✓" />
        ) : null}
        {l.fuel_included ? (
          <SpecDetail icon="fuelType" label={tForm("fuelIncluded")} value="✓" />
        ) : null}
        {l.cleaning_included ? (
          <SpecDetail icon="cleaning" label={tForm("cleaningIncluded")} value="✓" />
        ) : null}
        {l.bedding_included ? (
          <SpecDetail icon="bedding" label={tForm("beddingIncluded")} value="✓" />
        ) : null}
        {l.license_required ? (
          <SpecDetail icon="license" label={tForm("licenseRequired")} value="✓" />
        ) : null}
        {l.toilet_type && l.toilet_type !== "none" ? (
          <SpecDetail icon="toilet" label={tForm("toiletType")} value={tToilet(l.toilet_type)} />
        ) : null}
        {l.shower ? (
          <SpecDetail icon="shower" label={tForm("shower")} value="✓" />
        ) : null}
      </dl>

      {l.description ? (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-wide text-slate-400">
            {tDet("description")}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
            {l.description}
          </p>
        </div>
      ) : null}

      <p className="mt-8 text-sm">
        <Link href="/charter" className="text-slate-500 hover:underline">
          ← {t("title")}
        </Link>
      </p>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/photo-gallery";
import { SpecDetail } from "@/components/spec-detail";
import { BackToSearch } from "@/components/back-to-search";
import { countryName, formatLength } from "@/lib/boats/constants";
import { getFishingListing } from "@/lib/fishing/queries";

type Props = { params: Promise<{ locale: string; id: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const photoUrl = (p: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p}`;

export default async function FishingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations("Fishing");
  const tTrip = await getTranslations("TripType");
  const tDur = await getTranslations("TripDuration");
  const tRate = await getTranslations("RatePeriod");
  const tBoat = await getTranslations("BoatType");
  const tForm = await getTranslations("FishingForm");
  const tDet = await getTranslations("BoatDetail");
  const tCommon = await getTranslations("Common");
  const tAuth = await getTranslations("Auth");
  const tToilet = await getTranslations("ToiletType");
  const tStove = await getTranslations("StoveType");

  const l = await getFishingListing(id);
  if (!l) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const photos = [...(l.fishing_listing_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => photoUrl(p.storage_path));

  const place = [
    l.marina,
    l.city,
    l.postal_code,
    l.region,
    l.country ? countryName(l.country, locale) : null,
  ]
    .filter(Boolean)
    .join(", ");

  const heading =
    [l.trip_type ? tTrip(l.trip_type) : null, l.boat_name]
      .filter(Boolean)
      .join(" · ") || t("title");

  const priceLine =
    l.price != null
      ? `${l.currency} ${Number(l.price).toLocaleString()}` +
        (l.rate_period ? ` / ${tRate(l.rate_period)}` : "")
      : t("priceOnRequest");

  const phoneDigits =
    user && l.contact_phone
      ? String(l.contact_phone).replace(/[^\d]/g, "")
      : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PhotoGallery
        photos={photos}
        alt={heading}
        labels={{
          close: tCommon("close"),
          previous: tCommon("previous"),
          next: tCommon("next"),
        }}
      />

      <h1 className="mt-6 text-2xl font-semibold text-slate-900">{heading}</h1>
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
        {l.duration ? (
          <SpecDetail icon="duration" label={tForm("duration")} value={tDur(l.duration)} />
        ) : null}
        {l.boat_type ? (
          <SpecDetail label={tForm("boatType")} value={tBoat(l.boat_type)} />
        ) : null}
        {l.boat_length_m ? (
          <SpecDetail
            icon="length"
            label={tForm("lengthM")}
            value={formatLength(l.boat_length_m, tCommon("unitM"), tCommon("unitFt"))}
          />
        ) : null}
        {l.max_anglers ? (
          <SpecDetail icon="guests" label={tForm("maxAnglers")} value={l.max_anglers} />
        ) : null}
        {l.season ? (
          <SpecDetail icon="season" label={tForm("season")} value={l.season} />
        ) : null}
        {l.tackle_included ? (
          <SpecDetail icon="tackle" label={tForm("tackleIncluded")} value="✓" />
        ) : null}
        {l.bait_included ? (
          <SpecDetail icon="bait" label={tForm("baitIncluded")} value="✓" />
        ) : null}
        {l.license_included ? (
          <SpecDetail icon="license" label={tForm("licenseIncluded")} value="✓" />
        ) : null}
        {l.food_included ? (
          <SpecDetail icon="food" label={tForm("foodIncluded")} value="✓" />
        ) : null}
        {l.keep_catch ? (
          <SpecDetail icon="catch" label={tForm("keepCatch")} value="✓" />
        ) : null}
        {l.has_license ? (
          <SpecDetail icon="license" label={tForm("hasLicense")} value="✓" />
        ) : null}
        {l.toilet_type && l.toilet_type !== "none" ? (
          <SpecDetail icon="toilet" label={tForm("toiletType")} value={tToilet(l.toilet_type)} />
        ) : null}
        {l.shower ? (
          <SpecDetail icon="shower" label={tForm("shower")} value="✓" />
        ) : null}
        {l.stove_type && l.stove_type !== "none" ? (
          <SpecDetail icon="galley" label={tForm("stoveType")} value={tStove(l.stove_type)} />
        ) : null}
        {l.grill ? (
          <SpecDetail icon="grill" label={tForm("grill")} value="✓" />
        ) : null}
      </dl>

      {l.rules ? (
        <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <h2 className="text-xs uppercase tracking-wide text-amber-800">
            {tForm("rules")}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{l.rules}</p>
        </div>
      ) : null}

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

      <BackToSearch href="/fishing" label={tCommon("continueSearch")} />
    </div>
  );
}

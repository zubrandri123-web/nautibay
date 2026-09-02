import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/photo-gallery";
import { countryName, formatLength } from "@/lib/boats/constants";
import { getBoatListing } from "@/lib/boats/queries";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${path}`;
}

export default async function BoatDetailPage({ params }: Props) {
  const { id, locale } = await params;
  const listing = await getBoatListing(id);

  const t = await getTranslations("BoatDetail");
  const tType = await getTranslations("BoatType");
  const tHull = await getTranslations("HullMaterial");
  const tFuel = await getTranslations("FuelType");
  const tCondition = await getTranslations("Condition");
  const tAuth = await getTranslations("Auth");
  const tCommon = await getTranslations("Common");
  const fmtLen = (m: number) =>
    formatLength(m, tCommon("unitM"), tCommon("unitFt"));

  if (!listing) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const phoneDigits: string =
    (user && listing.contact_phone
      ? String(listing.contact_phone).replace(/[^\d]/g, "")
      : "") ?? "";

  const photos = [...(listing.boat_listing_photos ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const title =
    [listing.brand, listing.model].filter(Boolean).join(" ") ||
    tType(listing.boat_type);
  const location = [
    listing.city,
    listing.region,
    listing.country ? countryName(listing.country, locale) : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PhotoGallery
        photos={photos.map((p) => photoUrl(p.storage_path))}
        alt={title}
        labels={{
          close: tCommon("close"),
          previous: tCommon("previous"),
          next: tCommon("next"),
        }}
      />

      <h1 className="mt-6 text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="text-slate-500">{location}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">
        {listing.currency} {Number(listing.price).toLocaleString()}
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-xs uppercase tracking-wide text-slate-400">
          {t("contactSeller")}
        </h2>
        {user ? (
          <div className="mt-2 space-y-1 text-sm text-slate-800">
            {listing.profiles?.full_name ? (
              <p className="font-medium">{listing.profiles.full_name}</p>
            ) : null}
            {listing.contact_phone ? (
              <p>
                <a
                  href={`tel:${listing.contact_phone}`}
                  className="font-medium text-slate-900 underline"
                >
                  {listing.contact_phone}
                </a>
                {listing.contact_phone_whatsapp && phoneDigits ? (
                  <>
                    {" · "}
                    <a
                      href={`https://wa.me/${phoneDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {t("whatsapp")}
                    </a>
                  </>
                ) : null}
                {listing.contact_phone_telegram ? ` · ${t("telegram")}` : null}
              </p>
            ) : null}
            {listing.contact_email ? (
              <p>
                <a
                  href={`mailto:${listing.contact_email}`}
                  className="text-slate-900 underline"
                >
                  {listing.contact_email}
                </a>
              </p>
            ) : null}
            {listing.contact_note ? (
              <p className="whitespace-pre-line text-slate-600">
                {listing.contact_note}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-slate-600">{t("signInToContact")}</p>
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
        {listing.condition ? (
          <Detail label={t("condition")} value={tCondition(listing.condition)} />
        ) : null}
        <Detail label={t("year")} value={listing.year_built} />
        {listing.refit_year ? (
          <Detail label={t("refitYear")} value={listing.refit_year} />
        ) : null}
        <Detail label={t("length")} value={fmtLen(listing.length_m)} />
        {listing.beam_m ? (
          <Detail label={t("beam")} value={fmtLen(listing.beam_m)} />
        ) : null}
        {listing.draft_m ? (
          <Detail label={t("draft")} value={fmtLen(listing.draft_m)} />
        ) : null}
        {listing.hull_material ? (
          <Detail label={t("hull")} value={tHull(listing.hull_material)} />
        ) : null}
        {listing.fuel_type ? (
          <Detail label={t("fuel")} value={tFuel(listing.fuel_type)} />
        ) : null}
        {listing.engine_power_hp ? (
          <Detail label={t("engine")} value={`${listing.engine_power_hp} hp`} />
        ) : null}
        {listing.cabins ? <Detail label={t("cabins")} value={listing.cabins} /> : null}
        {listing.berths ? <Detail label={t("berths")} value={listing.berths} /> : null}
        {listing.sail_area_m2 ? (
          <Detail label={t("sailArea")} value={`${listing.sail_area_m2} m²`} />
        ) : null}
        {listing.flag_country ? (
          <Detail
            label={t("flag")}
            value={countryName(listing.flag_country, locale)}
          />
        ) : null}
      </dl>

      {listing.is_broker ? (
        <p className="mt-4 text-sm text-slate-500">
          {t("listedByBroker")}
          {listing.broker_company_name ? ` — ${listing.broker_company_name}` : ""}
        </p>
      ) : null}

      {listing.description ? (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-wide text-slate-400">
            {t("description")}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
            {listing.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

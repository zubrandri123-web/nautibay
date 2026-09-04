import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/photo-gallery";
import { SpecDetail } from "@/components/spec-detail";
import { BackToSearch } from "@/components/back-to-search";
import { countryName, formatLength } from "@/lib/boats/constants";
import { getBerthListing } from "@/lib/berths/queries";

type Props = { params: Promise<{ locale: string; id: string }> };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const photoUrl = (p: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${p}`;

export default async function BerthDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const tPlace = await getTranslations("PlaceType");
  const tDeal = await getTranslations("Deal");
  const tPeriod = await getTranslations("RentPeriod");
  const tForm = await getTranslations("BerthForm");
  const tDet = await getTranslations("BoatDetail");
  const tCommon = await getTranslations("Common");
  const tAuth = await getTranslations("Auth");

  const l = await getBerthListing(id);
  if (!l) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const photos = [...(l.berth_listing_photos ?? [])]
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

  const fmt = (m: number | null) =>
    m == null ? "" : formatLength(m, tCommon("unitM"), tCommon("unitFt"));

  const phoneDigits =
    user && l.contact_phone
      ? String(l.contact_phone).replace(/[^\d]/g, "")
      : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PhotoGallery
        photos={photos}
        alt={tPlace(l.place_type)}
        labels={{
          close: tCommon("close"),
          previous: tCommon("previous"),
          next: tCommon("next"),
        }}
      />

      <h1 className="mt-6 text-2xl font-semibold text-slate-900">
        {tPlace(l.place_type)} · {tDeal(l.deal)}
      </h1>
      <p className="text-slate-500">{place}</p>
      {l.map_url ? (
        <a
          href={l.map_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 underline"
        >
          <span aria-hidden="true">📍</span> {tDet("viewOnMap")}
        </a>
      ) : null}
      <p className="mt-2 text-3xl font-semibold text-slate-900">
        {l.currency} {Number(l.price).toLocaleString()}
        {l.deal === "rent" && l.rent_period
          ? ` / ${tPeriod(l.rent_period)}`
          : ""}
      </p>

      <div className="mt-6 rounded-lg border-2 border-sky-500 bg-sky-100 p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-sky-800">
          <span aria-hidden="true">👉</span> {tDet("contactSeller")}
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
        {l.beam_m ? (
          <SpecDetail icon="beam" label={tForm("beamM")} value={fmt(l.beam_m)} />
        ) : null}
        {l.draft_m && l.place_type !== "dry_storage" && l.place_type !== "locker" ? (
          <SpecDetail icon="draft" label={tForm("draftM")} value={fmt(l.draft_m)} />
        ) : null}
        {l.water && l.place_type !== "locker" ? (
          <SpecDetail icon="water" label={tForm("water")} value="✓" />
        ) : null}
        {l.electricity ? (
          <SpecDetail icon="electricity" label={tForm("electricity")} value="✓" />
        ) : null}
        {l.security ? (
          <SpecDetail icon="security" label={tForm("security")} value="✓" />
        ) : null}
        {l.liveaboard && l.place_type !== "locker" ? (
          <SpecDetail icon="liveaboard" label={tForm("liveaboard")} value="✓" />
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

      <BackToSearch href="/berths" label={tCommon("continueSearch")} />
    </div>
  );
}

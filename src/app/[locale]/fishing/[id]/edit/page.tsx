import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { FishingForm } from "@/components/fishing-form";
import { getOwnFishing } from "@/lib/fishing/queries";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditFishingPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations("Fishing");
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

  const l = (await getOwnFishing(id)) as
    | (Record<string, unknown> & {
        fishing_listing_photos:
          | { storage_path: string; sort_order: number }[]
          | null;
      })
    | null;
  if (!l) notFound();

  const photoPaths = [...(l.fishing_listing_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => p.storage_path);

  const s = (v: unknown) => (v == null ? "" : String(v));

  const initial = {
    tripType: s(l.trip_type),
    duration: s(l.duration),
    boatType: s(l.boat_type),
    boatName: s(l.boat_name),
    boatLengthM: s(l.boat_length_m),
    dimUnit: "m",
    maxAnglers: s(l.max_anglers),
    marina: s(l.marina),
    country: s(l.country),
    region: s(l.region),
    city: s(l.city),
    postalCode: s(l.postal_code),
    price: s(l.price),
    currency: s(l.currency) || "EUR",
    ratePeriod: s(l.rate_period),
    tackleIncluded: Boolean(l.tackle_included),
    baitIncluded: Boolean(l.bait_included),
    licenseIncluded: Boolean(l.license_included),
    foodIncluded: Boolean(l.food_included),
    keepCatch: Boolean(l.keep_catch),
    hasLicense: Boolean(l.has_license),
    toiletType: s(l.toilet_type),
    shower: Boolean(l.shower),
    stoveType: s(l.stove_type),
    grill: Boolean(l.grill),
    season: s(l.season),
    rules: s(l.rules),
    description: s(l.description),
    promoteSocial: Boolean(l.promote_social),
    contactPhone: s(l.contact_phone),
    contactPhoneWhatsapp: Boolean(l.contact_phone_whatsapp),
    contactPhoneTelegram: Boolean(l.contact_phone_telegram),
    contactEmail: s(l.contact_email),
    contactNote: s(l.contact_note),
    photoPaths,
  } as Parameters<typeof FishingForm>[0]["initial"];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">{t("editTitle")}</h1>
      <FishingForm
        locale={locale}
        userId={user.id}
        sellerEmail={user.email ?? ""}
        listingId={id}
        initial={initial}
      />
    </div>
  );
}

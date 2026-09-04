import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoatForm } from "@/components/boat-form";
import { getOwnListing } from "@/lib/boats/queries";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations("BoatForm");
  const tAuth = await getTranslations("Auth");
  const tMine = await getTranslations("MyListings");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-slate-700">{t("signInRequired")}</p>
        <Link
          href="/sign-in"
          className="btn-3d btn-3d-blue mt-4 inline-block px-4 py-2"
        >
          {tAuth("signInButton")}
        </Link>
      </div>
    );
  }

  const l = (await getOwnListing(id)) as
    | (Record<string, unknown> & {
        boat_listing_photos: { storage_path: string; sort_order: number }[] | null;
      })
    | null;
  if (!l) notFound();

  const photoPaths = [...(l.boat_listing_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => p.storage_path);

  const str = (v: unknown) => (v == null ? "" : String(v));

  const initial = {
    boatType: str(l.boat_type),
    price: str(l.price),
    currency: str(l.currency) || "EUR",
    yearBuilt: str(l.year_built),
    lengthM: str(l.length_m),
    dimUnit: "m",
    condition: str(l.condition),
    country: str(l.country),
    region: str(l.region),
    city: str(l.city),
    postalCode: str(l.postal_code),
    brand: str(l.brand),
    model: str(l.model),
    beamM: str(l.beam_m),
    draftM: str(l.draft_m),
    headroomM: str(l.headroom_m),
    fuelType: str(l.fuel_type),
    enginePowerHp: str(l.engine_power_hp),
    fuelTankL: str(l.fuel_tank_l),
    waterTankL: str(l.water_tank_l),
    hullMaterial: str(l.hull_material),
    cabins: str(l.cabins),
    berths: str(l.berths),
    toiletType: str(l.toilet_type),
    shower: Boolean(l.shower),
    stoveType: str(l.stove_type),
    grill: Boolean(l.grill),
    batteryVoltage: str(l.battery_voltage),
    shorePower: str(l.shore_power),
    steeringType: str(l.steering_type),
    keelType: str(l.keel_type),
    engineMount: str(l.engine_mount),
    refitYear: str(l.refit_year),
    sailAreaM2: str(l.sail_area_m2),
    videoUrl: str(l.video_url),
    description: str(l.description),
    flagCountry: str(l.flag_country),
    isBroker: Boolean(l.is_broker),
    brokerCompanyName: str(l.broker_company_name),
    promoteSocial: Boolean(l.promote_social),
    contactPhone: str(l.contact_phone),
    contactPhoneWhatsapp: Boolean(l.contact_phone_whatsapp),
    contactPhoneTelegram: Boolean(l.contact_phone_telegram),
    contactEmail: str(l.contact_email),
    contactNote: str(l.contact_note),
    photoPaths,
  } as Parameters<typeof BoatForm>[0]["initial"];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        {tMine("editTitle")}
      </h1>
      <BoatForm
        locale={locale}
        userId={user.id}
        sellerEmail={user.email ?? ""}
        listingId={id}
        initial={initial}
      />
    </div>
  );
}

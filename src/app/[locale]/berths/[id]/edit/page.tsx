import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { BerthForm } from "@/components/berth-form";
import { getOwnBerth } from "@/lib/berths/queries";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditBerthPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations("Berths");
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

  const l = (await getOwnBerth(id)) as
    | (Record<string, unknown> & {
        berth_listing_photos: { storage_path: string; sort_order: number }[] | null;
      })
    | null;
  if (!l) notFound();

  const photoPaths = [...(l.berth_listing_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => p.storage_path);

  const s = (v: unknown) => (v == null ? "" : String(v));

  const initial = {
    placeType: s(l.place_type),
    deal: s(l.deal) || "rent",
    marina: s(l.marina),
    country: s(l.country),
    region: s(l.region),
    city: s(l.city),
    postalCode: s(l.postal_code),
    mapUrl: s(l.map_url),
    lengthM: s(l.length_m),
    beamM: s(l.beam_m),
    draftM: s(l.draft_m),
    dimUnit: "m",
    price: s(l.price),
    currency: s(l.currency) || "EUR",
    rentPeriod: s(l.rent_period),
    electricity: Boolean(l.electricity),
    water: Boolean(l.water),
    security: Boolean(l.security),
    liveaboard: Boolean(l.liveaboard),
    description: s(l.description),
    promoteSocial: Boolean(l.promote_social),
    contactPhone: s(l.contact_phone),
    contactPhoneWhatsapp: Boolean(l.contact_phone_whatsapp),
    contactPhoneTelegram: Boolean(l.contact_phone_telegram),
    contactEmail: s(l.contact_email),
    contactNote: s(l.contact_note),
    photoPaths,
  } as Parameters<typeof BerthForm>[0]["initial"];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">{t("editTitle")}</h1>
      <BerthForm
        locale={locale}
        userId={user.id}
        sellerEmail={user.email ?? ""}
        listingId={id}
        initial={initial}
      />
    </div>
  );
}

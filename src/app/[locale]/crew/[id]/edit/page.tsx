import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { CrewForm } from "@/components/crew-form";
import { getOwnCrew } from "@/lib/crew/queries";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditCrewPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations("Crew");
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

  const l = (await getOwnCrew(id)) as
    | (Record<string, unknown> & {
        crew_listing_photos:
          | { storage_path: string; sort_order: number }[]
          | null;
      })
    | null;
  if (!l) notFound();

  const photoPaths = [...(l.crew_listing_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => p.storage_path);

  const s = (v: unknown) => (v == null ? "" : String(v));

  const initial = {
    role: s(l.role),
    availability: s(l.availability),
    displayName: s(l.display_name),
    headline: s(l.headline),
    yearsExperience: s(l.years_experience),
    languages: s(l.languages),
    licenses: s(l.licenses),
    vesselExperience: s(l.vessel_experience),
    homeBase: s(l.home_base),
    waters: s(l.waters),
    availableWorldwide: Boolean(l.available_worldwide),
    price: s(l.price),
    currency: s(l.currency) || "EUR",
    ratePeriod: s(l.rate_period),
    about: s(l.about),
    promoteSocial: Boolean(l.promote_social),
    contactPhone: s(l.contact_phone),
    contactPhoneWhatsapp: Boolean(l.contact_phone_whatsapp),
    contactPhoneTelegram: Boolean(l.contact_phone_telegram),
    contactEmail: s(l.contact_email),
    contactNote: s(l.contact_note),
    photoPaths,
  } as Parameters<typeof CrewForm>[0]["initial"];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">{t("editTitle")}</h1>
      <CrewForm
        locale={locale}
        userId={user.id}
        sellerEmail={user.email ?? ""}
        listingId={id}
        initial={initial}
      />
    </div>
  );
}

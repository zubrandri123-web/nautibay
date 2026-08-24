import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoatForm } from "@/components/boat-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewBoatListingPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations("BoatForm");
  const tAuth = await getTranslations("Auth");

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-slate-700">{t("signInRequired")}</p>
        <Link
          href="/sign-in"
          className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          {tAuth("signInButton")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">{t("title")}</h1>
      <BoatForm locale={locale} userId={user.id} />
    </div>
  );
}

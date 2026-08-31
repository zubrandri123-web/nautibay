import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/[locale]/(auth)/actions";
import { LanguageSwitcher } from "./language-switcher";

export async function NavBar({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-navy">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="whitespace-nowrap text-lg font-semibold text-white"
        >
          ⚓ NautiBay<span className="text-gold">.com</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/boats" className="text-slate-200 hover:text-white">
            {t("browseBoats")}
          </Link>
          <Link href="/boats/new" className="text-slate-200 hover:text-white">
            {t("sellBoat")}
          </Link>

          {user ? (
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="text-slate-200 hover:text-white"
              >
                {t("signOut")}
              </button>
            </form>
          ) : (
            <>
              <Link href="/sign-in" className="text-slate-200 hover:text-white">
                {t("signIn")}
              </Link>
              <Link
                href="/sign-up"
                className="btn-3d btn-3d-blue px-3 py-1.5"
              >
                {t("signUp")}
              </Link>
            </>
          )}

          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}

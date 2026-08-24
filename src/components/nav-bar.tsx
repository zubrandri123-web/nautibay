import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/[locale]/(auth)/actions";
import { LanguageSwitcher } from "./language-switcher";

export async function NavBar({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          ⚓ {tCommon("appName")}
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/boats" className="text-slate-700 hover:text-slate-900">
            {t("browseBoats")}
          </Link>
          <Link
            href="/boats/new"
            className="text-slate-700 hover:text-slate-900"
          >
            {t("sellBoat")}
          </Link>

          {user ? (
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="text-slate-700 hover:text-slate-900"
              >
                {t("signOut")}
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-slate-700 hover:text-slate-900"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
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

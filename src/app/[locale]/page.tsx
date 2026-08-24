import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const tCommon = await getTranslations("Common");

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
        {tCommon("appName")}
      </h1>
      <p className="mt-3 text-lg text-slate-600">{t("tagline")}</p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/boats"
          className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-lg font-medium text-slate-900 shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          {t("findBoat")}
        </Link>
        <Link
          href="/boats/new"
          className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-lg font-medium text-slate-900 shadow-sm transition hover:border-slate-400 hover:shadow-md"
        >
          {t("sellBoat")}
        </Link>
        <div className="cursor-not-allowed rounded-lg border border-dashed border-slate-300 bg-slate-100 px-6 py-8 text-lg font-medium text-slate-400">
          {t("findCrew")}
          <div className="mt-1 text-xs uppercase tracking-wide">
            {t("comingSoon")}
          </div>
        </div>
        <div className="cursor-not-allowed rounded-lg border border-dashed border-slate-300 bg-slate-100 px-6 py-8 text-lg font-medium text-slate-400">
          {t("services")}
          <div className="mt-1 text-xs uppercase tracking-wide">
            {t("comingSoon")}
          </div>
        </div>
      </div>
    </div>
  );
}

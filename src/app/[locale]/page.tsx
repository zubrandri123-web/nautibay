import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const tCommon = await getTranslations("Common");

  return (
    <div className="relative overflow-hidden bg-slate-50 py-20">
      {/* Scattered background photos — decorative, hidden from screen readers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Photo
          src="/hero/chart-compass.jpg"
          className="left-[2%] top-[4%] w-40 -rotate-6 sm:w-56"
        />
        <Photo
          src="/hero/harbor-boats-1.jpg"
          className="right-[3%] top-[3%] hidden w-48 rotate-6 sm:block"
        />
        <Photo
          src="/hero/marina-masts.jpg"
          className="left-[1%] top-[42%] hidden w-52 -rotate-3 lg:block"
        />
        <Photo
          src="/hero/tall-ship.jpg"
          className="right-[2%] top-[38%] hidden w-44 rotate-12 lg:block"
        />
        <Photo
          src="/hero/texture-patina.jpg"
          className="bottom-[5%] left-[4%] hidden w-48 rotate-12 sm:block"
        />
        <Photo
          src="/hero/harbor-boats-2.jpg"
          className="bottom-[3%] right-[2%] w-44 -rotate-12 sm:w-56"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <div className="rounded-2xl bg-white/90 px-6 py-10 shadow-sm backdrop-blur-sm sm:px-10">
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
      </div>
    </div>
  );
}

function Photo({ src, className }: { src: string; className: string }) {
  return (
    <div className={`absolute rounded-sm bg-white p-1.5 shadow-md ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
    </div>
  );
}

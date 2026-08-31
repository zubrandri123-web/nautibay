import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

function CompassRose() {
  const ink = "#16171a";
  const lite = "#f7f3e8";
  const disc = "#e7ddc6";
  const rad = (d: number) => ((d - 90) * Math.PI) / 180;
  const X = (d: number, r: number) => (60 + Math.cos(rad(d)) * r).toFixed(2);
  const Y = (d: number, r: number) => (60 + Math.sin(rad(d)) * r).toFixed(2);
  const P = (d: number, r: number) => `${X(d, r)},${Y(d, r)}`;
  const spike = (a: number, tip: number, base: number, k: string) => [
    <polygon key={`${k}-a`} points={`${P(a, tip)} ${P(a + 90, base)} 60,60`} fill={ink} />,
    <polygon key={`${k}-b`} points={`${P(a, tip)} ${P(a - 90, base)} 60,60`} fill={lite} />,
  ];
  return (
    <svg
      viewBox="0 0 120 120"
      className="mx-auto mb-3 h-20 w-20"
      aria-hidden="true"
    >
      {/* medallion */}
      <circle cx="60" cy="60" r="53" fill={disc} />
      <circle cx="60" cy="60" r="53" fill="none" stroke={ink} strokeWidth="2" />
      <circle cx="60" cy="60" r="45" fill="none" stroke={ink} strokeOpacity="0.3" strokeWidth="1" />

      {/* graduated ticks (skipped at the 4 cardinals to leave room for letters) */}
      <g stroke={ink}>
        {Array.from({ length: 16 }, (_, i) => i)
          .filter((i) => i % 4 !== 0)
          .map((i) => {
            const a = i * 22.5;
            return (
              <line
                key={i}
                x1={X(a, 52)}
                y1={Y(a, 52)}
                x2={X(a, 47)}
                y2={Y(a, 47)}
                strokeWidth={0.9}
              />
            );
          })}
      </g>

      {/* faceted 8-point star */}
      {[45, 135, 225, 315].flatMap((a) => spike(a, 22, 5, `ic${a}`))}
      {[0, 90, 180, 270].flatMap((a) => spike(a, 37, 6, `c${a}`))}

      {/* hub */}
      <circle cx="60" cy="60" r="5.5" fill={ink} />
      <circle cx="58" cy="58" r="1.5" fill={lite} opacity="0.85" />

      {/* direction letters */}
      <g
        fill={ink}
        fontSize="12"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        <text x="60" y="13" dominantBaseline="middle">N</text>
        <text x="107" y="61" dominantBaseline="middle">E</text>
        <text x="60" y="109" dominantBaseline="middle">S</text>
        <text x="13" y="61" dominantBaseline="middle">W</text>
      </g>
    </svg>
  );
}

export default async function HomePage() {
  const t = await getTranslations("Home");
  const tCommon = await getTranslations("Common");

  const soon = (label: string) => (
    <div className="cursor-not-allowed rounded-lg border border-dashed border-slate-400 bg-navy-dark/60 px-4 py-3 text-sm font-medium text-slate-400">
      {label}
      <div className="mt-0.5 text-[10px] uppercase tracking-wide">
        {t("comingSoon")}
      </div>
    </div>
  );

  return (
    <div
      className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-cover bg-center bg-fixed px-4 py-10"
      style={{ backgroundImage: "url(/hero/marina-wide.jpg)" }}
    >
      <div className="w-full max-w-sm rounded-xl bg-navy/70 px-5 py-7 text-center shadow-lg backdrop-blur-sm">
        <CompassRose />
        <h1 className="text-xl font-semibold text-white">
          {tCommon("appName")}
        </h1>
        <p className="mt-1.5 text-sm text-slate-200">{t("tagline")}</p>

        <div className="mt-6 grid grid-cols-1 gap-2.5">
          <Link href="/boats" className="btn-3d btn-3d-blue px-4 py-3 text-sm">
            {t("findBoat")}
          </Link>
          <Link
            href="/boats/new"
            className="btn-3d btn-3d-blue px-4 py-3 text-sm"
          >
            {t("sellBoat")}
          </Link>
          {soon(t("charterBoat"))}
          {soon(t("fishing"))}
          {soon(t("findCrew"))}
          {soon(t("services"))}
        </div>
      </div>
    </div>
  );
}

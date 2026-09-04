"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  ru: "Русский",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  de: "Deutsch",
  el: "Ελληνικά",
  hr: "Hrvatski",
  tr: "Türkçe",
  sv: "Svenska",
  no: "Norsk",
  uk: "Українська",
  pl: "Polski",
  pt: "Português",
  nl: "Nederlands",
  da: "Dansk",
  ro: "Română",
  bg: "Български",
};

// A globe, not flags — a single language here (Dutch, Spanish, Arabic…)
// can serve several countries, so no one flag would be accurate.
function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="M2.5 10h15" />
      <path d="M10 2.5c2.4 2 3.8 4.8 3.8 7.5s-1.4 5.5-3.8 7.5c-2.4-2-3.8-4.8-3.8-7.5S7.6 4.5 10 2.5Z" />
    </svg>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <div className="relative inline-flex items-center">
      <GlobeIcon />
      <select
        aria-label="Language"
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value;
          router.replace(
            // @ts-expect-error -- pathname comes from the current route, params may vary per page
            { pathname, params },
            { locale: nextLocale },
          );
        }}
        className="rounded-md border border-slate-300 bg-white py-1 pl-7 pr-2 text-sm text-slate-700"
      >
        {routing.locales.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code] ?? code}
          </option>
        ))}
      </select>
    </div>
  );
}

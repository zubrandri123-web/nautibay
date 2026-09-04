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
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
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
      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
    >
      {routing.locales.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code] ?? code}
        </option>
      ))}
    </select>
  );
}

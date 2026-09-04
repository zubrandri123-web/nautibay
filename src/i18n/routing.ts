import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    "en", "ru", "fr", "it", "es", "de", "el", "hr", "tr",
    "sv", "no", "uk", "pl", "pt", "nl", "da", "ro", "bg",
  ],
  // Visitors get their browser language if it is one of the locales above;
  // anything else falls back to English. Manual choice from the switcher wins.
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];

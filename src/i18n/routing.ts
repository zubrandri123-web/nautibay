import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru", "fr", "it", "es", "de", "el", "hr", "tr"],
  defaultLocale: "en",
  // Always open in English; visitors pick their own language from the switcher
  // (their choice is then remembered). No auto-switch from browser language.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];

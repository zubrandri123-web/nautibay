import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ru", "fr", "it", "es", "de", "el", "hr", "tr"],
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];

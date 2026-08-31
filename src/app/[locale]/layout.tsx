import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NavBar } from "@/components/nav-bar";
import { Link } from "@/i18n/navigation";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "NautiBay.com — Yacht Marketplace",
  description: "The international marketplace for the yachting community",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <NextIntlClientProvider>
          <NavBar locale={locale} />
          <main className="flex-1">{children}</main>
          <footer className="bg-navy-dark py-6 text-center text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} NautiBay.com — Yacht Marketplace
            </p>
            <Link
              href="/privacy"
              className="mt-1 inline-block hover:text-white"
            >
              Privacy policy
            </Link>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signInAction } from "../actions";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SignInPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("Auth");

  const error = typeof sp.error === "string" ? sp.error : undefined;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">
        {t("signInTitle")}
      </h1>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form action={signInAction} className="mt-6 space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("email")}
          </label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("password")}
          </label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
        >
          {t("signInButton")}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {t("needAccount")}{" "}
        <Link href="/sign-up" className="font-medium text-slate-900 underline">
          {t("signUpButton")}
        </Link>
      </p>
    </div>
  );
}

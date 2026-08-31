import { getTranslations } from "next-intl/server";
import { signUpAction } from "../actions";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SignUpPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("Auth");

  const checkEmail = typeof sp.checkEmail === "string" ? sp.checkEmail : undefined;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  if (checkEmail) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("checkEmailTitle")}
        </h1>
        <p className="mt-3 text-slate-600">
          {t("checkEmailBody", { email: checkEmail })}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">
        {t("signUpTitle")}
      </h1>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form action={signUpAction} className="mt-6 space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("fullName")}
          </label>
          <input
            name="fullName"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>

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
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <button type="submit" className="btn-3d btn-3d-green w-full px-4 py-2">
          {t("signUpButton")}
        </button>
      </form>
    </div>
  );
}

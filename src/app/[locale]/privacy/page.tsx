export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-relaxed text-slate-700">
      <h1 className="text-2xl font-semibold text-slate-900">Privacy policy</h1>
      <p className="mt-2 text-slate-500">Last updated: August 2026</p>

      <p className="mt-6">
        This page explains what information Yacht Marketplace collects, why,
        and what choices you have. It applies to everyone who visits or uses
        the site.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        What we collect
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          <strong>Account information:</strong> the email address and name
          you provide when you sign up.
        </li>
        <li>
          <strong>Listing information:</strong> anything you enter when
          creating a boat listing, including the photos you upload.
        </li>
        <li>
          <strong>Technical data:</strong> a session cookie that keeps you
          signed in. We don&apos;t use tracking or advertising cookies.
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        Why we collect it
      </h2>
      <p className="mt-2">
        Solely to operate the marketplace: to create your account, publish
        your listings, and let other users find and view them. We don&apos;t
        sell your data, and we don&apos;t use it for advertising.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        Where it&apos;s stored
      </h2>
      <p className="mt-2">
        Account data, listings, and photos are stored with{" "}
        <a
          href="https://supabase.com"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          Supabase
        </a>
        , our database and storage provider. We don&apos;t share your data
        with any other third party.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        Your rights
      </h2>
      <p className="mt-2">
        You can ask to see, correct, or delete your data at any time by
        contacting us — see below. Deleting your account removes your
        profile and listings from the site.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Contact</h2>
      <p className="mt-2">
        Questions about this policy or your data:{" "}
        <a href="mailto:zubrandri123@gmail.com" className="underline">
          zubrandri123@gmail.com
        </a>
        .
      </p>

      <p className="mt-8 text-xs text-slate-400">
        This is a general-purpose policy for an early-stage site with no paid
        features yet. It should be reviewed by a lawyer before the site
        processes payments or scales to a large audience.
      </p>
    </div>
  );
}

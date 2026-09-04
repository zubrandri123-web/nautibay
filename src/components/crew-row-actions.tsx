"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  bumpCrewAction,
  deleteCrewAction,
  setCrewStatusAction,
} from "@/app/[locale]/crew/mine/actions";

type Labels = {
  edit: string;
  archive: string;
  reactivate: string;
  del: string;
  confirmDelete: string;
};

export function CrewRowActions({
  id,
  status,
  labels,
}: {
  id: string;
  status: string;
  labels: Labels;
}) {
  const router = useRouter();
  const tCommon = useTranslations("Common");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string; hoursLeft?: number }>) =>
    startTransition(async () => {
      setErr(null);
      const res = await fn();
      if (res?.error) setErr(res.error);
      else if (res?.hoursLeft) {
        setErr(tCommon("bumpCooldown", { hours: res.hoursLeft }));
      } else router.refresh();
    });

  const btn =
    "rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:border-slate-500 disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/crew/${id}/edit`} className={btn}>
        {labels.edit}
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => bumpCrewAction(id))}
        className={btn}
      >
        {tCommon("bump")}
      </button>
      {status === "active" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setCrewStatusAction(id, "archived"))}
          className={btn}
        >
          {labels.archive}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setCrewStatusAction(id, "active"))}
          className={btn}
        >
          {labels.reactivate}
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm(labels.confirmDelete)) run(() => deleteCrewAction(id));
        }}
        className={`${btn} border-red-300 text-red-700 hover:border-red-500`}
      >
        {labels.del}
      </button>
      {err ? <span className="text-xs text-red-600">{err}</span> : null}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  deleteBerthAction,
  setBerthStatusAction,
} from "@/app/[locale]/berths/mine/actions";

type Labels = {
  edit: string;
  markTaken: string;
  archive: string;
  reactivate: string;
  del: string;
  confirmDelete: string;
};

export function BerthRowActions({
  id,
  status,
  deal,
  labels,
}: {
  id: string;
  status: string;
  deal: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      setErr(null);
      const res = await fn();
      if (res?.error) setErr(res.error);
      else router.refresh();
    });

  const btn =
    "rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:border-slate-500 disabled:opacity-50";
  const takenStatus = deal === "rent" ? "rented" : "sold";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/berths/${id}/edit`} className={btn}>
        {labels.edit}
      </Link>
      {status === "active" ? (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setBerthStatusAction(id, takenStatus))}
            className={btn}
          >
            {labels.markTaken}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setBerthStatusAction(id, "archived"))}
            className={btn}
          >
            {labels.archive}
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setBerthStatusAction(id, "active"))}
          className={btn}
        >
          {labels.reactivate}
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm(labels.confirmDelete)) run(() => deleteBerthAction(id));
        }}
        className={`${btn} border-red-300 text-red-700 hover:border-red-500`}
      >
        {labels.del}
      </button>
      {err ? <span className="text-xs text-red-600">{err}</span> : null}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveServiceAction,
  rejectServiceAction,
} from "@/app/[locale]/admin/services/actions";

export function AdminServiceActions({
  id,
  labels,
}: {
  id: string;
  labels: { approve: string; reject: string; confirmReject: string };
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => approveServiceAction(id))}
        className="rounded-md border border-green-600 bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {labels.approve}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm(labels.confirmReject)) run(() => rejectServiceAction(id));
        }}
        className="rounded-md border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:border-red-500 disabled:opacity-50"
      >
        {labels.reject}
      </button>
      {err ? <span className="text-xs text-red-600">{err}</span> : null}
    </div>
  );
}

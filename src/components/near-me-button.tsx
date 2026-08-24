"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

export function NearMeButton({ label }: { label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", position.coords.latitude.toString());
        params.set("lng", position.coords.longitude.toString());
        params.set("radiusKm", "50");
        router.push(`${pathname}?${params.toString()}`);
      },
      () => setError("Could not read your location."),
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-400"
      >
        📍 {label}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

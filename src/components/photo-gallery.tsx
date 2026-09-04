"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  photos: string[];
  alt: string;
  labels: { close: string; previous: string; next: string };
};

export function PhotoGallery({ photos, alt, labels }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (delta: number) =>
      setOpen((i) =>
        i == null ? i : (i + delta + photos.length) % photos.length,
      ),
    [photos.length],
  );

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, go]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i)}
            className="block overflow-hidden rounded-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="aspect-[4/3] w-full cursor-zoom-in object-cover transition hover:opacity-90"
            />
          </button>
        ))}
      </div>

      {open != null
        ? createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483000,
            background: "rgba(0,0,0,0.94)",
          }}
          className="flex items-center justify-center"
          onClick={close}
          onTouchStart={(e) => setTouchX(e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchX == null) return;
            const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            setTouchX(null);
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label={labels.close}
            style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
            className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-3xl leading-none text-white shadow-lg hover:bg-black/80"
          >
            ×
          </button>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                aria-label={labels.previous}
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-1 top-1/2 -translate-y-1/2 px-2 py-8 text-4xl text-white/75 hover:text-white"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={labels.next}
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-8 text-4xl text-white/75 hover:text-white"
              >
                ›
              </button>
            </>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[open]}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] max-w-[96vw] object-contain"
          />

          {photos.length > 1 ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/50 px-2 py-1 text-sm text-white">
              {open + 1} / {photos.length}
            </div>
          ) : null}
        </div>,
            document.body,
          )
        : null}
    </>
  );
}

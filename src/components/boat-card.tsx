import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { countryName } from "@/lib/boats/constants";
import type { BoatListingSummary } from "@/lib/boats/queries";

type Photo = { storage_path: string; sort_order: number };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function coverPhotoUrl(photos: Photo[] | null) {
  if (!photos || photos.length === 0 || !SUPABASE_URL) return null;
  const cover = [...photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  return `${SUPABASE_URL}/storage/v1/object/public/boat-photos/${cover.storage_path}`;
}

export async function BoatCard({ listing }: { listing: BoatListingSummary }) {
  const t = await getTranslations("BoatType");
  const tCard = await getTranslations("BoatCard");
  const locale = await getLocale();
  const photoUrl = coverPhotoUrl(listing.boat_listing_photos);
  const title =
    [listing.brand, listing.model].filter(Boolean).join(" ") || t(listing.boat_type as never);
  const location = [
    listing.city,
    listing.region,
    listing.country ? countryName(listing.country, locale) : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/boats/${listing.id}`}
      className="block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-400 hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full bg-slate-100">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            ⛵
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">
          {tCard("yearBuilt", { year: listing.year_built })} ·{" "}
          {tCard("lengthFt", { length: listing.length_ft })}
        </p>
        <p className="mt-1 text-sm text-slate-500">{location}</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {listing.currency} {listing.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}

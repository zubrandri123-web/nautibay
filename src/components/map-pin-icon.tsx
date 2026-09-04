// The classic teardrop map marker — round on top, pointed at the bottom —
// used next to "View on map" links so they read as a location at a glance,
// unlike the muted 📍 emoji it replaces. Fixed scarlet red, independent of
// the surrounding link color, so it reads instantly as "map pin".
export function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#ef4444"
      className="h-4 w-4 flex-none"
      aria-hidden="true"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

// A small hand-drawn icon set for spec rows (engine, tanks, dimensions...).
// Kept as one file of inline SVGs rather than a dependency — a dozen simple
// line icons, nothing worth pulling in a library for.

const common = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type DetailIconName =
  | "condition"
  | "calendar"
  | "wrench"
  | "length"
  | "beam"
  | "draft"
  | "headroom"
  | "hull"
  | "fuelType"
  | "enginePower"
  | "fuelTank"
  | "waterTank"
  | "cabins"
  | "berths"
  | "sailArea"
  | "flag"
  | "water"
  | "electricity"
  | "security"
  | "liveaboard"
  | "duration"
  | "season"
  | "license"
  | "skipper"
  | "cleaning"
  | "bedding"
  | "guests"
  | "toilet"
  | "shower"
  | "engineMount"
  | "keel"
  | "tackle"
  | "bait"
  | "food"
  | "catch"
  | "galley"
  | "grill"
  | "battery"
  | "shorePower";

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg {...common} className="h-4 w-4 flex-none text-slate-400" aria-hidden="true">
      {children}
    </svg>
  );
}

const ICONS: Record<DetailIconName, React.ReactNode> = {
  condition: (
    <Svg>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.7 10.2l2.1 2.1 4.5-4.6" />
    </Svg>
  ),
  calendar: (
    <Svg>
      <rect x="3" y="4.5" width="14" height="12" rx="1.5" />
      <path d="M3 8h14M6.5 3v3M13.5 3v3" />
    </Svg>
  ),
  wrench: (
    <Svg>
      <path d="M12.2 4.3a3.3 3.3 0 0 0-4.4 3.9L3.5 12.5a1.6 1.6 0 0 0 2.3 2.3l4.3-4.3a3.3 3.3 0 0 0 3.9-4.4l-2.1 2.1-1.7-.4-.4-1.7 2.4-1.8Z" />
    </Svg>
  ),
  length: (
    <Svg>
      <path d="M3 13.5h14v3H3z" />
      <path d="M5.5 13.5V15M8.5 13.5V15M11.5 13.5V15M14.5 13.5V15" />
    </Svg>
  ),
  beam: (
    <Svg>
      <path d="M3 10h14" />
      <path d="M5.2 7.5 3 10l2.2 2.5M14.8 7.5 17 10l-2.2 2.5" />
    </Svg>
  ),
  draft: (
    <Svg>
      <path d="M10 3v10.5" />
      <path d="M6.8 10.8 10 14l3.2-3.2" />
      <path d="M3 16.5h14" />
    </Svg>
  ),
  headroom: (
    <Svg>
      <path d="M4 4h12M4 16h12" />
      <path d="M10 6.2v7.6" />
      <path d="M7.8 8.4 10 6.2l2.2 2.2M7.8 11.6 10 13.8l2.2-2.2" />
    </Svg>
  ),
  hull: (
    <Svg>
      <path d="M3 8.5h14L15.3 15a2 2 0 0 1-1.9 1.4H6.6A2 2 0 0 1 4.7 15L3 8.5Z" />
      <path d="M6 8.5V4.8A1.3 1.3 0 0 1 7.3 3.5h5.4a1.3 1.3 0 0 1 1.3 1.3v3.7" />
    </Svg>
  ),
  fuelType: (
    <Svg>
      <path d="M4.5 16.5v-11A1.5 1.5 0 0 1 6 4h4a1.5 1.5 0 0 1 1.5 1.5v11" />
      <path d="M4.5 16.5h7M11.5 8h1.8L15.5 10v4a1 1 0 0 1-1 1h-.5" />
      <path d="M6.5 7.5h3" />
    </Svg>
  ),
  enginePower: (
    <Svg>
      <circle cx="10" cy="11" r="6" />
      <path d="M10 11 7.8 8.6" />
      <path d="M10 4.5V3M4.6 6.6l-1-1M15.4 6.6l1-1" />
    </Svg>
  ),
  fuelTank: (
    <Svg>
      <path d="M4.5 16.5v-11A1.5 1.5 0 0 1 6 4h4a1.5 1.5 0 0 1 1.5 1.5v11" />
      <path d="M4.5 16.5h7M11.5 8h1.8L15.5 10v4a1 1 0 0 1-1 1h-.5" />
      <path d="M6.5 10.5h3" />
    </Svg>
  ),
  waterTank: (
    <Svg>
      <path d="M10 3.3s4.2 5 4.2 8.4a4.2 4.2 0 1 1-8.4 0C5.8 8.3 10 3.3 10 3.3Z" />
    </Svg>
  ),
  cabins: (
    <Svg>
      <path d="M3 15V8.5a1 1 0 0 1 1-1h3v3h6v-3h3a1 1 0 0 1 1 1V15" />
      <path d="M3 15h14M6 10.5v1.5M14 10.5v1.5" />
    </Svg>
  ),
  berths: (
    <Svg>
      <circle cx="7" cy="6.3" r="2" />
      <circle cx="13" cy="6.3" r="2" />
      <path d="M2.8 15.5c.3-2.5 1.9-4 4.2-4s3.9 1.5 4.2 4M9.8 15.5c.3-2.5 1.9-4 4.2-4s3.9 1.5 4.2 4" />
    </Svg>
  ),
  sailArea: (
    <Svg>
      <path d="M10 3v14" />
      <path d="M10 3.5c3.2.6 5.4 3.1 5.4 6.5-2.6 0-4.5-.9-5.4-2.3" />
      <path d="M10 9c-2.4.4-4.2 2.1-4.2 4.6 2 0 3.4-.7 4.2-1.8" />
    </Svg>
  ),
  flag: (
    <Svg>
      <path d="M5.5 3v14" />
      <path d="M5.5 4h8l-2 3 2 3h-8" />
    </Svg>
  ),
  water: (
    <Svg>
      <path d="M10 3.3s4.2 5 4.2 8.4a4.2 4.2 0 1 1-8.4 0C5.8 8.3 10 3.3 10 3.3Z" />
    </Svg>
  ),
  electricity: (
    <Svg>
      <path d="M11 2.8 5.3 11h3.9l-1 6.2L14 9h-3.9l.9-6.2Z" />
    </Svg>
  ),
  security: (
    <Svg>
      <path d="M10 3.2 15.5 5v5c0 3.8-2.4 6.4-5.5 7.8C7 16.4 4.5 13.8 4.5 10V5L10 3.2Z" />
      <path d="M7.5 10l1.8 1.8 3.2-3.6" />
    </Svg>
  ),
  liveaboard: (
    <Svg>
      <path d="M4 9.5 10 4l6 5.5" />
      <path d="M5.5 8.8V16h9V8.8" />
      <path d="M8 16v-3.5h4V16" />
    </Svg>
  ),
  duration: (
    <Svg>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.2V10l3 1.8" />
    </Svg>
  ),
  season: (
    <Svg>
      <circle cx="10" cy="10" r="3.3" />
      <path d="M10 3.5v2M10 14.5v2M3.5 10h2M14.5 10h2M5.6 5.6l1.4 1.4M13 13l1.4 1.4M5.6 14.4l1.4-1.4M13 7l1.4-1.4" />
    </Svg>
  ),
  license: (
    <Svg>
      <rect x="3" y="5" width="14" height="10" rx="1.5" />
      <path d="M6 10.3l1.8 1.8L11.5 8.5" />
    </Svg>
  ),
  skipper: (
    <Svg>
      <circle cx="10" cy="10" r="6.2" />
      <circle cx="10" cy="10" r="1.5" />
      <path d="M10 3.8v4.7M10 11.5v4.7M4.4 6.9l4 2.4M11.6 10.7l4 2.4M4.4 13.1l4-2.4M11.6 9.3l4-2.4" />
    </Svg>
  ),
  cleaning: (
    <Svg>
      <path d="M6 3.3l.9 2.2 2.2.9-2.2.9L6 9.5l-.9-2.2-2.2-.9 2.2-.9L6 3.3Z" />
      <path d="M14.3 9.2l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" />
    </Svg>
  ),
  bedding: (
    <Svg>
      <path d="M4 8.7c0-2 1.6-3.2 3.7-3.2h4.6c2.1 0 3.7 1.2 3.7 3.2v3.1c0 2-1.6 3.2-3.7 3.2H7.7C5.6 15 4 13.8 4 11.8V8.7Z" />
    </Svg>
  ),
  guests: (
    <Svg>
      <circle cx="10" cy="6.2" r="2.1" />
      <circle cx="4.6" cy="7.8" r="1.6" />
      <circle cx="15.4" cy="7.8" r="1.6" />
      <path d="M6.1 16.2c.3-2.6 1.8-4.2 3.9-4.2s3.6 1.6 3.9 4.2" />
      <path d="M1.9 15.2c.2-1.7 1.1-2.8 2.7-2.8M18.1 15.2c-.2-1.7-1.1-2.8-2.7-2.8" />
    </Svg>
  ),
  toilet: (
    <Svg>
      <rect x="6" y="3" width="6" height="2.6" rx="0.6" />
      <path d="M6.3 5.8h5.4c1.4 0 2.4 1.2 2.2 2.6l-.5 4.2c-.2 1.6-1.6 2.9-3.2 2.9H7.8c-1.6 0-3-1.3-3.2-2.9l-.5-4.2c-.2-1.4.8-2.6 2.2-2.6Z" />
    </Svg>
  ),
  shower: (
    <Svg>
      <path d="M5.5 6.8a4.8 4.8 0 0 1 8-3.6" />
      <circle cx="13.5" cy="6.8" r="1.4" />
      <path d="M4 10.5h11" />
      <path d="M6.5 13v1.3M9.5 13v1.3M12.5 13v1.3M8 16v1M11 16v1" />
    </Svg>
  ),
  engineMount: (
    <Svg>
      <rect x="5" y="7" width="10" height="7" rx="1" />
      <path d="M7 7V5h6v2M9 14v2M11 14v2" />
    </Svg>
  ),
  keel: (
    <Svg>
      <path d="M4 6h12" />
      <path d="M8 6c0 4 .8 8 2 10 1.2-2 2-6 2-10" />
    </Svg>
  ),
  tackle: (
    <Svg>
      <path d="M4 16 15 4" />
      <circle cx="6" cy="14" r="1" />
      <path d="M15 4c1.4 1.8 1 6.5-2.3 9.6" />
    </Svg>
  ),
  bait: (
    <Svg>
      <path d="M4 13c2-5 3-9 6-9s1 7 4 7 1-6 4-3" />
    </Svg>
  ),
  food: (
    <Svg>
      <path d="M4 10h12a6 6 0 0 1-12 0Z" />
      <path d="M8 10V7M12 10V7" />
    </Svg>
  ),
  catch: (
    <Svg>
      <path d="M3 10c3-4 9-5 13-1-1 2-1 2 0 4-4 4-10 3-13-1 0-1 0-1 0-2Z" />
      <path d="M14.5 7.5l2.5-2M14.5 11.5l2.5 2" />
      <circle cx="6" cy="9.3" r="0.6" fill="currentColor" stroke="none" />
    </Svg>
  ),
  galley: (
    <Svg>
      <rect x="4" y="8" width="12" height="8" rx="1.2" />
      <circle cx="7.5" cy="8" r="1.3" />
      <circle cx="12.5" cy="8" r="1.3" />
      <path d="M4 12.5h12" />
    </Svg>
  ),
  grill: (
    <Svg>
      <circle cx="10" cy="11" r="6" />
      <path d="M5 8.5h10M5 11h10M5 13.5h10" />
      <path d="M7.5 6v10M10 6v10M12.5 6v10" />
    </Svg>
  ),
  battery: (
    <Svg>
      <rect x="3.5" y="7" width="11.5" height="7" rx="1.2" />
      <rect x="15.3" y="9" width="1.5" height="3" rx="0.5" fill="currentColor" stroke="none" />
      <path d="M7.7 10.5h2.6M9 9.2v2.6" />
    </Svg>
  ),
  shorePower: (
    <Svg>
      <path d="M7.3 3v4.2M11.3 3v4.2" />
      <path d="M5.6 7.2h7.2v2.8a3.6 3.6 0 0 1-7.2 0V7.2Z" />
      <path d="M9.2 13.6V17" />
    </Svg>
  ),
};

export function DetailIcon({ name }: { name: DetailIconName }) {
  return ICONS[name];
}

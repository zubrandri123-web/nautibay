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
  | "flag";

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
};

export function DetailIcon({ name }: { name: DetailIconName }) {
  return ICONS[name];
}

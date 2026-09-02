export const BOAT_TYPES = [
  "sailboat",
  "motorboat",
  "catamaran",
  "trimaran",
  "motor_yacht",
  "rib",
  "other",
] as const;

export const HULL_MATERIALS = [
  "fiberglass",
  "wood",
  "aluminum",
  "steel",
  "ferrocement",
  "carbon_composite",
] as const;

export const FUEL_TYPES = [
  "diesel",
  "gasoline",
  "electric",
  "hybrid",
  "none",
] as const;

export const CONDITIONS = ["new", "used"] as const;

// Listing prices are shown as entered — no conversion. Kept short on purpose.
export const CURRENCIES = ["EUR", "USD", "GBP"] as const;

// Short list of the main yachting markets — used only for the quick country
// checkboxes in the catalog filter panel.
export const MAIN_MARKETS = [
  "FR",
  "ES",
  "IT",
  "GR",
  "HR",
  "TR",
  "DE",
  "PT",
  "MT",
  "ME",
  "GB",
  "US",
  "RU",
] as const;

// Full ISO 3166-1 alpha-2 list — a boat can be anywhere. Used by the listing
// form (country + flag) and to validate search params.
export const COUNTRIES = [
  "AD","AE","AF","AG","AI","AL","AM","AO","AR","AS","AT","AU","AW","AX","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR",
  "BS","BT","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM",
  "CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ",
  "EC","EE","EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR","GA","GB",
  "GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU",
  "GW","GY","HK","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR",
  "IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW",
  "KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC",
  "MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT",
  "MU","MV","MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI","NL","NO","NP",
  "NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS",
  "PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG",
  "SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ",
  "TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW",
  "TZ","UA","UG","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS",
  "YE","YT","ZA","ZM","ZW",
] as const;

// Localized country name for a code, e.g. countryName("ES", "ru") -> "Испания".
export function countryName(code: string, locale: string): string {
  try {
    return (
      new Intl.DisplayNames([locale, "en"], { type: "region" }).of(code) ?? code
    );
  } catch {
    return code;
  }
}

export type BoatType = (typeof BOAT_TYPES)[number];
export type HullMaterial = (typeof HULL_MATERIALS)[number];
export type FuelType = (typeof FUEL_TYPES)[number];
export type Condition = (typeof CONDITIONS)[number];
export type CountryCode = (typeof COUNTRIES)[number];

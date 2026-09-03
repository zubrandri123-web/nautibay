// Section 6: services & shops — a directory of marine businesses. A business
// lists itself once; buyers browse and contact directly. Only a name and a
// contact are required.
export const SERVICE_CATEGORIES = [
  "shipyard",
  "chandlery",
  "sails_rigging",
  "engines",
  "electrics",
  "hull_paint",
  "cleaning",
  "brokerage",
  "insurance_finance",
  "surveyor",
  "transport_haulage",
  "provisioning",
  "diving",
  "canvas_upholstery",
  "refit_carpentry",
  "charter_agency",
  "school",
  "other",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

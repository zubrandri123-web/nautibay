import { z } from "zod";

// HTML number inputs hand back "" when left blank, and z.coerce.number()
// turns "" into 0 — which then fails .positive()/.min(). Treat blank as
// "not provided" so an untouched optional field validates cleanly.
export const optionalNumber = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    schema.optional(),
  );

// Optional <select> fields submit "" when left on the placeholder ("—").
// z.enum(...).optional() rejects "" (not a member, not undefined), which
// silently blocks the whole form. Treat blank as "not provided".
export const optionalEnum = <T extends readonly [string, ...string[]]>(
  values: T,
) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.enum(values).optional(),
  );

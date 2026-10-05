import { GetTestHistoryQueryParams } from "@workspace/api-zod";
/** HTTP parameters are strings; Orval's date schema validates response-model Dates. */
const schema = GetTestHistoryQueryParams
  .refine(value => !value.from || !value.to || value.from <= value.to, { message: "invalid_period" });
function decodeQuery(input: unknown): unknown {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  const query = { ...input } as Record<string, unknown>;
  for (const key of ["from", "to"]) {
    const value = query[key];
    if (value === undefined) continue;
    const match = typeof value === "string" && /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
    const validCalendar = match && Number(match[2]) >= 1 && Number(match[2]) <= 12
      && Number(match[3]) >= 1 && Number(match[3]) <= new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
    query[key] = validCalendar ? new Date(value as string) : new Date(NaN);
  }
  return query;
}
export const historyQuery = {
  safeParse: (input: unknown) => schema.safeParse(decodeQuery(input)),
  parse: (input: unknown) => schema.parse(decodeQuery(input)),
};

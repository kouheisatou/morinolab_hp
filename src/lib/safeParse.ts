/** Utility: safely convert arbitrary cell value to trimmed string. */
export function toStr(val: unknown, fallback = ""): string {
  if (val === null || val === undefined) return fallback;
  return String(val).trim();
}

/** Utility: safely convert to number.  Returns fallback (default NaN) when conversion fails. */
export function toNum(val: unknown, fallback: number = Number.NaN): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/** Utility: generic boolean parser that understands common truthy strings and numbers. */
export function toBool(val: unknown, fallback = false): boolean {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  const s = String(val).toLowerCase().trim();
  return ["true", "1", "yes", "y"].includes(s);
}

/**
 * Split a delimited string into number array, ignoring blanks & invalid numbers.
 * Accepts comma / pipe / whitespace as delimiters by default.
 */
export function splitNumList(raw: unknown, delimiters = /[|,\s]+/): number[] {
  if (raw === null || raw === undefined) return [];
  const str = String(raw);
  return str
    .split(delimiters)
    .filter(Boolean)
    .map((v) => toNum(v))
    .filter((n): n is number => Number.isFinite(n));
}

/** Safe number parser that returns undefined instead of NaN when conversion fails. */
export function toNumOpt(val: unknown): number | undefined {
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

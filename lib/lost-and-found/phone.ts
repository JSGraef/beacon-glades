// Area codes served exclusively by non-continental-US states/territories.
// We reject these along with non-+1 numbers. Continental US = +1, all others.
const NON_CONTINENTAL_US_AREA_CODES = new Set<string>([
  // Alaska
  "907",
  // Hawaii
  "808",
  // Puerto Rico
  "787",
  "939",
  // US Virgin Islands
  "340",
  // Guam
  "671",
  // Northern Mariana Islands
  "670",
  // American Samoa
  "684",
]);

/**
 * Normalize an input string to E.164 assuming North American defaults.
 * Returns null if it's not a plausible +1 number.
 */
export function normalizeToE164(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/\D+/g, "");
  if (!digits) {
    return null;
  }

  if (trimmed.startsWith("+")) {
    if (digits.length < 8 || digits.length > 15) {
      return null;
    }
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return null;
}

export function isContinentalUsE164(e164: string | null): boolean {
  if (!e164) {
    return false;
  }
  if (!e164.startsWith("+1")) {
    return false;
  }
  const national = e164.slice(2);
  if (national.length !== 10) {
    return false;
  }
  const areaCode = national.slice(0, 3);
  return !NON_CONTINENTAL_US_AREA_CODES.has(areaCode);
}

export function formatE164ForDisplay(e164: string | null): string {
  if (!e164) {
    return "";
  }
  if (e164.startsWith("+1") && e164.length === 12) {
    const n = e164.slice(2);
    return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
  }
  return e164;
}

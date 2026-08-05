/**
 * Reduce a phone number to just its digits, so an agent can type their number
 * however they remember it — "(859) 555-1212", "859-555-1212", "8595551212"
 * all resolve to the same value for hashing and comparison.
 */
export function normalizePhone(input: string): string {
  return (input ?? "").replace(/\D/g, "");
}

/** Format a 10-digit US number for display, e.g. "(859) 555-1212". */
export function formatPhone(digits: string): string {
  const d = normalizePhone(digits);
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return digits;
}

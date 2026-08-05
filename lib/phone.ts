/**
 * Reduce a phone number to just its digits.
 *
 * Phone numbers are entered as plain digits ("8595551212") — the inputs are
 * numeric-only. This still strips any stray formatting as a safety net, so a
 * pasted "859-555-1212" can never silently hash to a different value and lock
 * an agent out of their own account.
 */
export function normalizePhone(input: string): string {
  return (input ?? "").replace(/\D/g, "");
}

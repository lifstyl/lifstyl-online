import { createHash } from "crypto";

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

/**
 * Deterministic lookup key for a phone number ("blind index").
 *
 * Sign-in is by phone alone, so we must find the agent *before* we can verify
 * them — and bcrypt hashes are salted, so they can't be queried directly.
 * Comparing a login against every agent's bcrypt hash would mean ~110 slow
 * hashes per attempt (seconds). Instead each agent stores this fast SHA-256
 * key, which is indexed and unique, and the bcrypt hash is still what actually
 * verifies them.
 *
 * It's peppered with AUTH_SECRET — which lives in the environment, not the
 * database — so a leaked database alone can't be brute-forced back into phone
 * numbers (only 10^10 possibilities otherwise).
 *
 * NOTE: changing AUTH_SECRET invalidates every stored key. If it's ever
 * rotated, re-run `npm run agents:import` to rebuild them.
 */
export function phoneLookupKey(phone: string): string {
  const pepper = process.env.AUTH_SECRET ?? "";
  return createHash("sha256")
    .update(`${pepper}:${normalizePhone(phone)}`)
    .digest("hex");
}

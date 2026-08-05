import { LISTING_TTL_DAYS, WISHLIST_TTL_DAYS } from "./db/schema";

const DAY_MS = 24 * 60 * 60 * 1000;

export function ttlDaysFor(kind: "listing" | "wishlist"): number {
  return kind === "listing" ? LISTING_TTL_DAYS : WISHLIST_TTL_DAYS;
}

/** The moment a post created at `createdAt` is due to be removed. */
export function expiresAt(createdAt: Date, kind: "listing" | "wishlist"): Date {
  return new Date(createdAt.getTime() + ttlDaysFor(kind) * DAY_MS);
}

/**
 * Whole days left before removal, floored at 0. Used for the countdown shown
 * on each post and for deciding when to warn the admin.
 */
export function daysUntilExpiry(
  createdAt: Date,
  kind: "listing" | "wishlist",
  now: Date = new Date()
): number {
  const remaining = expiresAt(createdAt, kind).getTime() - now.getTime();
  return Math.max(0, Math.ceil(remaining / DAY_MS));
}

/** Human phrasing for the countdown badge. */
export function expiryLabel(
  createdAt: Date,
  kind: "listing" | "wishlist",
  now: Date = new Date()
): string {
  const days = daysUntilExpiry(createdAt, kind, now);
  if (days === 0) return "Removes today";
  if (days === 1) return "Removes tomorrow";
  return `Removes in ${days} days`;
}

/** The cutoff before which posts of this kind are considered expired. */
export function expiryCutoff(
  kind: "listing" | "wishlist",
  now: Date = new Date()
): Date {
  return new Date(now.getTime() - ttlDaysFor(kind) * DAY_MS);
}

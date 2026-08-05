import "server-only";
import { and, gt, lte } from "drizzle-orm";
import { db } from "./index";
import {
  listings,
  wishlists,
  agents,
  EXPIRY_WARNING_DAYS,
} from "./schema";
import { eq } from "drizzle-orm";
import { expiryCutoff, daysUntilExpiry } from "../expiry";
import { notifyAdmin, pruneNotificationsFor } from "../notify";

export type CleanupResult = {
  listingsDeleted: number;
  wishlistsDeleted: number;
  warningsRaised: number;
};

/**
 * Remove posts past their lifetime and warn the admin about ones approaching
 * it. Idempotent — notifications are unique per post, so running this more
 * than once in a day doesn't produce repeat alerts.
 */
export async function runCleanup(now: Date = new Date()): Promise<CleanupResult> {
  const result: CleanupResult = {
    listingsDeleted: 0,
    wishlistsDeleted: 0,
    warningsRaised: 0,
  };

  // ── Delete what's past its lifetime ─────────────────────
  const staleListings = await db
    .select({ id: listings.id })
    .from(listings)
    .where(lte(listings.createdAt, expiryCutoff("listing", now)));
  if (staleListings.length) {
    const ids = staleListings.map((r) => r.id);
    for (const id of ids) {
      await db.delete(listings).where(eq(listings.id, id));
    }
    await pruneNotificationsFor(["new_listing", "listing_expiring"], ids);
    result.listingsDeleted = ids.length;
  }

  const staleWishlists = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(lte(wishlists.createdAt, expiryCutoff("wishlist", now)));
  if (staleWishlists.length) {
    const ids = staleWishlists.map((r) => r.id);
    for (const id of ids) {
      await db.delete(wishlists).where(eq(wishlists.id, id));
    }
    await pruneNotificationsFor(["new_wishlist", "wishlist_expiring"], ids);
    result.wishlistsDeleted = ids.length;
  }

  // ── Warn about what's close to going ────────────────────
  const warnFrom = (kind: "listing" | "wishlist") => {
    // Still live, but inside the warning window.
    const table = kind === "listing" ? listings : wishlists;
    return and(
      gt(table.createdAt, expiryCutoff(kind, now)),
      lte(
        table.createdAt,
        new Date(
          expiryCutoff(kind, now).getTime() +
            EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000
        )
      )
    );
  };

  const expiringListings = await db
    .select({
      id: listings.id,
      createdAt: listings.createdAt,
      streetNumber: listings.streetNumber,
      streetName: listings.streetName,
      agentName: agents.name,
    })
    .from(listings)
    .innerJoin(agents, eq(listings.agentId, agents.id))
    .where(warnFrom("listing"));

  for (const row of expiringListings) {
    const days = daysUntilExpiry(row.createdAt, "listing", now);
    const raised = await notifyAdmin({
      kind: "listing_expiring",
      entityId: row.id,
      title: "Office Exclusive listing expiring soon",
      detail: `${row.streetNumber} ${row.streetName} (${row.agentName}) will be removed in ${days} day${days === 1 ? "" : "s"}.`,
      href: "/admin/office-exclusives",
    });
    if (raised) result.warningsRaised++;
  }

  const expiringWishlists = await db
    .select({
      id: wishlists.id,
      createdAt: wishlists.createdAt,
      body: wishlists.body,
      agentName: agents.name,
    })
    .from(wishlists)
    .innerJoin(agents, eq(wishlists.agentId, agents.id))
    .where(warnFrom("wishlist"));

  for (const row of expiringWishlists) {
    const days = daysUntilExpiry(row.createdAt, "wishlist", now);
    const raised = await notifyAdmin({
      kind: "wishlist_expiring",
      entityId: row.id,
      title: "Buyer Wishlist expiring soon",
      detail: `${row.agentName}'s post will be removed in ${days} day${days === 1 ? "" : "s"}: ${row.body.slice(0, 80)}${row.body.length > 80 ? "…" : ""}`,
      href: "/buyer-wishlists",
    });
    if (raised) result.warningsRaised++;
  }

  return result;
}

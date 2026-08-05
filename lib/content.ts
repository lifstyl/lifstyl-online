import "server-only";
import { asc, desc, eq, and, gt, isNull, sql } from "drizzle-orm";
import { db } from "./db";
import {
  carouselImages,
  testimonials,
  faqs,
  staffMembers,
  resourceLinks,
  pageContent,
  agents,
  listings,
  wishlists,
  notifications,
} from "./db/schema";
import type { ListingWithAgent, WishlistWithAgent } from "./db/schema";
import { expiryCutoff } from "./expiry";

export async function getCarouselImages() {
  return db.select().from(carouselImages).orderBy(asc(carouselImages.sortOrder));
}

export async function getTestimonials() {
  return db.select().from(testimonials).orderBy(asc(testimonials.sortOrder));
}

export async function getFaqs() {
  return db.select().from(faqs).orderBy(asc(faqs.sortOrder));
}

export async function getStaffMembers() {
  return db.select().from(staffMembers).orderBy(asc(staffMembers.sortOrder));
}

export async function getResourceLinks(pageSlug: string) {
  return db
    .select()
    .from(resourceLinks)
    .where(eq(resourceLinks.pageSlug, pageSlug))
    .orderBy(asc(resourceLinks.sortOrder));
}

/**
 * Group resource links by their groupLabel, preserving sortOrder.
 */
export async function getGroupedResourceLinks(pageSlug: string) {
  const rows = await getResourceLinks(pageSlug);
  const groups: {
    label: string;
    note: string;
    links: typeof rows;
  }[] = [];
  for (const row of rows) {
    let group = groups.find((g) => g.label === row.groupLabel);
    if (!group) {
      group = { label: row.groupLabel, note: row.groupNote, links: [] };
      groups.push(group);
    }
    if (row.groupNote && !group.note) group.note = row.groupNote;
    group.links.push(row);
  }
  return groups;
}

/**
 * Fetch all key/value content for a page as a plain object.
 * Missing keys simply won't be present; callers should provide fallbacks.
 */
export async function getPageContent(
  pageSlug: string
): Promise<Record<string, string>> {
  const rows = await db
    .select()
    .from(pageContent)
    .where(eq(pageContent.pageSlug, pageSlug));
  const out: Record<string, string> = {};
  for (const row of rows) out[row.key] = row.value;
  return out;
}

/**
 * Office Exclusives listings, newest first, with the posting agent's name.
 * The agent's phone (their password) is deliberately never selected here.
 */
export async function getListings(): Promise<ListingWithAgent[]> {
  // Filtered by age as well as purged nightly, so an expired listing is never
  // shown even if the cleanup job hasn't run yet.
  const rows = await db
    .select({
      listing: listings,
      agentName: agents.name,
    })
    .from(listings)
    .innerJoin(agents, eq(listings.agentId, agents.id))
    .where(gt(listings.createdAt, expiryCutoff("listing")))
    .orderBy(desc(listings.createdAt));

  return rows.map((r) => ({ ...r.listing, agentName: r.agentName }));
}

export async function getWishlists(): Promise<WishlistWithAgent[]> {
  const rows = await db
    .select({
      wishlist: wishlists,
      agentName: agents.name,
    })
    .from(wishlists)
    .innerJoin(agents, eq(wishlists.agentId, agents.id))
    .where(gt(wishlists.createdAt, expiryCutoff("wishlist")))
    .orderBy(desc(wishlists.createdAt));

  return rows.map((r) => ({ ...r.wishlist, agentName: r.agentName }));
}

/** Newest first, unread before read, for the admin bell. */
export async function getNotifications(limit = 50) {
  return db
    .select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(isNull(notifications.readAt));
  return rows[0]?.count ?? 0;
}

/** All agents, for the admin management screen. */
export async function getAgents() {
  return db.select().from(agents).orderBy(asc(agents.name));
}

export async function getPageContentValue(
  pageSlug: string,
  key: string
): Promise<string | undefined> {
  const rows = await db
    .select()
    .from(pageContent)
    .where(and(eq(pageContent.pageSlug, pageSlug), eq(pageContent.key, key)))
    .limit(1);
  return rows[0]?.value;
}

import "server-only";
import { asc, desc, eq, and, or, gt, isNull, isNotNull, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { PgColumn } from "drizzle-orm/pg-core";
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
  contractors,
  openHouses,
  OPEN_HOUSE_TTL_DAYS,
  OFFICE_TIMEZONE,
} from "./db/schema";
import type {
  ListingWithAgent,
  WishlistWithAgent,
  Contractor,
  OpenHouseWithAgents,
} from "./db/schema";
import { expiryCutoff } from "./expiry";

export async function getCarouselImages() {
  return db.select().from(carouselImages).orderBy(asc(carouselImages.sortOrder));
}

export async function getTestimonials() {
  return db.select().from(testimonials).orderBy(asc(testimonials.sortOrder));
}

export async function getFaqs() {
  try {
    return await db.select().from(faqs).orderBy(asc(faqs.sortOrder));
  } catch (err) {
    // A deploy goes live before the admin runs the database update on the
    // Setup page, so for that window the code selects columns the database
    // doesn't have yet. Losing the whole FAQs page over an optional link is
    // far worse than showing the questions without it, so fall back to the
    // columns that have always existed.
    if (!isUndefinedColumn(err)) throw err;
    const rows = await db
      .select({
        id: faqs.id,
        question: faqs.question,
        answer: faqs.answer,
        sortOrder: faqs.sortOrder,
      })
      .from(faqs)
      .orderBy(asc(faqs.sortOrder));
    return rows.map((r) => ({ ...r, linkUrl: "", linkLabel: "" }));
  }
}

/** Postgres 42703 — a selected column isn't in the table yet. */
function isUndefinedColumn(err: unknown): boolean {
  return hasPgCode(err, "42703");
}

/** Postgres 42P01 — the table itself doesn't exist yet. */
function isUndefinedTable(err: unknown): boolean {
  return hasPgCode(err, "42P01");
}

function hasPgCode(err: unknown, code: string): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === code || e?.cause?.code === code;
}

/**
 * Contractors & vendors, A–Z. Used by the admin screen, where a stable,
 * predictable order is what makes an entry findable.
 */
export async function getContractors(): Promise<Contractor[] | null> {
  return selectContractors(asc(contractors.name));
}

/**
 * The same list in a fresh random order on every request.
 *
 * The public directory is a list of businesses competing for the same calls,
 * so a fixed order would quietly hand whoever sits at the top a permanent
 * advantage. Shuffling per request keeps it even-handed.
 *
 * Randomised in SQL rather than in JS so the shuffle covers the whole table
 * rather than a page of it, and the page is `force-dynamic`, so this really
 * does re-run per visitor instead of being rendered once and cached.
 */
export async function getContractorsRandomized(): Promise<Contractor[] | null> {
  return selectContractors(sql`random()`);
}

/**
 * Returns null rather than throwing when the table hasn't been created yet —
 * a deploy goes live before the admin runs the database update on the Setup
 * page, and a brand-new page 500ing in that window is exactly what happened
 * when FAQs gained a column. Callers show a setup hint instead.
 */
async function selectContractors(
  order: SQL | PgColumn
): Promise<Contractor[] | null> {
  try {
    return await db.select().from(contractors).orderBy(order);
  } catch (err) {
    if (isUndefinedTable(err)) return null;
    throw err;
  }
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

/**
 * Open houses still worth showing, soonest first.
 *
 * A post drops off once its window has finished, and an unclaimed one also
 * drops off after OPEN_HOUSE_TTL_DAYS — whichever comes first. Taking it only
 * removes the 7-day limit; a slot whose time has passed is no use to anyone
 * either way.
 *
 * Conclusion is judged in the office's timezone. The scheduled values are
 * plain calendar/clock values, so they're compared against `now()` converted
 * to that zone rather than to the server's UTC clock, which would otherwise
 * leave finished open houses up for several hours.
 */
export async function getOpenHouses(): Promise<OpenHouseWithAgents[] | null> {
  const host = alias(agents, "host_agent");
  try {
    const rows = await db
      .select({
        openHouse: openHouses,
        agentName: agents.name,
        hostName: host.name,
      })
      .from(openHouses)
      .innerJoin(agents, eq(openHouses.agentId, agents.id))
      .leftJoin(host, eq(openHouses.hostAgentId, host.id))
      .where(
        and(
          sql`(${openHouses.scheduledDate} + ${openHouses.endTime}::time)
              > (now() AT TIME ZONE ${sql.raw(`'${OFFICE_TIMEZONE}'`)})`,
          or(
            isNotNull(openHouses.hostAgentId),
            gt(
              openHouses.createdAt,
              sql.raw(`now() - interval '${OPEN_HOUSE_TTL_DAYS} days'`)
            )
          )
        )
      )
      .orderBy(asc(openHouses.scheduledDate), asc(openHouses.startTime));

    return rows.map((r) => ({
      ...r.openHouse,
      agentName: r.agentName,
      hostName: r.hostName,
    }));
  } catch (err) {
    if (isUndefinedTable(err)) return null;
    throw err;
  }
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

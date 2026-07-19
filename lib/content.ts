import "server-only";
import { asc, eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  carouselImages,
  testimonials,
  faqs,
  staffMembers,
  resourceLinks,
  pageContent,
} from "./db/schema";

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

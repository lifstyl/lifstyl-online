import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Homepage hero carousel images. Ordered by `sortOrder`.
 */
export const carouselImages = pgTable("carousel_images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  altText: text("alt_text").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Homepage agent testimonials (quote + name + optional headshot).
 */
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quote: text("quote").notNull(),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * FAQ entries for /faqs.
 */
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * Support staff directory for /support-staff.
 */
export const staffMembers = pgTable("staff_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  bio: text("bio").notNull().default(""),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * Generic grouped list of outbound links, reused across pages that are
 * essentially "a heading + some grouped links out":
 *   • pageSlug "quarterly-meeting-materials" — groupLabel = meeting date
 *   • pageSlug "recommendations-for-marketing-materials" — groupLabel = category
 */
export const resourceLinks = pgTable("resource_links", {
  id: serial("id").primaryKey(),
  pageSlug: text("page_slug").notNull(),
  groupLabel: text("group_label").notNull().default(""),
  groupNote: text("group_note").notNull().default(""),
  title: text("title").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * Key/value store for one-off editable text and links per page.
 * e.g. ("home","heading"), ("home","calendarEmbedUrl"),
 *      ("book-a-conference-room","intro"), ("open-house-showcase","formUrl").
 */
export const pageContent = pgTable("page_content", {
  id: serial("id").primaryKey(),
  pageSlug: text("page_slug").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull().default(""),
});

export type CarouselImage = typeof carouselImages.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type StaffMember = typeof staffMembers.$inferSelect;
export type ResourceLink = typeof resourceLinks.$inferSelect;
export type PageContentRow = typeof pageContent.$inferSelect;

import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  doublePrecision,
  unique,
} from "drizzle-orm/pg-core";

/**
 * How long agent-posted content stays up before it's removed automatically,
 * and how far ahead the admin is warned that something is about to go.
 */
export const LISTING_TTL_DAYS = 30;
export const WISHLIST_TTL_DAYS = 90;
export const EXPIRY_WARNING_DAYS = 7;

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
  // Optional button-style link shown under the answer. URLs typed inside the
  // answer itself are turned into links too — see linkifyAnswer in lib/links.ts.
  linkUrl: text("link_url").notNull().default(""),
  linkLabel: text("link_label").notNull().default(""),
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
 *      ("book-a-conference-room","intro"), ("book-a-conference-room","bookingUrl").
 */
export const pageContent = pgTable("page_content", {
  id: serial("id").primaryKey(),
  pageSlug: text("page_slug").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull().default(""),
});

/**
 * Agents who can log into the Office Exclusives board.
 *
 * Their password is their phone number (the owner's choice — easy for agents
 * to remember, nothing new to distribute). It's stored only as a bcrypt hash,
 * and is deliberately NEVER shown on the public listing cards, since anything
 * displayed there would effectively be a published password.
 *
 * `phoneLast4` is kept in the clear purely so the admin can tell which number
 * an agent was set up with when resetting it — it is not enough to log in.
 */
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  // Display only — agents sign in with their phone number, so names don't
  // need to be unique (two agents could legitimately share one).
  name: text("name").notNull(),
  // Peppered SHA-256 of the phone, used to find the agent at sign-in.
  // Unique, so one number can never map to two agents. See lib/phone.ts.
  phoneLookup: text("phone_lookup").notNull().unique(),
  phoneHash: text("phone_hash").notNull(),
  phoneLast4: text("phone_last4").notNull().default(""),
  active: boolean("active").notNull().default(true),
  // Lets this agent edit/remove ANY listing on the Office Exclusives board.
  // Deliberately separate from the site admin role: it grants nothing in
  // /admin, so board management never becomes reachable with just a phone.
  isManager: boolean("is_manager").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Office Exclusives listings, contributed by agents.
 * Address parts are stored separately so they can be formatted/sorted later.
 */
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  streetNumber: text("street_number").notNull(),
  streetName: text("street_name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: doublePrecision("bathrooms").notNull(),
  squareFeet: integer("square_feet").notNull(),
  price: integer("price"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type CarouselImage = typeof carouselImages.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type StaffMember = typeof staffMembers.$inferSelect;
/**
 * Buyer wishlists — free-text "my buyer is looking for…" posts from agents.
 * Removed automatically once they pass WISHLIST_TTL_DAYS.
 */
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Admin notifications: new agent posts, and warnings before something is
 * auto-deleted.
 *
 * `kind` + `entityId` are unique together so the daily cleanup can run as
 * often as it likes without stacking up duplicate warnings for the same post.
 */
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    detail: text("detail").notNull().default(""),
    href: text("href").notNull().default(""),
    entityId: integer("entity_id").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    readAt: timestamp("read_at"),
  },
  (table) => ({
    uniquePerEntity: unique("notifications_kind_entity_unique").on(
      table.kind,
      table.entityId
    ),
  })
);

export type ResourceLink = typeof resourceLinks.$inferSelect;
export type PageContentRow = typeof pageContent.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Wishlist = typeof wishlists.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

/** A listing joined with its posting agent's name (phone is never included). */
export type ListingWithAgent = Listing & { agentName: string };
export type WishlistWithAgent = Wishlist & { agentName: string };

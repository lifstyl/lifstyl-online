"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
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
} from "./db/schema";
import { saveImage, isImageFile } from "./upload";
import { getSessionInfo } from "@/auth";
import { normalizePhone, phoneLookupKey } from "./phone";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const info = await getSessionInfo();
  if (!info?.isAdmin) throw new Error("Not authorized");
}

/**
 * Office Exclusives access: either a logged-in agent or the admin.
 * Returns the session info so callers can enforce per-agent ownership.
 */
async function requireExclusivesAccess() {
  const info = await getSessionInfo();
  if (!info || (!info.isAgent && !info.isAdmin)) {
    throw new Error("Not authorized");
  }
  return info;
}

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function num(fd: FormData, key: string): number {
  return Number(fd.get(key) ?? 0);
}

// ── Generic reorder: swap sortOrder with the adjacent row in the same scope ──
async function reorder(
  table:
    | typeof carouselImages
    | typeof testimonials
    | typeof faqs
    | typeof staffMembers
    | typeof resourceLinks,
  id: number,
  direction: "up" | "down",
  scope?: { column: any; value: string }
) {
  const rows = await db
    .select({ id: table.id, sortOrder: table.sortOrder })
    .from(table)
    .where(
      scope ? (eq(scope.column, scope.value) as any) : (sql`true` as any)
    )
    .orderBy(asc(table.sortOrder));

  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= rows.length) return;

  const a = rows[idx];
  const b = rows[swapWith];
  await db
    .update(table)
    .set({ sortOrder: b.sortOrder })
    .where(eq(table.id, a.id));
  await db
    .update(table)
    .set({ sortOrder: a.sortOrder })
    .where(eq(table.id, b.id));
}

async function nextSortOrder(
  table: any,
  scope?: { column: any; value: string }
): Promise<number> {
  const rows = await db
    .select({ max: sql<number>`coalesce(max(${table.sortOrder}), -1)` })
    .from(table)
    .where(scope ? eq(scope.column, scope.value) : (sql`true` as any));
  return (rows[0]?.max ?? -1) + 1;
}

// ─────────────────────────────────────────────────────────────
// CAROUSEL IMAGES
// ─────────────────────────────────────────────────────────────
export async function addCarouselImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("image");
  const urlField = str(formData, "url");
  let url = urlField;
  if (isImageFile(file)) url = await saveImage(file);
  if (!url) throw new Error("Provide an image file or URL.");

  await db.insert(carouselImages).values({
    url,
    altText: str(formData, "altText"),
    sortOrder: await nextSortOrder(carouselImages),
  });
  revalidateHome();
}

export async function deleteCarouselImage(formData: FormData) {
  await requireAdmin();
  await db.delete(carouselImages).where(eq(carouselImages.id, num(formData, "id")));
  revalidateHome();
}

export async function moveCarouselImage(formData: FormData) {
  await requireAdmin();
  await reorder(
    carouselImages,
    num(formData, "id"),
    str(formData, "direction") as "up" | "down"
  );
  revalidateHome();
}

// ─────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────
export async function addTestimonial(formData: FormData) {
  await requireAdmin();
  const file = formData.get("photo");
  let photoUrl = str(formData, "photoUrl") || null;
  if (isImageFile(file)) photoUrl = await saveImage(file);

  await db.insert(testimonials).values({
    name: str(formData, "name"),
    quote: str(formData, "quote"),
    photoUrl,
    sortOrder: await nextSortOrder(testimonials),
  });
  revalidateHome();
}

export async function updateTestimonial(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const file = formData.get("photo");
  const values: Record<string, unknown> = {
    name: str(formData, "name"),
    quote: str(formData, "quote"),
  };
  if (isImageFile(file)) values.photoUrl = await saveImage(file);
  await db.update(testimonials).set(values).where(eq(testimonials.id, id));
  revalidateHome();
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();
  await db.delete(testimonials).where(eq(testimonials.id, num(formData, "id")));
  revalidateHome();
}

export async function moveTestimonial(formData: FormData) {
  await requireAdmin();
  await reorder(
    testimonials,
    num(formData, "id"),
    str(formData, "direction") as "up" | "down"
  );
  revalidateHome();
}

// ─────────────────────────────────────────────────────────────
// FAQS
// ─────────────────────────────────────────────────────────────
export async function addFaq(formData: FormData) {
  await requireAdmin();
  await db.insert(faqs).values({
    question: str(formData, "question"),
    answer: str(formData, "answer"),
    sortOrder: await nextSortOrder(faqs),
  });
  revalidatePath("/faqs");
  revalidatePath("/admin/faqs");
}

export async function updateFaq(formData: FormData) {
  await requireAdmin();
  await db
    .update(faqs)
    .set({ question: str(formData, "question"), answer: str(formData, "answer") })
    .where(eq(faqs.id, num(formData, "id")));
  revalidatePath("/faqs");
  revalidatePath("/admin/faqs");
}

export async function deleteFaq(formData: FormData) {
  await requireAdmin();
  await db.delete(faqs).where(eq(faqs.id, num(formData, "id")));
  revalidatePath("/faqs");
  revalidatePath("/admin/faqs");
}

export async function moveFaq(formData: FormData) {
  await requireAdmin();
  await reorder(faqs, num(formData, "id"), str(formData, "direction") as "up" | "down");
  revalidatePath("/faqs");
  revalidatePath("/admin/faqs");
}

// ─────────────────────────────────────────────────────────────
// STAFF MEMBERS
// ─────────────────────────────────────────────────────────────
export async function addStaff(formData: FormData) {
  await requireAdmin();
  const file = formData.get("photo");
  let photoUrl = str(formData, "photoUrl") || null;
  if (isImageFile(file)) photoUrl = await saveImage(file);

  await db.insert(staffMembers).values({
    name: str(formData, "name"),
    title: str(formData, "title"),
    bio: str(formData, "bio"),
    photoUrl,
    sortOrder: await nextSortOrder(staffMembers),
  });
  revalidatePath("/support-staff");
  revalidatePath("/admin/support-staff");
}

export async function updateStaff(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const file = formData.get("photo");
  const values: Record<string, unknown> = {
    name: str(formData, "name"),
    title: str(formData, "title"),
    bio: str(formData, "bio"),
  };
  if (isImageFile(file)) values.photoUrl = await saveImage(file);
  await db.update(staffMembers).set(values).where(eq(staffMembers.id, id));
  revalidatePath("/support-staff");
  revalidatePath("/admin/support-staff");
}

export async function deleteStaff(formData: FormData) {
  await requireAdmin();
  await db.delete(staffMembers).where(eq(staffMembers.id, num(formData, "id")));
  revalidatePath("/support-staff");
  revalidatePath("/admin/support-staff");
}

export async function moveStaff(formData: FormData) {
  await requireAdmin();
  await reorder(
    staffMembers,
    num(formData, "id"),
    str(formData, "direction") as "up" | "down"
  );
  revalidatePath("/support-staff");
  revalidatePath("/admin/support-staff");
}

// ─────────────────────────────────────────────────────────────
// RESOURCE LINKS (quarterly meetings + marketing recommendations)
// ─────────────────────────────────────────────────────────────
export async function addResourceLink(formData: FormData) {
  await requireAdmin();
  const pageSlug = str(formData, "pageSlug");
  await db.insert(resourceLinks).values({
    pageSlug,
    groupLabel: str(formData, "groupLabel"),
    groupNote: str(formData, "groupNote"),
    title: str(formData, "title"),
    url: str(formData, "url") || "#",
    sortOrder: await nextSortOrder(resourceLinks, {
      column: resourceLinks.pageSlug,
      value: pageSlug,
    }),
  });
  revalidateResource(pageSlug);
}

export async function updateResourceLink(formData: FormData) {
  await requireAdmin();
  const pageSlug = str(formData, "pageSlug");
  await db
    .update(resourceLinks)
    .set({
      groupLabel: str(formData, "groupLabel"),
      groupNote: str(formData, "groupNote"),
      title: str(formData, "title"),
      url: str(formData, "url") || "#",
    })
    .where(eq(resourceLinks.id, num(formData, "id")));
  revalidateResource(pageSlug);
}

export async function deleteResourceLink(formData: FormData) {
  await requireAdmin();
  await db.delete(resourceLinks).where(eq(resourceLinks.id, num(formData, "id")));
  revalidateResource(str(formData, "pageSlug"));
}

export async function moveResourceLink(formData: FormData) {
  await requireAdmin();
  const pageSlug = str(formData, "pageSlug");
  await reorder(
    resourceLinks,
    num(formData, "id"),
    str(formData, "direction") as "up" | "down",
    { column: resourceLinks.pageSlug, value: pageSlug }
  );
  revalidateResource(pageSlug);
}

// ─────────────────────────────────────────────────────────────
// PAGE CONTENT (key/value upserts)
// ─────────────────────────────────────────────────────────────
export async function savePageContent(formData: FormData) {
  await requireAdmin();
  const pageSlug = str(formData, "pageSlug");
  // Every field named "kv:<key>" becomes a key/value row.
  for (const [field, raw] of formData.entries()) {
    if (!field.startsWith("kv:")) continue;
    const key = field.slice(3);
    const value = String(raw ?? "");
    const existing = await db
      .select({ id: pageContent.id })
      .from(pageContent)
      .where(and(eq(pageContent.pageSlug, pageSlug), eq(pageContent.key, key)))
      .limit(1);
    if (existing[0]) {
      await db
        .update(pageContent)
        .set({ value })
        .where(eq(pageContent.id, existing[0].id));
    } else {
      await db.insert(pageContent).values({ pageSlug, key, value });
    }
  }
  revalidatePagesForSlug(pageSlug);
}

// ─────────────────────────────────────────────────────────────
// OFFICE EXCLUSIVES — LISTINGS
// ─────────────────────────────────────────────────────────────

/** Pull and validate the listing fields shared by add + update. */
function listingFieldsFrom(formData: FormData) {
  const bedrooms = Number(str(formData, "bedrooms"));
  const bathrooms = Number(str(formData, "bathrooms"));
  const squareFeet = Number(str(formData, "squareFeet"));
  const priceRaw = normalizeDigits(str(formData, "price"));

  const fields = {
    streetNumber: str(formData, "streetNumber"),
    streetName: str(formData, "streetName"),
    city: str(formData, "city"),
    state: str(formData, "state").toUpperCase(),
    zip: str(formData, "zip"),
    bedrooms,
    bathrooms,
    squareFeet,
    price: priceRaw ? Number(priceRaw) : null,
    notes: str(formData, "notes"),
  };

  const missing = (
    ["streetNumber", "streetName", "city", "state", "zip"] as const
  ).filter((k) => !fields[k]);
  if (missing.length) {
    throw new Error("Please fill in the full property address.");
  }
  if (!Number.isFinite(bedrooms) || bedrooms < 0) {
    throw new Error("Bedrooms must be a number.");
  }
  if (!Number.isFinite(bathrooms) || bathrooms < 0) {
    throw new Error("Bathrooms must be a number.");
  }
  if (!Number.isFinite(squareFeet) || squareFeet <= 0) {
    throw new Error("Square footage must be a number greater than zero.");
  }

  return fields;
}

/** Strip everything but digits, so "$450,000" becomes "450000". */
function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export async function addListing(formData: FormData) {
  const info = await requireExclusivesAccess();
  // The admin has no agent record of their own, so listings are posted by
  // agents only; the admin manages existing ones from the admin panel.
  if (!info.agentId) {
    throw new Error("Only agents can post listings.");
  }

  const file = formData.get("image");
  const imageUrl = isImageFile(file) ? await saveImage(file) : null;

  await db.insert(listings).values({
    agentId: info.agentId,
    imageUrl,
    ...listingFieldsFrom(formData),
  });
  revalidatePath("/office-exclusives");
  revalidatePath("/admin/office-exclusives");
}

export async function updateListing(formData: FormData) {
  const info = await requireExclusivesAccess();
  const id = num(formData, "id");

  const existing = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);
  if (!existing[0]) throw new Error("Listing not found.");
  // Agents may only touch their own listings; the admin may touch any.
  if (!info.canManageAllListings && existing[0].agentId !== info.agentId) {
    throw new Error("You can only edit your own listings.");
  }

  const file = formData.get("image");
  const values: Record<string, unknown> = { ...listingFieldsFrom(formData) };
  if (isImageFile(file)) values.imageUrl = await saveImage(file);

  await db.update(listings).set(values).where(eq(listings.id, id));
  revalidatePath("/office-exclusives");
  revalidatePath("/admin/office-exclusives");
}

export async function deleteListing(formData: FormData) {
  const info = await requireExclusivesAccess();
  const id = num(formData, "id");

  const existing = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);
  if (!existing[0]) return;
  if (!info.canManageAllListings && existing[0].agentId !== info.agentId) {
    throw new Error("You can only remove your own listings.");
  }

  await db.delete(listings).where(eq(listings.id, id));
  revalidatePath("/office-exclusives");
  revalidatePath("/admin/office-exclusives");
}

// ─────────────────────────────────────────────────────────────
// OFFICE EXCLUSIVES — AGENTS (admin only)
// ─────────────────────────────────────────────────────────────
export async function addAgent(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  const phone = normalizePhone(str(formData, "phone"));

  if (!name) throw new Error("Agent name is required.");
  if (phone.length < 7) {
    throw new Error("Enter a full phone number — it's the agent's password.");
  }

  // Phone is the sign-in credential, so it must be unique — two agents sharing
  // a number would make sign-in ambiguous.
  const lookup = phoneLookupKey(phone);
  const clash = await db
    .select({ name: agents.name })
    .from(agents)
    .where(eq(agents.phoneLookup, lookup))
    .limit(1);
  if (clash[0]) {
    throw new Error(
      `That phone number is already used by ${clash[0].name}. Each agent needs their own number.`
    );
  }

  await db.insert(agents).values({
    name,
    phoneLookup: lookup,
    phoneHash: bcrypt.hashSync(phone, 10),
    phoneLast4: phone.slice(-4),
  });
  revalidatePath("/admin/exclusive-agents");
}

export async function updateAgentPhone(formData: FormData) {
  await requireAdmin();
  const id = num(formData, "id");
  const phone = normalizePhone(str(formData, "phone"));
  if (phone.length < 7) {
    throw new Error("Enter a full phone number — it's the agent's password.");
  }

  const lookup = phoneLookupKey(phone);
  const clash = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(eq(agents.phoneLookup, lookup))
    .limit(1);
  if (clash[0] && clash[0].id !== id) {
    throw new Error(
      `That phone number is already used by ${clash[0].name}. Each agent needs their own number.`
    );
  }

  await db
    .update(agents)
    .set({
      phoneLookup: lookup,
      phoneHash: bcrypt.hashSync(phone, 10),
      phoneLast4: phone.slice(-4),
    })
    .where(eq(agents.id, id));
  revalidatePath("/admin/exclusive-agents");
}

/**
 * Toggle whether an agent can manage every listing on the board.
 * This is scoped to Office Exclusives only — it grants no /admin access.
 */
export async function setAgentManager(formData: FormData) {
  await requireAdmin();
  await db
    .update(agents)
    .set({ isManager: str(formData, "manager") === "true" })
    .where(eq(agents.id, num(formData, "id")));
  revalidatePath("/admin/exclusive-agents");
  revalidatePath("/office-exclusives");
}

export async function setAgentActive(formData: FormData) {
  await requireAdmin();
  await db
    .update(agents)
    .set({ active: str(formData, "active") === "true" })
    .where(eq(agents.id, num(formData, "id")));
  revalidatePath("/admin/exclusive-agents");
}

/** Removing an agent also removes their listings (FK is ON DELETE CASCADE). */
export async function deleteAgent(formData: FormData) {
  await requireAdmin();
  await db.delete(agents).where(eq(agents.id, num(formData, "id")));
  revalidatePath("/admin/exclusive-agents");
  revalidatePath("/admin/office-exclusives");
  revalidatePath("/office-exclusives");
}

// ── revalidation helpers ────────────────────────────────────
function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/admin/home");
}
function revalidateResource(pageSlug: string) {
  revalidatePath(`/${pageSlug}`);
  revalidatePath(`/admin/${adminSlugForResource(pageSlug)}`);
}
function adminSlugForResource(pageSlug: string) {
  if (pageSlug === "quarterly-meeting-materials") return "quarterly-meetings";
  if (pageSlug === "recommendations-for-marketing-materials")
    return "marketing-materials";
  return pageSlug;
}
function revalidatePagesForSlug(pageSlug: string) {
  if (pageSlug === "home") return revalidateHome();
  revalidatePath(`/${pageSlug}`);
  revalidatePath(`/admin/${pageSlug}`);
}

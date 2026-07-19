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
} from "./db/schema";
import { saveImage, isImageFile } from "./upload";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Not authorized");
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

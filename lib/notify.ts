import "server-only";
import { and, inArray } from "drizzle-orm";
import { db } from "./db";
import { notifications } from "./db/schema";

export type NotificationKind =
  | "new_listing"
  | "new_wishlist"
  | "listing_expiring"
  | "wishlist_expiring";

/**
 * Record an admin notification.
 *
 * Idempotent per (kind, entityId): the nightly cleanup re-evaluates the same
 * posts every run, so without this the admin would collect a fresh "expiring
 * soon" alert for the same post every single day.
 */
export async function notifyAdmin(params: {
  kind: NotificationKind;
  entityId: number;
  title: string;
  detail?: string;
  href?: string;
}): Promise<boolean> {
  const inserted = await db
    .insert(notifications)
    .values({
      kind: params.kind,
      entityId: params.entityId,
      title: params.title,
      detail: params.detail ?? "",
      href: params.href ?? "",
    })
    .onConflictDoNothing({
      target: [notifications.kind, notifications.entityId],
    })
    .returning({ id: notifications.id });

  // False when this alert already existed, so callers can report how many
  // notifications they genuinely raised rather than how many they considered.
  return inserted.length > 0;
}

/**
 * Drop notifications that point at a post that no longer exists, so the bell
 * doesn't keep advertising things the admin can no longer open.
 */
export async function pruneNotificationsFor(
  kinds: NotificationKind[],
  entityIds: number[]
): Promise<void> {
  if (entityIds.length === 0 || kinds.length === 0) return;
  await db
    .delete(notifications)
    .where(
      and(
        inArray(notifications.kind, kinds),
        inArray(notifications.entityId, entityIds)
      )
    );
}

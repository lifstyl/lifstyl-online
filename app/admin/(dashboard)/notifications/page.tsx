import Link from "next/link";
import { getNotifications } from "@/lib/content";
import { markNotificationsRead, clearNotifications } from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { SubmitButton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, { text: string; tone: "new" | "warning" }> = {
  new_listing: { text: "New listing", tone: "new" },
  new_wishlist: { text: "New wishlist", tone: "new" },
  listing_expiring: { text: "Expiring soon", tone: "warning" },
  wishlist_expiring: { text: "Expiring soon", tone: "warning" },
};

export default async function AdminNotificationsPage() {
  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];
  let tableMissing = false;
  try {
    notifications = await getNotifications();
  } catch {
    tableMissing = true;
  }

  const dateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      <EditorHeader
        title="Notifications"
        description="New posts from agents, and warnings before something is removed automatically."
      />

      {tableMissing ? (
        <Card>
          <p className="text-sm text-text-body">
            Notifications aren&apos;t set up in the database yet. Go to{" "}
            <Link href="/admin/setup" className="font-medium text-navy underline">
              Setup
            </Link>{" "}
            and run &ldquo;Update database&rdquo;.
          </p>
        </Card>
      ) : (
        <>
          {notifications.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <form action={markNotificationsRead}>
                <SubmitButton variant="ghost">Mark all as read</SubmitButton>
              </form>
              <form action={clearNotifications}>
                <SubmitButton variant="danger">Clear all</SubmitButton>
              </form>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {notifications.map((n) => {
              const label = KIND_LABEL[n.kind] ?? {
                text: n.kind,
                tone: "new" as const,
              };
              const unread = !n.readAt;
              return (
                <Card
                  key={n.id}
                  className={unread ? "border-l-2 border-l-gold" : ""}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            label.tone === "warning"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-navy/10 text-navy"
                          }`}
                        >
                          {label.text}
                        </span>
                        {unread && (
                          <span className="text-xs font-medium text-gold">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-serif text-lg text-navy">
                        {n.title}
                      </p>
                      {n.detail && (
                        <p className="mt-1 break-words text-sm text-text-body">
                          {n.detail}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-xs text-text-muted">
                        {dateFormat.format(n.createdAt)}
                      </span>
                      {n.href && (
                        <Link
                          href={n.href}
                          className="text-sm font-medium text-gold hover:underline"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
            {notifications.length === 0 && (
              <p className="text-sm text-text-muted">
                Nothing yet. New listings, new wishlists, and upcoming removals
                will show up here.
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}

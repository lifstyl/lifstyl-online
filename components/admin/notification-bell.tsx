import Link from "next/link";
import { getUnreadNotificationCount } from "@/lib/content";

/**
 * Bell beside the logo in the admin sidebar. Shows a count of unread
 * notifications (new agent posts, and warnings before something is
 * auto-deleted) and links to the full list.
 */
export async function NotificationBell() {
  let unread = 0;
  try {
    unread = await getUnreadNotificationCount();
  } catch {
    // The notifications table may not exist yet on a database that hasn't been
    // updated — the bell shouldn't take the whole admin panel down for that.
    unread = 0;
  }

  return (
    <Link
      href="/admin/notifications"
      aria-label={
        unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
      }
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-sm text-white/70 transition hover:bg-white/5 hover:text-pure-white"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.7 21a2 2 0 01-3.4 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {unread > 0 && (
        <span className="absolute right-1 top-1 min-w-[18px] rounded-full bg-gold px-1 text-center text-[11px] font-semibold leading-[18px] text-pure-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}

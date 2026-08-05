import { NextResponse } from "next/server";
import { runCleanup } from "@/lib/db/cleanup";
import { getSessionInfo } from "@/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Nightly cleanup: removes expired listings and wishlists, and raises the
 * admin's "expiring soon" notifications. Scheduled in vercel.json.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when that env var is set.
 * The signed-in admin may also trigger it by hand from the Setup page, which
 * is handy for checking it works without waiting for the schedule.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorized = secret
    ? request.headers.get("authorization") === `Bearer ${secret}`
    : true;

  if (!authorized) {
    // Fall back to an admin session so the manual button still works.
    const session = await getSessionInfo();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
  }

  try {
    const result = await runCleanup();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

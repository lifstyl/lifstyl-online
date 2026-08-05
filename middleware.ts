import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

// Built from the edge-safe config only — see auth.config.ts for why.
const { auth } = NextAuth(authConfig);

/**
 * Protect every /admin route except the login page itself, and require the
 * admin role specifically: an agent logged into Office Exclusives must not
 * be able to reach the site's admin panel.
 *
 * /office-exclusives is intentionally not gated here — that page renders its
 * own login form and only queries listings once a session exists, so no
 * listing data is ever sent to a logged-out visitor.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "admin";

  if (pathname.startsWith("/admin") && !isLogin && !isAdmin) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isLogin && isAdmin) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};

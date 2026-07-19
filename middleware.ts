import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Protect every /admin route except the login page itself.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/admin") && !isLogin && !isLoggedIn) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in and hitting the login page → send to dashboard.
  if (isLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};

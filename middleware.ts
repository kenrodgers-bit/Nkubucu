import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const sessionCookieNames = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasSessionCookie(req: NextRequest) {
  return sessionCookieNames.some((name) => Boolean(req.cookies.get(name)));
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isAdminPage = pathname.startsWith("/admin");
  const isLogin = pathname.startsWith("/admin/login");
  const isForgotPassword = pathname.startsWith("/admin/forgot-password");
  const isAdminApi = pathname.startsWith("/api/admin");
  const hasSession = hasSessionCookie(req);

  if (isAdminPage && !isLogin && !isForgotPassword && !hasSession) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminApi && !hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

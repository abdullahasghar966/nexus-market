/**
 * Next.js Edge middleware — route-level role guards.
 *
 * Reads the `nexus_session` HttpOnly cookie set by /api/auth/session (a JSON
 * payload { uid, role } written after browser-side Firebase sign-in). The
 * cookie gates routing only; the real data-security boundary is Firestore
 * security rules keyed on the user's Firebase ID token.
 *
 * Protected routes:
 *   /vendor/dashboard  → requires role "vendor" or "admin"
 *   /admin             → requires role "admin"
 *
 * Note: /login and /register are intentionally NOT guarded — signed-in users
 * may revisit them (e.g. a customer clicking "Become a Vendor" → /register).
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/cookie-sign";

const COOKIE = "nexus_session";

const ROLE_GUARDED: { prefix: string; roles: string[] }[] = [
  { prefix: "/vendor/dashboard", roles: ["vendor", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];

interface SessionData {
  uid: string;
  role: string;
  email: string;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // HMAC-verify the routing cookie; a tampered/forged cookie verifies to null.
  const session = await verifySession<SessionData>(
    req.cookies.get(COOKIE)?.value,
  );

  for (const { prefix, roles } of ROLE_GUARDED) {
    if (pathname.startsWith(prefix)) {
      // Not signed in → login, preserving where they were headed
      if (!session?.uid) {
        const url = new URL("/login", req.url);
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
      }
      // Signed in but wrong role → home
      if (!roles.includes(session.role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vendor/:path*", "/admin/:path*"],
};

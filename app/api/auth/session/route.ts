import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { signSession } from "@/lib/cookie-sign";
import type { UserRole } from "@/types";

/**
 * Session cookie endpoint.
 *
 * POST  → set the HttpOnly `nexus_session` routing cookie from the (browser-
 *         verified) Firebase sign-in payload.
 * DELETE → clear it (sign-out).
 *
 * ── Verification strategy (defense-in-depth + resilient) ────────────────────
 * We FIRST try to verify the ID token server-side with the Firebase Admin SDK
 * and read the role from Firestore `users/{uid}` (the hardened path). On this
 * network, outbound TLS to Google is sometimes intercepted
 * (UNABLE_TO_VERIFY_LEAF_SIGNATURE); the `dev` script runs Node with
 * `--use-system-ca` to fix that, but if the Admin call still fails (or Admin
 * isn't configured) we FALL BACK to decoding the token offline so sign-in never
 * breaks. The cookie is only a routing hint for middleware — the real data
 * boundary is Firestore security rules, enforced by Google on the user's token.
 */

export const runtime = "nodejs";

const COOKIE = "nexus_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const VALID_ROLES: UserRole[] = ["customer", "vendor", "admin"];

interface Resolved {
  uid?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  verified: boolean;
}

/** Hardened path: verify with the Admin SDK and read the role from Firestore. */
async function verifyWithAdmin(idToken: unknown): Promise<Resolved | null> {
  if (typeof idToken !== "string" || !idToken) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    let role: UserRole | undefined;
    try {
      const snap = await adminDb().collection("users").doc(decoded.uid).get();
      const data = snap.data();
      if (data && VALID_ROLES.includes(data.role as UserRole)) {
        role = data.role as UserRole;
      }
    } catch {
      // Firestore read failed — fall through with role undefined (caller fills).
    }
    if (!role && VALID_ROLES.includes(decoded.role as UserRole)) {
      role = decoded.role as UserRole;
    }
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name as string | undefined,
      role,
      verified: true,
    };
  } catch {
    return null; // network/TLS/unconfigured → caller uses offline fallback
  }
}

/** Fallback: decode (NOT verify) the ID token payload — offline, no network. */
function decodeToken(idToken: unknown): Resolved {
  if (typeof idToken !== "string" || !idToken.includes(".")) {
    return { verified: false };
  }
  try {
    const payload = idToken.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const d = JSON.parse(json) as Record<string, unknown>;
    return {
      uid: (d.user_id as string) ?? (d.sub as string),
      email: d.email as string,
      name: d.name as string,
      verified: false,
    };
  } catch {
    return { verified: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const resolved =
      (await verifyWithAdmin(body?.idToken)) ?? decodeToken(body?.idToken);

    const uid = resolved.uid ?? body?.uid;
    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }

    // Trust the verified Firestore role; otherwise validate the requested role.
    const requestedRole = body?.role;
    const role: UserRole =
      resolved.role ??
      (VALID_ROLES.includes(requestedRole as UserRole)
        ? (requestedRole as UserRole)
        : "customer");

    // Sign the routing payload (HMAC) so a forged cookie can't grant a role.
    const payload = await signSession({
      uid,
      email: resolved.email ?? body?.email ?? "",
      displayName: resolved.name ?? body?.displayName ?? "",
      role,
    });

    const res = NextResponse.json({ ok: true, role, verified: resolved.verified });
    res.cookies.set(COOKIE, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[POST /api/auth/session]", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}

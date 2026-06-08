/**
 * Client-side helpers for the /api/auth/session route.
 * POST  → set the HttpOnly session routing cookie from the browser-verified
 *         Firebase sign-in payload.
 * DELETE → clear the session cookie (sign-out).
 */
import type { UserRole } from "@/types";

export interface SessionInput {
  /** Firebase ID token — decoded (not verified) server-side for uid/email. */
  idToken: string;
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
}

export interface SessionResult {
  ok: boolean;
  role: UserRole;
}

/** Set the server-side session cookie after a successful client sign-in. */
export async function createSession(input: SessionInput): Promise<SessionResult> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create session.");
  }
  return res.json();
}

/** Clear the session cookie (call after Firebase signOut). */
export async function destroySession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}

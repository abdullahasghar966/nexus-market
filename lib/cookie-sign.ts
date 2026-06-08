/**
 * HMAC-SHA256 signing for the `nexus_session` routing cookie.
 *
 * Uses the Web Crypto API only (`crypto.subtle`, `TextEncoder`, `btoa`/`atob`),
 * so the SAME module works in the Node API route (signing) and the Edge
 * middleware (verifying). The cookie is a routing hint — the real data boundary
 * is Firestore rules — but signing stops a user from forging `role: "admin"` to
 * reach the admin/vendor UI shells.
 *
 * Cookie format: `base64url(JSON payload) + "." + hmacHexHexDigest`.
 */

/** Secret for the cookie HMAC. Set SESSION_SECRET in production. */
export function getSessionSecret(): string {
  return process.env.SESSION_SECRET || "nexus-dev-session-secret-change-me";
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToString(s: string): string {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 ? 4 - (norm.length % 4) : 0;
  const bin = atob(norm + "=".repeat(pad));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return decoder.decode(bytes);
}

async function hmacHex(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const bytes = new Uint8Array(sig);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

/** Constant-time string compare (equal length, char-by-char). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Produce a signed cookie value from a JSON-serializable payload. */
export async function signSession(
  payload: Record<string, unknown>,
  secret: string = getSessionSecret(),
): Promise<string> {
  const body = bytesToB64url(encoder.encode(JSON.stringify(payload)));
  const sig = await hmacHex(body, secret);
  return `${body}.${sig}`;
}

/** Verify a signed cookie value; returns the payload or null if tampered. */
export async function verifySession<T = Record<string, unknown>>(
  value: string | undefined,
  secret: string = getSessionSecret(),
): Promise<T | null> {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  try {
    const expected = await hmacHex(body, secret);
    if (!timingSafeEqual(sig, expected)) return null;
    return JSON.parse(b64urlToString(body)) as T;
  } catch {
    return null;
  }
}

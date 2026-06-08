"use client";

/**
 * Thin wrapper — reads auth state from the shared AuthContext so there is
 * only one `onAuthStateChanged` listener for the whole app (in AuthProvider).
 * Drop-in replacement for the previous standalone hook.
 */
import { useAuthContext } from "@/lib/auth-context";
import type { AuthContextValue } from "@/lib/auth-context";

/** Backward-compatible alias so existing imports keep working. */
export type AuthState = AuthContextValue;

export function useAuth(): AuthState {
  return useAuthContext();
}

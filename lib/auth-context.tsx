"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";
import type { UserRole, UserProfile } from "@/types";

export interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  role: null,
  loading: true,
});

/**
 * Mounts a single `onAuthStateChanged` listener for the whole app.
 * Every component that calls `useAuth()` reads from this shared state —
 * no duplicate listeners, no stale snapshots.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<AuthContextValue>({
    user: null,
    profile: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setValue({ user: null, profile: null, role: null, loading: false });
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setValue({ user: null, profile: null, role: null, loading: false });
        return;
      }

      let role: UserRole = "customer";
      let profile: UserProfile | null = null;

      try {
        // Firestore is the source of truth for role (not ID-token claims)
        if (db) {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            profile = snap.data() as UserProfile;
            role = profile.role ?? "customer";
          }
        }
        // Fallback to custom claims if Firestore doc doesn't exist yet
        if (!profile) {
          const token = await user.getIdTokenResult();
          role = (token.claims.role as UserRole) ?? "customer";
        }
      } catch {
        // network error: degrade gracefully to customer
      }

      setValue({ user, profile, role, loading: false });
    });

    return () => unsub();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Read auth state from the shared AuthContext. Must be inside AuthProvider. */
export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}

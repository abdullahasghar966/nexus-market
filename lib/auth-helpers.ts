/**
 * Firebase Auth + Firestore profile helpers — client-side only.
 * Import from client components and hooks only (never from server/API routes).
 */
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "./firebase";
import type { UserRole, UserProfile } from "@/types";

/** Persist or merge a user profile document in Firestore `users/{uid}`. */
export async function saveUserProfile(
  user: User,
  overrides: { role?: UserRole; displayName?: string } = {},
): Promise<UserProfile> {
  if (!db) throw new Error("Firestore not configured.");

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? (snap.data() as UserProfile) : null;

  // Firestore rejects `undefined` field values — build the profile so only
  // fields with a real value are included (photoURL is absent for email/password
  // sign-up; displayName is absent for Google users who didn't set one).
  const displayName =
    overrides.displayName ?? user.displayName ?? existing?.displayName ?? null;
  const photoURL = user.photoURL ?? existing?.photoURL ?? null;

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? "",
    // Never downgrade an existing role (e.g. admin → customer on re-login)
    role: existing?.role ?? overrides.role ?? "customer",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    ...(displayName ? { displayName } : {}),
    ...(photoURL ? { photoURL } : {}),
  };

  await setDoc(ref, profile, { merge: true });
  return profile;
}

/** Fetch a user profile from Firestore. Returns null if not found. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * Google sign-in via popup. Saves the profile to Firestore on first sign-in
 * and returns the resolved role so the caller can set the session + redirect.
 */
export async function signInWithGoogle(): Promise<{ user: User; role: UserRole }> {
  if (!auth) throw new Error("Firebase Auth not configured.");
  const { user } = await signInWithPopup(auth, googleProvider);
  const profile = await saveUserProfile(user);
  return { user, role: profile.role };
}

/** Email + password sign-in. */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  if (!auth) throw new Error("Firebase Auth not configured.");
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Create a new account with email + password.
 * Also sets `displayName` on the Firebase Auth profile and writes to Firestore.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = "customer",
): Promise<User> {
  if (!auth) throw new Error("Firebase Auth not configured.");
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await saveUserProfile(user, { role, displayName });
  return user;
}

/** Sign out the current Firebase user. */
export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured || !auth) return;
  await firebaseSignOut(auth);
}

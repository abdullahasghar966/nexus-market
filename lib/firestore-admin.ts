/**
 * Admin user/vendor management backed by Firestore — CLIENT ONLY.
 *
 * Reads/writes the `users` collection; gated to admins by security rules.
 * Graceful when Firebase is unconfigured (empty list / no-op writes).
 */
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { UserProfile, UserRole } from "@/types";

export interface ManagedUser extends UserProfile {
  isSuspended?: boolean;
}

/** Live feed of all user profiles (admin only). */
export function subscribeToAllUsers(
  cb: (users: ManagedUser[]) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    cb([]);
    return () => {};
  }
  return onSnapshot(
    collection(db, "users"),
    (snap) => {
      cb(
        snap.docs
          .map((d) => d.data() as ManagedUser)
          .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
      );
    },
    () => cb([]),
  );
}

export async function setUserSuspended(
  uid: string,
  isSuspended: boolean,
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await updateDoc(doc(db, "users", uid), { isSuspended });
}

export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await updateDoc(doc(db, "users", uid), { role });
}

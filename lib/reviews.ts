/**
 * Customer reviews backed by Firestore — CLIENT ONLY.
 *
 * Browser Firestore works on this network, so reviews are written/read live
 * here. Everything degrades gracefully when Firebase is unconfigured (writes
 * throw a friendly error the form catches; subscriptions deliver an empty list)
 * so product pages keep rendering the static sample reviews.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export type ReviewStatus = "published" | "flagged" | "hidden";

export interface StoredReview {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  initials: string;
  avatarClass: string;
  rating: number;
  title?: string;
  body: string;
  status: ReviewStatus;
  createdAt: string; // ISO — client time, sortable
}

const COLLECTION = "reviews";

/** Deterministic avatar tint from a user id (matches the kit's token palette). */
const AVATAR_TINTS = [
  "bg-primary-container text-on-primary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  "bg-accent-container text-on-accent-container",
  "bg-primary-fixed text-on-primary-fixed-variant",
];

export function avatarTintFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

export function initialsFor(name: string): string {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export interface NewReviewInput {
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
}

/** Submit a review. Throws a friendly error when Firestore is unavailable. */
export async function addReview(input: NewReviewInput): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Reviews require sign-in and a configured backend.");
  }
  await addDoc(collection(db, COLLECTION), {
    productId: input.productId,
    productName: input.productName ?? "",
    userId: input.userId,
    userName: input.userName,
    initials: initialsFor(input.userName),
    avatarClass: avatarTintFor(input.userId),
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    title: input.title ?? "",
    body: input.body,
    status: "published" as ReviewStatus,
    createdAt: new Date().toISOString(),
  });
}

function mapDoc(id: string, data: Record<string, unknown>): StoredReview {
  return {
    id,
    productId: String(data.productId ?? ""),
    productName: data.productName ? String(data.productName) : undefined,
    userId: String(data.userId ?? ""),
    userName: String(data.userName ?? "Anonymous"),
    initials: String(data.initials ?? initialsFor(String(data.userName ?? "?"))),
    avatarClass: String(data.avatarClass ?? avatarTintFor(String(data.userId ?? ""))),
    rating: Number(data.rating ?? 5),
    title: data.title ? String(data.title) : undefined,
    body: String(data.body ?? ""),
    status: (data.status as ReviewStatus) ?? "published",
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

/**
 * Live published reviews for one product, newest first. Flagged/hidden reviews
 * are withheld from the public list (they surface in admin moderation). Sorted
 * client-side so no composite index is needed.
 */
export function subscribeToProductReviews(
  productId: string,
  cb: (reviews: StoredReview[]) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where("productId", "==", productId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => mapDoc(d.id, d.data()))
        .filter((r) => r.status === "published")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      cb(list);
    },
    () => cb([]),
  );
}

/** Live feed of every review for admin moderation, newest first. */
export function subscribeToAllReviews(
  cb: (reviews: StoredReview[]) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    cb([]);
    return () => {};
  }
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const list = snap.docs
        .map((d) => mapDoc(d.id, d.data()))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      cb(list);
    },
    () => cb([]),
  );
}

/** Moderation: set a review's status (admin only — enforced by rules). */
export async function setReviewStatus(
  id: string,
  status: ReviewStatus,
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await updateDoc(doc(db, COLLECTION, id), { status });
}

/** Moderation: permanently delete a review (admin only). */
export async function deleteReview(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await deleteDoc(doc(db, COLLECTION, id));
}

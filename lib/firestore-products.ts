/**
 * Vendor-managed product catalogue backed by Firestore — CLIENT ONLY.
 *
 * Powers the vendor dashboard's product CRUD and the admin product list. All
 * functions degrade gracefully when Firebase is unconfigured (writes reject
 * with a friendly error; subscriptions deliver an empty list), so the
 * dashboards still render their seeded sample data.
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
import { slugify } from "@/lib/utils";
import type { Product } from "@/types";

export interface StoredProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  category: string;
  stockCount: number;
  vendorId: string;
  vendorName: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  category: string;
  stockCount: number;
}

const COLLECTION = "products";

function mapDoc(id: string, d: Record<string, unknown>): StoredProduct {
  return {
    id,
    slug: String(d.slug ?? ""),
    name: String(d.name ?? ""),
    description: String(d.description ?? ""),
    image: String(d.image ?? ""),
    price: Number(d.price ?? 0),
    compareAtPrice:
      d.compareAtPrice === null || d.compareAtPrice === undefined
        ? null
        : Number(d.compareAtPrice),
    category: String(d.category ?? "electronics"),
    stockCount: Number(d.stockCount ?? 0),
    vendorId: String(d.vendorId ?? ""),
    vendorName: String(d.vendorName ?? ""),
    ownerId: String(d.ownerId ?? ""),
    isActive: d.isActive !== false,
    createdAt: String(d.createdAt ?? new Date().toISOString()),
  };
}

export async function addProduct(
  input: ProductInput,
  owner: { ownerId: string; vendorId: string; vendorName: string },
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Product management requires a configured backend.");
  }
  await addDoc(collection(db, COLLECTION), {
    slug: slugify(input.name) || `product-${Date.now()}`,
    name: input.name,
    description: input.description,
    image: input.image,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    category: input.category,
    stockCount: input.stockCount,
    vendorId: owner.vendorId,
    vendorName: owner.vendorName,
    ownerId: owner.ownerId,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
}

export async function updateProduct(
  id: string,
  patch: Partial<ProductInput> & { isActive?: boolean },
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await updateDoc(doc(db, COLLECTION, id), { ...patch });
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await deleteDoc(doc(db, COLLECTION, id));
}

/** Live products owned by one vendor (sorted newest-first client-side). */
export function subscribeToVendorProducts(
  ownerId: string,
  cb: (products: StoredProduct[]) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where("ownerId", "==", ownerId));
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs
          .map((d) => mapDoc(d.id, d.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    },
    () => cb([]),
  );
}

/** Live feed of all products (admin catalogue management). */
export function subscribeToAllProducts(
  cb: (products: StoredProduct[]) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    cb([]);
    return () => {};
  }
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      cb(
        snap.docs
          .map((d) => mapDoc(d.id, d.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    },
    () => cb([]),
  );
}

/** Live active products as domain `Product`s for the public storefront. */
export function subscribeToActiveProducts(
  cb: (products: Product[]) => void,
): () => void {
  return subscribeToAllProducts((list) =>
    cb(list.filter((p) => p.isActive).map(storedProductToProduct)),
  );
}

/** One live product by slug, as a domain `Product` (public detail fallback). */
export function subscribeToProductBySlug(
  slug: string,
  cb: (product: Product | null) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    cb(null);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where("slug", "==", slug));
  return onSnapshot(
    q,
    (snap) => {
      const doc0 = snap.docs[0];
      cb(doc0 ? storedProductToProduct(mapDoc(doc0.id, doc0.data())) : null);
    },
    () => cb(null),
  );
}

/** Map a stored vendor product onto the shared `Product` domain shape. */
export function storedProductToProduct(sp: StoredProduct): Product {
  return {
    id: sp.id,
    slug: sp.slug,
    name: sp.name,
    description: sp.description,
    images: sp.image ? [sp.image] : [],
    price: sp.price,
    compareAtPrice: sp.compareAtPrice ?? null,
    category: sp.category,
    tags: [],
    vendor: {
      id: sp.vendorId,
      name: sp.vendorName,
      slug: slugify(sp.vendorName) || sp.vendorId,
    },
    stockCount: sp.stockCount,
    rating: { average: 0, count: 0 },
    isActive: sp.isActive,
    isFeatured: false,
    createdAt: sp.createdAt,
  };
}

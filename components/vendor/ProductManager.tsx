"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn, formatPrice } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  subscribeToVendorProducts,
  type ProductInput,
  type StoredProduct,
} from "@/lib/firestore-products";
import { PRODUCTS } from "@/lib/data/sample";

const EMPTY_FORM: ProductInput = {
  name: "",
  description: "",
  image: "",
  price: 0,
  compareAtPrice: null,
  category: "electronics",
  stockCount: 0,
};

export function ProductManager() {
  const { user } = useAuth();
  const [live, setLive] = useState<StoredProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StoredProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  const canManage = isFirebaseConfigured && !!user;

  useEffect(() => {
    if (!canManage || !user) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToVendorProducts(user.uid, (list) => {
      setLive(list);
      setLoading(false);
    });
    return () => unsub();
  }, [canManage, user]);

  async function handleDelete(p: StoredProduct) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(p.id);
      toast.success("Product deleted");
    } catch {
      toast.error("Could not delete product");
    }
  }

  async function handleToggleActive(p: StoredProduct) {
    try {
      await updateProduct(p.id, { isActive: !p.isActive });
      toast.success(p.isActive ? "Product hidden" : "Product published");
    } catch {
      toast.error("Could not update product");
    }
  }

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(p: StoredProduct) {
    setEditing(p);
    setShowForm(true);
  }

  // Demo fallback rows when there's nothing live to show.
  const demoRows = PRODUCTS.slice(0, 6);
  const showingDemo = !canManage || (!loading && live.length === 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-headline-lg-mobile text-on-background md:text-headline-lg">
            Products
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {canManage
              ? "Add, edit, and manage your live catalogue."
              : "Demo catalogue — sign in as a vendor to manage real products."}
          </p>
        </div>
        {canManage && (
          <Button variant="accent" onClick={openAdd}>
            <Icon name="add" size={20} filled /> Add New Product
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface-container-lowest shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Status</th>
                {canManage && <th className="p-4 text-right font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-body-md">
              {loading && canManage && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    Loading your products…
                  </td>
                </tr>
              )}

              {!showingDemo &&
                live.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-container-high">
                          {p.image && (
                            <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <span className="line-clamp-1 font-medium text-on-surface">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-on-surface-variant">{p.category}</td>
                    <td className="p-4 font-medium tabular-nums text-on-surface">{formatPrice(p.price)}</td>
                    <td className="p-4 tabular-nums text-on-surface">
                      <StockPill count={p.stockCount} />
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-80",
                          p.isActive
                            ? "bg-success-container text-on-success-container"
                            : "bg-surface-container-high text-on-surface-variant",
                        )}
                      >
                        {p.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${p.name}`}
                          onClick={() => openEdit(p)}
                          className="rounded p-2 text-primary transition-colors hover:bg-surface-container"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${p.name}`}
                          onClick={() => handleDelete(p)}
                          className="rounded p-2 text-error transition-colors hover:bg-error-container/40"
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {showingDemo &&
                demoRows.map((p) => (
                  <tr key={p.id} className="text-on-surface-variant">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-container-high">
                          <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                        </div>
                        <span className="line-clamp-1 font-medium text-on-surface">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{p.category}</td>
                    <td className="p-4 font-medium tabular-nums text-on-surface">{formatPrice(p.price)}</td>
                    <td className="p-4 tabular-nums"><StockPill count={p.stockCount} /></td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-success-container px-2.5 py-0.5 text-label-sm font-bold uppercase tracking-wide text-on-success-container">
                        Active
                      </span>
                    </td>
                    {canManage && <td className="p-4" />}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <ProductFormModal
            initial={editing}
            onClose={() => setShowForm(false)}
            onSave={async (input) => {
              try {
                if (editing) {
                  await updateProduct(editing.id, input);
                  toast.success("Product updated");
                } else {
                  await addProduct(input, {
                    ownerId: user!.uid,
                    vendorId: `v_${user!.uid.slice(0, 8)}`,
                    vendorName: user!.displayName ?? "My Store",
                  });
                  toast.success("Product added");
                }
                setShowForm(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not save product");
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StockPill({ count }: { count: number }) {
  const out = count <= 0;
  const low = !out && count < 10;
  return (
    <span
      className={cn(
        "font-medium",
        out ? "text-error" : low ? "text-accent" : "text-on-surface",
      )}
    >
      {out ? "Out of stock" : `${count} in stock`}
    </span>
  );
}

/* ─────────────────────────── Add / edit modal ─────────────────────────── */

function ProductFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial: StoredProduct | null;
  onClose: () => void;
  onSave: (input: ProductInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductInput>(
    initial
      ? {
          name: initial.name,
          description: initial.description,
          image: initial.image,
          price: initial.price,
          compareAtPrice: initial.compareAtPrice ?? null,
          category: initial.category,
          stockCount: initial.stockCount,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (form.description.trim().length < 10) errs.description = "At least 10 characters";
    if (!form.image.trim()) errs.image = "Image URL required";
    if (!(form.price > 0)) errs.price = "Enter a price";
    if (form.stockCount < 0) errs.stockCount = "Cannot be negative";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40"
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[88vh] max-w-lg -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface-container-lowest p-6 shadow-floating"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-headline-md font-semibold text-on-surface">
            {initial ? "Edit product" : "Add new product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-variant"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <ModalField label="Product name" error={errors.name}>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Wireless headphones" />
          </ModalField>
          <ModalField label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="What makes this product great?"
              className="flex w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-body-md text-on-surface shadow-sm focus:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary"
            />
          </ModalField>
          <ModalField label="Image URL" error={errors.image}>
            <Input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://…" />
          </ModalField>
          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Price (USD)" error={errors.price}>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price || ""}
                onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                placeholder="89.99"
              />
            </ModalField>
            <ModalField label="Compare-at (optional)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.compareAtPrice ?? ""}
                onChange={(e) =>
                  set("compareAtPrice", e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="120.00"
              />
            </ModalField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Category">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="flex h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface shadow-sm focus:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </ModalField>
            <ModalField label="Stock count" error={errors.stockCount}>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.stockCount || ""}
                onChange={(e) => set("stockCount", parseInt(e.target.value, 10) || 0)}
                placeholder="25"
              />
            </ModalField>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              <Icon name="check" size={18} />
              {saving ? "Saving…" : initial ? "Save changes" : "Add product"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

function ModalField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-label-md text-on-surface">{label}</span>
      {children}
      {error && (
        <span className="mt-1 block text-label-sm normal-case tracking-normal text-error">
          {error}
        </span>
      )}
    </label>
  );
}

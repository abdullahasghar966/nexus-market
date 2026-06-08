"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useRealtimeStock } from "@/hooks/useRealtimeStock";
import { Icon } from "@/components/ui/icon";
import { Stars } from "@/components/ui/stars";
import { formatPrice } from "@/lib/utils";
import { staggerItem } from "@/components/animations/variants";

const LOW_STOCK_THRESHOLD = 10;

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const stock = useRealtimeStock(product.id, product.stockCount);

  const outOfStock = stock <= 0;
  const lowStock = !outOfStock && stock < LOW_STOCK_THRESHOLD;
  const href = `/products/${product.slug}`;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
        vendorId: product.vendor.id,
        vendorName: product.vendor.name,
        maxStock: stock,
      },
      1,
    );
    toast.success("Added to cart", { description: product.name });
  }

  return (
    <motion.article
      variants={staggerItem}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface-container-lowest shadow-card transition-shadow duration-300 hover:shadow-floating"
    >
      {(lowStock || outOfStock) && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full border border-line bg-surface-container-lowest/90 px-2 py-1 backdrop-blur-sm">
          <span
            className={`h-2 w-2 rounded-full ${outOfStock ? "bg-error" : "bg-accent animate-pulse-soft"}`}
          />
          <span
            className={`text-label-sm font-bold uppercase tracking-wider ${outOfStock ? "text-error" : "text-accent"}`}
          >
            {outOfStock ? "Out of Stock" : `Low Stock · ${stock}`}
          </span>
        </div>
      )}

      <Link
        href={href}
        className="block focus-visible:outline-none"
        aria-label={product.name}
      >
        <div
          className={`relative aspect-square overflow-hidden bg-surface-container-low ${outOfStock ? "opacity-60 grayscale" : ""}`}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-grow flex-col p-4">
        <div className="mb-1 text-label-sm text-primary-container">
          {product.vendor.name}
        </div>
        <h3 className="mb-2 line-clamp-2 text-body-md font-semibold text-on-surface">
          <Link href={href} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <div className="mb-3 flex items-center gap-1.5">
          <Stars rating={product.rating.average} size={16} />
          <span className="text-label-sm text-on-surface-variant">
            ({product.rating.average.toFixed(1)})
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-line/60 pt-4">
          <div>
            {product.compareAtPrice ? (
              <span className="block text-label-sm tabular-nums text-on-surface-variant line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
            <span className="text-body-lg font-bold tabular-nums text-on-surface">
              {formatPrice(product.price)}
            </span>
          </div>

          {outOfStock ? (
            <button
              type="button"
              disabled
              aria-label="Out of stock"
              className="flex cursor-not-allowed items-center justify-center rounded-full bg-surface-variant p-2.5 text-on-surface-variant"
            >
              <Icon name="remove_shopping_cart" size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
              className="flex items-center justify-center rounded-full bg-primary-container p-2.5 text-on-primary shadow-sm transition-colors hover:bg-primary active:scale-95"
            >
              <Icon name="add_shopping_cart" size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

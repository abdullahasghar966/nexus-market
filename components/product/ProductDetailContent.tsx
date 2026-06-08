"use client";

import Link from "next/link";
import { Stars } from "@/components/ui/stars";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductReviews } from "@/components/product/ProductReviews";
import { useRealtimeStock } from "@/hooks/useRealtimeStock";
import { formatPrice, discountPercent } from "@/lib/utils";
import type { MaterialIcon } from "@/lib/icons";
import type { Product } from "@/types";

const TRUST: { icon: MaterialIcon; label: string }[] = [
  { icon: "local_shipping", label: "Free shipping over $150" },
  { icon: "verified_user", label: "Verified vendor" },
  { icon: "done_all", label: "Secure checkout" },
];

/**
 * Presentational product-detail body, shared by the SSG sample-product page and
 * the client-side live (Firestore) product fallback so both look identical.
 */
export function ProductDetailContent({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  // Live stock from Firestore `stock/{id}` (falls back to the server value).
  const stock = useRealtimeStock(product.id, product.stockCount);
  const outOfStock = stock <= 0;
  const lowStock = !outOfStock && stock < 10;
  const off = discountPercent(product.price, product.compareAtPrice);

  return (
    <div className="container-page py-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-label-sm text-on-surface-variant"
      >
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <Icon name="chevron_right" size={16} />
        <Link href="/products" className="hover:text-primary">
          Shop
        </Link>
        <Icon name="chevron_right" size={16} />
        <span className="line-clamp-1 text-on-surface">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} discount={off} />

        <div>
          <Link
            href={`/products?vendor=${product.vendor.slug}`}
            className="inline-flex items-center gap-1 text-label-md text-primary hover:underline"
          >
            <Icon name="storefront" size={16} />
            {product.vendor.name}
          </Link>
          <h1 className="mt-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {product.name}
          </h1>
          <div className="mt-3">
            <Stars
              rating={product.rating.average}
              size={18}
              showValue
              count={product.rating.count}
            />
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-display-lg tabular-nums text-on-surface">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-body-lg tabular-nums text-on-surface-variant line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="mt-4">
            {outOfStock ? (
              <span className="inline-flex items-center gap-2 text-label-md font-semibold text-error">
                <span className="h-2.5 w-2.5 rounded-full bg-error" /> Out of stock
              </span>
            ) : lowStock ? (
              <span className="inline-flex items-center gap-2 text-label-md font-semibold text-accent">
                <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse-soft" />{" "}
                Low stock · {stock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-label-md font-semibold text-success">
                <span className="h-2.5 w-2.5 rounded-full bg-success" /> In stock ·{" "}
                {stock} available
              </span>
            )}
          </div>

          <p className="mt-5 max-w-prose text-body-md text-on-surface-variant">
            {product.description}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} stock={stock} />
            <Button asChild variant="secondary" size="lg">
              <Link href="/cart">
                <Icon name="shopping_cart" size={20} /> View cart
              </Link>
            </Button>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TRUST.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface-container-lowest p-3 text-label-md text-on-surface-variant"
              >
                <Icon name={f.icon} size={20} className="text-primary" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductReviews
        productId={product.id}
        productName={product.name}
        productSlug={product.slug}
        rating={product.rating}
      />

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-12">
          <h2 className="mb-8 text-headline-lg-mobile text-on-surface md:text-headline-lg">
            You might also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

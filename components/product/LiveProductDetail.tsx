"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { subscribeToProductBySlug } from "@/lib/firestore-products";
import { PRODUCTS } from "@/lib/data/sample";
import type { Product } from "@/types";

/**
 * Client fallback for product slugs not in the SSG sample set — i.e. live
 * vendor-listed products in Firestore. Subscribes by slug; shows the shared
 * detail body when found, a not-found state otherwise.
 */
export function LiveProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = subscribeToProductBySlug(slug, (p) => {
      setProduct(p);
      setReady(true);
    });
    return () => unsub();
  }, [slug]);

  if (!ready) {
    return (
      <div className="container-page py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-surface-container" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-surface-container" />
            <div className="h-12 w-1/3 animate-pulse rounded bg-surface-container" />
            <div className="h-24 w-full animate-pulse rounded bg-surface-container" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <Icon name="search" size={32} />
        </span>
        <h1 className="mt-6 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Product not found
        </h1>
        <p className="mt-2 max-w-sm text-body-md text-on-surface-variant">
          This product may have been removed or never existed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">
            <Icon name="shopping_bag" size={20} /> Browse products
          </Link>
        </Button>
      </div>
    );
  }

  // Related: same-category sample products as a sensible default.
  const related = PRODUCTS.filter((p) => p.category === product.category).slice(0, 4);

  return <ProductDetailContent product={product} related={related} />;
}

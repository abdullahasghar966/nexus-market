import type { Metadata } from "next";
import { Suspense } from "react";
import { PRODUCTS } from "@/lib/data/sample";
import { ProductBrowser } from "@/components/product/ProductBrowser";
import { ProductGrid } from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse products from verified vendors across the Nexus Market catalogue.",
};

export default function ProductsPage() {
  return (
    <div className="container-page py-10">
      <div>
        <span className="mb-2 block text-label-sm uppercase tracking-wider text-primary">
          Catalogue
        </span>
        <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
          All Products
        </h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Quality goods from verified vendors worldwide.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="mt-8">
            <ProductGrid products={PRODUCTS} />
          </div>
        }
      >
        <ProductBrowser products={PRODUCTS} />
      </Suspense>
    </div>
  );
}

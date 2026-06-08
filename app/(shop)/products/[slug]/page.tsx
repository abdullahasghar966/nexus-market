import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/data/sample";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { LiveProductDetail } from "@/components/product/LiveProductDetail";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.images[0]] },
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);

  // Unknown slug → it may be a live vendor product in Firestore (client-loaded).
  if (!product) return <LiveProductDetail slug={params.slug} />;

  // Related: same category or same vendor first, padded with the rest.
  const pool = PRODUCTS.filter((p) => p.id !== product.id);
  const affinity = pool.filter(
    (p) => p.category === product.category || p.vendor.id === product.vendor.id,
  );
  const related = [
    ...affinity,
    ...pool.filter((p) => !affinity.includes(p)),
  ].slice(0, 4);

  return <ProductDetailContent product={product} related={related} />;
}

"use client";

import { motion } from "framer-motion";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { staggerContainer } from "@/components/animations/variants";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </motion.div>
  );
}

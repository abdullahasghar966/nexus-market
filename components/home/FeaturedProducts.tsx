"use client";

import { motion } from "framer-motion";
import { FEATURED_PRODUCTS } from "@/lib/data/sample";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { staggerContainer } from "@/components/animations/variants";

export function FeaturedProducts() {
  return (
    <section id="featured" className="scroll-mt-20 bg-surface py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Handpicked"
          title="Featured Products"
          subtitle="Top-rated goods from our most trusted vendors."
          action={{ label: "View all products", href: "/products" }}
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-10 grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {FEATURED_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

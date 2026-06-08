"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { staggerContainer, staggerItem } from "@/components/animations/variants";

export function Categories() {
  return (
    <section id="categories" className="scroll-mt-20 bg-surface-container-lowest py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Browse"
          title="Explore Categories"
          subtitle="Find exactly what you're looking for across our curated marketplace."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6"
        >
          {CATEGORIES.map((c) => (
            <motion.div key={c.slug} variants={staggerItem}>
              <Link
                href={`/products?category=${c.slug}`}
                className="group flex h-full flex-col items-center rounded-xl border border-outline-variant bg-surface p-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container">
                  <Icon name={c.icon} size={30} />
                </span>
                <span className="text-label-md font-medium text-on-surface">
                  {c.name}
                </span>
                <span className="mt-0.5 text-label-sm font-normal normal-case tracking-normal text-on-surface-variant">
                  {c.blurb}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { STATS } from "@/lib/constants";
import { staggerContainer, staggerItem } from "@/components/animations/variants";

export function Stats() {
  return (
    <section className="border-b border-outline-variant bg-surface py-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="container-page grid grid-cols-2 gap-8 md:grid-cols-4"
      >
        {STATS.map((s) => (
          <motion.div
            key={s.label}
            variants={staggerItem}
            className="flex flex-col items-center text-center"
          >
            <span className="text-headline-lg font-bold text-primary md:text-display-lg">
              {s.value}
            </span>
            <span className="mt-1 text-label-md uppercase tracking-wider text-on-surface-variant">
              {s.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

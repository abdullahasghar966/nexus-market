"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/data/sample";
import { Stars } from "@/components/ui/stars";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { staggerContainer, staggerItem } from "@/components/animations/variants";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Testimonials() {
  return (
    <section id="about" className="scroll-mt-20 bg-surface-container-lowest py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Social proof"
          title="Loved by buyers and vendors"
          subtitle="Thousands of people trust Nexus Market for discovery, reliability, and growth."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10 grid grid-cols-1 gap-gutter md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.id}
              variants={staggerItem}
              className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card"
            >
              <Stars rating={t.rating ?? 5} size={18} />
              <blockquote className="mt-4 flex-grow text-body-md text-on-surface">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-label-md font-bold text-on-primary-fixed-variant">
                  {getInitials(t.author)}
                </span>
                <span>
                  <span className="block text-label-md font-semibold text-on-surface">
                    {t.author}
                  </span>
                  <span className="block text-label-sm font-normal normal-case tracking-normal text-on-surface-variant">
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

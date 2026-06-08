"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { VENDORS } from "@/lib/data/sample";
import { Icon } from "@/components/ui/icon";
import { Stars } from "@/components/ui/stars";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { staggerContainer, staggerItem } from "@/components/animations/variants";

export function VendorSpotlight() {
  return (
    <section id="vendors" className="scroll-mt-20 bg-surface-container-low py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Trusted partners"
          title="Featured Vendors"
          subtitle="Verified makers and suppliers building their business on Nexus Market."
          action={{ label: "Become a vendor", href: "/register?role=vendor" }}
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4"
        >
          {VENDORS.map((v) => (
            <motion.div
              key={v.id}
              variants={staggerItem}
              className="flex h-full flex-col rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card transition-shadow hover:shadow-floating"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-headline-md font-bold ${v.avatarClass}`}
                >
                  {v.initials}
                </span>
                {v.verified && (
                  <span className="inline-flex items-center gap-1 text-label-sm font-semibold uppercase tracking-wider text-secondary">
                    <Icon name="verified" size={16} filled /> Verified
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-headline-md font-semibold text-on-surface">
                {v.name}
              </h3>
              <p className="mt-1 text-body-md text-on-surface-variant">
                {v.tagline}
              </p>
              <div className="mt-3 flex items-center gap-1 text-label-md text-on-surface-variant">
                <Icon name="location_on" size={16} /> {v.location}
              </div>
              <div className="mt-3">
                <Stars
                  rating={v.rating.average}
                  size={16}
                  showValue
                  count={v.rating.count}
                />
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-line/60 pt-4">
                <span className="text-label-md text-on-surface-variant">
                  {v.productCount} products
                </span>
                <Link
                  href={`/products?vendor=${v.slug}`}
                  className="group inline-flex items-center gap-1 text-label-md font-medium text-primary transition-all hover:gap-2"
                >
                  Visit store
                  <Icon name="arrow_forward" size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

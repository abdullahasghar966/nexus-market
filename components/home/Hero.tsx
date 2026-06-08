"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Stars } from "@/components/ui/stars";
import { staggerContainer, staggerItem } from "@/components/animations/variants";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCgglzIEQesStS0MqzYbzVeLyHH2XzCsyl1gf3w71pPRq7e_CuOA9hoD6S-wNnLto2faqqOI10ykwNyyN56QJ70SW3JlGO-rDt1tr4Lx79XOE0cpHncccMBoWFDRWbRqqG1pUYFW6_YnK7rUyLQ7vzeLkPuiYZIyK9t7HsR28S7LatldXfRH50A-gci5fT9a9ds9mYL-CsbVVI-H6N1qfGK2--0pY1wBYtu7_EfboV4fmbzebenPN1fRXY4m_nRzHTgZrO0Hxs";

export function Hero() {
  return (
    <section className="relative flex min-h-[600px] items-center overflow-hidden bg-surface-container-low lg:min-h-[680px]">
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="container-page relative z-10 w-full py-20"
      >
        <div className="max-w-3xl">
          <motion.span
            variants={staggerItem}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest/70 px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-primary backdrop-blur"
          >
            <Icon name="public" size={16} /> Global B2B &amp; B2C Marketplace
          </motion.span>

          <motion.h1
            variants={staggerItem}
            className="mt-5 text-[40px] font-bold leading-tight tracking-[-0.02em] text-on-surface sm:text-display-lg"
          >
            The Global Marketplace for{" "}
            <span className="text-primary">Quality Goods</span>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="mt-6 max-w-2xl text-body-lg text-on-surface-variant"
          >
            Connect with verified vendors worldwide. Discover unique products,
            reliable suppliers, and seamless cross-border transactions built for
            modern commerce.
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <Button asChild size="lg">
              <Link href="/products">
                <Icon name="shopping_bag" size={20} /> Start Shopping
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/register?role=vendor">
                <Icon name="storefront" size={20} /> Become a Vendor
              </Link>
            </Button>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="mt-8 flex items-center gap-3 text-on-surface-variant"
          >
            <Stars rating={4.9} size={18} />
            <span className="text-label-md">
              4.9/5 from 12k+ verified reviews
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

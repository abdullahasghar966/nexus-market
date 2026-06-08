"use client";

import { motion, type Variants } from "framer-motion";
import { cardReveal } from "./variants";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  once?: boolean;
  amount?: number;
}

/**
 * Scroll-triggered reveal. Wraps children in a motion element that animates
 * from `hidden` to `visible` when it enters the viewport.
 */
export function Reveal({
  children,
  className,
  variants = cardReveal,
  delay = 0,
  once = true,
  amount = 0.2,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

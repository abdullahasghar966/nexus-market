"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransition } from "@/components/animations/variants";

/**
 * Animates page content on mount and re-runs on each route change
 * (keyed by pathname). App Router exit animations are intentionally omitted.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      variants={pageTransition}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

import type { Variants, Transition } from "framer-motion";

/* Shared easing + spring presets — the motion vocabulary for Atelier Market. */
export const EASE_LUXE = [0.22, 1, 0.36, 1] as const; // expressive ease-out
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const springSoft: Transition = { type: "spring", stiffness: 260, damping: 30 };
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 32 };
export const springDrawer: Transition = { type: "spring", stiffness: 320, damping: 38 };

/* ---- Base reveals ---- */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_LUXE } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_LUXE } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_LUXE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_LUXE } },
};

/* ---- Stagger orchestration ---- */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_LUXE } },
};

/* ---- Product / content card reveal ---- */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_LUXE } },
};

/* ---- Hero staggered lines ---- */
export const heroLine: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_LUXE, delay: 0.15 + i * 0.12 },
  }),
};

/* ---- Cart drawer (slide from right) + backdrop ---- */
export const drawerPanel: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: springDrawer },
  exit: { x: "100%", transition: { duration: 0.3, ease: EASE_IN_OUT } },
};

export const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/* ---- Modal / dialog ---- */
export const dialogPanel: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: EASE_LUXE } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};

/* ---- Mobile nav drawer (slide down, staggered links) ---- */
export const mobileNavContainer: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.35, ease: EASE_LUXE, staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: { opacity: 0, height: 0, transition: { duration: 0.25, ease: EASE_IN_OUT } },
};

export const mobileNavItem: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

/* ---- Page transition wrapper ---- */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_LUXE } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3, ease: EASE_IN_OUT } },
};

/* ---- Table rows (admin / vendor) ---- */
export const tableRow: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_LUXE } },
};

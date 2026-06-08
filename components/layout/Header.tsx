"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/lib/zustand/ui-store";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-helpers";
import { destroySession } from "@/lib/session";
import { mobileNavContainer, mobileNavItem } from "@/components/animations/variants";

/* ─── User menu dropdown ─────────────────────────────────────────── */

function UserMenu() {
  const router = useRouter();
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    await destroySession();
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden items-center gap-1 rounded-full px-3 py-2 text-label-md font-medium text-on-surface-variant transition-colors hover:text-primary md:inline-flex"
      >
        <Icon name="account_circle" size={24} />
        <span>Login</span>
      </Link>
    );
  }

  // Derive avatar: photo URL from Google, or coloured initials tile
  const initials = (user.displayName ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-surface-variant"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? "avatar"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-label-sm font-bold text-on-primary">
            {initials}
          </span>
        )}
        <span className="max-w-[120px] truncate text-label-md text-on-surface">
          {user.displayName ?? user.email}
        </span>
        <Icon
          name="expand_more"
          size={18}
          className={cn(
            "text-on-surface-variant transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-surface-container-lowest shadow-floating"
          >
            {/* User info */}
            <div className="border-b border-line px-4 py-3">
              <p className="truncate text-label-md font-semibold text-on-surface">
                {user.displayName ?? "Account"}
              </p>
              <p className="truncate text-label-sm text-on-surface-variant">
                {user.email}
              </p>
              <span
                className={cn(
                  "mt-1 inline-flex rounded-full px-2 py-0.5 text-label-sm font-bold uppercase tracking-wide",
                  role === "admin"
                    ? "bg-surface-variant text-on-surface-variant"
                    : role === "vendor"
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-primary-fixed text-on-primary-fixed-variant",
                )}
              >
                {role ?? "customer"}
              </span>
            </div>

            {/* Nav links */}
            <ul className="py-1">
              {role === "vendor" && (
                <li>
                  <Link
                    href="/vendor/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                  >
                    <Icon name="dashboard" size={18} className="text-primary" />
                    Vendor Dashboard
                  </Link>
                </li>
              )}
              {role === "admin" && (
                <li>
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                  >
                    <Icon name="settings" size={18} className="text-primary" />
                    Admin Panel
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/track"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  <Icon name="local_shipping" size={18} className="text-primary" />
                  Track Orders
                </Link>
              </li>
            </ul>

            {/* Sign out */}
            <div className="border-t border-line py-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-label-md text-error transition-colors hover:bg-error-container/30"
              >
                <Icon name="logout" size={18} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main header ───────────────────────────────────────────────── */

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, hydrated } = useCart();
  const { user } = useAuth();
  const { mobileNavOpen, toggleMobileNav, setMobileNavOpen, openCart } =
    useUIStore();
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  function isActive(href: string) {
    if (href === "/products") return pathname.startsWith("/products");
    return pathname === href;
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  const cartCount = hydrated ? totalItems : 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-line bg-surface transition-shadow",
        scrolled && "shadow-sm",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-headline-md font-bold text-primary">
          {SITE.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-gutter md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "border-b-2 border-transparent pb-1 text-body-md transition-colors hover:text-primary",
                isActive(link.href)
                  ? "border-primary text-primary"
                  : "text-on-surface-variant",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search (desktop) */}
        <form
          onSubmit={onSearch}
          role="search"
          className="relative hidden flex-1 lg:mx-gutter lg:flex lg:max-w-md"
        >
          <Icon
            name="search"
            size={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, or vendors…"
            aria-label="Search"
            className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        {/* Trailing actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="hidden rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary sm:inline-flex"
          >
            <Icon name="notifications" size={24} />
          </button>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart, ${cartCount} items`}
            className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
          >
            <Icon name="shopping_cart" size={24} />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Desktop: user menu (authenticated) or Login link */}
          <UserMenu />

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={toggleMobileNav}
            aria-label="Toggle menu"
            aria-expanded={mobileNavOpen}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant md:hidden"
          >
            <Icon name={mobileNavOpen ? "close" : "menu"} size={24} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
        {mobileNavOpen && (
          <motion.div
            key="mobile-menu"
            variants={mobileNavContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden border-t border-line bg-surface md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              <form onSubmit={onSearch} role="search" className="relative mb-2">
                <Icon
                  name="search"
                  size={20}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search"
                  className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-body-md focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </form>

              {NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={mobileNavItem}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-3 py-2.5 text-body-md text-on-surface transition-colors hover:bg-surface-variant"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={mobileNavItem} className="border-t border-line pt-2 mt-1">
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1">
                      <p className="text-label-md font-semibold text-on-surface">
                        {user.displayName ?? user.email}
                      </p>
                    </div>
                    <Link
                      href="/track"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-body-md text-on-surface transition-colors hover:bg-surface-variant"
                    >
                      <Icon name="local_shipping" size={20} className="text-primary" />
                      Track Orders
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileNavOpen(false);
                        await signOut();
                        await destroySession();
                        router.push("/");
                        router.refresh();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-body-md text-error transition-colors hover:bg-error-container/30"
                    >
                      <Icon name="logout" size={20} />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-body-md font-medium text-primary transition-colors hover:bg-surface-variant"
                  >
                    <Icon name="account_circle" size={22} />
                    Login / Register
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { fadeInUp } from "@/components/animations/variants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    // Placeholder until the email backend (Resend) is wired up.
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast.success("You're subscribed!", {
        description: "Welcome to Nexus Market.",
      });
    }, 700);
  }

  return (
    <section id="newsletter" className="scroll-mt-20 bg-surface py-16">
      <div className="container-page">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-primary px-6 py-12 text-on-primary md:px-12 md:py-14"
        >
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-on-primary/10 px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-primary-fixed">
              <Icon name="mail" size={16} /> Newsletter
            </span>
            <h2 className="mt-4 text-headline-lg-mobile font-bold text-on-primary md:text-headline-lg">
              Stay ahead of the marketplace
            </h2>
            <p className="mt-3 text-body-md text-primary-fixed">
              Get new arrivals, vendor spotlights, and exclusive offers — straight
              to your inbox.
            </p>
            <form
              onSubmit={onSubmit}
              className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-12 w-full rounded-lg border border-transparent bg-on-primary px-4 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={loading}
                className="shrink-0"
              >
                {loading ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
            <p className="mt-3 text-label-sm font-normal normal-case tracking-normal text-primary-fixed/80">
              No spam. Unsubscribe anytime.
            </p>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-on-primary/5"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-on-primary/5"
          />
        </motion.div>
      </div>
    </section>
  );
}

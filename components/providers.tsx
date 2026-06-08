"use client";

import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";

/**
 * Client-side providers mounted once at the root layout.
 * - AuthProvider   → single onAuthStateChanged listener for the whole app
 * - MotionConfig   → honors OS "reduce motion" setting for all Framer animations
 * - Toaster        → sonner toast portal (bottom-right, light theme)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          gap={10}
          toastOptions={{
            classNames: {
              toast:
                "!bg-surface-container-lowest !border-line !text-on-surface !rounded-lg !font-sans !shadow-floating",
              title: "!font-semibold",
              description: "!text-on-surface-variant",
              actionButton: "!bg-primary !text-on-primary",
            },
          }}
        />
      </MotionConfig>
    </AuthProvider>
  );
}

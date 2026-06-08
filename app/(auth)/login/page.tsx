import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Nexus Market account.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="h-96 animate-pulse rounded-2xl bg-surface-container" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

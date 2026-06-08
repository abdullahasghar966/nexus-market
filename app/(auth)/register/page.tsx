import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Join Nexus Market as a buyer or vendor.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="h-[36rem] animate-pulse rounded-2xl bg-surface-container" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

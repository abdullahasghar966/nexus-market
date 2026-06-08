"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { signInWithGoogle, registerWithEmail } from "@/lib/auth-helpers";
import { createSession } from "@/lib/session";
import { fadeInUp } from "@/components/animations/variants";
import type { UserRole } from "@/types";

/* ─── Validation schema ──────────────────────────────────────────── */

const schema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});
type Fields = z.infer<typeof schema>;

/* ─── Role option ─────────────────────────────────────────────────── */

const ROLES: {
  value: UserRole;
  label: string;
  icon: "shopping_bag" | "store";
  desc: string;
}[] = [
  {
    value: "customer",
    label: "I'm a Buyer",
    icon: "shopping_bag",
    desc: "Shop from verified vendors",
  },
  {
    value: "vendor",
    label: "I'm a Vendor",
    icon: "store",
    desc: "Sell products on Nexus Market",
  },
];

/* ─── Google icon SVG ────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" />
    </svg>
  );
}

/* ─── Form ───────────────────────────────────────────────────────── */

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Preselect the Vendor tile when arriving from "Become a Vendor" (?role=vendor)
  const [role, setRole] = useState<UserRole>(
    searchParams.get("role") === "vendor" ? "vendor" : "customer",
  );
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) });

  const busy = googleLoading || isSubmitting;

  function redirectAfter(r: string) {
    router.push(r === "vendor" ? "/vendor/dashboard" : "/");
    router.refresh();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const { user, role: sessionRole } = await signInWithGoogle();
      await createSession({
        idToken: await user.getIdToken(),
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "",
        role: sessionRole,
      });
      toast.success(`Welcome, ${user.displayName ?? "there"}!`);
      redirectAfter(sessionRole);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit(data: Fields) {
    try {
      const user = await registerWithEmail(
        data.email,
        data.password,
        data.displayName,
        role,
      );
      await createSession({
        idToken: await user.getIdToken(),
        uid: user.uid,
        email: user.email ?? "",
        displayName: data.displayName,
        role,
      });
      toast.success("Account created! Welcome to Nexus Market.");
      redirectAfter(role);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const msg =
        code === "auth/email-already-in-use"
          ? "That email is already registered. Try signing in instead."
          : code === "auth/operation-not-allowed"
            ? "Email/password sign-up is not enabled — please use Google."
            : code === "auth/weak-password"
              ? "Password is too weak. Please choose a stronger one."
              : err instanceof Error
                ? err.message
                : "Registration failed. Please try again.";
      toast.error(msg);
    }
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-line bg-surface-container-lowest px-8 py-10 shadow-floating">
        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-headline-md text-on-surface">
            Create your account
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Join Nexus Market — buy or sell worldwide.
          </p>
        </div>

        {/* Role selector */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {ROLES.map((opt) => {
            const active = role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                  active
                    ? "border-primary bg-primary-fixed text-primary ring-2 ring-primary/20"
                    : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/40",
                )}
              >
                <Icon name={opt.icon} size={24} filled={active} />
                <span className="text-label-md font-semibold">{opt.label}</span>
                <span className="text-label-sm opacity-75">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleGoogle}
          disabled={busy}
        >
          {googleLoading ? (
            <Icon name="refresh" size={20} className="animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-outline-variant" />
          <span className="text-label-sm text-on-surface-variant">or</span>
          <div className="h-px flex-1 bg-outline-variant" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="displayName"
              className="mb-1.5 block text-label-md text-on-surface"
            >
              Full name
            </label>
            <Input
              id="displayName"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              aria-invalid={!!errors.displayName}
              className={cn(errors.displayName && "border-error")}
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="mt-1 text-label-sm text-error">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="mb-1.5 block text-label-md text-on-surface"
            >
              Email
            </label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              className={cn(errors.email && "border-error")}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-label-sm text-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="mb-1.5 block text-label-md text-on-surface"
            >
              Password
            </label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              aria-invalid={!!errors.password}
              className={cn(errors.password && "border-error")}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-label-sm text-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={busy}
          >
            {isSubmitting ? (
              <>
                <Icon name="refresh" size={20} className="animate-spin" />
                Creating account…
              </>
            ) : (
              `Create ${role === "vendor" ? "Vendor" : "Buyer"} Account`
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

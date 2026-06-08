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
import {
  signInWithGoogle,
  signInWithEmail,
  getUserProfile,
} from "@/lib/auth-helpers";
import { createSession } from "@/lib/session";
import { fadeInUp } from "@/components/animations/variants";

/* ─── Validation schema ──────────────────────────────────────────── */

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type Fields = z.infer<typeof schema>;

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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) });

  const busy = googleLoading || isSubmitting;

  /** Redirect after sign-in: role-based default or back to the `from` page. */
  function redirectAfter(role: string) {
    if (role === "admin") return router.push("/admin");
    if (role === "vendor") return router.push("/vendor/dashboard");
    // Only use `from` for customer routes (never redirect customers to dashboards)
    const safe = from.startsWith("/admin") || from.startsWith("/vendor") ? "/" : from;
    router.push(safe);
    router.refresh();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const { user, role } = await signInWithGoogle();
      await createSession({
        idToken: await user.getIdToken(),
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "",
        role,
      });
      toast.success(`Welcome back, ${user.displayName ?? "there"}!`);
      redirectAfter(role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit(data: Fields) {
    try {
      const user = await signInWithEmail(data.email, data.password);
      const profile = await getUserProfile(user.uid);
      const role = profile?.role ?? "customer";
      await createSession({
        idToken: await user.getIdToken(),
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "",
        role,
      });
      toast.success("Welcome back!");
      redirectAfter(role);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const msg =
        code === "auth/invalid-credential" ||
        code === "auth/user-not-found" ||
        code === "auth/wrong-password"
          ? "Incorrect email or password."
          : code === "auth/too-many-requests"
            ? "Too many attempts. Please wait a moment and try again."
            : code === "auth/operation-not-allowed"
              ? "Email/password sign-in is not enabled. Please use Google."
              : err instanceof Error
                ? err.message
                : "Sign-in failed. Please try again.";
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
        <div className="mb-8 text-center">
          <h1 className="text-headline-md text-on-surface">
            Sign in to Nexus Market
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Welcome back! Please enter your details.
          </p>
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

        {/* Email/password */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-label-md text-on-surface"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              className={cn(errors.email && "border-error focus-visible:ring-error/30")}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-label-sm text-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-label-md text-on-surface">
                Password
              </label>
              <button
                type="button"
                className="text-label-sm text-primary transition-colors hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className={cn(errors.password && "border-error focus-visible:ring-error/30")}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-label-sm text-error">{errors.password.message}</p>
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
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-md text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

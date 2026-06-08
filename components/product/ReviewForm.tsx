"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { addReview } from "@/lib/reviews";

const MIN_BODY = 20;

/**
 * Post-purchase review submission. Auth-gated: signed-out shoppers see a sign-in
 * prompt. On submit the review is written to Firestore and appears live in the
 * list (and in the admin moderation queue).
 */
export function ReviewForm({
  productId,
  productName,
  productSlug,
  onDone,
}: {
  productId: string;
  productName: string;
  productSlug: string;
  onDone?: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="rounded-xl border border-line bg-surface-container-lowest p-6 text-center shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <Icon name="lock" size={24} />
        </span>
        <p className="mt-3 text-body-md text-on-surface">
          Sign in to share your experience with this product.
        </p>
        <Button asChild className="mt-4">
          <Link href={`/login?from=/products/${productSlug}`}>
            <Icon name="account_circle" size={20} /> Sign in to review
          </Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }
    if (body.trim().length < MIN_BODY) {
      setError(`Tell us a little more — at least ${MIN_BODY} characters.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await addReview({
        productId,
        productName,
        userId: user!.uid,
        userName: user!.displayName ?? user!.email ?? "Anonymous",
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });
      toast.success("Thanks for your review!");
      setRating(0);
      setTitle("");
      setBody("");
      onDone?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not submit your review.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card"
    >
      <h3 className="text-headline-md font-semibold text-on-surface">
        Write a review
      </h3>

      {/* Star picker */}
      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (hover || rating) >= n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => {
                setRating(n);
                setError(null);
              }}
              className={cn(
                "transition-colors",
                active ? "text-accent" : "text-outline",
              )}
            >
              <Icon name={active ? "star" : "star_border"} size={28} filled={active} />
            </button>
          );
        })}
        {rating > 0 && (
          <span className="ml-2 text-label-md text-on-surface-variant">
            {rating}/5
          </span>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="mb-1 block text-label-md text-on-surface">
            Title <span className="text-on-surface-variant">(optional)</span>
          </span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum it up in a few words"
            maxLength={80}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-label-md text-on-surface">
            Your review
          </span>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (error) setError(null);
            }}
            rows={4}
            placeholder="What did you like or dislike? How was the quality and the vendor?"
            className="flex w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-body-md text-on-surface shadow-sm transition-colors placeholder:text-on-surface-variant/70 focus:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary"
          />
          <span className="mt-1 block text-label-sm text-on-surface-variant">
            {body.trim().length}/{MIN_BODY} characters minimum
          </span>
        </label>

        {error && (
          <p className="text-label-sm normal-case tracking-normal text-error">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            <Icon name="check" size={18} />
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
          {onDone && (
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

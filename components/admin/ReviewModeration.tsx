"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Stars } from "@/components/ui/stars";
import { Icon } from "@/components/ui/icon";
import { cn, formatDate } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToAllReviews,
  setReviewStatus,
  deleteReview,
  type ReviewStatus,
  type StoredReview,
} from "@/lib/reviews";

const STATUS_PILL: Record<ReviewStatus, string> = {
  published: "bg-success-container text-on-success-container",
  flagged: "bg-error-container text-on-error-container",
  hidden: "bg-surface-variant text-on-surface-variant",
};

export function ReviewModeration() {
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToAllReviews((list) => {
      setReviews(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function moderate(id: string, status: ReviewStatus) {
    try {
      await setReviewStatus(id, status);
      toast.success(`Review ${status}`);
    } catch {
      toast.error("Action failed — admin access required.");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Permanently delete this review?")) return;
    try {
      await deleteReview(id);
      toast.success("Review deleted");
    } catch {
      toast.error("Could not delete review");
    }
  }

  const counts = {
    total: reviews.length,
    published: reviews.filter((r) => r.status === "published").length,
    flagged: reviews.filter((r) => r.status === "flagged").length,
    hidden: reviews.filter((r) => r.status === "hidden").length,
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatChip label="Total" value={counts.total} />
        <StatChip label="Published" value={counts.published} tint="success" />
        <StatChip label="Flagged" value={counts.flagged} tint="error" />
        <StatChip label="Hidden" value={counts.hidden} />
      </div>

      {loading && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-on-surface-variant">
          Loading reviews…
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
            <Icon name="manage_search" size={24} />
          </span>
          <p className="mt-3 text-body-md text-on-surface">No reviews to moderate yet.</p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            Customer reviews submitted on product pages appear here for moderation.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-label-sm font-bold",
                    r.avatarClass,
                  )}
                >
                  {r.initials}
                </span>
                <div>
                  <div className="text-label-md text-on-surface">{r.userName}</div>
                  <div className="text-label-sm text-on-surface-variant">
                    {r.productName || r.productId} · {formatDate(r.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Stars rating={r.rating} size={16} />
                <span
                  className={cn(
                    "inline-flex rounded px-2 py-0.5 text-label-sm font-bold uppercase tracking-wide",
                    STATUS_PILL[r.status],
                  )}
                >
                  {r.status}
                </span>
              </div>
            </div>

            {r.title && (
              <h3 className="text-label-md font-semibold text-on-surface">{r.title}</h3>
            )}
            <p className="mt-1 text-body-md text-on-surface-variant">{r.body}</p>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-outline-variant pt-3">
              {r.status !== "published" && (
                <ActionBtn icon="check_circle" label="Approve" onClick={() => moderate(r.id, "published")} />
              )}
              {r.status !== "flagged" && (
                <ActionBtn icon="warning" label="Flag" onClick={() => moderate(r.id, "flagged")} />
              )}
              {r.status !== "hidden" && (
                <ActionBtn icon="block" label="Hide" onClick={() => moderate(r.id, "hidden")} />
              )}
              <ActionBtn icon="delete" label="Delete" tint="error" onClick={() => remove(r.id)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatChip({
  label,
  value,
  tint,
}: {
  label: string;
  value: number;
  tint?: "success" | "error";
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2">
      <span
        className={cn(
          "text-headline-md font-bold tabular-nums",
          tint === "success"
            ? "text-success"
            : tint === "error"
              ? "text-error"
              : "text-on-surface",
        )}
      >
        {value}
      </span>
      <span className="text-label-md text-on-surface-variant">{label}</span>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  tint,
  onClick,
}: {
  icon: "check_circle" | "warning" | "block" | "delete";
  label: string;
  tint?: "error";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-label-md transition-colors",
        tint === "error"
          ? "border-error/40 text-error hover:bg-error-container/30"
          : "border-outline-variant text-on-surface hover:bg-surface-container-low",
      )}
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  );
}

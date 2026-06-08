"use client";

import { useEffect, useState } from "react";
import { Stars } from "@/components/ui/stars";
import { Icon } from "@/components/ui/icon";
import { cn, formatDate } from "@/lib/utils";
import { SAMPLE_REVIEWS } from "@/lib/data/sample";
import { subscribeToProductReviews, type StoredReview } from "@/lib/reviews";
import { ReviewForm } from "@/components/product/ReviewForm";
import type { Rating } from "@/types";

/**
 * Customer-reviews section: a sticky rating-summary card alongside the review
 * list. Live reviews (Firestore) appear first, ahead of the seeded sample
 * reviews, and the summary average/count blends both. Signed-in shoppers can
 * post a review inline.
 */
export function ProductReviews({
  productId,
  productName,
  productSlug,
  rating,
}: {
  productId: string;
  productName: string;
  productSlug: string;
  rating: Rating;
}) {
  const [live, setLive] = useState<StoredReview[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return subscribeToProductReviews(productId, setLive);
  }, [productId]);

  // Blend the seeded base rating with live reviews for a believable summary.
  const liveSum = live.reduce((s, r) => s + r.rating, 0);
  const totalCount = rating.count + live.length;
  const average =
    totalCount > 0
      ? (rating.average * rating.count + liveSum) / totalCount
      : rating.average;

  return (
    <section className="mt-16 border-t border-line pt-12">
      <h2 className="mb-8 text-headline-lg-mobile text-on-surface md:text-headline-lg">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Summary */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="sticky top-24 rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card">
            <div className="text-display-lg tabular-nums text-on-surface">
              {average.toFixed(1)}
            </div>
            <div className="my-2">
              <Stars rating={average} size={20} />
            </div>
            <p className="mb-6 text-body-md text-on-surface-variant">
              Based on {totalCount.toLocaleString()} reviews
            </p>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="w-full rounded-lg border border-outline-variant py-2 text-label-md text-on-surface transition-colors hover:bg-surface-variant/30"
            >
              {showForm ? "Close" : "Write a Review"}
            </button>
          </div>
        </div>

        {/* Review list */}
        <div className="flex flex-col gap-6 md:col-span-8 lg:col-span-9">
          {showForm && (
            <ReviewForm
              productId={productId}
              productName={productName}
              productSlug={productSlug}
              onDone={() => setShowForm(false)}
            />
          )}

          {/* Live reviews first */}
          {live.map((review) => (
            <ReviewCard
              key={review.id}
              initials={review.initials}
              avatarClass={review.avatarClass}
              name={review.userName}
              date={formatDate(review.createdAt)}
              rating={review.rating}
              title={review.title}
              body={review.body}
              isNew
            />
          ))}

          {/* Seeded sample reviews */}
          {SAMPLE_REVIEWS.map((review) => (
            <ReviewCard
              key={review.id}
              initials={review.initials}
              avatarClass={review.avatarClass}
              name={review.name}
              date={review.date}
              rating={review.rating}
              title={review.title}
              body={review.body}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  initials,
  avatarClass,
  name,
  date,
  rating,
  title,
  body,
  isNew,
}: {
  initials: string;
  avatarClass: string;
  name: string;
  date: string;
  rating: number;
  title?: string;
  body: string;
  isNew?: boolean;
}) {
  return (
    <article className="rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-label-md font-bold",
              avatarClass,
            )}
          >
            {initials}
          </span>
          <div>
            <div className="flex items-center gap-2 text-label-md text-on-surface">
              {name}
              {isNew && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-container px-2 py-0.5 text-label-sm font-bold uppercase tracking-wide text-on-success-container">
                  <Icon name="check_circle" size={12} filled /> Verified
                </span>
              )}
            </div>
            <div className="text-label-sm text-on-surface-variant">{date}</div>
          </div>
        </div>
        <Stars rating={rating} size={18} />
      </div>
      {title && (
        <h3 className="mb-2 text-headline-md text-on-surface">{title}</h3>
      )}
      <p className="text-body-md text-on-surface-variant">{body}</p>
    </article>
  );
}

"use client"

import { createReview } from "@/app/actions/review-actions";
import { AlertCircle, CheckCircle2, Star } from "lucide-react";
import { useActionState, useState } from "react";
import { useT } from "next-i18next/client";

export function ReviewForm({ placeId }: { placeId: number }) {
  const { t } = useT("restaurants");
  const [rating, setRating] = useState(0);
  const reviewAction = createReview.bind(null, placeId);
  const [reviewState, reviewFormAction, isPending] = useActionState(
    reviewAction,
    { error: "", success: "" },
  );

  return (
    <form action={reviewFormAction} className="mt-6 space-y-4">
      {reviewState?.error ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600"
        >
          <AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />
          <p>{reviewState.error}</p>
        </div>
      ) : null}

      {reviewState?.success ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-md-green/15 bg-md-green/10 p-4 text-sm text-md-green"
        >
          <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden="true" />
          <p>{reviewState.success}</p>
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-semibold text-md-brown-dark">
          {t("reviews.form.rating", { defaultValue: "Rating" })}
        </label>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-md-gold hover:text-md-gold/80 focus:outline-none"
              aria-label={t("reviews.form.starRating", {
                star,
                defaultValue: `${star} star rating`,
              })}
              aria-pressed={rating === star}
            >
              <Star
                className={[
                  "h-6 w-6 fill-current",
                  star <= rating
                    ? "text-md-gold"
                    : "text-md-gold/30 hover:text-md-gold",
                ].join(" ")}
              />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
        <input
          type="hidden"
          name="ratingError"
          value={t("reviews.form.ratingError", {
            defaultValue: "Rating must be between 1 and 5",
          })}
        />
        <input
          type="hidden"
          name="commentError"
          value={t("reviews.form.commentError", {
            defaultValue: "Review comment must be at least 3 characters",
          })}
        />
        <input
          type="hidden"
          name="successMessage"
          value={t("reviews.form.success", {
            defaultValue: "Review submitted",
          })}
        />
      </div>

      <div>
        <label
          htmlFor="review"
          className="block text-sm font-semibold text-md-brown-dark"
        >
          {t("reviews.form.reviewLabel", { defaultValue: "Your Review" })}
        </label>
        <textarea
          id="review"
          name="comment"
          rows={4}
          className="mt-2 w-full rounded-lg border border-md-gold/30 bg-white p-4 text-sm text-md-brown-dark placeholder-md-muted focus:border-md-green focus:outline-none focus:ring-1 focus:ring-md-green"
          placeholder={t("reviews.form.placeholder", {
            defaultValue:
              "Tell us about the ambiance, service, and of course, the food...",
          })}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full bg-md-green px-6 py-3 text-sm font-bold text-md-cream transition hover:bg-md-green-soft disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending
          ? t("reviews.form.submitting", { defaultValue: "Submitting..." })
          : t("reviews.form.submit", { defaultValue: "Submit Review" })}
      </button>
    </form>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpDown,
  BadgeCheck,
  CalendarDays,
  Filter,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import {
  getBusinessByOwnerId,
  getListingByBusinessId,
  getReviewsByListingId,
  type ReviewWithProfile,
} from "@/lib/business";
import { getCurrentProfile, requireUser } from "@/lib/auth";

type ReviewsPageProps = {
  searchParams?: Promise<{
    q?: string | string[],
    rating?: string | string[],
    sort?: string | string[],
  }>,
}

type SortKey = "newest" | "oldest" | "highest" | "lowest"

const SORT_OPTIONS: { label: string, value: SortKey }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest rated", value: "highest" },
  { label: "Lowest rated", value: "lowest" },
]

const RATING_FILTERS = [
  { label: "All", value: null },
  { label: "5 stars", value: 5 },
  { label: "4 stars", value: 4 },
  { label: "3 stars", value: 3 },
  { label: "2 stars", value: 2 },
  { label: "1 star", value: 1 },
]

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getReviewRating(review: ReviewWithProfile) {
  const rating = Number(review.rating)

  if (!Number.isFinite(rating)) return 0

  return Math.max(0, Math.min(5, rating))
}

function normalizeRatingFilter(value: string | string[] | undefined) {
  const rating = Number(getParamValue(value))

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null

  return rating
}

function normalizeSort(value: string | string[] | undefined): SortKey {
  const sort = getParamValue(value)

  return SORT_OPTIONS.some((option) => option.value === sort)
    ? (sort as SortKey)
    : "newest"
}

function formatReviewDate(value: string | undefined) {
  if (!value) return "Date unavailable"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Date unavailable"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function formatAverage(value: number) {
  return value > 0 ? value.toFixed(1) : "0.0"
}

function getInitials(name: string | null, email: string | null) {
  const source = (name || email || "Guest").replace(/@.*/, "")
  const parts = source.split(/[\s._-]+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")

  return initials || "G"
}

function buildReviewsHref({
  rating,
  sort,
  q,
}: {
  rating: number | null,
  sort: SortKey,
  q: string,
}) {
  const params = new URLSearchParams()
  const cleanQuery = q.trim()

  if (rating !== null) params.set("rating", String(rating))
  if (sort !== "newest") params.set("sort", sort)
  if (cleanQuery) params.set("q", cleanQuery)

  const query = params.toString()

  return query ? `/business/reviews?${query}` : "/business/reviews"
}

function sortReviews(reviews: ReviewWithProfile[], sort: SortKey) {
  return [...reviews].sort((first, second) => {
    const firstRating = getReviewRating(first)
    const secondRating = getReviewRating(second)
    const firstTime = first.created_at ? Date.parse(first.created_at) : 0
    const secondTime = second.created_at ? Date.parse(second.created_at) : 0

    switch (sort) {
      case "oldest":
        return firstTime - secondTime
      case "highest":
        return secondRating - firstRating || secondTime - firstTime
      case "lowest":
        return firstRating - secondRating || secondTime - firstTime
      case "newest":
      default:
        return secondTime - firstTime
    }
  })
}

function filterReviews({
  reviews,
  rating,
  query,
}: {
  reviews: ReviewWithProfile[],
  rating: number | null,
  query: string,
}) {
  const cleanQuery = query.trim().toLowerCase()

  return reviews.filter((review) => {
    const matchesRating = rating === null || Math.round(getReviewRating(review)) === rating
    const searchableText = [
      review.comment,
      review.author_name,
      review.author_email,
    ].filter(Boolean).join(" ").toLowerCase()
    const matchesQuery = !cleanQuery || searchableText.includes(cleanQuery)

    return matchesRating && matchesQuery
  })
}

function countByRating(reviews: ReviewWithProfile[], rating: number) {
  return reviews.filter((review) => Math.round(getReviewRating(review)) === rating).length
}

function ReviewStars({ rating }: { rating: number }) {
  const safeRating = Math.round(Math.max(0, Math.min(5, rating)))

  return (
    <div className="flex items-center gap-1" aria-label={`${safeRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={[
            "h-4 w-4",
            star <= safeRating
              ? "fill-md-gold text-md-gold"
              : "fill-gray-200 text-gray-200",
          ].join(" ")}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function LockedState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string,
  description: string,
  ctaLabel: string,
  ctaHref: string,
}) {
  return (
    <div className="grid min-h-[calc(100vh-160px)] place-items-center">
      <section className="w-full max-w-3xl rounded-lg border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-md-sand text-md-green">
          <Sparkles className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
          Reviews
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-md-brown-dark">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-md-muted">
          {description}
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href={ctaHref}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-md-green px-5 text-sm font-bold text-white transition hover:bg-md-brown-dark"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>
    </div>
  )
}

function ReviewCard({ review }: { review: ReviewWithProfile }) {
  const rating = getReviewRating(review)
  const authorName = review.author_name || "Moroccool traveler"

  return (
    <article className="rounded-lg border border-md-gold/20 bg-white px-5 py-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-md-sand text-sm font-bold text-md-green">
            {getInitials(review.author_name, review.author_email)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-bold text-md-brown-dark">
              {authorName}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-md-muted">
              {review.author_email ? (
                <span className="break-all">{review.author_email}</span>
              ) : (
                <span>Profile name unavailable</span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatReviewDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full border border-md-gold/25 bg-md-sand px-3 py-2">
          <ReviewStars rating={rating} />
          <span className="text-sm font-bold text-md-brown-dark">{rating}/5</span>
        </div>
      </div>

      <p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-md-muted">
        {review.comment}
      </p>
    </article>
  )
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const user = await requireUser()
  const params = searchParams ? await searchParams : {}
  const [profile, business] = await Promise.all([
    getCurrentProfile(),
    getBusinessByOwnerId(user.id),
  ])

  if (profile?.role !== "business_owner") {
    redirect("/profile")
  }

  if (!business) {
    return (
      <LockedState
        title="Submit your business details first"
        description="Reviews are attached to a Moroccool business listing, so the owner profile needs a business before feedback can appear here."
        ctaLabel="Submit business details"
        ctaHref="/business/signup"
      />
    )
  }

  const listing = await getListingByBusinessId(Number(business.id))

  if (!listing) {
    return (
      <LockedState
        title="Create your listing first"
        description="Guest reviews are connected to the public listing travelers can visit and review."
        ctaLabel="Create listing"
        ctaHref="/business/listing"
      />
    )
  }

  const reviews = await getReviewsByListingId(Number(listing.id))
  const activeRating = normalizeRatingFilter(params.rating)
  const activeSort = normalizeSort(params.sort)
  const activeQuery = (getParamValue(params.q) ?? "").trim()
  const filteredReviews = sortReviews(
    filterReviews({ reviews, rating: activeRating, query: activeQuery }),
    activeSort,
  )
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + getReviewRating(review), 0) / reviews.length
    : 0
  const positiveReviews = reviews.filter((review) => getReviewRating(review) >= 4).length
  const needsFollowUp = reviews.filter((review) => getReviewRating(review) > 0 && getReviewRating(review) <= 3).length
  const profileAttached = reviews.filter((review) => review.author_name || review.author_email).length
  const activeFilterCount =
    (activeRating === null ? 0 : 1) +
    (activeSort === "newest" ? 0 : 1) +
    (activeQuery ? 1 : 0)
  const listingLocation = listing.city || business.city || "Location not set"
  const stats = [
    {
      label: "Total reviews",
      value: String(reviews.length),
      icon: MessageSquareText,
      className: "text-md-green",
    },
    {
      label: "Average rating",
      value: formatAverage(averageRating),
      icon: Star,
      className: "text-md-gold-dark",
    },
    {
      label: "Positive",
      value: String(positiveReviews),
      icon: BadgeCheck,
      className: "text-md-green",
    },
    {
      label: "Follow-up",
      value: String(needsFollowUp),
      icon: TrendingUp,
      className: "text-red-700",
    },
  ]
  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = countByRating(reviews, rating)

    return {
      rating,
      count,
      percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
    }
  })

  return (
    <div className="space-y-6">
      <section className="border-b border-gray-200 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-md-green/20 bg-md-green/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-md-green">
              <Star className="h-4 w-4" aria-hidden="true" />
              Guest feedback
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
              Reviews
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Read traveler reviews for {listing.name}, including the profile details attached to each reviewer.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              Selected listing
            </p>
            <p className="mt-2 text-xl font-bold text-gray-950">
              {listing.name}
            </p>
            <p className="mt-1 text-sm text-gray-600">{listingLocation}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, className }) => (
          <div
            key={label}
            className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm"
          >
            <Icon className={`h-5 w-5 ${className}`} aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-950">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <form action="/business/reviews" className="w-full max-w-xl">
                {activeRating !== null ? (
                  <input type="hidden" name="rating" value={activeRating} />
                ) : null}
                {activeSort !== "newest" ? (
                  <input type="hidden" name="sort" value={activeSort} />
                ) : null}
                <label htmlFor="review-search" className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                  Search reviews
                </label>
                <div className="mt-2 flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="review-search"
                      name="q"
                      type="search"
                      defaultValue={activeQuery}
                      placeholder="Reviewer, email, or comment"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-md-green focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-md-green px-4 text-sm font-bold text-white transition hover:bg-md-brown-dark"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Search
                  </button>
                </div>
              </form>

              {activeFilterCount > 0 ? (
                <Link
                  href="/business/reviews"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </Link>
              ) : null}
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                <Filter className="h-4 w-4" aria-hidden="true" />
                Rating
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {RATING_FILTERS.map((filter) => {
                  const active = activeRating === filter.value
                  const count = filter.value === null
                    ? reviews.length
                    : countByRating(reviews, filter.value)

                  return (
                    <Link
                      key={filter.label}
                      href={buildReviewsHref({
                        rating: filter.value,
                        sort: activeSort,
                        q: activeQuery,
                      })}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition",
                        active
                          ? "border-md-green bg-md-green text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-md-green/35 hover:bg-md-green/5 hover:text-md-green",
                      ].join(" ")}
                    >
                      {filter.value ? (
                        <Star className="h-4 w-4" aria-hidden="true" />
                      ) : null}
                      {filter.label}
                      <span className={active ? "text-white/80" : "text-gray-400"}>
                        {count}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                Sort
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => {
                  const active = activeSort === option.value

                  return (
                    <Link
                      key={option.value}
                      href={buildReviewsHref({
                        rating: activeRating,
                        sort: option.value,
                        q: activeQuery,
                      })}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "inline-flex h-9 items-center rounded-lg border px-3 text-sm font-bold transition",
                        active
                          ? "border-md-green bg-md-green text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-md-green/35 hover:bg-md-green/5 hover:text-md-green",
                      ].join(" ")}
                    >
                      {option.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                Results
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-950">
                {filteredReviews.length} of {reviews.length} reviews
              </h2>
            </div>
          </div>

          {reviews.length === 0 ? (
            <section className="rounded-lg border border-dashed border-md-gold/35 bg-white px-6 py-12 text-center shadow-sm">
              <MessageSquareText className="mx-auto h-10 w-10 text-md-gold-dark" aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold text-md-brown-dark">
                No reviews yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-md-muted">
                Reviews submitted from the public listing page will appear here with the reviewer profile.
              </p>
            </section>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <section className="rounded-lg border border-dashed border-md-gold/35 bg-white px-6 py-12 text-center shadow-sm">
              <Filter className="mx-auto h-10 w-10 text-md-gold-dark" aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold text-md-brown-dark">
                No matching reviews
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-md-muted">
                Adjust the search, rating, or sorting filters to widen the result set.
              </p>
              <Link
                href="/business/reviews"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-md-green px-4 text-sm font-bold text-white transition hover:bg-md-brown-dark"
              >
                Clear filters
              </Link>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-md-green" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                Rating mix
              </p>
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-950">
              Distribution
            </h2>
            <div className="mt-5 space-y-4">
              {ratingBreakdown.map(({ rating, count, percentage }) => (
                <div key={rating}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-1 font-bold text-md-brown-dark">
                      {rating}
                      <Star className="h-3.5 w-3.5 fill-md-gold text-md-gold" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {count} reviews
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-md-green"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-md-gold/20 bg-md-brown-dark px-5 py-5 text-md-cream shadow-sm">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-md-gold" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-md-gold">
                Profile coverage
              </p>
            </div>
            <h2 className="mt-3 text-xl font-bold">
              {profileAttached} of {reviews.length} reviewers identified
            </h2>
            <p className="mt-3 text-sm leading-6 text-md-sand">
              Names and emails appear on review cards when the reviewer profile is available.
            </p>
          </section>
        </aside>
      </section>
    </div>
  )
}

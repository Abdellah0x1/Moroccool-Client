import { getPlaceById } from "@/lib/places";
import {
  formatOpeningHoursValue,
  getOpeningHoursEntries,
} from "@/lib/opening-hours";
import type { Place } from "@/types";
import { getAllReviews, type ReviewWithAuthor } from "@/lib/reveiws";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
  MapPin,
  Phone,
  Star,
  Utensils,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

import { ReviewForm } from "@/components/ReviewForm";
import { ImageGallery } from "@/components/imageGallery";

type RestaurantPageProps = {
  params: Promise<{ id: string }>;
};

type ReviewsCopy = {
  noReviewsTitle: string;
  noReviewsDescription: string;
  authorFallback: string;
  recentVisit: string;
  starsLabel: string;
};

function formatReviewDate(
  value: string | undefined,
  locale: string,
  fallback: string,
) {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale || "en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function ReviewStars({
  rating,
  starsLabel,
}: {
  rating: number;
  starsLabel: string;
}) {
  const safeRating = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex items-center gap-1" aria-label={`${safeRating} ${starsLabel}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={[
            "h-4 w-4",
            star <= safeRating
              ? "fill-md-gold text-md-gold"
              : "fill-md-sand text-md-sand-dark",
          ].join(" ")}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function isPlaceType(place: Place, type: "hotel" | "restaurant" | "cafe") {
  return place.type.toLowerCase() === type;
}

function getOpeningHours(place: Place) {
  return place.openingHours ?? place.opening_hours ?? place.openingHoure ?? null;
}

function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function normalizeExternalUrl(url: string | undefined) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function ReviewsList({
  reviews,
  locale,
  copy,
}: {
  reviews: ReviewWithAuthor[];
  locale: string;
  copy: ReviewsCopy;
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-md-gold/35 bg-md-cream px-6 py-8 text-center">
        <MessageSquare className="mx-auto h-9 w-9 text-md-gold" aria-hidden="true" />
        <h4 className="mt-4 font-display text-2xl font-bold text-md-brown-dark">
          {copy.noReviewsTitle}
        </h4>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-md-muted">
          {copy.noReviewsDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="rounded-lg border border-md-gold/20 bg-white px-5 py-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-md-sand text-md-green">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-semibold text-md-brown-dark">
                  {review.author_name || copy.authorFallback}
                </h4>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-md-muted">
                  {formatReviewDate(review.created_at, locale, copy.recentVisit)}
                </p>
              </div>
            </div>
            <ReviewStars rating={review.rating} starsLabel={copy.starsLabel} />
          </div>

          <p className="mt-4 text-sm leading-7 text-md-muted">
            {review.comment}
          </p>
        </article>
      ))}
    </div>
  );
}

export default async function RestaurantDetails({ params }: RestaurantPageProps) {
  const { t, lng } = await getT("restaurants");
  const { id } = await params;
  const placeResult = await getPlaceById(Number(id));
  const restaurant = placeResult?.[0] as Place | undefined;

  if (!restaurant || !isPlaceType(restaurant, "restaurant")) {
    notFound();
  }

  const mainImage = restaurant.images?.[0] || "/placeholder-restaurant.jpg";
  const reviews = await getAllReviews({ placeId: Number(id) });
  const reviewCountLabel =
    reviews.length === 1
      ? t("detail.reviewSingular", { defaultValue: "review" })
      : t("detail.reviewPlural", { defaultValue: "reviews" });
  const openingHours = getOpeningHours(restaurant);
  const openingHoursEntries = getOpeningHoursEntries(openingHours);
  const websiteUrl = normalizeExternalUrl(restaurant.website);
  const bookingHref = `/restaurants/${restaurant.id}/book`;
  const reviewsCopy: ReviewsCopy = {
    noReviewsTitle: t("detail.noReviewsTitle", {
      defaultValue: "No reviews yet",
    }),
    noReviewsDescription: t("detail.noReviewsDescription", {
      restaurantName: restaurant.name,
      defaultValue:
        "Be the first traveler to share your experience at {{restaurantName}}.",
    }),
    authorFallback: t("detail.authorFallback", {
      defaultValue: "Morocco Discovery traveler",
    }),
    recentVisit: t("detail.recentVisit", { defaultValue: "Recent visit" }),
    starsLabel: t("detail.starsLabel", { defaultValue: "out of 5 stars" }),
  };

  return (
    <main className="min-h-screen bg-md-cream font-body text-md-brown-dark">
      <section className="relative min-h-[60vh] overflow-hidden">
        <Image
          src={mainImage}
          alt={restaurant.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-md-brown-dark/45" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-md-cream to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-7xl items-end px-6 pb-20 pt-36">
          <div className="max-w-4xl">
            <Link
              href="/restaurants"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-md-cream/30 bg-md-brown-dark/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-md-cream backdrop-blur transition hover:bg-md-brown-dark/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("detail.backLink", { defaultValue: "Back to Dining" })}
            </Link>
            <div className="mb-4 ml-4 inline-flex items-center gap-2 rounded-full border border-md-gold/40 bg-md-cream/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-md-gold backdrop-blur">
              <Utensils className="h-4 w-4" aria-hidden="true" />
              {t("detail.badge", { defaultValue: "Restaurant Guide" })}
            </div>
            <h1 className="max-w-4xl font-display text-5xl font-bold leading-tight text-md-cream drop-shadow md:text-6xl">
              {restaurant.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-md-cream/90 drop-shadow">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-md-gold" aria-hidden="true" />
                <span>{restaurant.address}, {restaurant.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-md-gold" aria-hidden="true" />
                <span className="font-semibold">{restaurant.rating} / 5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-16">
        <article className="space-y-8 text-md-brown-dark">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-md-gold-dark">
              {t("detail.experienceEyebrow", {
                defaultValue: "The Experience",
              })}
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              {t("detail.experienceTitle", {
                defaultValue: "A symphony of texture, taste, and tradition.",
              })}
            </h2>
            <div className="mt-6 space-y-6 text-base leading-8 text-md-muted md:text-lg">
              <p>
                {t("detail.paragraphOne", {
                  city: restaurant.city,
                  name: restaurant.name,
                  defaultValue:
                    "Nestled in the vibrant heart of {{city}}, {{name}} offers a dining experience that bridges generations of culinary heritage and modern gastronomy. Every dish is a testament to the rich, sun-drenched landscapes and bustling souks of Morocco.",
                })}
              </p>
              <p>
                {t("detail.paragraphTwo", {
                  defaultValue:
                    "From the moment you step inside, the atmosphere envelops you with warm ochre tones, the subtle scent of toasted cumin and orange blossom, and the gentle hum of intimate conversations. The menu is thoughtfully curated, focusing on seasonal ingredients sourced from local artisans.",
                })}
              </p>
              <p>
                {t("detail.paragraphThree", {
                  city: restaurant.city,
                  name: restaurant.name,
                  defaultValue:
                    "Whether you are seeking a slow-paced evening of fine dining or a spirited gathering, {{name}} promises an unforgettable journey through taste and texture, perfectly capturing the heartbeat of {{city}}.",
                })}
              </p>
            </div>
          </div>

          {restaurant.images && restaurant.images.length > 1 && (
            <ImageGallery images={restaurant.images.slice(1, 3)} name={restaurant.name} />
          )}

          <div className="mt-12 border-t border-md-gold/20 pt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-display text-2xl font-bold text-md-brown-dark">
                  {t("detail.leaveReviewTitle", { defaultValue: "Leave a Review" })}
                </h3>
                <p className="mt-2 text-sm text-md-muted">
                  {t("detail.shareReviewDescription", {
                    restaurantName: restaurant.name,
                    defaultValue:
                      "Share your experience at {{restaurantName}} with other travelers.",
                  })}
                </p>
              </div>
              <div className="rounded-full border border-md-gold/25 bg-white px-4 py-2 text-sm font-bold text-md-green">
                {reviews.length} {reviewCountLabel}
              </div>
            </div>
            <ReviewForm placeId={Number(id)} />

            <div className="mt-10">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                  {t("detail.travelerNotes", { defaultValue: "Traveler notes" })}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-md-brown-dark">
                  {t("detail.reviewsFor", {
                    restaurantName: restaurant.name,
                    defaultValue: "Reviews for {{restaurantName}}",
                  })}
                </h3>
              </div>
              <ReviewsList reviews={reviews} locale={lng} copy={reviewsCopy} />
            </div>
          </div>
        </article>

        <aside className="sticky top-24 rounded-xl border border-md-gold/20 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="font-display text-2xl font-bold text-md-brown-dark">
            {t("detail.essentialsTitle", {
              defaultValue: "Traveler Essentials",
            })}
          </h3>
          <p className="mt-2 text-sm text-md-muted">
            {t("detail.essentialsDescription", {
              restaurantName: restaurant.name,
              defaultValue:
                "Everything you need to plan your visit to {{restaurantName}}.",
            })}
          </p>

          <div className="my-8 h-px w-full bg-md-gold/20" />

          <ul className="space-y-6 text-sm">
            <li className="flex items-start gap-4">
              <Clock className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
              <div>
                <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                  {t("detail.hours", { defaultValue: "Hours" })}
                </div>
                {openingHoursEntries.length > 0 ? (
                  <div className="mt-1 space-y-1 text-md-muted">
                    {openingHoursEntries.map(([days, hours]) => (
                      <div key={days}>
                        <span className="font-semibold capitalize text-md-brown-dark">
                          {days}:
                        </span>{" "}
                        {formatOpeningHoursValue(hours)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-1 text-md-muted">
                    {t("detail.hoursUnavailable", {
                      defaultValue: "Hours not available",
                    })}
                  </div>
                )}
              </div>
            </li>
            <li className="flex items-start gap-4">
              <MapPin className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
              <div>
                <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                  {t("detail.location", { defaultValue: "Location" })}
                </div>
                <div className="mt-1 text-md-muted">{restaurant.address}</div>
                <div className="text-md-muted">
                  {restaurant.city}, {t("detail.country", { defaultValue: "Morocco" })}
                </div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Phone className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
              <div>
                <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                  {t("detail.contact", { defaultValue: "Contact" })}
                </div>
                {restaurant.phone ? (
                  <a
                    href={getPhoneHref(restaurant.phone)}
                    className="mt-1 block text-md-muted transition hover:text-md-green"
                  >
                    {restaurant.phone}
                  </a>
                ) : (
                  <div className="mt-1 text-md-muted">
                    {t("detail.phoneUnavailable", {
                      defaultValue: "Phone not available",
                    })}
                  </div>
                )}
              </div>
            </li>
            {websiteUrl ? (
              <li className="flex items-start gap-4">
                <ExternalLink className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
                <div>
                  <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                    {t("detail.website", { defaultValue: "Website" })}
                  </div>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-words text-md-muted transition hover:text-md-green"
                  >
                    {restaurant.website}
                  </a>
                </div>
              </li>
            ) : null}
            <li className="flex items-start gap-4">
              <Star className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
              <div>
                <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                  {t("detail.rating", { defaultValue: "Rating" })}
                </div>
                <div className="mt-1 text-md-muted">
                  {t("detail.ratingText", {
                    rating: restaurant.rating,
                    defaultValue: "{{rating}} out of 5 stars",
                  })}
                </div>
              </div>
            </li>
          </ul>

          <div className="mt-8">
            <Link
              href={bookingHref}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-md-brown-dark px-6 py-4 text-sm font-bold text-md-cream shadow-md transition-all hover:bg-md-gold hover:text-md-brown-dark hover:shadow-lg"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {t("detail.bookTable", { defaultValue: "Book a Table" })}
            </Link>
            <p className="mt-4 text-center text-xs text-md-muted">
              {t("detail.reservationsNote", {
                defaultValue: "Table requests are confirmed by the restaurant.",
              })}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

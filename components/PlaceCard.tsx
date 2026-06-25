"use client";

import { ArrowRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useT } from "next-i18next/client";
import { useRouter } from "next/navigation";

import type { Place } from "@/types";

function normalizePlaceType(type: Place["type"]) {
  return type.toLowerCase() as "hotel" | "restaurant" | "cafe";
}

function getPlaceTypeKey(type: Place["type"]) {
  switch (normalizePlaceType(type)) {
    case "hotel":
      return "hotel";
    case "restaurant":
      return "restaurant";
    case "cafe":
      return "cafe";
    default:
      return String(type).toLowerCase();
  }
}

function clampRating(rating: number | null | undefined) {
  if (typeof rating !== "number" || Number.isNaN(rating)) return null;
  return Math.max(0, Math.min(5, rating));
}

export function PlaceCard({
  place,
  actionLabel,
  actionHref,
}: {
  place: Place;
  actionLabel?: string;
  actionHref?: string;
}) {
  const { t } = useT("places");
  const imageSrc = place.images?.[0];
  const rating = clampRating(place.rating);
  const placeType = normalizePlaceType(place.type);
  const detailHref =
    placeType === "hotel" ? `/accomodation/${place.id}` : `/${placeType}s/${place.id}`;
  const detailLabel = actionLabel ?? t("card.viewDetails", { defaultValue: "View details" });
  const href = actionHref ?? detailHref;
  const router = useRouter();

  return (
    <article onClick={() => router.push(detailHref)} className="group overflow-hidden rounded-lg border border-md-gold/20 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-md-gold/35 hover:shadow-lg">
      <div className="relative aspect-4/3 w-full bg-md-sand">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-sm font-body text-md-muted">
              {t("card.noImage", { defaultValue: "No image" })}
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-md-brown-dark/75 via-md-brown-dark/15 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-md-gold/30 bg-md-cream/95 px-3 py-1 text-xs font-body font-bold uppercase tracking-[0.12em] text-md-brown-dark backdrop-blur">
            {t(`card.type.${getPlaceTypeKey(place.type)}`, {
              defaultValue: place.type,
            })}
          </span>
        </div>

        {rating !== null ? (
          <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-md-gold/30 bg-md-cream/95 px-3 py-1 text-xs font-body font-bold text-md-brown-dark backdrop-blur">
            <Star className="h-4 w-4 fill-md-gold text-md-gold" aria-hidden="true" />
            <span>{rating.toFixed(1)}</span>
          </div>
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="text-xs font-body uppercase tracking-[0.18em] text-md-cream/80">
            {place.city}
          </div>
          <h3 className="mt-2 line-clamp-2 font-display text-2xl font-semibold leading-tight text-md-cream">
            {place.name}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 flex-none text-md-gold-dark" aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-md-muted">
              {t("card.address", { defaultValue: "Address" })}
            </div>
            <div className="mt-1 line-clamp-2 font-body text-sm leading-6 text-md-brown-dark">
              {place.address}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-md-gold/15 pt-5">
          <span className="text-sm font-body font-bold text-md-green">
            {t("card.curatedPick", { defaultValue: "Curated pick" })}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full bg-md-brown-dark px-4 py-2 text-sm font-bold text-md-cream transition group-hover:bg-md-gold group-hover:text-md-brown-dark"
          >
            {detailLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

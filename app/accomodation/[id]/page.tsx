import { getPlaceById } from "@/lib/places";
import type { Place } from "@/types";
import {
  ArrowLeft,
  Bed,
  CalendarCheck,
  Clock,
  ConciergeBell,
  ExternalLink,
  Hotel,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

type AccommodationPageProps = {
  params: Promise<{ id: string }>;
};

function parsePlaceId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function formatRating(
  rating: number | null | undefined,
  newLabel: string,
) {
  if (typeof rating !== "number" || Number.isNaN(rating)) return newLabel;
  return `${Math.max(0, Math.min(5, rating)).toFixed(1)} / 5`;
}

function isPlaceType(place: Place, type: "hotel" | "restaurant" | "cafe") {
  return place.type.toLowerCase() === type;
}

function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function normalizeExternalUrl(url: string | undefined) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default async function AccommodationDetails({
  params,
}: AccommodationPageProps) {
  const { t } = await getT("places");
  const { id } = await params;
  const placeId = parsePlaceId(id);

  if (!placeId) {
    notFound();
  }

  const placeResult = await getPlaceById(placeId);
  const stay = placeResult?.[0] as Place | undefined;

  if (!stay || !isPlaceType(stay, "hotel")) {
    notFound();
  }

  const newRatingLabel = t("stays.detail.newRating", { defaultValue: "New" });
  const ratingLabel = formatRating(stay.rating, newRatingLabel);
  const mainImage = stay.images?.[0] || "/images/hero.jpg";
  const galleryImages = stay.images?.slice(1, 4) || [];
  const websiteUrl = normalizeExternalUrl(stay.website);
  const requestHref = `/accomodation/${stay.id}/book`;
  const requestLabel = t("stays.detail.requestStay", {
    defaultValue: "Request this stay",
  });

  return (
    <main className="min-h-screen bg-md-cream font-body text-md-brown-dark">
      <section className="relative min-h-[72vh] overflow-hidden">
        <Image
          src={mainImage}
          alt={stay.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-md-brown-dark/45" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-md-cream to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl items-end px-6 pb-20 pt-36">
          <div className="max-w-4xl">
            <Link
              href="/accomodation"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-md-cream/30 bg-md-brown-dark/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-md-cream backdrop-blur transition hover:bg-md-brown-dark/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("stays.detail.backLink", { defaultValue: "Back to stays" })}
            </Link>
            <div className="mb-4 ml-4 inline-flex items-center gap-2 rounded-full border border-md-gold/40 bg-md-cream/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-md-gold backdrop-blur">
              <Hotel className="h-4 w-4" aria-hidden="true" />
              {t("stays.detail.badge", { defaultValue: "Curated Stay" })}
            </div>
            <h1 className="max-w-4xl font-display text-5xl font-bold leading-tight text-md-cream drop-shadow md:text-7xl">
              {stay.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-md-cream/90 drop-shadow">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-md-gold" aria-hidden="true" />
                <span>
                  {stay.address}, {stay.city}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-md-gold text-md-gold" aria-hidden="true" />
                <span className="font-semibold">{ratingLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.45fr_0.85fr] lg:items-start lg:gap-16">
        <article className="space-y-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-md-gold-dark">
              {t("stays.detail.sectionEyebrow", { defaultValue: "The Stay" })}
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold text-md-brown-dark md:text-5xl">
              {t("stays.detail.title", {
                city: stay.city,
                defaultValue: "A calm base for discovering {{city}}.",
              })}
            </h2>
            <div className="mt-6 space-y-6 text-base leading-8 text-md-muted md:text-lg">
              <p>
                {t("stays.detail.paragraphOne", {
                  name: stay.name,
                  defaultValue:
                    "{{name}} brings together the comfort of a considered stay with the texture of its local setting. It is a refined place to pause between long walks, market visits, dining plans, and the slower moments that make travel memorable.",
                })}
              </p>
              <p>
                {t("stays.detail.paragraphTwo", {
                  city: stay.city,
                  defaultValue:
                    "The experience is shaped around atmosphere, useful location, and easy access to the rhythms of {{city}}. Use it as a settled home base while exploring nearby streets, cultural stops, and restaurants across the city.",
                })}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Bed,
                label: t("stays.detail.cards.bestForLabel", {
                  defaultValue: "Best for",
                }),
                value: t("stays.detail.cards.bestForValue", {
                  defaultValue: "Restful city stay",
                }),
              },
              {
                icon: Sparkles,
                label: t("stays.detail.cards.moodLabel", { defaultValue: "Mood" }),
                value: t("stays.detail.cards.moodValue", {
                  defaultValue: "Curated comfort",
                }),
              },
              {
                icon: ShieldCheck,
                label: t("stays.detail.cards.pickTypeLabel", {
                  defaultValue: "Pick type",
                }),
                value: t("stays.detail.cards.pickTypeValue", {
                  defaultValue: "Verified hotel",
                }),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-md-gold/20 bg-white px-5 py-5 shadow-sm"
              >
                <Icon className="h-5 w-5 text-md-green" aria-hidden="true" />
                <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                  {label}
                </div>
                <div className="mt-2 font-display text-2xl font-semibold text-md-brown-dark">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-8 shadow-sm">
            <h2 className="font-display text-3xl font-bold text-md-brown-dark">
              {t("stays.detail.whyTitle", { defaultValue: "Why stay here" })}
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {[
                {
                  icon: MapPin,
                  title: t("stays.detail.whyLocationTitle", {
                    defaultValue: "Location-led",
                  }),
                  text: t("stays.detail.whyLocationText", {
                    city: stay.city,
                    defaultValue:
                      "A practical base for exploring {{city}}, with the address clearly available for planning arrivals and routes.",
                  }),
                },
                {
                  icon: ConciergeBell,
                  title: t("stays.detail.whyTravelTitle", {
                    defaultValue: "Travel-ready",
                  }),
                  text: t("stays.detail.whyTravelText", {
                    defaultValue:
                      "Useful for travelers who want comfort, atmosphere, and an easier transition between city discovery and downtime.",
                  }),
                },
                {
                  icon: Wifi,
                  title: t("stays.detail.whyEaseTitle", {
                    defaultValue: "Everyday ease",
                  }),
                  text: t("stays.detail.whyEaseText", {
                    defaultValue:
                      "A stay profile designed around the essentials guests expect while planning a smooth Moroccan itinerary.",
                  }),
                },
                {
                  icon: Star,
                  title: t("stays.detail.whySignalTitle", {
                    defaultValue: "Guest signal",
                  }),
                  text: t("stays.detail.whySignalText", {
                    rating: ratingLabel,
                    defaultValue: "Current rating: {{rating}}.",
                  }),
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-lg border border-md-sand-dark bg-md-cream px-5 py-5"
                >
                  <Icon className="h-5 w-5 text-md-green" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-2xl font-bold text-md-brown-dark">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-md-muted">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {galleryImages.length > 0 ? (
            <section>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-md-gold-dark">
                  {t("stays.detail.galleryEyebrow", { defaultValue: "Gallery" })}
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-md-brown-dark">
                  {t("stays.detail.galleryTitle", { defaultValue: "A closer look" })}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {galleryImages.map((image, index) => (
                  <div
                    key={image}
                    className="relative h-64 overflow-hidden rounded-lg border border-md-gold/10 bg-md-sand shadow-sm"
                  >
                    <Image
                      src={image}
                      alt={t("stays.detail.galleryAlt", {
                        name: stay.name,
                        index: index + 1,
                        defaultValue: "{{name}} gallery image {{index}}",
                      })}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition duration-700 hover:scale-[1.04]"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <aside className="sticky top-24 rounded-lg border border-md-gold/20 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-3xl font-bold text-md-brown-dark">
            {t("stays.detail.essentialsTitle", {
              defaultValue: "Stay essentials",
            })}
          </h2>
          <p className="mt-2 text-sm leading-6 text-md-muted">
            {t("stays.detail.essentialsDescription", {
              name: stay.name,
              defaultValue: "Key details for planning your arrival at {{name}}.",
            })}
          </p>

          <div className="my-8 h-px w-full bg-md-gold/20" />

          <ul className="space-y-6 text-sm">
            <li className="flex items-start gap-4">
              <MapPin className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
              <div>
                <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                  {t("stays.detail.location", { defaultValue: "Location" })}
                </div>
                <div className="mt-1 text-md-muted">{stay.address}</div>
                <div className="text-md-muted">
                  {stay.city}, {t("stays.detail.country", { defaultValue: "Morocco" })}
                </div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Clock className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
              <div>
                <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                  {t("stays.detail.checkIn", { defaultValue: "Check-in" })}
                </div>
                <div className="mt-1 text-md-muted">
                  {t("stays.detail.checkInTime", { defaultValue: "From 3:00 PM" })}
                </div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Clock className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
              <div>
                <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                  {t("stays.detail.checkOut", { defaultValue: "Check-out" })}
                </div>
                <div className="mt-1 text-md-muted">
                  {t("stays.detail.checkOutTime", { defaultValue: "Until 11:00 AM" })}
                </div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Phone className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
              <div>
                <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                  {t("stays.detail.contact", { defaultValue: "Contact" })}
                </div>
                {stay.phone ? (
                  <a
                    href={getPhoneHref(stay.phone)}
                    className="mt-1 block text-md-muted transition hover:text-md-green"
                  >
                    {stay.phone}
                  </a>
                ) : (
                  <div className="mt-1 text-md-muted">
                    {t("stays.detail.phoneUnavailable", {
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
                    {t("stays.detail.website", { defaultValue: "Website" })}
                  </div>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-words text-md-muted transition hover:text-md-green"
                  >
                    {stay.website}
                  </a>
                </div>
              </li>
            ) : null}
            <li className="flex items-start gap-4">
              <Star className="h-5 w-5 flex-none text-md-green" aria-hidden="true" />
              <div>
                <div className="font-bold uppercase tracking-wider text-md-brown-dark">
                  {t("stays.detail.rating", { defaultValue: "Rating" })}
                </div>
                <div className="mt-1 text-md-muted">{ratingLabel}</div>
              </div>
            </li>
          </ul>

          <div className="mt-8">
            <Link
              href={requestHref}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-md-brown-dark px-6 py-4 text-sm font-bold text-md-cream shadow-md transition hover:bg-md-gold hover:text-md-brown-dark hover:shadow-lg"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {requestLabel}
            </Link>
            <p className="mt-4 text-center text-xs leading-5 text-md-muted">
              {t("stays.detail.availabilityNote", {
                defaultValue: "Availability and rates should be confirmed before booking.",
              })}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

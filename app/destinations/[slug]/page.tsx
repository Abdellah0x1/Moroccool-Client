import { getCityBySlug } from "@/lib/cities";
import { getPlaces } from "@/lib/places";
import type { City, Place } from "@/types";
import {
  ArrowRight,
  Bed,
  Coffee,
  Compass,
  Hotel,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

type DestinationPageProps = {
  params: Promise<{ slug: string }>;
};

function getPrimaryImage(places: Place[], fallback: string) {
  return places.find((place) => place.images?.[0])?.images[0] ?? fallback;
}

function PlacePreviewList({
  places,
  emptyText,
}: {
  places: Place[];
  emptyText: string;
}) {
  if (places.length === 0) {
    return (
      <p className="font-body text-sm leading-6 text-md-muted">
        {emptyText}
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {places.slice(0, 3).map((place) => (
        <div key={place.id} className="flex items-start gap-3">
          <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-md-gold" />
          <div className="min-w-0">
            <div className="line-clamp-1 font-body text-sm font-semibold text-md-brown-dark">
              {place.name}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-md-muted">
              <MapPin className="h-3.5 w-3.5 flex-none text-md-gold-dark" />
              <span className="line-clamp-1">{place.address}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { t } = await getT("places");
  const { slug } = await params;
  const cityResult = (await getCityBySlug(slug)) as City[] | null | undefined;
  const city = cityResult?.[0];

  if (!city) {
    notFound();
  }

  const [restaurants, cafes, hotels] = await Promise.all([
    getPlaces({ city: city.name, type: "restaurant", limit: 4 }),
    getPlaces({ city: city.name, type: "cafe", limit: 4 }),
    getPlaces({ city: city.name, type: "hotel", limit: 4 }),
  ]);

  const diningPlaces = [...cafes, ...restaurants].slice(0, 4);
  const accommodationPlaces = hotels.slice(0, 4);
  const cityQuery = encodeURIComponent(city.name);
  const emptyPicks = t("destinationDetail.emptyPicks", {
    defaultValue: "Fresh picks are being curated for this city.",
  });

  return (
    <main className="min-h-screen bg-md-cream font-body text-md-brown-dark">
      <section className="relative min-h-[78vh] overflow-hidden">
        <Image
          src={city.image}
          alt={city.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-md-brown-dark/45" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-md-cream to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-20 pt-36">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-md-gold/40 bg-md-cream/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-md-gold backdrop-blur">
              <Compass className="h-4 w-4" />
              {t("destinationDetail.badge", { defaultValue: "Destination Guide" })}
            </div>
            <h1 className="max-w-4xl font-display text-5xl font-bold leading-tight text-md-cream drop-shadow md:text-7xl">
              {city.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-md-sand drop-shadow md:text-xl">
              {city.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-md-gold-dark">
            {t("destinationDetail.introEyebrow", {
              defaultValue: "Heartbeat of the City",
            })}
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold text-md-brown-dark md:text-5xl">
            {t("destinationDetail.introTitle", {
              defaultValue:
                "A city guide shaped around texture, taste, and a sense of place.",
            })}
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-md-muted md:text-lg">
            {t("destinationDetail.introDescription", {
              city: city.name,
              defaultValue:
                "Use this guide as a refined starting point for {{city}}: pair slow cultural wandering with intimate dining rooms, considered cafes, and stays that keep you close to the city's most memorable rhythms.",
            })}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            {
              icon: Sparkles,
              label: t("destinationDetail.stats.moodLabel", { defaultValue: "Mood" }),
              value: t("destinationDetail.stats.moodValue", {
                defaultValue: "Editorial discovery",
              }),
            },
            {
              icon: ShieldCheck,
              label: t("destinationDetail.stats.focusLabel", { defaultValue: "Focus" }),
              value: t("destinationDetail.stats.focusValue", {
                defaultValue: "Curated picks",
              }),
            },
            {
              icon: Star,
              label: t("destinationDetail.stats.styleLabel", { defaultValue: "Style" }),
              value: t("destinationDetail.stats.styleValue", {
                defaultValue: "Modern Moorish",
              }),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-md-gold/20 bg-white px-5 py-5 shadow-sm"
            >
              <Icon className="h-5 w-5 text-md-green" />
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                {label}
              </div>
              <div className="mt-2 font-display text-2xl font-semibold text-md-brown-dark">
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-md-gold-dark">
                {t("destinationDetail.thingsEyebrow", {
                  defaultValue: "Things to do",
                })}
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold text-md-brown-dark md:text-5xl">
                {t("destinationDetail.nextStopTitle", {
                  city: city.name,
                  defaultValue: "Choose your next stop in {{city}}",
                })}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-md-muted">
              {t("destinationDetail.nextStopDescription", {
                defaultValue:
                  "Two focused paths for the parts of the journey travelers book, revisit, and recommend: where to eat, and where to stay.",
              })}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <article className="overflow-hidden rounded-lg border border-md-gold/20 bg-md-cream shadow-sm">
              <div className="relative h-72">
                <Image
                  src={getPrimaryImage(diningPlaces, city.image)}
                  alt={t("destinationDetail.diningAlt", {
                    city: city.name,
                    defaultValue: "Cafes and restaurants in {{city}}",
                  })}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-md-brown-dark/80 via-md-brown-dark/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-md-cream/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-md-green">
                    <Coffee className="h-4 w-4" />
                    {t("destinationDetail.diningBadge", {
                      defaultValue: "Cafes & Restaurants",
                    })}
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-bold text-md-cream">
                    {t("destinationDetail.diningTitle", {
                      defaultValue: "Taste the city",
                    })}
                  </h3>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-sm leading-7 text-md-muted">
                  {t("destinationDetail.diningDescription", {
                    city: city.name,
                    defaultValue:
                      "From atmospheric cafes to polished dining rooms, follow the flavors that give {{city}} its daily tempo.",
                  })}
                </p>
                <div className="mt-6">
                  <PlacePreviewList places={diningPlaces} emptyText={emptyPicks} />
                </div>
                <Link
                  href={`/restaurants?city=${cityQuery}`}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-md-green px-5 py-3 text-sm font-bold text-md-cream transition hover:bg-md-green-soft"
                >
                  <Utensils className="h-4 w-4" />
                  {t("destinationDetail.diningCta", {
                    defaultValue: "Explore dining",
                  })}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            <article className="overflow-hidden rounded-lg border border-md-gold/20 bg-md-cream shadow-sm">
              <div className="relative h-72">
                <Image
                  src={getPrimaryImage(accommodationPlaces, city.image)}
                  alt={t("destinationDetail.staysAlt", {
                    city: city.name,
                    defaultValue: "Hotels and accommodations in {{city}}",
                  })}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-md-brown-dark/80 via-md-brown-dark/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-md-cream/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-md-green">
                    <Hotel className="h-4 w-4" />
                    {t("destinationDetail.staysBadge", {
                      defaultValue: "Hotels & Accommodations",
                    })}
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-bold text-md-cream">
                    {t("destinationDetail.staysTitle", {
                      defaultValue: "Stay close to the story",
                    })}
                  </h3>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-sm leading-7 text-md-muted">
                  {t("destinationDetail.staysDescription", {
                    defaultValue:
                      "Pick stays with character, comfort, and a strong sense of place, from calm riads to refined city hotels.",
                  })}
                </p>
                <div className="mt-6">
                  <PlacePreviewList
                    places={accommodationPlaces}
                    emptyText={emptyPicks}
                  />
                </div>
                <Link
                  href={`/accomodation?city=${cityQuery}`}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-md-brown-dark px-5 py-3 text-sm font-bold text-md-cream transition hover:bg-md-gold hover:text-md-brown-dark"
                >
                  <Bed className="h-4 w-4" />
                  {t("destinationDetail.staysCta", {
                    defaultValue: "Explore stays",
                  })}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

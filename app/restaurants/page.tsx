import { RestaurantFilter } from "@/components/RestaurantFilter";
import { PlaceCard } from "@/components/PlaceCard";
import { getPlaces } from "@/lib/places";
import { Coffee, MapPin, Star, Utensils } from "lucide-react";
import Image from "next/image";
import { getT } from "next-i18next/server";
import { getAllCities } from "@/lib/cities";

type SearchParams = {
  city?: string;
  query?: string;
  page?: string;
  limit?: string;
};

function cleanParam(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function EmptyResults({
  copy,
}: {
  copy: {
    title: string;
    description: string;
  };
}) {
  return (
    <div className="rounded-lg border border-dashed border-md-gold/35 bg-white px-6 py-14 text-center">
      <Coffee className="mx-auto h-10 w-10 text-md-gold" aria-hidden="true" />
      <h3 className="mt-5 font-display text-3xl font-bold text-md-brown-dark">
        {copy.title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-md-muted">
        {copy.description}
      </p>
    </div>
  );
}

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { t } = await getT("restaurants");
  const params = await searchParams;
  const city = cleanParam(params.city);
  const query = cleanParam(params.query);
  const page = positiveNumber(params.page, 1);
  const limit = positiveNumber(params.limit, 9);

  const restaurants = await getPlaces({
    city,
    type: "restaurant",
    page,
    limit,
    name: query,
  });
  const cities = [...new Set(restaurants.map((r) => r.city).filter(Boolean))] as string[];

  const resultLabel =
    restaurants.length === 1
      ? t("list.resultSingular", { defaultValue: "restaurant" })
      : t("list.resultPlural", { defaultValue: "restaurants" });
  const emptyDescription = t("list.emptyDescription", {
    queryPart: query
      ? t("list.emptyQueryPart", {
        query,
        defaultValue: ` than "${query}"`,
      })
      : "",
    cityPart: city
      ? t("list.emptyCityPart", {
        city,
        defaultValue: ` in ${city}`,
      })
      : "",
    defaultValue:
      "Try a different city or a broader search term{{queryPart}}{{cityPart}}.",
  });

  return (
    <main className="min-h-screen bg-md-cream font-body text-md-brown-dark">
      <section className="relative overflow-hidden bg-md-brown-dark px-6 pb-16 pt-44 md:pt-36">
        <Image
          src="https://res.cloudinary.com/dcw6rqiaz/image/upload/v1781467893/360_F_312194404_c7wNjaDr2ee3bI9OWN7Y6OOIJFD6EJMg_lodzse.jpg"
          alt={t("list.heroAlt", { defaultValue: "Moroccan dining room" })}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-md-brown-dark/45" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-md-gold/40 bg-md-cream/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-md-gold backdrop-blur">
              <Utensils className="h-4 w-4" aria-hidden="true" />
              {t("list.eyebrow", { defaultValue: "Fine Dining" })}
            </div>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-tight text-md-cream md:text-7xl">
              {t("list.title", {
                defaultValue: "Restaurants worth planning the day around.",
              })}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-md-sand md:text-lg">
              {t("list.description", {
                defaultValue:
                  "Explore polished dining rooms, memorable Moroccan tables, and city-specific picks for food-led travel across Morocco.",
              })}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              {
                icon: Star,
                label: t("list.resultsLabel", { defaultValue: "Results" }),
                value: `${restaurants.length} ${resultLabel}`,
              },
              {
                icon: MapPin,
                label: t("list.locationLabel", { defaultValue: "Location" }),
                value:
                  city ?? t("list.allCities", { defaultValue: "All cities" }),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-md-gold/20 bg-md-cream/95 px-5 py-4 shadow-sm backdrop-blur"
              >
                <Icon className="h-5 w-5 text-md-green" aria-hidden="true" />
                <div className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                  {label}
                </div>
                <div className="mt-1 font-display text-2xl font-semibold text-md-brown-dark">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-md-gold/15 bg-md-sand px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <RestaurantFilter
            title={t("list.filterTitle", { defaultValue: "Find a table" })}
            searchPlaceholder={t("list.searchPlaceholder", {
              defaultValue: "Search restaurant or cuisine",
            })}
            cities={cities}
            submitLabel={t("list.submitLabel", { defaultValue: "Show dining" })}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-md-gold-dark">
              {t("list.directoryEyebrow", {
                defaultValue: "Dining directory",
              })}
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-md-brown-dark">
              {t("list.foundLabel", {
                count: restaurants.length,
                resultLabel,
                defaultValue: "{{count}} {{resultLabel}} found",
              })}
            </h2>
          </div>

          {(city || query) && (
            <div className="flex flex-wrap gap-2">
              {city ? (
                <span className="rounded-full border border-md-gold/25 bg-white px-3 py-1 text-xs font-bold text-md-green">
                  {city}
                </span>
              ) : null}
              {query ? (
                <span className="rounded-full border border-md-gold/25 bg-white px-3 py-1 text-xs font-bold text-md-green">
                  {query}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                actionHref={`/restaurants/${place.id}/book`}
                actionLabel={t("list.actionLabel", {
                  defaultValue: "Book table",
                })}
              />
            ))}
          </div>
        ) : (
          <EmptyResults
            copy={{
              title: t("list.emptyTitle", {
                defaultValue: "No dining picks found",
              }),
              description: emptyDescription,
            }}
          />
        )}
      </section>
    </main>
  );
}

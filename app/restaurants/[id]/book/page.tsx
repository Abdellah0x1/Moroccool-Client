import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  LogIn,
  MapPin,
  Phone,
  ShieldCheck,
  Utensils,
  UsersRound,
} from "lucide-react";
import { RestaurantBookingForm } from "@/components/RestaurantBookingForm";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import {
  formatOpeningHoursValue,
  getOpeningHoursEntries,
} from "@/lib/opening-hours";
import { getPlaceById } from "@/lib/places";
import type { Place } from "@/types";

type RestaurantBookingPageProps = {
  params: Promise<{ id: string }>;
};

function isRestaurant(place: Place | undefined) {
  return String(place?.type ?? "").toLowerCase() === "restaurant";
}

function getOpeningHours(place: Place) {
  return place.openingHours ?? place.opening_hours ?? place.openingHoure ?? null;
}

function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function RestaurantBookingPage({
  params,
}: RestaurantBookingPageProps) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isFinite(restaurantId)) notFound();

  const placeResult = await getPlaceById(restaurantId);
  const restaurant = placeResult?.[0] as Place | undefined;

  if (!restaurant || !isRestaurant(restaurant)) {
    notFound();
  }

  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const mainImage = restaurant.images?.[0] || "/images/hero.jpg";
  const openingHours = getOpeningHours(restaurant);
  const openingHoursEntries = getOpeningHoursEntries(openingHours).slice(0, 4);
  const bookingPath = `/restaurants/${restaurant.id}/book`;

  return (
    <main className="min-h-screen bg-md-cream pb-16 pt-36 font-body text-md-brown-dark">
      <section className="mx-auto max-w-7xl px-6">
        <Link
          href={`/restaurants/${restaurant.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-md-gold-dark transition hover:text-md-green"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Restaurant details
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-lg border border-md-gold/20 bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image
                  src={mainImage}
                  alt={restaurant.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-md-cream/40 bg-md-brown-dark/55 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-md-cream backdrop-blur">
                  <Utensils className="h-3.5 w-3.5" aria-hidden="true" />
                  Table request
                </div>
              </div>

              <div className="px-6 py-6">
                <h1 className="font-display text-4xl font-bold leading-tight text-md-brown-dark">
                  {restaurant.name}
                </h1>
                <div className="mt-4 space-y-3 text-sm text-md-muted">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-none text-md-green" aria-hidden="true" />
                    <span>
                      {restaurant.address}, {restaurant.city}
                    </span>
                  </p>
                  {restaurant.phone ? (
                    <a
                      href={getPhoneHref(restaurant.phone)}
                      className="flex items-center gap-2 transition hover:text-md-green"
                    >
                      <Phone className="h-4 w-4 flex-none text-md-green" aria-hidden="true" />
                      {restaurant.phone}
                    </a>
                  ) : null}
                </div>

                {openingHoursEntries.length > 0 ? (
                  <div className="mt-6 rounded-lg border border-md-gold/20 bg-md-cream px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                      Opening hours
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      {openingHoursEntries.map(([day, hours]) => (
                        <div key={day} className="flex justify-between gap-4">
                          <span className="font-bold capitalize text-md-brown-dark">
                            {day}
                          </span>
                          <span className="text-right text-md-muted">
                            {formatOpeningHoursValue(hours)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-lg border border-md-gold/20 bg-md-brown-dark px-6 py-6 text-md-cream shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold">
                Flow
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">
                How confirmation works
              </h2>
              <div className="mt-5 grid gap-4">
                {[
                  { label: "You send a request", icon: CalendarClock },
                  { label: "Restaurant reviews it", icon: ShieldCheck },
                  { label: "Status becomes confirmed or declined", icon: BadgeCheck },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 text-sm font-bold">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-md-cream/10 text-md-gold">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Status", value: "Pending first", icon: Clock3 },
                  { label: "Party size", value: "1-20 guests", icon: UsersRound },
                  { label: "Confirmation", value: "Owner review", icon: CheckCircle2 },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <Icon className="h-5 w-5 text-md-green" aria-hidden="true" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                      {label}
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-md-brown-dark">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {user ? (
              <RestaurantBookingForm
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
                defaultName={profile?.name ?? ""}
                defaultEmail={profile?.email ?? user.email ?? ""}
                minDate={todayIsoDate()}
              />
            ) : (
              <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-8 shadow-sm">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-md-sand text-md-green">
                  <LogIn className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                  Sign in required
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-md-brown-dark">
                  Continue to request a table
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-md-muted">
                  A Moroccool account lets the restaurant connect the request to
                  you and lets the dashboard keep a clear booking history.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/login?next=${encodeURIComponent(bookingPath)}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-md-green px-5 text-sm font-bold text-white transition hover:bg-md-brown-dark"
                  >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-md-gold/30 bg-white px-5 text-sm font-bold text-md-brown-dark transition hover:bg-md-sand"
                  >
                    Create account
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

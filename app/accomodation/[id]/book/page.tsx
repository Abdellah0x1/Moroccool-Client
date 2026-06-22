import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  CalendarClock,
  Clock3,
  Hotel,
  LogIn,
  MapPin,
  Phone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import {
  AccommodationBookingForm,
  type AccommodationRoomOption,
} from "@/components/AccommodationBookingForm";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getPlaceById } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";
import type { Place } from "@/types";
import { cookies } from "next/headers";
import { getGuestHotelAvailability } from "@/lib/guest-hotel-availability";

type AccommodationBookingPageProps = {
  params: Promise<{ id: string }>;
};

function isHotel(place: Place | undefined) {
  return String(place?.type ?? "").toLowerCase() === "hotel";
}

function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(value: string | undefined) {
  if (!value) return null;
  return value.slice(0, 5);
}

async function getRoomOptions(stayId: number): Promise<AccommodationRoomOption[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("accommodation_room_types")
    .select("id, name, max_guests, base_price, units")
    .eq("etablissement_id", stayId)
    .order("base_price", { ascending: true });

  if (error) {
    console.log("accommodation room types lookup error", error);
    return [];
  }

  return (data ?? []) as AccommodationRoomOption[];
}

export default async function AccommodationBookingPage({
  params,
}: AccommodationBookingPageProps) {
  const { id } = await params;
  const stayId = Number(id);

  if (!Number.isFinite(stayId)) notFound();

  const placeResult = await getPlaceById(stayId);
  const stay = placeResult?.[0] as Place | undefined;

  if (!stay || !isHotel(stay)) {
    notFound();
  }

  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const [roomOptions, availability] = await Promise.all([
    getRoomOptions(stay.id),
    getGuestHotelAvailability(stay.id, new Date(), 90),
  ]);
  const mainImage = stay.images?.[0] || "/images/hero.jpg";
  const bookingPath = `/accomodation/${stay.id}/book`;
  const checkInTime = formatTime(stay.check_in_time) ?? "15:00";
  const checkOutTime = formatTime(stay.check_out_time) ?? "11:00";
  const defaultCheckIn = addDaysIso(1);
  const defaultCheckOut = addDaysIso(2);

  return (
    <main className="min-h-screen bg-md-cream pb-16 pt-36 font-body text-md-brown-dark">
      <section className="mx-auto max-w-7xl px-6">
        <Link
          href={`/accomodation/${stay.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-md-gold-dark transition hover:text-md-green"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Stay details
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-lg border border-md-gold/20 bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image
                  src={mainImage}
                  alt={stay.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-md-cream/40 bg-md-brown-dark/55 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-md-cream backdrop-blur">
                  <Hotel className="h-3.5 w-3.5" aria-hidden="true" />
                  Stay request
                </div>
              </div>

              <div className="px-6 py-6">
                <h1 className="font-display text-4xl font-bold leading-tight text-md-brown-dark">
                  {stay.name}
                </h1>
                <div className="mt-4 space-y-3 text-sm text-md-muted">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-none text-md-green" aria-hidden="true" />
                    <span>
                      {stay.address}, {stay.city}
                    </span>
                  </p>
                  {stay.phone ? (
                    <a
                      href={getPhoneHref(stay.phone)}
                      className="flex items-center gap-2 transition hover:text-md-green"
                    >
                      <Phone className="h-4 w-4 flex-none text-md-green" aria-hidden="true" />
                      {stay.phone}
                    </a>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-md-gold/20 bg-md-cream px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                      Check-in
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold text-md-brown-dark">
                      {checkInTime}
                    </p>
                  </div>
                  <div className="rounded-lg border border-md-gold/20 bg-md-cream px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                      Check-out
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold text-md-brown-dark">
                      {checkOutTime}
                    </p>
                  </div>
                </div>

                {roomOptions.length > 0 ? (
                  <div className="mt-6 rounded-lg border border-md-gold/20 bg-md-cream px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                      Room options
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      {roomOptions.slice(0, 3).map((room) => (
                        <div key={room.id} className="flex justify-between gap-4">
                          <span className="font-bold text-md-brown-dark">
                            {room.name}
                          </span>
                          <span className="text-right text-md-muted">
                            Up to {room.max_guests ?? 2}
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
                How stay confirmation works
              </h2>
              <div className="mt-5 grid gap-4">
                {[
                  { label: "You send dates and room needs", icon: CalendarClock },
                  { label: "Hotel checks availability", icon: ShieldCheck },
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
                  { label: "Stay size", value: "1-20 guests", icon: UsersRound },
                  { label: "Room choice", value: roomOptions.length ? `${roomOptions.length} types` : "On request", icon: BedDouble },
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
              <AccommodationBookingForm
                stayId={stay.id}
                stayName={stay.name}
                roomOptions={roomOptions}
                availability={availability.cells}
                availabilityError={availability.error}
                defaultName={profile?.name ?? ""}
                defaultEmail={profile?.email ?? user.email ?? ""}
                minDate={addDaysIso(0)}
                defaultCheckIn={defaultCheckIn}
                defaultCheckOut={defaultCheckOut}
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
                  Continue to request this stay
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-md-muted">
                  A Moroccool account connects the request to you and keeps your
                  booking history available after the hotel replies.
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

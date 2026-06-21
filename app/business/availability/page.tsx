import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Hotel,
  Sparkles,
  Utensils,
  UsersRound,
} from "lucide-react";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { getBookingsForOwner } from "@/lib/bookings";
import type { BookingStatus, OpeningHoursMap, OpeningHoursValue, RestaurantBooking } from "@/types";

const DAY_MS = 86_400_000;
const SLOT_MINUTES = 30;
const FIRST_SLOT_MINUTES = 11 * 60;
const SLOT_COUNT = 24;
const WEEKDAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type AvailabilityPageProps = {
  searchParams: Promise<{
    week?: string | string[];
  }>;
};

type CalendarBooking = {
  booking: RestaurantBooking;
  dayIndex: number;
  slotIndex: number;
};

type DaySchedule = {
  active: boolean;
  start?: string;
  end?: string;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const sundayBasedDay = start.getDay();
  const daysSinceMonday = sundayBasedDay === 0 ? 6 : sundayBasedDay - 1;
  start.setDate(start.getDate() - daysSinceMonday);

  return start;
}

function getSelectedWeek(week: string | undefined) {
  const requestedWeek = parseIsoDate(week);
  return startOfWeek(requestedWeek ?? new Date());
}

function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
}

function getSlots() {
  return Array.from({ length: SLOT_COUNT }, (_, index) => {
    const minutes = FIRST_SLOT_MINUTES + index * SLOT_MINUTES;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
  });
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function getWeekHref(weekStart: Date, offset: number) {
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(weekStart.getDate() + offset * 7);

  return `/business/availability?week=${toLocalIsoDate(nextWeek)}`;
}

function getWeekLabel(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startLabel = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(weekStart);
  const endLabel = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(weekEnd);

  return `${startLabel} – ${endLabel}`;
}

function getCalendarBookings(bookings: RestaurantBooking[], weekStart: Date) {
  return bookings.reduce<CalendarBooking[]>((calendarBookings, booking) => {
    if (booking.status !== "pending" && booking.status !== "confirmed") {
      return calendarBookings;
    }

    const bookingDate = parseIsoDate(booking.requested_date);
    const requestedMinutes = timeToMinutes(booking.requested_time);

    if (!bookingDate || requestedMinutes === null) return calendarBookings;

    const dayIndex = Math.round((bookingDate.getTime() - weekStart.getTime()) / DAY_MS);
    const slotIndex = Math.floor((requestedMinutes - FIRST_SLOT_MINUTES) / SLOT_MINUTES);

    if (dayIndex < 0 || dayIndex > 6 || slotIndex < 0 || slotIndex >= SLOT_COUNT) {
      return calendarBookings;
    }

    calendarBookings.push({ booking, dayIndex, slotIndex });
    return calendarBookings;
  }, []);
}

function groupBookingsBySlot(bookings: CalendarBooking[]) {
  return bookings.reduce<Map<string, CalendarBooking[]>>((groups, booking) => {
    const key = `${booking.dayIndex}-${booking.slotIndex}`;
    const group = groups.get(key) ?? [];
    group.push(booking);
    groups.set(key, group);
    return groups;
  }, new Map());
}

function getStatusStyles(status: BookingStatus) {
  if (status === "confirmed") {
    return "border-md-green/35 bg-md-green text-white hover:bg-md-brown-dark";
  }

  return "border-md-gold/50 bg-md-gold text-md-brown-dark hover:bg-md-gold-dark hover:text-white";
}

function getDaySchedule(openingHours: unknown, date: Date): DaySchedule | null {
  if (!openingHours || typeof openingHours !== "object" || Array.isArray(openingHours)) {
    return null;
  }

  const weekday = WEEKDAY_KEYS[(date.getDay() + 6) % 7];
  const value = (openingHours as OpeningHoursMap)[weekday] as OpeningHoursValue | undefined;

  if (!value || typeof value === "string") return null;

  return {
    active: value.active !== false,
    start: value.start,
    end: value.end,
  };
}

function LockedState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="grid min-h-[calc(100vh-160px)] place-items-center">
      <section className="w-full max-w-3xl rounded-lg border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-md-sand text-md-green">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
          Availability
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
  );
}

export default async function BusinessAvailabilityPage({
  searchParams,
}: AvailabilityPageProps) {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== "business_owner") {
    redirect("/profile");
  }

  const params = await searchParams;
  const weekStart = getSelectedWeek(firstValue(params.week));
  const weekDays = getWeekDays(weekStart);
  const slots = getSlots();
  const { business, listing, bookings, error } = await getBookingsForOwner(user.id);
  const listingType = String(listing?.type ?? "").toLowerCase();

  if (!listing) {
    return (
      <LockedState
        icon={Sparkles}
        title="Create your restaurant listing first"
        description="The availability calendar opens once your public restaurant listing exists, so table requests always have a place to land."
        ctaLabel="Create listing"
        ctaHref="/business/listing"
      />
    );
  }

  if (listingType === "hotel") {
    return (
      <LockedState
        icon={Hotel}
        title="Manage room availability in your listing"
        description="Hotel stays use room inventory and date ranges rather than table time slots. Update room types and stay rules from your listing."
        ctaLabel="Edit listing"
        ctaHref="/business/listing"
      />
    );
  }

  if (listingType !== "restaurant") {
    return (
      <LockedState
        icon={Sparkles}
        title="Availability is not set up for this listing"
        description="Choose Restaurant as the listing type to use the table-booking calendar."
        ctaLabel="Edit listing"
        ctaHref="/business/listing"
      />
    );
  }

  const restaurantBookings = bookings.filter(
    (booking): booking is RestaurantBooking => booking.type === "restaurant",
  );
  const calendarBookings = getCalendarBookings(restaurantBookings, weekStart);
  const bookingsBySlot = groupBookingsBySlot(calendarBookings);
  const pendingCount = calendarBookings.filter(
    ({ booking }) => booking.status === "pending",
  ).length;
  const confirmedCount = calendarBookings.filter(
    ({ booking }) => booking.status === "confirmed",
  ).length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 border-b border-gray-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-md-green/20 bg-md-green/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-md-green">
            <Utensils className="h-4 w-4" aria-hidden="true" />
            Restaurant calendar
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
            Availability
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            See active table requests for {listing.name}. Pending and confirmed
            requests are shown here; declined and cancelled requests do not block a slot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              Restaurant
            </p>
            <p className="mt-1 text-sm font-bold text-gray-950">{business?.name ?? listing.name}</p>
          </div>
          <Link
            href="/business/listing"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Edit hours
          </Link>
        </div>
      </section>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error}. Try refreshing the page or return to the bookings inbox.</p>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">This week</p>
          <p className="mt-2 text-2xl font-semibold text-gray-950">{calendarBookings.length}</p>
          <p className="mt-1 text-sm text-gray-600">Active table requests</p>
        </div>
        <div className="rounded-lg border border-md-gold/30 bg-md-gold/10 px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-md-brown-dark">{pendingCount}</p>
          <p className="mt-1 text-sm text-md-brown">Awaiting your response</p>
        </div>
        <div className="rounded-lg border border-md-green/25 bg-md-green/10 px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-md-green">Confirmed</p>
          <p className="mt-2 text-2xl font-semibold text-md-green">{confirmedCount}</p>
          <p className="mt-1 text-sm text-md-brown">Blocking table availability</p>
        </div>
      </section>

      <section className="rounded-xl border border-md-gold/20 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-md-gold/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark">Weekly schedule</p>
            <h2 className="mt-1 text-xl font-bold text-gray-950">{getWeekLabel(weekStart)}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={getWeekHref(weekStart, -1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/business/availability"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Today
            </Link>
            <Link
              href={getWeekHref(weekStart, 1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-md-gold/15 px-4 py-3 text-xs font-semibold text-gray-600 sm:px-5">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-md-gold" aria-hidden="true" />
            Pending request
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-md-green" aria-hidden="true" />
            Confirmed booking
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-200" aria-hidden="true" />
            Closed day
          </span>
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid min-w-[980px]"
            style={{
              gridTemplateColumns: "76px repeat(7, minmax(128px, 1fr))",
              gridTemplateRows: `76px repeat(${slots.length}, 72px)`,
            }}
          >
            <div
              className="sticky left-0 top-0 z-30 border-b border-r border-md-gold/15 bg-md-cream/95 backdrop-blur"
              style={{ gridColumn: 1, gridRow: 1 }}
            />

            {weekDays.map((date, index) => {
              const schedule = getDaySchedule(listing.openingHours, date);
              const isClosed = schedule?.active === false;
              const isToday = toLocalIsoDate(date) === toLocalIsoDate(new Date());

              return (
                <div
                  key={toLocalIsoDate(date)}
                  className={`sticky top-0 z-20 flex flex-col justify-center border-b border-r border-md-gold/15 px-4 py-2 backdrop-blur ${isClosed ? "bg-gray-100" : "bg-md-cream/95"}`}
                  style={{ gridColumn: index + 2, gridRow: 1 }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-md-gold-dark">
                    {new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)}
                  </p>
                  <p className={`mt-0.5 text-xl font-bold ${isToday ? "text-md-green" : "text-md-brown-dark"}`}>
                    {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                    {isClosed ? "Closed" : schedule?.start && schedule?.end ? `${schedule.start}–${schedule.end}` : "Hours not set"}
                  </p>
                </div>
              );
            })}

            {slots.flatMap((_, rowIndex) =>
              weekDays.map((date, colIndex) => {
                const isClosed = getDaySchedule(listing.openingHours, date)?.active === false;

                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`border-b border-r border-gray-100/80 ${isClosed ? "bg-gray-50" : "bg-white"}`}
                    style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 2 }}
                  />
                );
              }),
            )}

            {slots.map((slot, index) => (
              <div
                key={slot}
                className="sticky left-0 z-20 flex items-start justify-end border-b border-r border-md-gold/15 bg-white px-3 pt-1"
                style={{ gridColumn: 1, gridRow: index + 2 }}
              >
                <span className="-mt-2 bg-white px-1 text-xs font-bold tracking-wider text-md-muted">{slot}</span>
              </div>
            ))}

            {Array.from(bookingsBySlot.entries()).map(([key, slotBookings]) => {
              const { dayIndex, slotIndex } = slotBookings[0];

              return (
                <div
                  key={key}
                  className="z-10 m-1 flex min-w-0 flex-col gap-1 overflow-y-auto"
                  style={{ gridColumn: dayIndex + 2, gridRow: slotIndex + 2 }}
                >
                  {slotBookings.map(({ booking }) => (
                    <Link
                      key={booking.id}
                      href={`/business/bookings?status=${booking.status}`}
                      className={`group relative min-w-0 rounded-md border px-2.5 py-2 transition focus:outline-none focus:ring-2 focus:ring-md-gold focus:ring-offset-1 ${getStatusStyles(booking.status)}`}
                      aria-label={`View ${booking.status} booking for ${booking.customer_name} at ${booking.requested_time.slice(0, 5)}`}
                    >
                      <p className="truncate text-xs font-bold">{booking.customer_name}</p>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] opacity-90">
                        <UsersRound className="h-3 w-3" aria-hidden="true" />
                        {booking.guests} guests
                      </span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <p className="text-center text-xs leading-5 text-gray-500">
        Need to confirm or decline a request? Open the <Link href="/business/bookings" className="font-bold text-md-green hover:underline">bookings inbox</Link> to update its status.
      </p>
    </div>
  );
}

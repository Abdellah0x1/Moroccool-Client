import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hotel,
  Mail,
  MessageSquareText,
  Phone,
  Sparkles,
  Utensils,
  UsersRound,
  XCircle,
} from "lucide-react";
import { updateRestaurantBookingStatus } from "@/app/actions/booking-actions";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { getRestaurantBookingsForOwner } from "@/lib/bookings";
import type { RestaurantBooking } from "@/types";

type StatusMeta = {
  label: string;
  icon: typeof Clock3;
  className: string;
};

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getStatusMeta(status: RestaurantBooking["status"]): StatusMeta {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        icon: CheckCircle2,
        className: "border-md-green/25 bg-md-green/10 text-md-green",
      };
    case "rejected":
      return {
        label: "Declined",
        icon: XCircle,
        className: "border-red-200 bg-red-50 text-red-700",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        icon: Ban,
        className: "border-md-sand-dark bg-md-cream text-md-muted",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        icon: Clock3,
        className: "border-md-gold/30 bg-md-gold/10 text-md-gold-dark",
      };
  }
}

function countByStatus(bookings: RestaurantBooking[], status: RestaurantBooking["status"]) {
  return bookings.filter((booking) => booking.status === status).length;
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
          Bookings
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

function BookingCard({ booking }: { booking: RestaurantBooking }) {
  const statusMeta = getStatusMeta(booking.status);
  const StatusIcon = statusMeta.icon;
  const confirmAction = updateRestaurantBookingStatus.bind(null, booking.id, "confirmed");
  const rejectAction = updateRestaurantBookingStatus.bind(null, booking.id, "rejected");
  const cancelAction = updateRestaurantBookingStatus.bind(null, booking.id, "cancelled");
  const isPending = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";

  return (
    <article className="rounded-lg border border-md-gold/20 bg-white px-5 py-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusMeta.className}`}>
              <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {statusMeta.label}
            </span>
            {booking.occasion ? (
              <span className="rounded-full border border-md-gold/25 bg-md-sand px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark">
                {booking.occasion}
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold text-md-brown-dark">
            {formatDate(booking.requested_date)} at {formatTime(booking.requested_time)}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-md-brown-dark">
            <UsersRound className="h-4 w-4 text-md-green" aria-hidden="true" />
            {booking.guests} guests
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[320px]">
          {isPending ? (
            <>
              <form action={confirmAction}>
                <Button type="submit" className="h-10 w-full gap-2 bg-md-green font-bold text-white hover:bg-md-brown-dark">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Confirm
                </Button>
              </form>
              <form action={rejectAction} className="sm:col-span-2">
                <Button type="submit" variant="outline" className="h-10 w-full border-red-200 bg-red-50 font-bold text-red-700 hover:bg-red-100">
                  Decline and email
                </Button>
                <label className="sr-only" htmlFor={`owner-note-${booking.id}`}>
                  Decline note
                </label>
                <textarea
                  id={`owner-note-${booking.id}`}
                  name="owner_note"
                  required
                  rows={2}
                  className="my-2 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 outline-none transition placeholder:text-red-400 focus:border-red-300 focus:bg-white"
                  placeholder="Reason for declining..."
                />
              </form>
            </>
          ) : null}
          {isConfirmed ? (
            <form action={cancelAction}>
              <Button type="submit" variant="outline" className="h-10 w-full border-md-sand-dark bg-white font-bold text-md-brown-dark hover:bg-md-sand">
                Cancel
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-md-gold/15 pt-5 md:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
            Guest
          </p>
          <p className="mt-2 font-bold text-md-brown-dark">{booking.customer_name}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
            Contact
          </p>
          <div className="mt-2 space-y-1 text-sm text-md-muted">
            <a href={`tel:${booking.customer_phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 transition hover:text-md-green">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {booking.customer_phone}
            </a>
            <a href={`mailto:${booking.customer_email}`} className="flex items-center gap-2 transition hover:text-md-green">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {booking.customer_email}
            </a>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
            Guest note
          </p>
          <p className="mt-2 text-sm leading-6 text-md-muted">
            {booking.notes || "No note added."}
          </p>
        </div>
        {booking.owner_note ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
              Owner note
            </p>
            <p className="mt-2 text-sm leading-6 text-md-muted">
              {booking.owner_note}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default async function BusinessBookingsPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== "business_owner") {
    redirect("/profile");
  }

  const { business, listing, bookings, error } = await getRestaurantBookingsForOwner(user.id);
  const listingType = String(listing?.type ?? "").toLowerCase();
  console.log('bookings :', bookings)

  if (!listing) {
    return (
      <LockedState
        icon={Sparkles}
        title="Create your restaurant listing first"
        description="Booking requests appear after your public restaurant listing exists."
        ctaLabel="Create listing"
        ctaHref="/business/listing"
      />
    );
  }

  if (listingType !== "restaurant") {
    return (
      <LockedState
        icon={Hotel}
        title="Restaurant bookings only"
        description="This inbox is built for table requests. Hotel booking requests can use a separate stays flow."
        ctaLabel="Edit listing"
        ctaHref="/business/listing"
      />
    );
  }

  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const todayBookings = bookings.filter((booking) => booking.requested_date === todayIsoDate());
  const stats = [
    {
      label: "Pending",
      value: String(pendingBookings.length),
      icon: Clock3,
      className: "text-md-gold-dark",
    },
    {
      label: "Confirmed",
      value: String(countByStatus(bookings, "confirmed")),
      icon: BadgeCheck,
      className: "text-md-green",
    },
    {
      label: "Today",
      value: String(todayBookings.length),
      icon: CalendarDays,
      className: "text-md-green",
    },
    {
      label: "Declined",
      value: String(countByStatus(bookings, "rejected")),
      icon: XCircle,
      className: "text-red-700",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="border-b border-gray-200 pb-6">
        <div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-md-green/20 bg-md-green/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-md-green">
                <Utensils className="h-4 w-4" aria-hidden="true" />
                Restaurant booking flow
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
                Bookings
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Review table requests for {listing.name}, then confirm,
                decline, or cancel them from the same inbox.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                Selected restaurant
              </p>
              <p className="mt-2 text-xl font-bold text-gray-950">
                {listing.name}
              </p>
              <p className="mt-1 text-sm text-gray-600">{business?.city}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {error ? (
            <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-8 shadow-sm">
              <MessageSquareText className="h-8 w-8 text-md-gold-dark" aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold text-md-brown-dark">
                Booking storage is not ready
              </h2>
              <p className="mt-3 text-sm leading-7 text-md-muted">
                Once the restaurant bookings table is available, submitted table
                requests will appear here for owner review.
              </p>
            </section>
          ) : bookings.length > 0 ? (
            bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <section className="rounded-lg border border-dashed border-md-gold/35 bg-white px-6 py-12 text-center shadow-sm">
              <CalendarDays className="mx-auto h-10 w-10 text-md-gold-dark" aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold text-md-brown-dark">
                No table requests yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-md-muted">
                New requests from the restaurant detail page will land here as
                pending bookings.
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-8">
          <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
              Owner workflow
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-md-brown-dark">
              Request states
            </h2>
            <div className="mt-5 divide-y divide-md-gold/15 border-y border-md-gold/15">
              {[
                ["Pending", "Guest submitted a request and is waiting for the restaurant."],
                ["Confirmed", "Restaurant accepted the date, time, and party size."],
                ["Declined", "Restaurant cannot host this request."],
                ["Cancelled", "A confirmed booking was released."],
              ].map(([label, description]) => (
                <div key={label} className="py-4">
                  <p className="font-bold text-md-brown-dark">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-md-muted">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-md-gold/20 bg-md-brown-dark px-6 py-6 text-md-cream shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold">
              Availability
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">
              Keep capacity current
            </h2>
            <p className="mt-3 text-sm leading-6 text-md-sand">
              Update availability when lunch or dinner fills up so new guests
              see cleaner request options.
            </p>
            <Link
              href="/business/availability"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-md-cream px-4 text-sm font-bold text-md-brown-dark transition hover:bg-md-gold"
            >
              Manage availability
            </Link>
          </section>
        </aside>
      </section>
    </div>
  );
}

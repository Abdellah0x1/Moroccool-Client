import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Hotel,
  Mail,
  MessageSquareText,
  Moon,
  Phone,
  Sparkles,
  Utensils,
  UsersRound,
  XCircle,
  Search,
  Filter,
  MapPin,
  CreditCard,
} from "lucide-react";
import { updateBookingStatus } from "@/app/actions/booking-actions";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { getBookingsForOwner } from "@/lib/bookings";
import type {
  AccommodationBooking,
  BookingStatus,
  OwnerBooking,
  RestaurantBooking,
} from "@/types";

const ITEMS_PER_PAGE = 6;

type StatusMeta = {
  label: string;
  icon: typeof Clock3;
  className: string;
};

type ListingCopy = {
  icon: typeof Sparkles;
  eyebrow: string;
  selectedLabel: string;
  intro: string;
  emptyTitle: string;
  emptyDescription: string;
  availabilityTitle: string;
  availabilityDescription: string;
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

function formatTime(value: string | null | undefined) {
  if (!value) return "Flexible";
  return value.slice(0, 5);
}

function formatMoney(value: number | null) {
  if (value === null) return "Not quoted";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStayNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getBookingDate(booking: OwnerBooking) {
  return booking.type === "hotel" ? booking.check_in : booking.requested_date;
}

function getStatusMeta(status: BookingStatus): StatusMeta {
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

function countByStatus(bookings: OwnerBooking[], status: BookingStatus) {
  return bookings.filter((booking) => booking.status === status).length;
}

function getListingCopy(listingType: string, listingName: string): ListingCopy {
  if (listingType === "hotel") {
    return {
      icon: Hotel,
      eyebrow: "Hotel booking flow",
      selectedLabel: "Selected stay",
      intro: `Review stay requests for ${listingName}, then confirm, decline, or cancel them from the same inbox.`,
      emptyTitle: "No stay requests yet",
      emptyDescription:
        "New requests from the accommodation booking page will land here as pending bookings.",
      availabilityTitle: "Keep room rules current",
      availabilityDescription:
        "Room availability, minimum nights, and closed dates should stay accurate before guests request stays.",
    };
  }

  return {
    icon: Utensils,
    eyebrow: "Restaurant booking flow",
    selectedLabel: "Selected restaurant",
    intro: `Review table requests for ${listingName}, then confirm, decline, or cancel them from the same inbox.`,
    emptyTitle: "No table requests yet",
    emptyDescription:
      "New requests from the restaurant detail page will land here as pending bookings.",
    availabilityTitle: "Keep capacity current",
    availabilityDescription:
      "Update availability when lunch or dinner fills up so new guests see cleaner request options.",
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

function BookingActions({ booking }: { booking: OwnerBooking }) {
  const confirmAction = updateBookingStatus.bind(null, booking.id, "confirmed");
  const rejectAction = updateBookingStatus.bind(null, booking.id, "rejected");
  const cancelAction = updateBookingStatus.bind(null, booking.id, "cancelled");
  const isPending = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";

  return (
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
  );
}

function ContactDetails({ booking }: { booking: OwnerBooking }) {
  return (
    <>
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
    </>
  );
}

function RestaurantBookingCard({ booking }: { booking: RestaurantBooking }) {
  const statusMeta = getStatusMeta(booking.status);
  const StatusIcon = statusMeta.icon;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-md-green/30">
      {/* Gradient accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-md-gold via-md-gold-dark to-md-green" />

      <div className="px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            {/* Status + occasion badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] shadow-sm ${statusMeta.className}`}>
                <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {statusMeta.label}
              </span>
              {booking.occasion ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-md-gold/25 bg-gradient-to-r from-md-sand to-md-cream px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark shadow-sm">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {booking.occasion}
                </span>
              ) : null}
            </div>

            {/* Date/time headline */}
            <h2 className="mt-5 font-display text-2xl font-bold text-md-brown-dark sm:text-3xl">
              {formatDate(booking.requested_date)}
              <span className="mx-2 text-gray-300">·</span>
              <span className="text-md-green">{formatTime(booking.requested_time)}</span>
            </h2>

            {/* Quick info chips */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-md-brown-dark">
                <UsersRound className="h-4 w-4 text-md-green" aria-hidden="true" />
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-md-brown-dark">
                <Utensils className="h-4 w-4 text-md-gold-dark" aria-hidden="true" />
                Table reservation
              </span>
            </div>
          </div>

          <div className="shrink-0 lg:mt-0 mt-4">
            <BookingActions booking={booking} />
          </div>
        </div>

        {/* Contact details section */}
        <div className="mt-8 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <ContactDetails booking={booking} />
        </div>
      </div>
    </article>
  );
}

function AccommodationBookingCard({ booking }: { booking: AccommodationBooking }) {
  const statusMeta = getStatusMeta(booking.status);
  const StatusIcon = statusMeta.icon;
  const nights = getStayNights(booking.check_in, booking.check_out);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-md-green/30">
      {/* Gradient accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-md-green via-emerald-400 to-teal-500" />

      <div className="px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            {/* Status + room type badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] shadow-sm transition-colors ${statusMeta.className}`}>
                <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {statusMeta.label}
              </span>
              {booking.room_type_name ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-md-gold/25 bg-gradient-to-r from-md-sand to-md-cream px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark shadow-sm">
                  <BedDouble className="h-3 w-3" aria-hidden="true" />
                  {booking.room_type_name}
                </span>
              ) : null}
            </div>

            {/* Check-in / Check-out headline */}
            <div className="mt-5 flex items-center gap-3 font-display text-2xl font-bold text-md-brown-dark sm:text-3xl">
              <span>{formatDate(booking.check_in)}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 shadow-sm">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{formatDate(booking.check_out)}</span>
            </div>

            {/* Quick info chips */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-md-brown-dark">
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5">
                <BedDouble className="h-4 w-4 text-md-green" aria-hidden="true" />
                {booking.rooms} {booking.rooms === 1 ? "room" : "rooms"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5">
                <UsersRound className="h-4 w-4 text-md-green" aria-hidden="true" />
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5">
                <Moon className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                {nights || "—"} {nights === 1 ? "night" : "nights"}
              </span>
            </div>
          </div>

          <div className="shrink-0 lg:mt-0 mt-4">
            <BookingActions booking={booking} />
          </div>
        </div>

        {/* Detail tiles */}
        <div className="mt-8 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <ContactDetails booking={booking} />

          <div className="flex flex-col rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 transition-colors hover:border-gray-200">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              Expected Arrival
            </p>
            <p className="mt-auto pt-3 text-xl font-bold text-gray-900">
              {formatTime(booking.arrival_time)}
            </p>
          </div>

          <div className="flex flex-col rounded-xl border border-md-green/20 bg-gradient-to-br from-md-green/5 to-emerald-50 p-4 transition-colors hover:border-md-green/30">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-md-green">
              <CreditCard className="h-3 w-3" aria-hidden="true" />
              Quote Total
            </p>
            <p className="mt-auto pt-3 text-xl font-bold text-md-green">
              {formatMoney(booking.quoted_price)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function BookingCard({ booking }: { booking: OwnerBooking }) {
  if (booking.type === "hotel") {
    return <AccommodationBookingCard booking={booking} />;
  }

  return <RestaurantBookingCard booking={booking} />;
}

const BOOKING_FILTER_OPTIONS = [
  { label: "All", value: null },
  { label: "Confirmed", value: "confirmed" },
  { label: "Declined", value: "rejected" },
  { label: "Pending", value: "pending" },
];

function buildPageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const parts: string[] = [];
  if (params.status) parts.push(`status=${params.status}`);
  if (params.q) parts.push(`q=${params.q}`);
  parts.push(`page=${page}`);
  return `/business/bookings?${parts.join("&")}`;
}

function Pagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number;
  totalPages: number;
  params: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "dots")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "dots") {
      pages.push("dots");
    }
  }

  return (
    <nav aria-label="Booking pagination" className="flex items-center justify-center gap-2 pt-2">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildPageHref(params, currentPage - 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-md-green/40 hover:bg-md-green/5 hover:text-md-green"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "dots" ? (
          <span key={`dots-${i}`} className="inline-flex h-10 w-6 items-center justify-center text-sm text-gray-400">
            ···
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-md-green text-sm font-bold text-white shadow-sm"
            aria-current="page"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildPageHref(params, p)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-md-green/40 hover:bg-md-green/5 hover:text-md-green"
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageHref(params, currentPage + 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-md-green/40 hover:bg-md-green/5 hover:text-md-green"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

export default async function BusinessBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] | undefined, q?: string | string[] | undefined, page?: string | string[] | undefined }> }) {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const params = searchParams ? await searchParams : {};

  if (profile?.role !== "business_owner") {
    redirect("/profile");
  }

  const { business, listing, bookings, error } = await getBookingsForOwner(user.id);
  const listingType = String(listing?.type ?? "").toLowerCase();
  const activeStatus = params?.status ? String(params.status).toLowerCase() : null;
  const activeQuery = params?.q ? String(params.q).toLowerCase() : null;

  const filterBookings = bookings.filter(booking => {
    const matchesStatus = activeStatus ? booking.status.toLowerCase() === activeStatus : true;
    const searchAbleText = [booking.customer_name, booking.customer_email].filter(Boolean).join("").toLowerCase();
    const matchesQuery = activeQuery ? searchAbleText.includes(activeQuery) : true

    return matchesStatus && matchesQuery
  });

  // Pagination
  const currentPage = Math.max(1, parseInt(String(params?.page ?? "1"), 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filterBookings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBookings = filterBookings.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  if (!listing) {
    return (
      <LockedState
        icon={Sparkles}
        title="Create your listing first"
        description="Booking requests appear after your public listing exists."
        ctaLabel="Create listing"
        ctaHref="/business/listing"
      />
    );
  }

  if (listingType !== "restaurant" && listingType !== "hotel") {
    return (
      <LockedState
        icon={Sparkles}
        title="Bookings are not available for this listing"
        description="This inbox is currently built for restaurant table requests and hotel stay requests."
        ctaLabel="Edit listing"
        ctaHref="/business/listing"
      />
    );
  }

  const copy = getListingCopy(listingType, listing.name);
  const HeaderIcon = copy.icon;
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const todayBookings = bookings.filter((booking) => getBookingDate(booking) === todayIsoDate());
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
      label: listingType === "hotel" ? "Check-ins today" : "Today",
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
                <HeaderIcon className="h-4 w-4" aria-hidden="true" />
                {copy.eyebrow}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
                Bookings
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                {copy.intro}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                {copy.selectedLabel}
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

      <section>
        <div className="space-y-5">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <form className="flex w-full max-w-xl flex-col sm:flex-row gap-3">
              {params.status && <input type='hidden' name="status" value={params.status} />}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  type="text"
                  name="q"
                  defaultValue={activeQuery ?? ''}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-md-green focus:bg-white"
                  placeholder="Search by user name or email..."
                />
              </div>
              <Button
                type="submit"
                className="h-11 rounded-lg bg-md-green px-6 font-bold text-white hover:bg-md-brown-dark transition-colors shrink-0"
              >
                Search
              </Button>
            </form>
            <div className="space-y-5 mt-5">
              <div className="text-gray-400 flex gap-2 text-xs font-bold items-center uppercasse tracking-[0.14em]">
                <Filter className="w-4 h-4" />
                <p>Filters</p>
              </div>
              <div className="flex gap-2 flex-wrap ">
                {BOOKING_FILTER_OPTIONS.map(filter => {
                  const queryParams = params?.q ? `&q=${params.q}` : ''
                  const href = filter.value ? `/business/bookings?status=${filter.value}${queryParams}` : `/business/bookings?${queryParams}`
                  const isActive = params?.status === filter.value || (!params?.status && !filter.value)
                  return <Link key={filter.label} href={href} className={`inline-flex items-center rounded-lg border px-3 h-9 font-bold ${isActive ? 'bg-md-green text-white' : 'bg-white text-md-brown text-gray-950'}`}>{filter.label}</Link>
                })}
              </div>
            </div>
          </section>
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
                The booking inbox could not load the detail table for this listing type.
              </p>
            </section>
          ) : filterBookings.length > 0 ? (
            <>
              {/* Page info */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filterBookings.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">{filterBookings.length}</span>{" "}
                  {filterBookings.length === 1 ? "booking" : "bookings"}
                </p>
                {totalPages > 1 && (
                  <p className="text-sm text-gray-400">
                    Page {safePage} of {totalPages}
                  </p>
                )}
              </div>

              {paginatedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}

              {/* Pagination controls */}
              <Pagination currentPage={safePage} totalPages={totalPages} params={params} />
            </>
          ) : (
            <section className="rounded-lg border border-dashed border-md-gold/35 bg-white px-6 py-12 text-center shadow-sm">
              <CalendarDays className="mx-auto h-10 w-10 text-md-gold-dark" aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold text-md-brown-dark">
                {copy.emptyTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-md-muted">
                {copy.emptyDescription}
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
                ["Pending", "Guest submitted a request and is waiting for owner review."],
                ["Confirmed", "The business accepted the requested date and details."],
                ["Declined", "The business cannot host this request and sends a note."],
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
              {copy.availabilityTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-md-sand">
              {copy.availabilityDescription}
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

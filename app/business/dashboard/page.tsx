import { redirect } from "next/navigation";
import {
  BadgeCheck,
  BarChart,
  BookOpenCheck,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  EyeOff,
  Hotel,
  MessageSquareText,
  Sparkles,
  Star,
} from "lucide-react";
import { getBusinessByOwnerId, getListingByBusinessId, getRecentReviews } from "@/lib/business";
import { getBookingsForOwner } from "@/lib/bookings";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import {
  ChartBarInteractive,
  type BookingChartDatum,
} from "@/components/BarChart";
import type { OwnerBooking } from "@/types";
import Link from "next/link";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLabel(value: string | null | undefined, fallback = "Not set") {
  if (!value) return fallback;

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusMeta(status: string | null | undefined) {
  switch (status) {
    case "approved":
      return {
        label: "Approved",
        description: "Your business can appear in Moroccool listings.",
        icon: BadgeCheck,
        className: "border-md-green/25 bg-md-green/10 text-md-green",
      };
    case "rejected":
      return {
        label: "Needs attention",
        description: "Our team could not approve this application yet.",
        icon: EyeOff,
        className: "border-red-200 bg-red-50 text-red-700",
      };
    case "needs_changes":
      return {
        label: "Changes requested",
        description: "Update your business details before approval.",
        icon: ClipboardCheck,
        className: "border-md-gold/30 bg-md-gold/10 text-md-gold-dark",
      };
    case "pending_review":
    default:
      return {
        label: "Pending review",
        description: "Your application is in the review queue.",
        icon: Clock3,
        className: "border-md-gold/30 bg-md-gold/10 text-md-gold-dark",
      };
  }
}

function getCommissionLabel(model: string | null, value: number | null) {
  if (value === null || value === undefined) return "Pending setup";
  if (model === "per_booking") return `${value}% per booking`;
  return `${value} ${formatLabel(model, "commission")}`;
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getBookingActivityDate(booking: OwnerBooking) {
  if (!booking.created_at) return null;

  const date = new Date(booking.created_at);

  if (Number.isNaN(date.getTime())) return null;

  return toLocalIsoDate(date);
}

function getLatestBookingActivityDate(bookings: OwnerBooking[]) {
  return bookings.reduce<Date | null>((latest, booking) => {
    const activityDate = getBookingActivityDate(booking);

    if (!activityDate) return latest;

    const date = new Date(`${activityDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) return latest;
    if (!latest || date > latest) return date;

    return latest;
  }, null);
}

function getEmptyChartRows(endDate: Date, days: number): BookingChartDatum[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (days - index - 1));

    return {
      date: toLocalIsoDate(date),
      pending: 0,
      confirmed: 0,
      rejected: 0,
      cancelled: 0,
      total: 0,
    } satisfies BookingChartDatum;
  });
}

function fillBookingChartRows(rows: BookingChartDatum[], bookings: OwnerBooking[]) {
  const rowsByDate = new Map(rows.map((row) => [row.date, row]));

  bookings.forEach((booking) => {
    const activityDate = getBookingActivityDate(booking);
    const row = activityDate ? rowsByDate.get(activityDate) : null;

    if (!row) return;

    row[booking.status] += 1;
    row.total += 1;
  });

  return rows;
}

function getChartTotal(rows: BookingChartDatum[]) {
  return rows.reduce((total, row) => total + row.total, 0);
}

function getBookingChartData(bookings: OwnerBooking[], days = 14): BookingChartDatum[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentRows = fillBookingChartRows(
    getEmptyChartRows(today, days),
    bookings,
  );

  if (getChartTotal(currentRows) > 0 || bookings.length === 0) {
    return currentRows;
  }

  const latestActivityDate = getLatestBookingActivityDate(bookings);

  if (!latestActivityDate) return currentRows;

  return fillBookingChartRows(
    getEmptyChartRows(latestActivityDate, days),
    bookings,
  );
}

export default async function BusinessDashboard() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== "business_owner") {
    redirect("/profile");
  }

  const business = await getBusinessByOwnerId(user.id);
  const listing = business ? await getListingByBusinessId(Number(business.id)) : null;
  const recentReviews = listing?.id ? await getRecentReviews(Number(listing.id)) : [];
  const listingType = String(listing?.type ?? "").toLowerCase();
  const hasListing = Boolean(listing);
  const isRestaurantListing = listingType === "restaurant";
  const isHotelListing = listingType === "hotel";
  const isBookableListing = isRestaurantListing || isHotelListing;
  const statusMeta = getStatusMeta(business?.status);
  const StatusIcon = statusMeta.icon;
  const bookingResult = isBookableListing
    ? await getBookingsForOwner(user.id)
    : { bookings: [] };
  const bookings = bookingResult.bookings ?? [];
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length;
  const bookingChartData = getBookingChartData(bookings);

  const overviewStats = [
    {
      label: "Application",
      value: statusMeta.label,
      icon: StatusIcon,
      className: "text-md-green",
    },
    {
      label: "Listing",
      value: hasListing ? "Live" : "Not created",
      icon: hasListing ? Sparkles : EyeOff,
      className: hasListing ? "text-md-green" : "text-md-gold-dark",
    },
    {
      label: "Pending bookings",
      value: String(pendingBookings),
      icon: BookOpenCheck,
      className: "text-md-gold-dark",
    },
    {
      label: "Confirmed",
      value: String(confirmedBookings),
      icon: CalendarDays,
      className: "text-md-green",
    },
  ];



  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            {business?.name || "Your Moroccool business"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Monitor the operational pieces that matter: approval status,
            listing readiness, availability, and booking requests.
          </p>
        </div>

        <div className={`rounded-lg border px-4 py-3 ${statusMeta.className}`}>
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em]">
                Current status
              </p>
              <p className="mt-0.5 text-sm font-bold">{statusMeta.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map(({ label, value, icon: Icon, className }) => (
          <div
            key={label}
            className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm"
          >
            <Icon className={`h-5 w-5 ${className}`} aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                Requests created
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-950">
                Recent 14-day activity
              </h2>
            </div>

            <BarChart className="h-5 w-5 text-md-green" aria-hidden="true" />
          </div>

          <div className="mt-5">
            <ChartBarInteractive data={bookingChartData} />
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center gap-4">
              <Hotel className="h-5 w-5 text-md-green" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400"> Recent Booking requests </p>
            </div>
          </section>



          <section className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <MessageSquareText className="h-5 w-5 text-md-green" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                Reviews
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-950">
                Recent Guest Feedback
              </h2>
              <span className="text-xs font-medium text-md-green bg-md-green/10 px-2 py-1 rounded-full">
                {recentReviews.length} New
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {recentReviews.map((review) => (
                <div
                  className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                  key={review.id}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < (review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                          aria-hidden="true"
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-gray-700">{review.rating}</span>
                    </div>
                    {review.created_at && (
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
              ))}
              {recentReviews.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
                  <MessageSquareText className="h-8 w-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-600">No reviews yet</p>
                  <p className="text-xs text-gray-400 mt-1">When guests review your property, they'll appear here.</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-center items-center">
              <Link className="w-full rounded-full bg-md-green text-white font-bold p-2 text-center " href="/business/reviews">
                View all reviews
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

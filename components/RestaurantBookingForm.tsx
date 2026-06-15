"use client";

import { useActionState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
  UsersRound,
} from "lucide-react";
import { createRestaurantBooking } from "@/app/actions/booking-actions";
import { Button } from "@/components/ui/button";

const TIME_OPTIONS = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

type RestaurantBookingFormProps = {
  restaurantId: number;
  restaurantName: string;
  defaultName?: string;
  defaultEmail?: string;
  minDate: string;
};

export function RestaurantBookingForm({
  restaurantId,
  restaurantName,
  defaultName = "",
  defaultEmail = "",
  minDate,
}: RestaurantBookingFormProps) {
  const bookingAction = createRestaurantBooking.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState(bookingAction, {
    error: "",
    success: "",
  });

  if (state?.success) {
    return (
      <section className="rounded-lg border border-md-green/20 bg-white px-6 py-8 shadow-sm">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-md-green/10 text-md-green">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
          Request sent
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-md-brown-dark">
          {restaurantName} has your table request
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-md-muted">
          {state.success}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["Pending review", "Restaurant confirms", "You arrive"].map((step, index) => (
            <div
              key={step}
              className="rounded-lg border border-md-gold/20 bg-md-cream px-4 py-4"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                Step {index + 1}
              </p>
              <p className="mt-2 text-sm font-bold text-md-brown-dark">{step}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-md-gold/20 bg-white px-6 py-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-md-sand text-md-green">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
            Table request
          </p>
          <h2 className="font-display text-3xl font-bold text-md-brown-dark">
            Choose your visit
          </h2>
        </div>
      </div>

      {state?.error ? (
        <div
          role="alert"
          className="mt-6 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />
          <p>{state.error}</p>
        </div>
      ) : null}

      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-bold text-md-brown-dark">Date</span>
          <div className="relative mt-2">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <input
              type="date"
              name="requested_date"
              min={minDate}
              defaultValue={minDate}
              required
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm font-semibold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-md-brown-dark">Time</span>
          <div className="relative mt-2">
            <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <select
              name="requested_time"
              defaultValue="20:00"
              required
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm font-bold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-md-brown-dark">Guests</span>
          <div className="relative mt-2">
            <UsersRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <input
              type="number"
              name="guests"
              min="1"
              max="20"
              defaultValue="2"
              required
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm font-semibold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
            />
          </div>
        </label>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-md-brown-dark">Name</span>
          <div className="relative mt-2">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <input
              type="text"
              name="customer_name"
              defaultValue={defaultName}
              required
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
              placeholder="Full name"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-md-brown-dark">Phone</span>
          <div className="relative mt-2">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <input
              type="tel"
              name="customer_phone"
              required
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
              placeholder="+212 6 12 34 56 78"
            />
          </div>
        </label>

        <label className="block col-span-2">
          <span className="text-sm font-bold text-md-brown-dark">Email</span>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <input
              type="email"
              name="customer_email"
              defaultValue={defaultEmail}
              required
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
              placeholder="you@example.com"
            />
          </div>
        </label>


      </div>

      <label className="mt-7 block">
        <span className="text-sm font-bold text-md-brown-dark">Notes</span>
        <div className="relative mt-2">
          <MessageSquareText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-md-muted" aria-hidden="true" />
          <textarea
            name="notes"
            rows={4}
            className="w-full rounded-lg border border-md-sand-dark bg-md-cream/40 py-3 pl-11 pr-3 text-sm text-md-brown-dark outline-none transition placeholder:text-md-muted focus:border-md-gold focus:bg-white"
            placeholder="Dietary needs, seating preference, accessibility notes..."
          />
        </div>
      </label>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-md-muted">
          Requests are submitted as pending until the restaurant confirms them.
        </p>
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 gap-2 bg-md-green px-6 font-bold text-white hover:bg-md-brown-dark"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isPending ? "Sending..." : "Send request"}
        </Button>
      </div>
    </form>
  );
}

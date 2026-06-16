"use client";

import { useActionState, useMemo, useState } from "react";
import {
  AlertCircle,
  BedDouble,
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
import { createAccommodationBooking } from "@/app/actions/booking-actions";
import { Button } from "@/components/ui/button";

export type AccommodationRoomOption = {
  id: number;
  name: string;
  max_guests: number | null;
  base_price: number | null;
  units: number | null;
};

type AccommodationBookingFormProps = {
  stayId: number;
  stayName: string;
  roomOptions: AccommodationRoomOption[];
  defaultName?: string;
  defaultEmail?: string;
  minDate: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
};

function parseIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getNights(checkIn: string, checkOut: string) {
  const start = parseIsoDate(checkIn);
  const end = parseIsoDate(checkOut);

  if (!start || !end) return 0;

  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

function formatMad(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "MAD",
  }).format(value);
}

export function AccommodationBookingForm({
  stayId,
  stayName,
  roomOptions,
  defaultName = "",
  defaultEmail = "",
  minDate,
  defaultCheckIn,
  defaultCheckOut,
}: AccommodationBookingFormProps) {
  const bookingAction = createAccommodationBooking.bind(null, stayId);
  const [state, formAction, isPending] = useActionState(bookingAction, {
    error: "",
    success: "",
  });
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [rooms, setRooms] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState(
    roomOptions[0]?.id ? String(roomOptions[0].id) : "",
  );

  const nights = getNights(checkIn, checkOut);
  const selectedRoom = roomOptions.find((room) => String(room.id) === selectedRoomId);
  const estimatedTotal = useMemo(() => {
    if (!selectedRoom?.base_price || nights < 1) return null;
    return selectedRoom.base_price * rooms * nights;
  }, [nights, rooms, selectedRoom?.base_price]);

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
          {stayName} has your stay request
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-md-muted">
          {state.success}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["Pending review", "Hotel confirms", "You check in"].map((step, index) => (
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
          <BedDouble className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
            Stay request
          </p>
          <h2 className="font-display text-3xl font-bold text-md-brown-dark">
            Choose your stay
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

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-md-brown-dark">Check-in</span>
          <div className="relative mt-2">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <input
              type="date"
              name="check_in_date"
              min={minDate}
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              required
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm font-semibold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-md-brown-dark">Check-out</span>
          <div className="relative mt-2">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <input
              type="date"
              name="check_out_date"
              min={checkIn || minDate}
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              required
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm font-semibold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
            />
          </div>
        </label>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <label className="block md:col-span-3">
          <span className="text-sm font-bold text-md-brown-dark">Room type</span>
          <div className="relative mt-2">
            <BedDouble className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <select
              name="room_type_id"
              value={selectedRoomId}
              onChange={(event) => setSelectedRoomId(event.target.value)}
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm font-bold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
            >
              {roomOptions.length > 0 ? (
                roomOptions.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                    {room.base_price ? ` - ${formatMad(room.base_price)} / night` : ""}
                  </option>
                ))
              ) : (
                <option value="">Hotel assigns room type</option>
              )}
            </select>
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-md-brown-dark">Rooms</span>
          <div className="relative mt-2">
            <BedDouble className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <input
              type="number"
              name="rooms"
              min="1"
              max="7"
              value={rooms}
              onChange={(event) => setRooms(Number(event.target.value))}
              required
              className="h-12 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 pl-11 pr-3 text-sm font-semibold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
            />
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

        <label className="block">
          <span className="text-sm font-bold text-md-brown-dark">Arrival</span>
          <div className="relative mt-2">
            <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
            <input
              type="time"
              name="arrival_time"
              defaultValue="15:00"
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

        <label className="block md:col-span-2">
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
            placeholder="Room preferences, arrival details, accessibility notes..."
          />
        </div>
      </label>

      <div className="mt-7 rounded-lg border border-md-gold/20 bg-md-cream px-4 py-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
              Nights
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-md-brown-dark">
              {nights || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
              Rooms
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-md-brown-dark">
              {rooms || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
              Estimate
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-md-brown-dark">
              {estimatedTotal ? formatMad(estimatedTotal) : "On request"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-md-muted">
          Requests stay pending until the hotel confirms availability and rate.
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

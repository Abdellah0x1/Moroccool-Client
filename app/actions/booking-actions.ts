"use server"

import { getCurrentProfile, requireUser } from "@/lib/auth"
import {
  ownerCanManageBooking,
  ownerCanManageRestaurantBooking,
  type BookingStatus,
} from "@/lib/bookings"
import { sendBookingStatusEmail } from "@/lib/email"
import { createClient } from "@/lib/supabase/server"
import type { Place } from "@/types"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"


type BookingState = {
  error?: string,
  success?: string
}

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
] as const

const readString = (form: FormData, key: string): string => {
  return String(form.get(key) ?? "").trim()
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isBookingStatus(value: string): value is BookingStatus {
  return BOOKING_STATUSES.includes(
    value as BookingStatus,
  )
}

function todayIsoString() {
  return new Date().toISOString().slice(0, 10);
}

function getStayNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

export async function createRestaurantBooking(restaurantId: number, _prevState: BookingState, formData: FormData): Promise<BookingState> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const user = await requireUser();

  const { data: restaurant, error: RestaurantError } = await supabase.from('etablissement').select("id, business_id, name, type").eq("id", restaurantId).maybeSingle();
  const restaurantRow = restaurant as Pick<Place, "id" | "business_id" | "name" | "type"> | null

  if (!restaurantRow || RestaurantError || restaurantRow.type.toLocaleLowerCase() != "restaurant") {
    return {
      error: "Restaurant not found"
    }
  }

  const requestedDate = readString(formData, "requested_date");
  const requestedTime = readString(formData, "requested_time");
  const guests = Number(readString(formData, "guests"));
  const customerName = readString(formData, "customer_name");
  const customerEmail = readString(formData, "customer_email");
  const customerPhone = readString(formData, "customer_phone");
  const notes = readString(formData, "notes");


  if (!isValidDate(requestedDate) || requestedDate < todayIsoString()) {
    return { error: "Choose a valid future date" }
  }

  if (!isValidTime(requestedTime)) {
    return {
      error: "Choose a valid time"
    }
  }

  if (!customerName || !customerEmail || !customerPhone) {
    return {
      error: "Name, email, and phone are required"
    }
  }

  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    return { error: "Number of guests must be between 1 and 20" }
  }

  const { data: booking, error: BookingError } = await supabase.from('bookings').insert({
    type: 'restaurant',
    etablissement_id: restaurantId,
    status: 'pending',
    user_id: user.id,
    business_id: restaurantRow.business_id,
    customer_email: customerEmail,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_note: notes || null
  }).select('id').single()

  if (!booking || BookingError) {
    console.log('booking error ', BookingError)
    return {
      error: "Failed to created booking"
    }
  }

  const { data: bookingDetails, error: bookingDetailsError } = await supabase.from('restaurant_booking_details').insert({
    booking_id: booking.id,
    requested_date: requestedDate,
    requested_time: requestedTime,
    guests
  }).select('*').single()

  if (!bookingDetails || bookingDetailsError) {
    console.log('booking details error ', bookingDetailsError)
    return {
      error: "failed to created booking details"
    }
  }

  revalidatePath(`/restaurants/${restaurantId}/book`);
  revalidatePath(`/business/bookings`);
  revalidatePath("/business/availability");

  return { success: "Booking created successfully" };
}








export async function updateBookingStatus(
  bookingId: number,
  status: BookingStatus,
  formData?: FormData,
) {
  if (!Number.isInteger(bookingId) || bookingId < 1) return
  if (!isBookingStatus(status)) return

  const ownerNote = readString(formData ?? new FormData(), "owner_note")

  if (status === "rejected" && !ownerNote) return

  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== 'business_owner') return

  const canManage = await ownerCanManageBooking(user.id, bookingId)

  if (!canManage) return

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      id,
      type,
      customer_email,
      customer_name,
      status,
      owner_note,
      etablissement_id
    `)
    .eq("id", bookingId)
    .single();

  if (!booking) return;

  if (status === "confirmed" && booking.type === "hotel") {
    const { data: hotelDetails } = await supabase
      .from("accommodation_booking_details")
      .select("room_type_id, check_in, check_out, rooms")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (!hotelDetails?.room_type_id) return;

    const availability = await checkAccommodationAvailability({
      supabase,
      roomTypeId: hotelDetails.room_type_id,
      checkIn: hotelDetails.check_in,
      checkOut: hotelDetails.check_out,
      requestedRooms: hotelDetails.rooms,
      excludeBookingId: bookingId,
    });

    if (!availability.available) {
      return;
    }
  }

  const { data: updatedBooking, error: errorUpdate } = await supabase.from('bookings').update({
    status: status,
    owner_note: ownerNote || null,
    updated_at: new Date().toISOString(),
  }).eq('id', bookingId).select(`
    id,
    type,
    customer_email,
    customer_name,
    status,
    owner_note,
    etablissement_id
  `).single()

  if (!updatedBooking || errorUpdate) {
    console.log('error updating booking status', errorUpdate)
    return
  }

  const { data: listing } = await supabase
    .from("etablissement")
    .select("name")
    .eq("id", updatedBooking.etablissement_id)
    .maybeSingle()

  if (updatedBooking.type === "restaurant") {
    const { data: bookingDetails } = await supabase
      .from("restaurant_booking_details")
      .select("requested_date, requested_time, guests")
      .eq("booking_id", bookingId)
      .maybeSingle()

    if (bookingDetails) {
      await sendBookingStatusEmail({
        customerEmail: updatedBooking.customer_email,
        customerName: updatedBooking.customer_name,
        listingName: listing?.name ?? "the restaurant",
        bookingType: "restaurant",
        status,
        details: [
          { label: "Date", value: bookingDetails.requested_date },
          { label: "Time", value: bookingDetails.requested_time },
          { label: "Guests", value: `${bookingDetails.guests} people` },
        ],
        ownerNote: updatedBooking.owner_note,
      })
    }
  }

  if (updatedBooking.type === "hotel") {
    const { data: bookingDetails } = await supabase
      .from("accommodation_booking_details")
      .select(`
        check_in,
        check_out,
        guests,
        rooms,
        arrival_time,
        quoted_price,
        room_type:accommodation_room_types(name)
      `)
      .eq("booking_id", bookingId)
      .maybeSingle()

    if (bookingDetails) {
      const roomType = Array.isArray(bookingDetails.room_type)
        ? bookingDetails.room_type[0]
        : bookingDetails.room_type
      const details = [
        { label: "Check-in", value: bookingDetails.check_in },
        { label: "Check-out", value: bookingDetails.check_out },
        { label: "Guests", value: `${bookingDetails.guests} people` },
        { label: "Rooms", value: String(bookingDetails.rooms) },
        bookingDetails.arrival_time
          ? { label: "Arrival", value: String(bookingDetails.arrival_time).slice(0, 5) }
          : null,
        roomType?.name ? { label: "Room type", value: roomType.name } : null,
      ].filter((detail): detail is { label: string; value: string } => detail !== null)

      await sendBookingStatusEmail({
        customerEmail: updatedBooking.customer_email,
        customerName: updatedBooking.customer_name,
        listingName: listing?.name ?? "the hotel",
        bookingType: "hotel",
        status,
        details,
        ownerNote: updatedBooking.owner_note,
      })
    }
  }

  revalidatePath('/business/bookings');
  revalidatePath('/business/dashboard')
}

export async function updateRestaurantBookingStatus(
  bookingId: number,
  status: BookingStatus,
  formData?: FormData,
) {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== 'business_owner') return

  const canManage = await ownerCanManageRestaurantBooking(user.id, bookingId)

  if (!canManage) return

  return updateBookingStatus(bookingId, status, formData)
}





function getStayDates(checkIn: string, checkOut: string) {
  const dates: string[] = [];
  const current = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  while (current < end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

async function checkAccommodationAvailability({
  supabase,
  roomTypeId,
  checkIn,
  checkOut,
  requestedRooms,
  excludeBookingId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
  requestedRooms: number;
  excludeBookingId?: number;
}) {
  const nights = getStayDates(checkIn, checkOut);

  if (nights.length === 0) {
    return { available: false, error: "Invalid stay dates" };
  }

  const { data: roomType } = await supabase
    .from("accommodation_room_types")
    .select("id, units")
    .eq("id", roomTypeId)
    .maybeSingle();

  if (!roomType) {
    return { available: false, error: "Room type not found" };
  }

  const { data: availabilityRows } = await supabase
    .from("accommodation_availability")
    .select("date, status, available_units, min_nights")
    .eq("room_type_id", roomTypeId)
    .gte("date", checkIn)
    .lt("date", checkOut);

  const { data: bookedRows } = await supabase
    .from("accommodation_booking_details")
    .select(`
      booking_id,
      check_in,
      check_out,
      rooms,
      booking:bookings!inner(status)
    `)
    .eq("room_type_id", roomTypeId)
    .eq("booking.status", "confirmed")
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);

  const availabilityByDate = new Map(
    (availabilityRows ?? []).map((row) => [row.date, row])
  );

  const bookedRoomsByDate = new Map<string, number>();

  for (const booking of bookedRows ?? []) {
    if (excludeBookingId && booking.booking_id === excludeBookingId) continue;

    for (const night of getStayDates(booking.check_in, booking.check_out)) {
      bookedRoomsByDate.set(
        night,
        (bookedRoomsByDate.get(night) ?? 0) + booking.rooms
      );
    }
  }

  for (const night of nights) {
    const rule = availabilityByDate.get(night);

    const baseUnits =
      rule?.status === "closed"
        ? 0
        : rule?.available_units ?? roomType.units;

    const alreadyBooked = bookedRoomsByDate.get(night) ?? 0;
    const remaining = baseUnits - alreadyBooked;

    if (requestedRooms > remaining) {
      return {
        available: false,
        error: `Only ${Math.max(remaining, 0)} rooms left on ${night}`,
      };
    }

    if (rule?.min_nights && nights.length < rule.min_nights) {
      return {
        available: false,
        error: `Minimum stay is ${rule.min_nights} nights for ${night}`,
      };
    }
  }

  return { available: true };
}


export async function createAccommodationBooking(
  stayId: number,
  _prevState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const user = await requireUser();

  const { data: stay, error: stayError } = await supabase
    .from("etablissement")
    .select("id, business_id, name, type")
    .eq("id", stayId)
    .maybeSingle();
  const stayRow = stay as Pick<Place, "id" | "business_id" | "name" | "type"> | null;

  if (!stayRow || stayError || stayRow.type.toLowerCase() !== "hotel") {
    return { error: "Stay not found" };
  }

  const customerName = readString(formData, "customer_name");
  const customerPhone = readString(formData, "customer_phone");
  const customerEmail = readString(formData, "customer_email");
  const rooms = Number(readString(formData, "rooms"));
  const guests = Number(readString(formData, "guests"));
  const checkIn = readString(formData, "check_in_date");
  const checkOut = readString(formData, "check_out_date");
  const notes = readString(formData, "notes");
  const arrivalTime = readString(formData, "arrival_time");
  const roomTypeId = Number(readString(formData, "room_type_id"));

  if (!isValidDate(checkIn) || checkIn < todayIsoString()) {
    return { error: "Choose a valid check-in date" };
  }

  if (!isValidDate(checkOut) || checkIn >= checkOut) {
    return { error: "Choose a check-out date after check-in" };
  }

  if (arrivalTime && !isValidTime(arrivalTime)) {
    return { error: "Choose a valid arrival time" };
  }

  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    return { error: "Number of guests must be between 1 and 20" };
  }

  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 7) {
    return { error: "Number of rooms must be between 1 and 7" };
  }

  if (!customerName || !customerPhone || !customerEmail) {
    return { error: "Name, email, and phone are required" };
  }

  const availability = await checkAccommodationAvailability({
    supabase,
    roomTypeId: roomTypeId,
    checkIn,
    checkOut,
    requestedRooms: rooms,
  });

  if (!availability.available) {
    return { error: availability.error };
  }

  let roomType: {
    id: number;
    max_guests: number | null;
    base_price: number | null;
  } | null = null;

  if (Number.isInteger(roomTypeId) && roomTypeId > 0) {
    const { data: roomTypeData, error: roomTypeError } = await supabase
      .from("accommodation_room_types")
      .select("id, max_guests, base_price")
      .eq("id", roomTypeId)
      .eq("etablissement_id", stayId)
      .maybeSingle();

    if (roomTypeError || !roomTypeData) {
      return { error: "Selected room type is not available" };
    }

    roomType = roomTypeData;

    if (roomType.max_guests && guests > roomType.max_guests * rooms) {
      return { error: "Guest count is too high for the selected room type" };
    }
  }

  const nights = getStayNights(checkIn, checkOut);
  const quotedPrice = roomType?.base_price ? roomType.base_price * rooms * nights : null;

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      type: "hotel",
      status: "pending",
      user_id: user.id,
      business_id: stayRow.business_id,
      etablissement_id: stayId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      customer_note: notes || null,
    })
    .select("id")
    .single();

  if (!booking || bookingError) {
    console.log("accommodation booking error", bookingError);
    return { error: "Failed to create booking" };
  }

  const { error: detailsError } = await supabase
    .from("accommodation_booking_details")
    .insert({
      booking_id: booking.id,
      room_type_id: roomType?.id ?? null,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      rooms,
      arrival_time: arrivalTime || null,
      quoted_price: quotedPrice,
    });

  if (detailsError) {
    console.log("accommodation booking details error", detailsError);
    await supabase.from("bookings").delete().eq("id", booking.id);
    return { error: "Failed to create booking details" };
  }

  revalidatePath(`/accomodation/${stayId}/book`);
  revalidatePath("/business/bookings");
  revalidatePath("/business/dashboard");

  return {
    success:
      "Your stay request was sent. The hotel can now confirm availability or reply with details.",
  };
}

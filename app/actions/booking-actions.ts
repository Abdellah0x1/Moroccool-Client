"use server"

import { getCurrentProfile, requireUser } from "@/lib/auth"
import {
  ownerCanManageRestaurantBooking,
  type RestaurantBookingStatus,
} from "@/lib/bookings"
import { sendRestaurantBookingStatusEmail } from "@/lib/email"
import { createClient } from "@/lib/supabase/server"
import type { Place } from "@/types"
import { error } from "console"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"


type BookingState = {
  error?: string,
  success?: string
}

const RESTAURANT_BOOKING_STATUSES = [
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

function isRestaurantBookingStatus(value: string): value is RestaurantBookingStatus {
  return RESTAURANT_BOOKING_STATUSES.includes(
    value as RestaurantBookingStatus,
  )
}

function todayIsoString() {
  return new Date().toISOString().slice(0, 10);
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








export async function updateRestaurantBookingStatus(
  bookingId: number,
  status: RestaurantBookingStatus,
  formData?: FormData,
) {
  if (!Number.isInteger(bookingId) || bookingId < 1) return
  if (!isRestaurantBookingStatus(status)) return

  const ownerNote = readString(formData ?? new FormData(), "owner_note")

  if (status === "rejected" && !ownerNote) return

  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== 'business_owner') return

  const canManage = await ownerCanManageRestaurantBooking(user.id, bookingId)

  if (!canManage) return

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: updatedBooking, error: errorUpdate } = await supabase.from('bookings').update({
    status: status,
    owner_note: ownerNote || null,
    updated_at: new Date().toISOString(),
  }).eq('id', bookingId).select(`
    id,
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

  const { data: bookingDetails } = await supabase
    .from("restaurant_booking_details")
    .select("requested_date, requested_time, guests")
    .eq("booking_id", bookingId)
    .maybeSingle()

  const { data: restaurant } = await supabase
    .from("etablissement")
    .select("name")
    .eq("id", updatedBooking.etablissement_id)
    .maybeSingle()

  if (bookingDetails) {
    await sendRestaurantBookingStatusEmail({
      customerEmail: updatedBooking.customer_email,
      customerName: updatedBooking.customer_name,
      restaurantName: restaurant?.name ?? "the restaurant",
      status,
      requestedDate: bookingDetails.requested_date,
      requestedTime: bookingDetails.requested_time,
      guests: bookingDetails.guests,
      ownerNote: updatedBooking.owner_note,
    })
  }

  revalidatePath('/business/bookings');
  revalidatePath('/business/dashboard')
}


// export async function createAccommodationBooking(stayId: number, _prevState: BookingState, formData: FormData): Promise<BookingState> {
//   const cookieStore = await cookies();
//   const supabase = await createClient(cookieStore);

//   const user = await requireUser();

//   const { data: stay, error: stayError } = await supabase
//     .from("etablissement")
//     .select("id, business_id, name, type")
//     .eq("id", stayId)
//     .maybeSingle();
//   const stayRow = stay as Pick<Place, "id" | "business_id" | "name" | "type"> | null;

//   if (!stayRow || stayError || stayRow.type.toLocaleLowerCase() !== "hotel") {
//     return { error: "Stay not found" };
//   }

//   const checkInDate = readString(formData, "check_in_date");
//   const checkOutDate = readString(formData, "check_out_date");
//   const guests = Number(readString(formData, "guests"));
//   const rooms = Number(readString(formData, "rooms"));
//   const roomTypeId = Number(readString(formData, "room_type_id"));
//   const arrivalTime = readString(formData, "arrival_time");
//   const customerName = readString(formData, "customer_name");
//   const customerEmail = readString(formData, "customer_email");
//   const customerPhone = readString(formData, "customer_phone");
//   const notes = readString(formData, "notes");

//   if (!isValidDate(checkInDate) || checkInDate < todayIsoString()) {
//     return { error: "Choose a valid check-in date" };
//   }

//   if (!isValidDate(checkOutDate) || checkOutDate <= checkInDate) {
//     return { error: "Choose a check-out date after check-in" };
//   }

//   if (arrivalTime && !isValidTime(arrivalTime)) {
//     return { error: "Choose a valid arrival time" };
//   }

//   if (!Number.isInteger(guests) || guests < 1 || guests > 30) {
//     return { error: "Number of guests must be between 1 and 30" };
//   }

//   if (!Number.isInteger(rooms) || rooms < 1 || rooms > 10) {
//     return { error: "Number of rooms must be between 1 and 10" };
//   }

//   if (!customerName || !customerEmail || !customerPhone) {
//     return { error: "Name, email, and phone are required" };
//   }

//   let roomType: { id: number; name: string; max_guests: number | null } | null = null;

//   if (Number.isInteger(roomTypeId) && roomTypeId > 0) {
//     const { data: roomTypeData, error: roomTypeError } = await supabase
//       .from("accommodation_room_types")
//       .select("id, name, max_guests")
//       .eq("id", roomTypeId)
//       .eq("etablissement_id", stayId)
//       .maybeSingle();

//     if (roomTypeError || !roomTypeData) {
//       return { error: "Selected room type is not available" };
//     }

//     roomType = roomTypeData;

//     if (roomType.max_guests && guests > roomType.max_guests * rooms) {
//       return { error: "Guest count is too high for the selected room type" };
//     }
//   }

//   const { data: booking, error: bookingError } = await supabase.from("bookings").insert({
//     type: "accommodation",
//     etablissement_id: stayId,
//     status: "pending",
//     user_id: user.id,
//     business_id: stayRow.business_id,
//     customer_email: customerEmail,
//     customer_name: customerName,
//     customer_phone: customerPhone,
//     customer_note: notes || null,
//   }).select("id").single();

//   if (!booking || bookingError) {
//     console.log("accommodation booking error", bookingError);
//     return { error: "Failed to create booking" };
//   }

//   const { error: bookingDetailsError } = await supabase.from("accommodation_booking_details").insert({
//     booking_id: booking.id,
//     room_type_id: roomType?.id ?? null,
//     room_type_name: roomType?.name ?? null,
//     check_in_date: checkInDate,
//     check_out_date: checkOutDate,
//     guests,
//     rooms,
//     arrival_time: arrivalTime || null,
//   });

//   if (bookingDetailsError) {
//     console.log("accommodation booking details error", bookingDetailsError);
//     await supabase.from("bookings").delete().eq("id", booking.id);
//     return { error: "Failed to create booking details" };
//   }

//   revalidatePath(`/accomodation/${stayId}/book`);
//   revalidatePath("/business/bookings");
//   revalidatePath("/business/dashboard");

//   return { success: "Your stay request was sent. The hotel can now confirm availability or reply with details." };
// }


export async function createAccommodationBooking(formData: FormData): Promise<BookingState> {
  const name = readString(formData, 'customer_name');
  const phone = readString(formData, 'customer_phone');
  const email = readString(formData, 'customer_email');
  const rooms = Number(formData.get('rooms'));
  const guests = Number(formData.get('guests'))
  const checkin = readString(formData, 'check_in_date');
  const checkout = readString(formData, 'check_out_date');
  const notes = readString(formData, 'notes');
  const roomType = readString(formData, 'room_type_id');
  const roomTypeId = Number(readString(formData, 'room_type_id'))

  if (!isValidDate(checkin) || checkin < todayIsoString()) {
    return { error: 'Invalid check-in date' }
  }

  if (!isValidDate(checkout) || checkin >= checkout) {
    return { error: "Invalid check-out date" }
  }

  if (!Number.isInteger(guests) || guests < 1 || guests < 20) {
    return { error: "Number of guests must be between 1 and 20" }
  }
}
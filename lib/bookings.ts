import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwnerId, getListingByBusinessId } from "@/lib/business";
import type { RestaurantBooking } from "@/types";

export type RestaurantBookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled";

type OwnerBookingResult = {
  business: Awaited<ReturnType<typeof getBusinessByOwnerId>>;
  listing: Awaited<ReturnType<typeof getListingByBusinessId>>;
  bookings: RestaurantBooking[];
  error?: string;
};

type JoinedBooking = {
  id: number;
  business_id: number | string | null;
  etablissement_id: number;
  status: RestaurantBookingStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_note: string | null;
  owner_note: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type RestaurantBookingDetailRow = {
  id: number;
  booking_id: number;
  requested_time: string;
  requested_date: string;
  guests: number;
  booking: JoinedBooking | JoinedBooking[] | null;
};

function getJoinedBooking(row: RestaurantBookingDetailRow) {
  return Array.isArray(row.booking) ? row.booking[0] : row.booking;
}


export async function getRestaurantBookingsForOwner(ownerId: string): Promise<OwnerBookingResult> {
  const business = await getBusinessByOwnerId(ownerId);
  const listing = business ? await getListingByBusinessId(Number(business?.id)) : null;

  if (!business || !listing) {
    return {
      business,
      listing,
      bookings: []
    }
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error: bookingError } = await supabase
    .from("restaurant_booking_details")
    .select(`
      booking_id,
      requested_time,
      requested_date,
      guests,
      booking:bookings!inner(
        id,
        business_id,
        etablissement_id,
        status,
        customer_name,
        customer_phone,
        customer_email,
        customer_note,
        owner_note,
        created_at,
        updated_at
      )
    `)
    .eq("booking.business_id", business.id)
    .eq("booking.etablissement_id", listing.id)
    .eq("booking.type", "restaurant")
    .order("requested_date", { ascending: true })
    .order("requested_time", { ascending: true });

  if (!data || bookingError) {
    console.log('fetching bookings error : ', bookingError)
    return {
      business,
      listing,
      bookings: []
    }
  }

  const formatted = ((data ?? []) as RestaurantBookingDetailRow[])
    .map((row): RestaurantBooking | null => {
      const booking = getJoinedBooking(row);

      if (!booking) return null;

      return {
        id: booking.id,
        restaurant_booking_id: row.id,
        business_id: booking.business_id,
        restaurant_id: booking.etablissement_id,
        status: booking.status,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        customer_email: booking.customer_email,
        notes: booking.customer_note,
        occasion: null,
        owner_note: booking.owner_note,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        requested_date: row.requested_date,
        requested_time: row.requested_time,
        guests: row.guests,
      };
    })
    .filter((booking): booking is RestaurantBooking => booking !== null);

  return {
    business,
    listing,
    bookings: formatted,
  }
}

export async function ownerCanManageRestaurantBooking(
  ownerId: string,
  bookingId: number,
) {
  const { business, listing } = await getRestaurantBookingsForOwner(ownerId);

  if (!business || !listing) return false;

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .eq("business_id", business.id)
    .eq("etablissement_id", listing.id)
    .eq("type", "restaurant")
    .maybeSingle();

  if (error) {
    console.log("restaurant booking permission lookup error", error);
    return false;
  }

  return Boolean(data);
}

import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwnerId, getListingByBusinessId } from "@/lib/business";
import type {
  AccommodationBooking,
  BookingStatus,
  OwnerBooking,
  RestaurantBooking,
} from "@/types";

export type { BookingStatus };
export type RestaurantBookingStatus = BookingStatus;

type OwnerBookingResult = {
  business: Awaited<ReturnType<typeof getBusinessByOwnerId>>;
  listing: Awaited<ReturnType<typeof getListingByBusinessId>>;
  bookings: OwnerBooking[];
  error?: string;
};

type JoinedBooking = {
  id: number;
  type: "restaurant" | "hotel";
  business_id: number | string | null;
  etablissement_id: number;
  status: BookingStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_note: string | null;
  owner_note: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type RestaurantBookingDetailRow = {
  booking_id: number;
  requested_time: string;
  requested_date: string;
  guests: number;
  booking: JoinedBooking | JoinedBooking[] | null;
};

type RoomTypeRow = {
  id: number;
  name: string | null;
};

type AccommodationBookingDetailRow = {
  booking_id: number;
  room_type_id: number | null;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
  arrival_time: string | null;
  quoted_price: number | string | null;
  room_type: RoomTypeRow | RoomTypeRow[] | null;
  booking: JoinedBooking | JoinedBooking[] | null;
};

function getJoinedBooking(row: {
  booking: JoinedBooking | JoinedBooking[] | null;
}) {
  return Array.isArray(row.booking) ? row.booking[0] : row.booking;
}

function getJoinedRoomType(row: AccommodationBookingDetailRow) {
  return Array.isArray(row.room_type) ? row.room_type[0] : row.room_type;
}

function toNumber(value: number | string | null) {
  if (value === null) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

async function getOwnerContext(ownerId: string) {
  const business = await getBusinessByOwnerId(ownerId);
  const listing = business ? await getListingByBusinessId(Number(business.id)) : null;

  return { business, listing };
}

async function queryRestaurantBookingsForOwner(
  ownerId: string,
): Promise<OwnerBookingResult> {
  const { business, listing } = await getOwnerContext(ownerId);

  if (!business || !listing) {
    return {
      business,
      listing,
      bookings: [],
    };
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
        type,
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

  if (bookingError) {
    console.log("fetching restaurant bookings error:", bookingError);
    return {
      business,
      listing,
      bookings: [],
      error: "Could not load restaurant bookings",
    };
  }

  const formatted = ((data ?? []) as RestaurantBookingDetailRow[])
    .map((row): RestaurantBooking | null => {
      const booking = getJoinedBooking(row);

      if (!booking) return null;

      return {
        id: booking.id,
        type: "restaurant",
        listing_id: booking.etablissement_id,
        restaurant_booking_id: row.booking_id,
        restaurant_id: booking.etablissement_id,
        business_id: booking.business_id,
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
  };
}

async function queryAccommodationBookingsForOwner(
  ownerId: string,
): Promise<OwnerBookingResult> {
  const { business, listing } = await getOwnerContext(ownerId);

  if (!business || !listing) {
    return {
      business,
      listing,
      bookings: [],
    };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error: bookingError } = await supabase
    .from("accommodation_booking_details")
    .select(`
      booking_id,
      room_type_id,
      check_in,
      check_out,
      guests,
      rooms,
      arrival_time,
      quoted_price,
      room_type:accommodation_room_types(
        id,
        name
      ),
      booking:bookings!inner(
        id,
        type,
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
    .eq("booking.type", "hotel")
    .order("check_in", { ascending: true });

  if (bookingError) {
    console.log("fetching accommodation bookings error:", bookingError);
    return {
      business,
      listing,
      bookings: [],
      error: "Could not load accommodation bookings",
    };
  }

  const formatted = ((data ?? []) as AccommodationBookingDetailRow[])
    .map((row): AccommodationBooking | null => {
      const booking = getJoinedBooking(row);
      const roomType = getJoinedRoomType(row);

      if (!booking) return null;

      return {
        id: booking.id,
        type: "hotel",
        listing_id: booking.etablissement_id,
        accommodation_booking_id: row.booking_id,
        accommodation_id: booking.etablissement_id,
        business_id: booking.business_id,
        status: booking.status,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        customer_email: booking.customer_email,
        notes: booking.customer_note,
        owner_note: booking.owner_note,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        room_type_id: row.room_type_id,
        room_type_name: roomType?.name ?? null,
        check_in: row.check_in,
        check_out: row.check_out,
        guests: row.guests,
        rooms: row.rooms,
        arrival_time: row.arrival_time,
        quoted_price: toNumber(row.quoted_price),
      };
    })
    .filter((booking): booking is AccommodationBooking => booking !== null);

  return {
    business,
    listing,
    bookings: formatted,
  };
}

export async function getRestaurantBookingsForOwner(
  ownerId: string,
): Promise<OwnerBookingResult & { bookings: RestaurantBooking[] }> {
  const result = await queryRestaurantBookingsForOwner(ownerId);

  return {
    ...result,
    bookings: result.bookings.filter(
      (booking): booking is RestaurantBooking => booking.type === "restaurant",
    ),
  };
}

export async function getAccommodationBookingsForOwner(
  ownerId: string,
): Promise<OwnerBookingResult & { bookings: AccommodationBooking[] }> {
  const result = await queryAccommodationBookingsForOwner(ownerId);

  return {
    ...result,
    bookings: result.bookings.filter(
      (booking): booking is AccommodationBooking => booking.type === "hotel",
    ),
  };
}

export async function getBookingsForOwner(
  ownerId: string,
): Promise<OwnerBookingResult> {
  const { business, listing } = await getOwnerContext(ownerId);
  const listingType = String(listing?.type ?? "").toLowerCase();

  if (!business || !listing) {
    return {
      business,
      listing,
      bookings: [],
    };
  }

  if (listingType === "restaurant") {
    return queryRestaurantBookingsForOwner(ownerId);
  }

  if (listingType === "hotel") {
    return queryAccommodationBookingsForOwner(ownerId);
  }

  return {
    business,
    listing,
    bookings: [],
  };
}

export async function ownerCanManageBooking(ownerId: string, bookingId: number) {
  const business = await getBusinessByOwnerId(ownerId);

  if (!business) return false;

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (error) {
    console.log("booking permission lookup error", error);
    return false;
  }

  return Boolean(data);
}

export async function ownerCanManageRestaurantBooking(
  ownerId: string,
  bookingId: number,
) {
  const canManage = await ownerCanManageBooking(ownerId, bookingId);

  if (!canManage) return false;

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .eq("type", "restaurant")
    .maybeSingle();

  if (error) {
    console.log("restaurant booking permission lookup error", error);
    return false;
  }

  return Boolean(data);
}

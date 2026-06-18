
import { supabase } from "./supabase/client";

export async function getBookingsForUser(userId: string) {
  const { data: bookingRows, error: bookingsError } = await supabase.from('bookings').select(`
      id,
      type,
      status,
      etablissement_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_note,
      owner_note,
      created_at,
      etablissment:etablissement(
        id,
        name,
        city,
        type,
        images
      )
        `).eq('user_id', userId).order('created_at', { ascending: false })
  if (bookingsError) {
    console.log('error fetching current user bookings :', bookingsError);
    return { bookings: [], error: 'user bookings fetching error' }
  }

  let bookings = bookingRows ?? []
  const restaurantBookingIds = bookings.filter(booking => booking.type == 'restaurant').map(booking => booking.id);
  const hotelsBookingIds = bookings.filter(booking => booking.type == 'hotel').map(booking => booking.id);

  const { data: RestaurantDetails, error: RestaurantError } = restaurantBookingIds.length > 0 ? await supabase.from('restaurant_booking_details').select('booking_id, requested_date, requested_time, guests').in('booking_id', restaurantBookingIds) : { data: [], error: null }

  const { data: accommodationDetails, error: accommodationError } = hotelsBookingIds.length > 0 ? await supabase.from('accommodation_booking_details').select(`
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
            )
          `).in('booking_id', hotelsBookingIds) : { data: [], error: null };

  if (accommodationError || RestaurantError) {
    console.log('user booking details lookup error ', accommodationError, RestaurantError)
  }

  const RestaurantDetailsByBookingId = new Map(
    (RestaurantDetails ?? []).map(detail => [detail.booking_id, detail])
  )

  const accommodationDetailsByBookingId = new Map(
    (accommodationDetails ?? []).map(detail => [detail.booking_id, detail])
  )

  const formatted = bookings.map((booking) => {
    if (booking.type === "restaurant") {
      return {
        ...booking,
        restaurant_details: RestaurantDetailsByBookingId.get(booking.id) ?? null,
        accommodation_details: null
      }
    }
  })

  return {
    bookings: formatted,
    error: null
  }
}

export type OpeningHoursValue =
    | string
    | {
        active?: boolean,
        start?: string,
        end?: string,
    }

export type OpeningHoursMap = Record<string, OpeningHoursValue>

export type Place = {
    id: number,
    name: string,
    city: string,
    type: "hotel" | "restaurant" | "cafe" | "Hotel" | "Restaurant" | "Cafe",
    address: string,
    rating: number,
    images: string[],
    phone?: string,
    website?: string,
    openingHours?: OpeningHoursMap,
    opening_hours?: OpeningHoursMap,
    openingHoure?: OpeningHoursMap,
    google_maps_embed_url?: string | null,
    min_nights?: number,
    max_nights?: number,
    check_in_time?: string,
    check_out_time?: string,
    business_id?: number | string | null,
}


export type City = {
    id: number,
    name: string,
    slug: string,
    description: string,
    image: string
}



export type Profile = {
    id: string,
    name: string,
    role: string,
    email: string,
    created_at: string
}

export type Review = {
    id: string,
    rating: number,
    user_id: string,
    place_id: number,
    comment: string,
    created_at?: string
}

export type User = {
    id: string,
    email: string,
    password: string
}

export type Business = {
    id: string | number,
    owner_id: string,
    name: string,
    phone: string | null,
    email: string | null,
    city: string | null,
    address: string | null,
    status: string | null,
    commission_model: string | null,
    commission_value: number | null,
    created_at: string | null,
    updated_at: string | null,
}



export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled"

type BaseOwnerBooking = {
    id: number,
    type: "restaurant" | "hotel",
    listing_id: number,
    business_id: number | string | null,
    customer_name: string,
    customer_email: string,
    customer_phone: string,
    status: BookingStatus,
    notes: string | null,
    owner_note: string | null,
    created_at: string | null,
    updated_at: string | null,
}

export type RestaurantBooking = BaseOwnerBooking & {
    type: "restaurant",
    restaurant_booking_id?: number,
    restaurant_id: number,
    requested_date: string,
    requested_time: string,
    guests: number,
    occasion: string | null,
}

export type AccommodationBooking = BaseOwnerBooking & {
    type: "hotel",
    accommodation_booking_id?: number,
    accommodation_id: number,
    room_type_id: number | null,
    room_type_name: string | null,
    check_in: string,
    check_out: string,
    guests: number,
    rooms: number,
    arrival_time: string | null,
    quoted_price: number | null,
}

export type OwnerBooking = RestaurantBooking | AccommodationBooking

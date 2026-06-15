
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



export type RestaurantBooking = {
    id: number,
    restaurant_booking_id?: number,
    restaurant_id: number,
    business_id: number | string | null,
    customer_name: string,
    customer_email: string,
    customer_phone: string,
    requested_date: string,
    requested_time: string,
    guests: number,
    status: "pending" | "confirmed" | "rejected" | "cancelled",
    occasion: string | null,
    notes: string | null,
    owner_note: string | null,
    created_at: string | null,
    updated_at: string | null,
}

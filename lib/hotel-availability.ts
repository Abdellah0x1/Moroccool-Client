import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getBusinessByOwnerId, getListingByBusinessId } from "./business"


function toLocalIsoDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    next.setDate(next.getDate() + days);
    return next;
}

export async function getHotelAvailabilityForOwner(ownerId: string, weekStart: Date, days = 7) {
    const business = await getBusinessByOwnerId(ownerId);
    const listing = business ? await getListingByBusinessId(Number(business.id)) : null;

    if (!business || !listing || String(listing.type ?? "").toLowerCase() !== "hotel") {
        return { business, listing, roomTypes: [], dates: [], cells: [], error: null }
    }

    const start = toLocalIsoDate(weekStart);
    const end = toLocalIsoDate(addDays(weekStart, days - 1));
    const rangeEndExclusive = toLocalIsoDate(addDays(weekStart, days));

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);

    const { data: roomTypes, error: roomTypesError } = await supabase
        .from("accommodation_room_types")
        .select("id, name, max_guests, units, base_price")
        .eq('etablissement_id', listing.id)
        .order("name");

    if (!roomTypes || roomTypesError) {
        return { business, listing, roomTypes: [], dates: [], cells: [], error: "Could not load room types" }
    }



    const dates = Array.from({ length: days }, (_, index) => toLocalIsoDate(addDays(weekStart, index)));

    if (roomTypes.length === 0) {
        return { business, listing, roomTypes, dates, cells: [], error: null }
    }

    const roomTypesIds = roomTypes.map(roomType => roomType.id);

    const [{ data: overrides, error: overridesError }, { data: bookings, error: bookingsError }] = await Promise.all([
        supabase
            .from("accommodation_availability")
            .select("room_type_id, date, status, available_units, min_nights, owner_note")
            .in("room_type_id", roomTypesIds)
            .gte("date", start)
            .lte("date", end),
        supabase
            .from("accommodation_booking_details")
            .select(`
                room_type_id,
                check_in,
                check_out,
                rooms,
                booking:bookings!inner(
                    status,
                    business_id,
                    etablissement_id
                )
            `)
            .in("room_type_id", roomTypesIds)
            .eq("booking.business_id", business.id)
            .eq("booking.etablissement_id", listing.id)
            .eq("booking.status", "confirmed")
            .lt("check_in", rangeEndExclusive)
            .gt("check_out", start)
    ])

    if (overridesError || bookingsError) {
        console.log("hotel availability lookup error", overridesError ?? bookingsError);
        return { business, listing, roomTypes: [], dates: [], cells: [], error: "Could not load hotel availability" }
    }

    const overrideByCell = new Map((overrides ?? []).map(row => [`${row.room_type_id}-${row.date}`, row]));

    const cells = roomTypes.flatMap(room => dates.map(date => {
        const override = overrideByCell.get(`${room.id}-${date}`);

        const bookedRooms = (bookings ?? [])
            .filter(booking => booking.room_type_id === room.id && booking.check_in <= date && booking.check_out > date)
            .reduce((total, booking) => total + booking.rooms, 0);


        const inventoryLimit = override?.available_units ?? room.units;
        const status = override?.status ?? "open";
        const sellableUnits = status === "closed" ? 0 : Math.max(0, inventoryLimit - bookedRooms);

        return {
            roomTypeId: room.id,
            roomTypeName: room.name,
            date,
            status,
            inventoryLimit,
            bookedRooms,
            sellableUnits,
            minNights: override?.min_nights ?? 1,
            ownerNote: override?.owner_note ?? null
        }
    }));


    return { business, listing, roomTypes, dates, cells, error: null }
}

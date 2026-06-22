import "server-only"

import { cookies } from "next/headers"
import { createClient } from "./supabase/server"



export type GuestAvailabilityCell = {
    roomTypeId: number,
    date: string,
    sellableUnits: number,
    minNights: number,
    available: boolean
}

function toLocalIsoDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    next.setDate(next.getDate() + days);
    return next;
}


export async function getGuestHotelAvailability(
    stayId: number,
    startDate: Date,
    days = 90,
) {
    const supabase = await createClient(await cookies());

    const start = toLocalIsoDate(startDate);
    const end = toLocalIsoDate(addDays(startDate, days - 1));
    const endExclusive = toLocalIsoDate(addDays(startDate, days));

    const { data: roomTypes, error: roomTypesError } = await supabase
        .from("accommodation_room_types")
        .select("id, units")
        .eq("etablissement_id", stayId);

    if (roomTypesError) {
        console.log("guest room type lookup error", roomTypesError);
        return { cells: [] as GuestAvailabilityCell[], error: "Could not load availability" };
    }

    if (!roomTypes?.length) {
        return { cells: [] as GuestAvailabilityCell[], error: null };
    }

    const roomTypeIds = roomTypes.map((room) => room.id);

    const [{ data: overrides, error: overridesError }, { data: bookings, error: bookingsError }] =
        await Promise.all([
            supabase
                .from("accommodation_availability")
                .select("room_type_id, date, status, available_units, min_nights")
                .in("room_type_id", roomTypeIds)
                .gte("date", start)
                .lte("date", end),

            supabase
                .from("accommodation_booking_details")
                .select(`
          room_type_id,
          check_in,
          check_out,
          rooms,
          booking:bookings!inner(status, etablissement_id)
        `)
                .in("room_type_id", roomTypeIds)
                .eq("booking.etablissement_id", stayId)
                .eq("booking.status", "confirmed")
                .lt("check_in", endExclusive)
                .gt("check_out", start),
        ]);

    if (overridesError || bookingsError) {
        return {
            cells: [] as GuestAvailabilityCell[],
            error: "Could not load availability",
        };
    }

    const dates = Array.from({ length: days }, (_, index) =>
        toLocalIsoDate(addDays(startDate, index)),
    );

    const overridesByCell = new Map(
        (overrides ?? []).map((row) => [`${row.room_type_id}-${row.date}`, row]),
    );

    const cells = roomTypes.flatMap((room) =>
        dates.map((date) => {
            const override = overridesByCell.get(`${room.id}-${date}`);

            const confirmedRooms = (bookings ?? [])
                .filter(
                    (booking) =>
                        booking.room_type_id === room.id &&
                        booking.check_in <= date &&
                        booking.check_out > date,
                )
                .reduce((total, booking) => total + booking.rooms, 0);

            const inventoryLimit =
                override?.status === "closed"
                    ? 0
                    : (override?.available_units ?? room.units);

            const sellableUnits = Math.max(0, inventoryLimit - confirmedRooms);

            return {
                roomTypeId: room.id,
                date,
                sellableUnits,
                minNights: override?.min_nights ?? 1,
                available: sellableUnits > 0,
            };
        }),
    );

    return { cells, error: null };
}

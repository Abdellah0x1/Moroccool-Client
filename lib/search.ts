"use server"

import { supabase } from "./supabase/client";


export async function searchCity(query: string) {

    const { data, error } = await supabase
        .from("city")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) {
        console.log('error searching accorss city', error);
        return [];
    }

    return data;
}


export async function searchPlaces(query: string, type: "hotel" | "restaurant" | "place") {
    const { data, error } = await supabase
        .from("etablissement")
        .select("*")
        .in("type", [type, type[0].toUpperCase() + type.slice(1)])
        .or(
            `name.ilike.%${query}%,city.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`
        );
    if (error) {
        console.log('error searching across etablishmant', error);
        return [];
    }
    return data;
}
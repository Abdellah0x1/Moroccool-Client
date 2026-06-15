import { supabase } from "./supabase/client"

export async function getAllCities() {
    try {
        const { data: cities, error } = await supabase.from('city').select("*")
        if (error) throw new Error("error fetching all cites")
        return cities
    } catch (err) {
        console.log(err)
    }
}

export async function getCityBySlug(slug: string) {
    try {
        const { data: city, error } = await supabase.from("city").select("*").eq("slug", slug);
        if (error) throw new Error("Error getting city by slug")
        return city
    } catch (err) {
        console.log(err)
        return null
    }
}
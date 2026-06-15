"use server"


import { supabase } from "@/lib/supabase/client"
import type { Place } from "@/types/index"


type GetPlacesParams = {
    name?: string
    city?: string,
    type?: "hotel" | "restaurant" | "cafe",
    page?: number,
    limit?: number
}

function titleCaseType(type: GetPlacesParams["type"]) {
    if (!type) return type
    return `${type.charAt(0).toUpperCase()}${type.slice(1)}`
}


export async function getPlaces({
    name,
    city,
    type,
    page = 1,
    limit = 9
}: GetPlacesParams): Promise<Place[]> {
    const from = (page - 1) * limit
    const to = from + limit - 1
    let query = supabase
        .from("etablissement")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to)

    if (city) {
        query = query.eq("city", city)
    }

    if (type) {
        query = query.in("type", [type, titleCaseType(type)])
    }

    if (name) {
        query = query.ilike("name", `%${name}%`)
    }

    const { data, error } = await query
    if (error) throw new Error("error getting in getPlaces from supabase")
    return (data ?? []) as Place[]

}


export async function getPlaceById(id: number) {
    try {
        const { data, error } = await supabase.from("etablissement").select().eq('id', id)
        if (error) throw new Error("error getting place by id")
        return data
    } catch (error) {
        console.log(error)
    }

}

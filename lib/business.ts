import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/types";

export async function getBusinessByOwnerId(ownerId: string) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.log("business lookup error", error);
        return null;
    }

    return data as Business | null;
}


export async function getListingByBusinessId(businessId: number) {
    if (!Number.isFinite(businessId)) return null;

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);

    const { data: listing, error: listingError } = await supabase
        .from('etablissement')
        .select("*")
        .eq('business_id', businessId)
        .maybeSingle();

    if (listingError) {
        console.log("listing lookup error", listingError)
        return null;
    }

    return listing ?? null;
}

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getRecentBookings() {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);
}

export async function getRecentReviews() {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)


    const { data: reviews, error: ReviewsError } = await supabase.from('reviews').select('*').limit(4).order('created_at', { ascending: false })
    if (ReviewsError) {
        console.log('Error while fetching recent reviews', ReviewsError)
        return { reviews: [] }
    }
    return { reviews: reviews ?? [] }

}



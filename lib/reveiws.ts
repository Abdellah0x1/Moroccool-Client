import "server-only"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { Review } from "@/types"

export type ReviewWithAuthor = Review & {
    author_name?: string | null
}

export async function getAllReviews({ placeId }: { placeId: number }): Promise<ReviewWithAuthor[]> {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const { data: reviews, error } = await supabase
        .from('review')
        .select('*')
        .eq('place_id', placeId)

    if (error) {
        console.log('error fetching reviews', error)
        return []
    }

    const reviewRows = (reviews ?? []) as Review[]
    const userIds = [...new Set(reviewRows.map((review) => review.user_id).filter(Boolean))]

    if (userIds.length === 0) return reviewRows

    const { data: profiles, error: profileError } = await supabase
        .from('profile')
        .select('id, name')
        .in('id', userIds)

    if (profileError) {
        console.log('error fetching review profiles', profileError)
        return reviewRows
    }

    const profileById = new Map(
        (profiles ?? []).map((profile) => [profile.id, profile.name as string | null])
    )

    return reviewRows.map((review) => ({
        ...review,
        author_name: profileById.get(review.user_id) ?? null,
    }))
}

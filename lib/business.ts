import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Business, Review } from "@/types";

type SupabaseServerClient = ReturnType<typeof createClient>;

type ReviewerProfile = {
    id: string,
    name: string | null,
    email: string | null,
}

export type ReviewWithProfile = Review & {
    author_name: string | null,
    author_email: string | null,
}

async function attachReviewerProfiles(
    supabase: SupabaseServerClient,
    reviewRows: Review[],
): Promise<ReviewWithProfile[]> {
    const userIds = [...new Set(reviewRows.map((review) => review.user_id).filter(Boolean))]

    if (userIds.length === 0) {
        return reviewRows.map((review) => ({
            ...review,
            author_name: null,
            author_email: null,
        }))
    }

    const { data: profiles, error: profileError } = await supabase
        .from("profile")
        .select("id, name, email")
        .in("id", userIds)

    if (profileError) {
        console.log("review profile lookup error", profileError)

        return reviewRows.map((review) => ({
            ...review,
            author_name: null,
            author_email: null,
        }))
    }

    const profileById = new Map(
        ((profiles ?? []) as ReviewerProfile[]).map((profile) => [
            profile.id,
            profile,
        ]),
    )

    return reviewRows.map((review) => {
        const profile = profileById.get(review.user_id)

        return {
            ...review,
            author_name: profile?.name ?? null,
            author_email: profile?.email ?? null,
        }
    })
}

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



export async function getReviewsByListingId(listingId: number): Promise<ReviewWithProfile[]> {
    if (!Number.isFinite(listingId)) return [];

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);

    const { data: reviews, error: reviewsError } = await supabase
        .from('review')
        .select("*")
        .eq('place_id', listingId)
        .order('created_at', { ascending: false })

    if (reviewsError) {
        console.log("reviews lookup error", reviewsError);
        return [];
    }

    return attachReviewerProfiles(supabase, (reviews ?? []) as Review[]);
}

export async function getReviewsByBusinessId(businessId: number): Promise<ReviewWithProfile[]> {
    if (!Number.isFinite(businessId)) return [];

    const listing = await getListingByBusinessId(businessId);

    if (!listing?.id) return [];

    return getReviewsByListingId(Number(listing.id));
}

export async function getRecentReviews(listingId: number) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: reviews, error: ReviewsError } = await supabase.from('review').select('*').eq('place_id', listingId).order('created_at', { ascending: false }).limit(4)

    if (!reviews || ReviewsError) {
        console.log('recent reviews fetching error ', ReviewsError)
        return []
    }


    return reviews;
}

"use server"

import {createClient} from "@/lib/supabase/server"
import { cookies } from "next/headers";
import {requireUser} from "@/lib/auth"
import {revalidatePath} from "next/cache"


type ReviewState = {
    error?: string,
    success?: string
}

function getFormMessage(formData: FormData, key: string, fallback: string) {
    const value = String(formData.get(key) ?? "").trim();
    return value || fallback;
}

export async function createReview(
    placeId:number,
    _prevState: ReviewState,
    formData: FormData,
):Promise<ReviewState>{
    const user = await requireUser()

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);

    const rating = Number(formData.get('rating'));

    if(!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return {error: getFormMessage(formData, "ratingError", "Rating must be between 1 and 5")}
    }
    const comment = String(formData.get('comment') ?? '').trim();

    if(comment.length <3) {
        return {error: getFormMessage(formData, "commentError", "Review comment must be at least 3 characters")}
    }
    const {error} = await supabase.from('review').insert({place_id: placeId,rating, user_id: user.id, comment})

    if(error) return {
        error: error.message
    }

    revalidatePath(`/restaurants/${placeId}`);
    return {
        success: getFormMessage(formData, "successMessage", "Review submitted")
    }
}

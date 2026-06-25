"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"


type loginState = {
    error?: string
}
function safeNextPath(value: FormDataEntryValue | null) {
    const next = String(value || "").trim();

    if (!next.startsWith("/") || next.startsWith("//")) return "/";

    return next;
}

export async function userLoginWithPassword(_prevState: loginState, formData: FormData) {
    const email = String(formData.get('email')).trim().toLocaleLowerCase()
    const password = String(formData.get('password')).trim()
    const next = safeNextPath(formData.get("next"))
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) return {
        error: error.message
    }

    revalidatePath('/', 'layout')
    redirect(next);
}


export async function loginUserWithGoogle(formData?: FormData) {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);


    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const next = safeNextPath(formData?.get("next") ?? null)

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${redirectUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        }
    })

    if (error) throw error;

    return redirect(data.url)
}


export async function loginWithFacebook(formData?: FormData) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const next = safeNextPath(formData?.get("next") ?? null)


    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
            redirectTo: `${redirectUrl}/auth/callback?next=${encodeURIComponent(next)}`
        }
    })

    if (error) throw error;

    return redirect(data.url)
}


export async function userSignUpWithPassword(prevState: { error: string }, formData: FormData) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore)
    const email = String(formData.get('email'))
    const password = String(formData.get('password'))
    const name = String(formData.get('name'))

    if (!email || !password || !name) return {
        error: 'all fields are required'
    }

    if (password.length < 8) return {
        error: "password length should be at least 8 characters"
    }
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                email,
                name
            }
        }
    })

    if (error) {
        return {
            error: error.message
        }
    }
    revalidatePath('/', 'layout')
    redirect('/');

}

export async function userSignOut() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    await supabase.auth.signOut();

    revalidatePath('/', 'layout');
    redirect('/login');
}



const PER_BOOKING_COMMISSION_BY_TYPE: Record<string, number> = {
    hotel: 25,
    riad: 25,
    restaurant: 10,
    cafe: 10,
}

export async function ownerSignup(_prevState: { error?: string }, formData: FormData): Promise<{ error?: string, success?: string }> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const name = String(formData.get("ownerName") || "").trim();
    const email = String(formData.get("ownerEmail") || "").trim().toLowerCase();
    const password = String(formData.get("ownerPassword") || "").trim();
    const phone = String(formData.get("ownerPhone") || "").trim();
    const businessName = String(formData.get("businessName") || "").trim();
    const businessCity = String(formData.get("businessCity") || "").trim();
    const businessType = String(formData.get("businessType") || "").trim().toLowerCase();
    const address = String(formData.get("businessAddress") || "").trim();
    const businessPhone = String(formData.get("businessPhone") || "").trim();
    const businessEmail = String(formData.get("businessEmail") || "").trim().toLowerCase();
    const termsAccepted = formData.get("termsAccepted") === "yes";

    if (!termsAccepted) {
        return {
            error: "You must accept the partner terms",
        }
    }

    if (!name || !email || !password || !phone || !businessName || !businessCity || !businessType || !address || !businessPhone || !businessEmail) {
        return {
            error: "All fields are required",
        }
    }

    const commissionValue = PER_BOOKING_COMMISSION_BY_TYPE[businessType];

    if (commissionValue === undefined) {
        return {
            error: "We currently support hotel, riad, restaurant, and café partners.",
        }
    }
    if (password.length < 8) {
        return {
            error: "password must be atleast 8 characters long",
        }
    }
    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return {
            error: "Invalid Email Address",

        }
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                email,
                name,
                phone,
                role: "business_owner",
            }
        }
    })

    if (signUpError) {
        console.log("sign up error", signUpError)
        return {
            error: signUpError.message
        }
    }

    const userId = data.user?.id;

    if (!userId || data.user?.identities?.length === 0) {
        return {
            error: "Could not create account. This email may already be registered."
        }
    }

    const { error: profileError } = await supabase.from('profile').upsert({
        id: userId,
        email,
        name,
        role: "business_owner",
    })


    if (profileError) {
        console.log("business owner profile error", profileError)
        return {
            error: "Account created, but profile creation failed"
        }
    }

    const { error: businessError } = await supabase.from('businesses').insert({
        owner_id: userId,
        name: businessName,
        city: businessCity,
        address,
        phone: businessPhone,
        email: businessEmail,
        type: businessType,
        status: "pending_review",
        commission_model: "per_booking",
        commission_value: commissionValue
    })

    if (businessError) {
        console.log("business application error", businessError)
        return {
            error: "account created but business profile creation failed"
        }
    }

    revalidatePath("/")
    redirect("/business/dashboard")
}

export const ownerSingup = ownerSignup;

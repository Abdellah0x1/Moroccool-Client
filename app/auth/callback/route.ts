import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";


export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || "/"

    if (code) {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            return NextResponse.redirect(
                new URL(`/login?message=${error.message}`)
            )
        }

        return NextResponse.redirect(
            new URL(next, requestUrl)
        )
    }
}
import "server-only"
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";




export async function getCurrentUser() {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null

    return user
}


export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) return redirect('/login');
    return user
}


export async function requireGuest(){
    const user = await getCurrentUser();
    if(user) redirect('/')
}

// export async function requireAdmin(){
//     const cookieStore = await cookies()
//     const supabase = await createClient(cookieStore);

//     const user = await requireUser(); 
//     const {data: profile, error} = await supabase.from('Profile').select('row').eq('id', user.id);

//     // profile is an array of rows; ensure we have a row and check its role
//     const role = Array.isArray(profile) && profile.length > 0 ? profile[0]?.row?.role : undefined;
//     if (error || role !== 'admin') return redirect('/')
//     return user;
// }


export async function getCurrentProfile() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null

    const { data: Profile, error } = await supabase.from('profile').select('id, email, name, role, created_at').eq('id', user.id).single()

    if (error) {
        console.log(error)
        return null
    }
    return Profile
}

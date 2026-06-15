import "server-only"
import {createClient} from "@supabase/supabase-js"

//SUPABASE CLIENT FOR ADMIN ACTIONS ONLY

export const supabaseAdmin = createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY!);


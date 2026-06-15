"use server"

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getCurrentProfile } from "@/lib/auth";
import uploadToCloudinary from "@/lib/cloudinaryUploader";


export async function SaveBusinessListing(_prevState: { error?: string; success?: boolean }, formData: FormData): Promise<{ success?: boolean, error?: string }> {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore);
    const user = await requireUser();
    const profile = await getCurrentProfile();
    if (profile?.role !== 'business_owner') return { error: 'only business owner can manage listings' }

    const { data: business, error: BusinessError } = await supabase.from("businesses").select("*").eq('owner_id', user.id).single();

    if (!business) return { error: "business not found" }
    if (business.status !== 'approved') return { error: "your business must be approved before you can manage listings" }


    const name = String(formData.get('name'))
    const type = String(formData.get('type'))
    const description = String(formData.get('description'))
    const phone = String(formData.get('phone'))
    const google_maps_embed_url = String(formData.get('google_maps_embed_url') || "")
    const website = String(formData.get('website') || "");
    const images = formData.getAll('images') as File[];



    if (!name || !type || !description || !phone || !google_maps_embed_url) {
        return { success: false, error: "Please fill all the required fileds" }
    }


    if (type == 'hotel' && (!formData.get('check_in_time') || !formData.get('check_out_time') || !formData.get('room_types'))) return { success: false, error: "Please fill all the required fields for hotel" }

    if (type == 'restaurant' && !formData.get('opening_hours')) return { success: false, error: "Please fill all the required fields for restaurant" }

    if (images.length === 0) return { error: "Please upload at least one image" };

    const validImages = images.filter(img => img instanceof File && img.size > 0 && img.type.startsWith('image/'));

    if (validImages.length === 0) return { error: 'Please upload valid images' }

    let imagesUrls: string[] = []
    try {
        imagesUrls = await Promise.all(validImages.map(img => uploadToCloudinary(img, business.name, `businesses/${business.id}`)))
    } catch (error) {
        console.log("Error uploading images: ", error)
        return { error: 'Error uploading images' }

    }


    const { data: listing, error: ListingError } = await supabase.from('etablissement')
        .upsert({
            business_id: business.id,
            name: name,
            type,
            description,
            phone,
            website,
            city: business.city,
            address: business.address,
            rating: 4.5,
            images: imagesUrls,
            google_maps_embed_url,
            openingHours: type == 'restaurant' ? JSON.parse(formData.get('opening_hours') as string) : {},
            check_in_time: type == 'hotel' ? formData.get('check_in_time') : undefined,
            check_out_time: type == 'hotel' ? formData.get('check_out_time') : undefined
        }, { onConflict: 'business_id' })
        .select()
        .single()


    if (ListingError) return { success: false, error: ListingError.message }

    if (type === 'hotel' && listing) {
        const rooms = JSON.parse(formData.get('room_types') as string) as { name: string, maxGuests: number, basePrice: number, units: number }[]

        for (const room of rooms) {
            await supabase.from('accommodation_room_types').upsert({
                etablissement_id: listing.id,
                name: room.name,
                max_guests: room.maxGuests,
                base_price: room.basePrice,
                units: room.units
            })
        }
    }


    revalidatePath('/business/listing')
    revalidatePath('/business/dashboard')
    revalidatePath('/restaurants')
    revalidatePath('/accomodation')
    return {
        success: true
    }
}
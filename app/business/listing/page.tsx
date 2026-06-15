"use client";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Building2,
    FileText,
    Globe,
    LayoutList,
    Phone,
    Type,
    Map,
    Camera,
    Upload,
    X,
    Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react";
import { GoogleMapsEmbedInput } from "@/components/GoogleMapsEmbedInput";
import { RestaurantAvailability } from "@/components/RestaurantAvailability";
import { HotelAvailability } from "@/components/HotelAvailability";
import { useActionState } from "react";
import { SaveBusinessListing } from "@/app/actions/business-actions";
import Link from "next/link";

export default function ListBusiness() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);

    function syncFileInput(files: File[]) {
        if (!fileInputRef.current) return
        const dataTransfer = new DataTransfer();

        files.forEach(file => {
            dataTransfer.items.add(file);
        })

        fileInputRef.current.files = dataTransfer.files;
    }

    function handleFiles(files: File[]) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'))
        const allowed = 8 - photoFiles.length;
        const batch = imageFiles.slice(0, allowed);

        if (batch.length === 0) return

        const nextFiles = [...photoFiles, ...batch];
        setPhotoFiles(nextFiles);
        syncFileInput(nextFiles);

        batch.forEach(file => {
            const reader = new FileReader();

            reader.onload = event => {
                setPreviews(prev => [...prev, event.target?.result as string])
            };
            reader.readAsDataURL(file);
        })
    }

    function removePhoto(index: number) {
        const nextFiles = photoFiles.filter((_, i) => i !== index)
        const nextPreviews = previews.filter((_, i) => i !== index);

        setPhotoFiles(nextFiles);
        setPreviews(nextPreviews);
        syncFileInput(nextFiles);
    }



    const [type, setType] = useState("restaurant");
    const [state, formAction, isPending] = useActionState(SaveBusinessListing, { error: undefined, success: undefined })

    return <form action={formAction} className="font-body text-md-brown-dark">
        <div className="mb-6 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-950">List your business</h1>
            <p className="mt-2 text-md-muted">
                Set up the details travelers will see before they contact or book your business.
            </p>
        </div>

        {/* ── Listing basics ── */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden px-6 py-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-md-sand text-md-green">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">Step 1</p>
                    <h2 className="font-display text-2xl font-bold text-md-brown-dark">Listing basics</h2>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-md-brown-dark">Listing Title</Label>
                    <div className="relative">
                        <Type className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
                        <Input name="name" type="text" className="w-full h-12 pl-11 pr-4 border border-md-sand-dark rounded-lg bg-md-cream/40 transition focus:border-md-gold focus:bg-white" placeholder="e.g, Dar El Bacha Restaurant" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-bold text-md-brown-dark">Business Type</Label>
                    <div className="relative">
                        <LayoutList className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
                        <select value={type} onChange={e => setType(e.target.value)} name="type" className="w-full h-12 appearance-none pl-11 pr-4 border border-md-sand-dark rounded-lg bg-md-cream/40 text-md-brown-dark transition focus:border-md-gold focus:bg-white focus:outline-none">
                            <option value="hotel">Hotel</option>
                            <option value="restaurant">Restaurant</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-bold text-md-brown-dark">Short Description</Label>
                    <div className="relative">
                        <FileText className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-md-muted" aria-hidden="true" />
                        <Textarea name="description" rows={4} className="w-full pl-11 pr-4 py-3 border border-md-sand-dark rounded-lg bg-md-cream/40 transition focus:border-md-gold focus:bg-white" placeholder="Write a short description of your business" />
                    </div>
                </div>
            </div>
        </div>



        {/* ── Contact & Booking ── */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden px-6 py-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-md-sand text-md-green">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">Step 3</p>
                    <h2 className="font-display text-2xl font-bold text-md-brown-dark">Contact &amp; Booking</h2>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-md-brown-dark">Phone</Label>
                    <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
                        <Input name="phone" type="tel" className="w-full h-12 pl-11 pr-4 border border-md-sand-dark rounded-lg bg-md-cream/40 transition focus:border-md-gold focus:bg-white" placeholder="e.g, +212 6 12 34 56 78" />
                    </div>
                </div>



                <div className="space-y-2">
                    <Label className="text-sm font-bold text-md-brown-dark">Website</Label>
                    <div className="relative">
                        <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-md-muted" aria-hidden="true" />
                        <Input name="website" type="url" className="w-full h-12 pl-11 pr-4 border border-md-sand-dark rounded-lg bg-md-cream/40 transition focus:border-md-gold focus:bg-white" placeholder="e.g, https://yourbusiness.com" />
                    </div>
                </div>
            </div>
        </div>

        {/* ── Photos ── */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden px-6 py-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-md-sand text-md-green">
                    <Camera className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-md-gold text-xs font-bold uppercase tracking-[0.16em]">Step 2 </p>
                    <h2 className="font-display text-2xl font-bold text-md-brown-dark">Photos</h2>
                </div>
            </div>
            <p className="mb-6 text-sm text-md-muted ml-[52px]">
                Upload up to 8 photos. The first image will be your cover photo.
            </p>

            <Label
                htmlFor="photo-upload"
                onDragOver={e => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-md-gold', 'bg-md-sand/30')
                }}
                onDragLeave={e => {
                    e.currentTarget.classList.remove('border-md-gold', 'bg-md-sand/30')
                }}
                onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-md-gold', 'bg-md-sand/30')

                    const files = Array.from(e.dataTransfer.files);
                    handleFiles(files);
                }}

                className="group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-md-sand-dark bg-md-cream/40  px-6 py-12 transition-all duration-200 hover:border-md-gold hover:bg-md-sand/20"
            >
                <div className="grid h-14 w-14 rounded-full place-items-center bg-md-sand/30 text-md-gold-dark transition-transform duration-200 group-hover:scale-110">
                    <Upload className="h-6 w-6" />
                </div>

                <div className="text-center">
                    <p className="text-sm font-bold text-md-brown-dark">
                        Click to upload or drage &amp; drop
                    </p>
                    <p className="mt-1 text-xs text-md-muted">PNG, JPG, SVG up to 10MB</p>
                </div>

                <input
                    id="photo-upload"
                    ref={fileInputRef}
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={e => {
                        if (e.target.files) {
                            handleFiles(Array.from(e.target.files))
                        }
                    }}
                />
            </Label>

            {previews.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {previews.map((src, i) => (
                        <div
                            key={`${src}-${i}`}
                            className="group/thumb relative aspect-[4/3] overflow-hidden rounded-lg border border-md-sand-dark bg-md-cream"
                        >
                            <img
                                src={src}
                                alt={`Upload ${i + 1}`}
                                className="h-full w-full object-cover"
                            />

                            {i === 0 && (
                                <span className="absolute left-2 top-2 rounded-full bg-md-green px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                                    Cover
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-md-brown-dark shadow transition hover:bg-red-50 hover:text-red-600 opacity-0 group-hover/thumb:opacity-100"
                                aria-label={`Remove photo ${i + 1}`}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

        </div>


        {/* location */}
        <div className="mb-6 rounded-lg bg-white border border-gray-200 px-6 py-6 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-md-sand text-md-green">
                    <Map className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">Step 4</p>
                    <h2 className="font-display text-2xl font-bold text-md-brown-dark">Location</h2>
                </div>
            </div>
            <GoogleMapsEmbedInput />
        </div>


        {/*Availability & booking rules */}
        <div className="mb-6 rounded-lg bg-white border border-gray-200 px-6 py-6 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-md-sand text-md-green">
                    <Calendar className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">Step 5</p>
                    <h2 className="font-display text-2xl font-bold text-md-brown-dark">Availability & booking rules</h2>
                </div>
            </div>
            {type === "restaurant" && <RestaurantAvailability />}
            {type === "hotel" && <HotelAvailability />}
        </div>


        {/* ── Status feedback ── */}
        {state?.error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm animate-[slideDown_0.25s_ease-out]">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-100 text-red-500">
                    <X className="h-4 w-4" />
                </span>
                <p className="font-medium">{state.error}</p>
            </div>
        )}
        {state?.success && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-sm animate-[slideDown_0.25s_ease-out]">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-500">
                    ✓
                </span>
                <p className="font-medium">Listing saved successfully!</p>
            </div>
        )}

        <div className="flex gap-4 justify-end">
            <Link href="/business/dashboard" className="inline-flex h-12 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-md-brown transition hover:bg-gray-50">Cancel</Link>
            <Button disabled={isPending} type="submit" className="h-12 rounded-lg bg-md-green px-5 font-bold text-white hover:bg-md-brown-dark">
                {isPending ? "Saving…" : "Save listing"}
            </Button>
        </div>
    </form>
}

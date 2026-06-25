"use client"

import { MapPin, Search } from "lucide-react"
import { useT } from "next-i18next/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { City, Place } from "@/types"
import { searchPlaces, searchCity } from "@/lib/search"
import Link from "next/link"

export function GlobalSearchBar() {
    const { t: tCommon } = useT("common")

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ places: Place[], cities: City[] }>({ places: [], cities: [] })
    const [open, setOpen] = useState(false)



    useEffect(() => {
        if (query.length < 2) {
            setResults({ places: [], cities: [] })
            setOpen(false);
            return
        }
        const timeout = setTimeout(async () => {
            const [hotels, restaurants, cities] = await Promise.all([
                searchPlaces(query, "hotel"),
                searchPlaces(query, "restaurant"),
                searchCity(query),
            ])
            setResults({ places: [...hotels, ...restaurants], cities })
            setOpen(true)

        }, 300)

        return () => clearTimeout(timeout) // cancel if user keeps typing
    }, [query])

    return <div className="relative w-full max-w-2xl">
        <form action="/search" className="bg-md-cream rounded-full p-2 flex items-center w-full max-w-2xl shadow-2xl backdrop-blur-sm bg-opacity-95">
            <div className="flex-1 flex items-center px-5 py-2.5">
                <MapPin className="text-md-green mr-3 w-5 h-5 shrink-0" />
                <input
                    type="search"
                    name="query"
                    placeholder={tCommon("search.destinationPlaceholder", { defaultValue: "Where to go?" })}
                    className="bg-transparent border-none outline-none text-md-brown-dark w-full placeholder-md-muted font-body text-[15px]"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => results.places.length + results.cities.length > 0 && setOpen(true)} // open only if there results 
                />
            </div>

            <div className="hidden md:block border-l border-md-gold/25 h-8 mx-1" />

            <Select name="category" defaultValue="destinations">
                <SelectTrigger className="hidden md:flex border-none shadow-none bg-transparent text-md-brown-dark/70 font-body text-sm focus:ring-0 focus:outline-none rounded-full px-4 py-2 h-auto w-auto gap-1.5 cursor-pointer hover:text-md-brown-dark transition-colors">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-md-gold/20 bg-md-cream shadow-xl p-1">
                    <SelectItem className="rounded-lg text-sm font-body cursor-pointer focus:bg-md-gold/10 focus:text-md-brown-dark" value="destinations">{tCommon("search.category.destinations", { defaultValue: "Cities" })}</SelectItem>
                    <SelectItem className="rounded-lg text-sm font-body cursor-pointer focus:bg-md-gold/10 focus:text-md-brown-dark" value="hotels">{tCommon("search.category.hotels", { defaultValue: "Hotels" })}</SelectItem>
                    <SelectItem className="rounded-lg text-sm font-body cursor-pointer focus:bg-md-gold/10 focus:text-md-brown-dark" value="restaurants">{tCommon("search.category.restaurants", { defaultValue: "Restaurants" })}</SelectItem>
                </SelectContent>
            </Select>

            <button type="submit" className="bg-md-green hover:bg-md-green-soft text-md-cream p-3.5 rounded-full transition-colors duration-300 shadow-md flex items-center justify-center shrink-0 cursor-pointer">
                <Search className="w-5 h-5" />
            </button>
        </form>

        {open && (results.cities.length > 0 || results.places.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-md-cream rounded-2xl shadow-xl border border-md-gold/20 p-2 z-50 max-h-96 overflow-y-auto">

                {/* Cities / Destinations */}
                {results.cities.length > 0 && (
                    <>
                        <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-md-muted">Destinations</p>
                        {results.cities.map(city => (
                            <Link
                                key={`city-${city.id}`}
                                href={`/destinations/${city.slug}`}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-md-gold/10 transition-colors"
                            >
                                <img src={city.image} alt={city.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-md-brown-dark">{city.name}</p>
                                    <p className="text-xs text-md-muted line-clamp-1">{city.description}</p>
                                </div>
                            </Link>
                        ))}
                    </>
                )}

                {/* Places (Hotels & Restaurants) */}
                {results.places.length > 0 && (
                    <>
                        {results.cities.length > 0 && <div className="border-t border-md-gold/15 my-1.5" />}
                        <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-md-muted">Places</p>
                        {results.places.map(place => {
                            const isHotel = place.type.toLowerCase() === "hotel";
                            const href = isHotel ? `/accomodation/${place.id}` : `/restaurants/${place.id}`;
                            return (
                                <Link
                                    key={`place-${place.id}`}
                                    href={href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-md-gold/10 transition-colors"
                                >
                                    {place.images?.[0] ? (
                                        <img src={place.images[0]} alt={place.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-md-gold/10 shrink-0 flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-md-muted" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-md-brown-dark truncate">{place.name}</p>
                                        <p className="text-xs text-md-muted">
                                            <span className="inline-block bg-md-gold/10 text-md-brown-dark/70 rounded px-1.5 py-0.5 mr-1.5 text-[10px] font-semibold uppercase">
                                                {isHotel ? "Hotel" : "Restaurant"}
                                            </span>
                                            {place.city}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </>
                )}
            </div>
        )}
    </div>

}
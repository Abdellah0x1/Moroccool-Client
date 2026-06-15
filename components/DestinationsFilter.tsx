"use client"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useT } from "next-i18next/client"

export function DestinationsFilter() {

    const { t } = useT("places")
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    function updateFilter(key: string, value: string) {
        const newParams = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            newParams.set(key, value)
        } else {
            newParams.delete(key)
        }

        const search = newParams.toString()
        router.push(`${pathName}?${search}`)
    }

    return <div className="flex flex-col md:flex-row gap-6 md:gap-12 bg-md-cream border border-md-gold/30 p-8 rounded-2xl shadow-sm max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-bold text-md-gold tracking-wider uppercase font-body">
                {t("filter.cityLabel", { defaultValue: "Location" })}
            </label>
            <div className="relative">
                <select onChange={e => updateFilter("city", e.target.value)} className="w-full appearance-none bg-white border border-md-sand-dark text-md-brown-dark py-3 px-4 rounded-lg focus:outline-none focus:border-md-gold focus:ring-1 focus:ring-md-gold transition-colors duration-200 cursor-pointer font-body">
                    <option value="all">{t("filter.allCities", { defaultValue: "All Cities" })}</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Chefchaouen">Chefchaouen</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-md-gold">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-bold text-md-gold tracking-wider uppercase font-body">
                {t("filter.categoryLabel", { defaultValue: "Category" })}
            </label>
            <div className="relative">
                <select onChange={(e) => updateFilter("type", e.target.value)} className="w-full appearance-none bg-white border border-md-sand-dark text-md-brown-dark py-3 px-4 rounded-lg focus:outline-none focus:border-md-gold focus:ring-1 focus:ring-md-gold transition-colors duration-200 cursor-pointer font-body">
                    <option value="all">{t("filter.allCategories", { defaultValue: "All Categories" })}</option>
                    <option value="hotel">{t("filter.hotelCategory", { defaultValue: "Hotels" })}</option>
                    <option value="restaurant">{t("filter.restaurantCategory", { defaultValue: "Restaurants" })}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-md-gold">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
            </div>
        </div>

    </div>

}

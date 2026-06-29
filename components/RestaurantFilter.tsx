"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useT } from "next-i18next/client";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";

type RestaurantFilterProps = {
  title?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  cityLabel?: string;
  submitLabel?: string;
  resetLabel?: string;
  cities?: string[];
};

const DEFAULT_CITIES = ["Marrakech", "Casablanca", "Chefchaouen", "Agadir", "Tanger", "Rabat", "Meknes"];

export function RestaurantFilter({
  title,
  searchLabel,
  searchPlaceholder,
  cityLabel,
  submitLabel,
  resetLabel,
  cities = DEFAULT_CITIES,
}: RestaurantFilterProps) {
  const { t } = useT("places");
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const activeQuery = searchParams.get("query") || "";
  const activeCity = searchParams.get("city") || "";
  const hasFilters = Boolean(activeQuery || activeCity);
  const copy = {
    title: title ?? t("filter.title", { defaultValue: "Refine results" }),
    searchLabel: searchLabel ?? t("filter.searchLabel", { defaultValue: "Search" }),
    searchPlaceholder:
      searchPlaceholder ??
      t("filter.searchPlaceholder", {
        defaultValue: "Find restaurant, cafe, cuisine...",
      }),
    cityLabel: cityLabel ?? t("filter.cityLabel", { defaultValue: "Location" }),
    submitLabel: submitLabel ?? t("filter.submitLabel", { defaultValue: "Apply" }),
    resetLabel: resetLabel ?? t("filter.resetLabel", { defaultValue: "Clear" }),
  };

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("query") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const nextParams = new URLSearchParams();

    if (query) nextParams.set("query", query);
    if (city) nextParams.set("city", city);

    const search = nextParams.toString();
    router.push(search ? `${pathName}?${search}` : pathName);
  }

  return (
    <form
      onSubmit={applyFilters}
      className="grid gap-5 rounded-lg border border-md-gold/20 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end md:p-6"
    >
      <div className="md:col-span-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {copy.title}
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-muted">
          {copy.searchLabel}
        </span>
        <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-md-sand-dark bg-md-cream px-4 transition focus-within:border-md-gold focus-within:ring-2 focus-within:ring-md-gold/15">
          <Search className="h-4 w-4 flex-none text-md-green" aria-hidden="true" />
          <input
            name="query"
            defaultValue={activeQuery}
            placeholder={copy.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-md-brown-dark outline-none placeholder:text-md-muted/70"
          />
        </span>
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-muted">
          {copy.cityLabel}
        </span>
        <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-md-sand-dark bg-md-cream px-4 transition focus-within:border-md-gold focus-within:ring-2 focus-within:ring-md-gold/15">
          <MapPin className="h-4 w-4 flex-none text-md-green" aria-hidden="true" />
          <select
            name="city"
            defaultValue={activeCity}
            className="min-w-0 flex-1 appearance-none bg-transparent text-sm font-semibold text-md-brown-dark outline-none"
          >
            <option value="">
              {t("filter.allCities", { defaultValue: "All Cities" })}
            </option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-md-green px-5 text-sm font-bold text-md-cream transition hover:bg-md-green-soft md:flex-none"
        >
          {copy.submitLabel}
        </button>
        {hasFilters ? (
          <Link
            href={pathName}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-md-gold/30 px-4 text-sm font-bold text-md-brown-dark transition hover:border-md-gold hover:text-md-green"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            {copy.resetLabel}
          </Link>
        ) : null}
      </div>
    </form>
  );
}

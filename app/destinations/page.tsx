import { getAllCities } from "@/lib/cities";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import type { City } from "@/types/index";
import { getT } from "next-i18next/server";

export default async function DestinationsPage() {
  const { t } = await getT("places");
  const cities = ((await getAllCities()) as City[] | undefined) || [];

  return (
    <main className="min-h-screen bg-md-cream font-body">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex flex-col justify-center items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={cities[0]?.image || "/images/hero.jpg"}
            alt={t("destinations.heroAlt", { defaultValue: "Destinations hero" })}
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-md-brown-dark/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center pt-20">
          <p className="text-md-gold font-body tracking-[0.2em] uppercase text-sm mb-4 drop-shadow-md font-bold">
            {t("destinations.eyebrow", { defaultValue: "Destinations Hub" })}
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-md-cream mb-6 max-w-4xl drop-shadow-lg leading-tight">
            {t("destinations.title", {
              defaultValue: "Discover the Soul of the Maghreb",
            })}
          </h1>
          <p className="text-lg md:text-xl text-md-sand font-body max-w-2xl drop-shadow">
            {t("destinations.description", {
              defaultValue:
                "From the hidden riads of Marrakesh to the azure streets of Chefchaouen, explore our hand-picked collection of Morocco's most iconic cities.",
            })}
          </p>
        </div>
      </section>




      {/* Cities Grid Section */}
      <section className="py-24 px-6 container mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <Compass className="w-10 h-10 text-md-gold mb-4" />
          <h2 className="text-3xl font-display font-bold text-md-brown-dark">
            {t("destinations.sectionTitle", {
              defaultValue: "Explore Our Curated Cities",
            })}
          </h2>
          <div className="w-24 h-1 bg-md-gold mt-6 rounded-full opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {cities.map((city) => (
            <Link href={`/destinations/${city.slug}`} key={city.id} className="group cursor-pointer block">
              <div className="relative h-96 md:h-[450px] rounded-3xl overflow-hidden shadow-lg group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-500">
                <Image
                  src={city.image || "/images/hero.jpg"}
                  alt={
                    city.name ||
                    t("destinations.fallbackImageAlt", {
                      defaultValue: "Moroccan city",
                    })
                  }
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-md-brown-dark/95 via-md-brown-dark/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-4xl font-display font-bold text-md-cream mb-2 drop-shadow-md">
                    {city.name}
                  </h3>
                  <p className="text-md-sand-dark text-sm font-body opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 line-clamp-2 mb-4">
                    {city.description ||
                      t("destinations.fallbackDescription", {
                        defaultValue:
                          "Immerse yourself in the rich culture, stunning architecture, and vibrant life of this majestic destination.",
                      })}
                  </p>
                  <div className="flex items-center text-md-gold opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                    <span className="font-bold text-xs tracking-widest uppercase mr-2">
                      {t("destinations.exploreCity", {
                        defaultValue: "Explore City",
                      })}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

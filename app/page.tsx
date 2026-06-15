"use client";

import { useState } from "react";
import { useT } from "next-i18next/client";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Mail, Compass, Hotel, UtensilsCrossed, Sparkles } from "lucide-react";

export default function Home() {
  const { t } = useT("home");
  const { t: tCommon } = useT("common");
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const destinations = [
    { "name": t('destination.marrakech.title'), "image": "https://res.cloudinary.com/dcw6rqiaz/image/upload/v1780319778/marrakech_m9vzv5.webp", "description": t('destination.marrakech.description') },
    { "name": t('destination.chefchaouen.title'), "image": "https://res.cloudinary.com/dcw6rqiaz/image/upload/v1780319778/chefchaoun_eb1yfa.jpg", "description": t('destination.chefchaouen.description') },
    { "name": t('destination.casablanca.title'), "image": "https://res.cloudinary.com/dcw6rqiaz/image/upload/v1780319777/casablanca_ihqy1l.avif", "description": t('destination.casablanca.description') },
  ];

  const journeySteps = [
    {
      key: "discover",
      icon: Compass,
      color: "md-green",
      link: "/destinations",
    },
    {
      key: "stay",
      icon: Hotel,
      color: "md-gold",
      link: "/accomodation",
    },
    {
      key: "dine",
      icon: UtensilsCrossed,
      color: "md-green",
      link: "/restaurants",
    },
    {
      key: "explore",
      icon: Sparkles,
      color: "md-gold",
      link: "/destinations",
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dcw6rqiaz/image/upload/v1781464157/Mosquee_Maroc_p6isbh.jpg"
            alt="Sahara Sunset"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-md-brown-dark/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 pt-32 text-center flex flex-col items-center">
          <p className="text-md-gold font-body tracking-[0.2em] uppercase text-sm mb-6 drop-shadow-md">
            {t("hero.eyebrow", { defaultValue: "Curated Luxury Travel" })}
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-md-cream mb-8 max-w-4xl drop-shadow-lg leading-tight">
            {t("hero.title", { defaultValue: "Explore the Magic of Morocco" })}
          </h1>
          <p className="text-xl text-md-cream/90 font-body mb-12 max-w-2xl drop-shadow">
            {t("hero.description", { defaultValue: "Unveil the Timeless Secrets of the Modern Oasis" })}
          </p>

          {/* Smart Search Bar Mockup */}
          <div className="bg-md-cream rounded-full p-2 flex flex-col md:flex-row items-center w-full max-w-2xl shadow-2xl backdrop-blur-sm bg-opacity-95">
            <div className="flex-1 flex items-center px-6 py-3 w-full md:w-auto">
              <MapPin className="text-md-green mr-3 w-5 h-5" />
              <input
                type="text"
                placeholder={tCommon("search.destinationPlaceholder", { defaultValue: "Where to go?" })}
                className="bg-transparent border-none outline-none text-md-brown-dark w-full placeholder-md-muted font-body"
              />
            </div>
            <button className="bg-md-green hover:bg-md-green-soft text-md-cream p-4 rounded-full transition-colors duration-300 w-full md:w-auto mt-2 md:mt-0 shadow-md flex items-center justify-center">
              <Search className="w-5 h-5" />
              <span className="md:hidden ml-2 font-semibold">
                {tCommon("search.searchButton", { defaultValue: "Search" })}
              </span>
            </button>
          </div>
        </div>
      </section>


      {/* destination */}
      <section className="bg-md-cream py-20 max-w-7xl mx-auto">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-display font-bold text-md-brown-dark mb-12 text-center text-md-gold">
            {t('destination.title', { defaultValue: "Top Destinations" })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-md-brown-dark/90 via-md-brown-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-3xl font-display font-bold text-md-cream mb-2 drop-shadow-md">{destination.name}</h3>
                    <p className="text-md-sand text-sm font-body opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-2">
                      {destination.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan Your Journey */}
      <section id="plan-journey" className="relative py-24 px-6 overflow-hidden bg-md-brown-dark">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-md-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-md-green/5 rounded-full blur-3xl" />
        </div>

        {/* Subtle geometric pattern overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              rgba(212, 175, 55, 0.5) 40px,
              rgba(212, 175, 55, 0.5) 41px
            )`,
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section header */}
          <div className="text-center mb-20">
            <p className="text-md-gold font-body tracking-[0.2em] uppercase text-xs mb-4">
              {t("journey.eyebrow", { defaultValue: "How It Works" })}
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-md-cream mb-6">
              {t("journey.title", { defaultValue: "Plan Your Journey" })}
            </h2>
            <p className="text-md-sand-dark font-body text-base max-w-2xl mx-auto leading-relaxed">
              {t("journey.subtitle", {
                defaultValue: "From dream to destination in four simple steps. We handle the details so you can focus on the adventure.",
              })}
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-[2px] z-0">
              <div className="w-full h-full border-t-2 border-dashed border-md-gold/20" />
            </div>

            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              const isGold = step.color === "md-gold";

              return (
                <Link
                  key={step.key}
                  href={step.link}
                  className="group relative z-10 block"
                  onMouseEnter={() => setActiveStep(index)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  <div
                    className={`
                      flex flex-col items-center text-center p-8 rounded-2xl
                      transition-all duration-500 ease-out
                      ${isActive
                        ? "bg-md-cream/10 backdrop-blur-sm shadow-lg shadow-md-gold/10 -translate-y-2"
                        : "bg-transparent hover:bg-md-cream/5"
                      }
                    `}
                  >
                    {/* Step number badge */}
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center mb-5
                        text-xs font-bold font-body transition-all duration-300
                        ${isActive
                          ? isGold
                            ? "bg-md-gold text-md-brown-dark shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                            : "bg-md-green text-md-cream shadow-[0_0_20px_rgba(20,108,60,0.4)]"
                          : "bg-md-cream/10 text-md-sand-dark"
                        }
                      `}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Icon */}
                    <div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mb-6
                        transition-all duration-500
                        ${isActive
                          ? isGold
                            ? "bg-md-gold/20 rotate-6"
                            : "bg-md-green/20 rotate-6"
                          : "bg-md-cream/5 group-hover:bg-md-cream/10"
                        }
                      `}
                    >
                      <Icon
                        className={`
                          w-7 h-7 transition-all duration-300
                          ${isActive
                            ? isGold ? "text-md-gold" : "text-md-green-soft"
                            : "text-md-sand-dark group-hover:text-md-cream"
                          }
                        `}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`
                        text-[10px] uppercase tracking-[0.25em] font-body mb-2
                        transition-colors duration-300
                        ${isActive
                          ? isGold ? "text-md-gold" : "text-md-green-soft"
                          : "text-md-muted"
                        }
                      `}
                    >
                      {t(`journey.steps.${step.key}.label`)}
                    </span>

                    {/* Title */}
                    <h3
                      className={`
                        text-lg font-display font-bold mb-3
                        transition-colors duration-300
                        ${isActive ? "text-md-cream" : "text-md-sand group-hover:text-md-cream"}
                      `}
                    >
                      {t(`journey.steps.${step.key}.title`)}
                    </h3>

                    {/* Description */}
                    <p className="text-md-muted font-body text-xs leading-relaxed line-clamp-3 group-hover:text-md-sand-dark transition-colors duration-300">
                      {t(`journey.steps.${step.key}.description`)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-3 bg-md-gold hover:bg-md-gold-soft text-md-brown-dark px-10 py-4 rounded-full font-bold font-body transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] hover:-translate-y-0.5"
            >
              <Compass className="w-5 h-5" />
              {t("journey.cta", { defaultValue: "Start Planning" })}
            </Link>
          </div>
        </div>
      </section>

      {/* contact */}
      <section className="bg-md-cream py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5">
          <Image src="/images/hero.png" alt="Pattern" fill className="object-cover" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-12 justify-between items-center px-10 md:px-16 py-20 bg-md-brown-dark rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-md-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-md-green/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

            <div className="flex flex-col gap-4 flex-1 text-center md:text-left relative z-10">
              <p className="text-md-gold font-body tracking-[0.2em] uppercase text-xs">{t("subscribe.hook")}</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-md-cream">{t("subscribe.title")}</h2>
              <p className="text-md-sand-dark font-body text-sm leading-relaxed max-w-md mx-auto md:mx-0">
                {t("subscribe.description")}
              </p>
            </div>

            <form className="flex flex-col w-full md:w-auto gap-4 flex-1 relative z-10">
              <div className="relative w-full">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-md-muted w-5 h-5" />
                <input
                  type="email"
                  placeholder={t("subscribe.placeholder")}
                  className="w-full bg-md-cream/5 border border-md-gold/30 text-md-cream py-3 pl-12 pr-4 rounded-full outline-none focus:border-md-gold focus:bg-md-cream/10 transition-all duration-300 font-body placeholder-md-muted"
                />
              </div>
              <button className="bg-md-gold hover:bg-md-gold-soft text-md-brown-dark px-8 py-3 rounded-full font-bold transition-colors duration-300 w-full shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]">
                {t("subscribe.button")}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

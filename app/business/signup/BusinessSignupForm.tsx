"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useActionState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Shield,
  Star,
  Globe,
  CreditCard,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { ownerSignup } from "@/app/actions/auth-actions";

const MOROCCAN_CITIES = [
  "Casablanca",
  "Marrakech",
  "Fes",
  "Rabat",
  "Tangier",
  "Agadir",
  "Meknes",
  "Oujda",
  "Kenitra",
  "Tetouan",
  "Safi",
  "Mohammedia",
  "El Jadida",
  "Beni Mellal",
  "Nador",
  "Taza",
  "Settat",
  "Khouribga",
  "Essaouira",
  "Chefchaouen",
  "Ouarzazate",
  "Ifrane",
  "Dakhla",
  "Errachidia",
  "Merzouga",
];

const BUSINESS_TYPES = [
  "Restaurant",
  "Hotel",
  "Riad",
  "Cafe",
  "Experience",
];

export default function BusinessSignupForm() {
  const [agreed, setAgreed] = useState(false);

  const [state, formAction, isPending] = useActionState(ownerSignup, { error: "" })

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-md-cream font-body relative">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 lg:top-8 lg:left-8 z-30 flex items-center gap-2 text-md-cream/90 hover:text-md-gold transition-colors duration-300 drop-shadow-md"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium tracking-wider uppercase text-sm">
          Return
        </span>
      </Link>

      {/* ─── LEFT: Value Proposition ─── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] relative bg-md-brown-dark flex-col">
        <Image
          src="https://res.cloudinary.com/dcw6rqiaz/image/upload/v1781011771/DSC08046-Edit_q7mfyp.webp"
          alt="Luxury Moroccan riad courtyard"
          fill
          className="object-cover object-center opacity-60"
          priority
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-md-brown-dark via-md-brown-dark/50 to-md-brown-dark/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-md-brown-dark/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full p-12 xl:p-16 pb-16 xl:pb-20">
          {/* Logo / Brand */}
          <div className="mb-auto pt-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-md-gold/20 backdrop-blur-sm flex items-center justify-center border border-md-gold/30">
                <Globe className="w-5 h-5 text-md-gold" />
              </div>
              <span className="text-md-cream font-display text-xl font-bold tracking-wide">
                Moroccool
              </span>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <div>
              <p className="text-md-gold/80 uppercase tracking-[0.2em] text-xs font-semibold mb-4">
                For Business Owners
              </p>
              <h1 className="font-display text-4xl xl:text-5xl font-bold text-md-cream leading-tight mb-4 drop-shadow-lg">
                Partner with
                <br />
                Moroccool
              </h1>
              <p className="text-md-sand/90 text-lg max-w-md leading-relaxed">
                Reach travelers looking for curated Moroccan stays, restaurants,
                and experiences.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 pt-4">
              {[
                {
                  icon: Star,
                  title: "Receive booking requests",
                  desc: "Get notified when travelers want to book",
                },
                {
                  icon: Globe,
                  title: "Get discovered by travelers",
                  desc: "Appear in curated search results worldwide",
                },
                {
                  icon: CreditCard,
                  title: "Pay only on completed bookings",
                  desc: "Commission-based model, no upfront fees",
                },
              ].map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 flex-shrink-0 group-hover:bg-md-gold/20 group-hover:border-md-gold/30 transition-all duration-300">
                    <benefit.icon className="w-5 h-5 text-md-gold" />
                  </div>
                  <div>
                    <p className="text-md-cream font-semibold text-sm">
                      {benefit.title}
                    </p>
                    <p className="text-md-sand/60 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust note */}
            <div className="flex items-center gap-2 pt-6 border-t border-white/10">
              <Shield className="w-4 h-4 text-md-gold/70" />
              <p className="text-md-sand/50 text-xs">
                Trusted by 500+ hospitality partners across Morocco
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Signup Form ─── */}
      <div className="flex-1 flex flex-col min-h-screen pt-10">
        {/* Mobile hero band */}
        <div className="lg:hidden relative h-56 bg-md-brown-dark overflow-hidden">
          <Image
            src="https://res.cloudinary.com/dcw6rqiaz/image/upload/v1781011771/DSC08046-Edit_q7mfyp.webp"
            alt="Luxury Moroccan riad"
            fill
            className="object-cover object-center opacity-50"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-md-cream via-md-brown-dark/60 to-md-brown-dark/30" />
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
            <p className="text-md-gold/80 uppercase tracking-[0.2em] text-xs font-semibold mb-2">
              For Business Owners
            </p>
            <h1 className="font-display text-2xl font-bold text-md-cream leading-tight">
              Partner with Moroccool
            </h1>
            <p className="text-md-sand/80 text-sm mt-1">
              Reach travelers looking for curated Moroccan experiences.
            </p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-start px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 py-8 lg:py-12 overflow-y-auto">
          <div className="max-w-lg w-full mx-auto">
            {/* Badge + Title */}
            <div className="mb-8 lg:mt-8">
              <div className="inline-flex items-center gap-2 bg-md-gold/10 border border-md-gold/20 rounded-full px-4 py-1.5 mb-4">
                <Briefcase className="w-3.5 h-3.5 text-md-gold-dark" />
                <span className="text-xs font-semibold text-md-gold-dark tracking-wide uppercase">
                  Business Partner Application
                </span>
              </div>
              <h2 className="text-3xl font-display font-bold text-md-brown-dark mb-2">
                Create your business account
              </h2>
              <p className="text-md-muted text-sm">
                Submit your details and our team will review your application.
              </p>
            </div>

            {/* Form */}
            <form action={formAction} className="space-y-8">
              {state?.error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                  <AlertCircle className="h-4 w-4 flex-none" />
                  <p>{state.error}</p>
                </div>
              )}

              {/* ── Section 1: Owner Account ── */}
              <fieldset className="space-y-5">
                <legend className="flex items-center gap-2 text-sm font-bold text-md-brown-dark uppercase tracking-wider mb-1">
                  <div className="w-6 h-6 rounded-md bg-md-green/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-md-green" />
                  </div>
                  Owner Account
                </legend>
                <div className="h-px bg-md-sand-dark/60" />

                {/* Full name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="owner-name"
                    className="text-sm font-medium text-md-brown-dark block"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4.5 w-4.5 text-md-muted/70" />
                    </div>
                    <input
                      id="owner-name"
                      type="text"
                      name="ownerName"
                      className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-11 pr-4 text-md-brown-dark placeholder-md-muted/50 transition-all duration-300 outline-none shadow-sm text-sm"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="owner-email"
                    className="text-sm font-medium text-md-brown-dark block"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-md-muted/70" />
                    </div>
                    <input
                      id="owner-email"
                      type="email"
                      name="ownerEmail"
                      className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-11 pr-4 text-md-brown-dark placeholder-md-muted/50 transition-all duration-300 outline-none shadow-sm text-sm"
                      placeholder="you@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone & Password row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="owner-phone"
                      className="text-sm font-medium text-md-brown-dark block"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-4.5 w-4.5 text-md-muted/70" />
                      </div>
                      <input
                        id="owner-phone"
                        type="tel"
                        name="ownerPhone"
                        className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-11 pr-4 text-md-brown-dark placeholder-md-muted/50 transition-all duration-300 outline-none shadow-sm text-sm"
                        placeholder="+212 6XX XXX XXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="owner-password"
                      className="text-sm font-medium text-md-brown-dark block"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-4.5 w-4.5 text-md-muted/70" />
                      </div>
                      <input
                        id="owner-password"
                        type="password"
                        name="ownerPassword"
                        className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-11 pr-4 text-md-brown-dark placeholder-md-muted/50 transition-all duration-300 outline-none shadow-sm text-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* ── Section 2: Business Details ── */}
              <fieldset className="space-y-5">
                <legend className="flex items-center gap-2 text-sm font-bold text-md-brown-dark uppercase tracking-wider mb-1">
                  <div className="w-6 h-6 rounded-md bg-md-gold/10 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-md-gold-dark" />
                  </div>
                  Business Details
                </legend>
                <div className="h-px bg-md-sand-dark/60" />

                {/* Business name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="biz-name"
                    className="text-sm font-medium text-md-brown-dark block"
                  >
                    Business Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="h-4.5 w-4.5 text-md-muted/70" />
                    </div>
                    <input
                      id="biz-name"
                      type="text"
                      name="businessName"
                      className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-11 pr-4 text-md-brown-dark placeholder-md-muted/50 transition-all duration-300 outline-none shadow-sm text-sm"
                      placeholder="e.g. Riad Bahia"
                      required
                    />
                  </div>
                </div>

                {/* Business type & City row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="biz-type"
                      className="text-sm font-medium text-md-brown-dark block"
                    >
                      Business Type
                    </label>
                    <div className="relative">
                      <select
                        id="biz-type"
                        name="businessType"
                        className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-4 pr-10 text-md-brown-dark transition-all duration-300 outline-none shadow-sm text-sm appearance-none cursor-pointer"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        {BUSINESS_TYPES.map((type) => (
                          <option key={type} value={type.toLowerCase()}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-md-muted/70" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="biz-city"
                      className="text-sm font-medium text-md-brown-dark block"
                    >
                      City
                    </label>
                    <div className="relative">
                      <select
                        id="biz-city"
                        name="businessCity"
                        className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-4 pr-10 text-md-brown-dark transition-all duration-300 outline-none shadow-sm text-sm appearance-none cursor-pointer"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select city
                        </option>
                        {MOROCCAN_CITIES.map((city) => (
                          <option key={city} value={city.toLowerCase()}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-md-muted/70" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="biz-address"
                    className="text-sm font-medium text-md-brown-dark block"
                  >
                    Business Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-4.5 w-4.5 text-md-muted/70" />
                    </div>
                    <input
                      id="biz-address"
                      type="text"
                      name="businessAddress"
                      className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-11 pr-4 text-md-brown-dark placeholder-md-muted/50 transition-all duration-300 outline-none shadow-sm text-sm"
                      placeholder="Street, neighbourhood, city"
                      required
                    />
                  </div>
                </div>

                {/* Business Email & Phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="biz-email"
                      className="text-sm font-medium text-md-brown-dark block"
                    >
                      Business Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-4.5 w-4.5 text-md-muted/70" />
                      </div>
                      <input
                        id="biz-email"
                        type="email"
                        name="businessEmail"
                        className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-11 pr-4 text-md-brown-dark placeholder-md-muted/50 transition-all duration-300 outline-none shadow-sm text-sm"
                        placeholder="contact@business.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="biz-phone"
                      className="text-sm font-medium text-md-brown-dark block"
                    >
                      Business Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-4.5 w-4.5 text-md-muted/70" />
                      </div>
                      <input
                        id="biz-phone"
                        type="tel"
                        name="businessPhone"
                        className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold/50 rounded-xl py-3 pl-11 pr-4 text-md-brown-dark placeholder-md-muted/50 transition-all duration-300 outline-none shadow-sm text-sm"
                        placeholder="+212 5XX XXX XXX"
                        required
                      />
                    </div>
                  </div>
                </div>
              </fieldset>


              {/* ── Agreement & Submit ── */}
              <div className="space-y-5 pt-2">
                {/* Checkbox */}
                <label
                  htmlFor="agree-terms"
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      id="agree-terms"
                      type="checkbox"
                      name="termsAccepted"
                      value="yes"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-md-sand-dark bg-white peer-checked:bg-md-green peer-checked:border-md-green transition-all duration-200 flex items-center justify-center group-hover:border-md-gold">
                      {agreed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-md-muted leading-relaxed">
                    I confirm that I represent this business and agree to{" "}
                    <Link
                      href="#"
                      className="text-md-green font-medium hover:text-md-green-soft transition-colors underline underline-offset-2"
                    >
                      Moroccool partner terms
                    </Link>
                    .
                  </span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!agreed || isPending}
                  className="w-full bg-md-green hover:bg-md-green-soft disabled:bg-md-sand-dark disabled:cursor-not-allowed text-md-cream py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg text-sm uppercase flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>

                {/* Review notice */}
                <div className="flex items-center justify-center gap-2 text-center">
                  <AlertCircle className="w-3.5 h-3.5 text-md-muted/60 flex-shrink-0" />
                  <p className="text-xs text-md-muted/80">
                    Applications are reviewed before listings go live. You will
                    be notified by email.
                  </p>
                </div>

                {/* Sign-in link */}
                <div className="text-center text-sm text-md-muted pt-2 pb-4">
                  Already have a business account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-md-green hover:text-md-green-soft transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

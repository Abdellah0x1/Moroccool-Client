"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User, AlertCircle } from "lucide-react";
import { useT } from "next-i18next/client";
import { userSignUpWithPassword } from "@/app/actions/auth-actions"
import { useActionState } from "react";

export default function SignupPage() {
  const { t } = useT("signup");
  const [state, signupAction, isPending] = useActionState(userSignUpWithPassword, { error: "" })

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-md-cream font-body relative">
      {/* Decorative Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center gap-2 text-md-cream md:text-md-cream/90 hover:text-md-gold transition-colors duration-300 drop-shadow-md"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium tracking-wider uppercase text-sm">{t("return", { defaultValue: "Return" })}</span>
      </Link>

      {/* Left Column - Imagery (Hidden on small mobile, 50% width otherwise) */}
      <div className="hidden md:flex md:w-1/2 relative bg-md-brown-dark">
        <Image
          src="/images/hero.jpg"
          alt="Moroccan aesthetics"
          fill
          className="object-cover object-center opacity-80 scale-x-[-1]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-md-brown-dark/90 via-md-brown-dark/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 lg:p-16 text-md-cream">
          <p className="font-display text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg leading-tight">
            {t("welcome", { defaultValue: "Begin Your Journey" })}
          </p>
          <p className="text-md-sand text-lg max-w-md drop-shadow">
            {t("description", { defaultValue: "Create an account to unlock personalized recommendations, save your favorite destinations, and plan the perfect Moroccan getaway." })}
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-24 py-20 min-h-screen">
        <div className="max-w-md w-full mx-auto relative">

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-display font-bold text-md-brown-dark mb-3">{t("signUpTitle", { defaultValue: "Create Account" })}</h2>
            <p className="text-md-muted">{t("signUpSubtitle", { defaultValue: "Fill in your details below to get started" })}</p>
          </div>

          <form action={signupAction} className="space-y-6">
            {state?.error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                <AlertCircle className="h-4 w-4 flex-none" />
                <p>{state.error}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-md-brown-dark block" htmlFor="name">
                {t("namePlaceholder", { defaultValue: "Full Name" })}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-md-muted" />
                </div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold rounded-xl py-3.5 pl-12 pr-4 text-md-brown-dark placeholder-md-muted/60 transition-all duration-300 outline-none shadow-sm"
                  placeholder={t("namePlaceholder", { defaultValue: "Full Name" })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-md-brown-dark block" htmlFor="email">
                {t("emailPlaceholder", { defaultValue: "Email Address" })}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-md-muted" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold rounded-xl py-3.5 pl-12 pr-4 text-md-brown-dark placeholder-md-muted/60 transition-all duration-300 outline-none shadow-sm"
                  placeholder={t("emailPlaceholder", { defaultValue: "Email Address" })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-md-brown-dark block" htmlFor="password">
                {t("passwordPlaceholder", { defaultValue: "Password" })}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-md-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full bg-white border border-md-sand-dark focus:border-md-gold focus:ring-1 focus:ring-md-gold rounded-xl py-3.5 pl-12 pr-4 text-md-brown-dark placeholder-md-muted/60 transition-all duration-300 outline-none shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-md-green hover:bg-md-green-soft text-md-cream py-4 rounded-xl font-bold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg mt-8 text-sm uppercase"
            >
              {t("signUpButton", { defaultValue: "Sign Up" })}
            </button>
          </form>

          <div className="mt-10 text-center text-sm text-md-muted">
            {t("hasAccount", { defaultValue: "Already have an account?" })}{" "}
            <Link href="/login" className="font-semibold text-md-green hover:text-md-green-soft transition-colors ml-1">
              {t("signInLink", { defaultValue: "Sign in" })}
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
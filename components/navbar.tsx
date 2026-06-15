"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "next-i18next/client";
import { Bed, BriefcaseBusiness, Compass, Home, LogIn, Utensils } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { LanguageSwitcher } from "./LanguageSwitcher";

type NavbarProfile = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
} | null;

function getDesktopLinkClass(isActive: boolean) {
  return [
    "group relative inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ease-out",
    isActive
      ? "bg-md-brown-dark text-md-gold shadow-[0_4px_12px_rgba(29,10,3,0.15)] ring-1 ring-md-brown-dark/5"
      : "text-md-brown-dark/80 hover:bg-white/60 hover:text-md-brown-dark hover:shadow-sm",
  ].join(" ");
}

function getMobileLinkClass(isActive: boolean) {
  return [
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 text-[11px] font-semibold transition-all duration-300",
    isActive
      ? "bg-gradient-to-b from-md-gold to-[#f0c341] text-md-brown-dark shadow-[0_4px_10px_rgba(212,175,55,0.3)]"
      : "text-md-sand/80 hover:text-md-gold hover:bg-white/5",
  ].join(" ");
}

function isBusinessOwner(profile: NavbarProfile) {
  return profile?.role === "business_owner";
}

export function Navbar({ user, profile }: { user: User | null, profile: NavbarProfile }) {
  const { t } = useT("common");
  const pathname = usePathname();
  const businessOwner = isBusinessOwner(profile);
  const accountHref = user
    ? businessOwner
      ? "/business/dashboard"
      : "/profile"
    : "/login";
  const accountLabel = user
    ? businessOwner
      ? t("nav.business", { defaultValue: "My Business" })
      : t("nav.profile", { defaultValue: "My Profile" })
    : t("nav.login", { defaultValue: "Sign In" });

  const navItems = useMemo(
    () => [
      {
        href: "/",
        label: t("nav.home", { defaultValue: "Home" }),
        icon: Home,
        active: pathname === "/",
      },
      {
        href: "/destinations",
        label: t("nav.destinations", { defaultValue: "Destinations" }),
        icon: Compass,
        active:
          pathname.startsWith("/destinations") ||
          pathname.startsWith("/destination"),
      },
      {
        href: "/accomodation",
        label: t("nav.accomodation", { defaultValue: "Stays" }),
        icon: Bed,
        active: pathname.startsWith("/accomodation"),
      },
      {
        href: "/restaurants",
        label: t("nav.restaurants", { defaultValue: "Restaurants" }),
        icon: Utensils,
        active: pathname.startsWith("/restaurants"),
      },
    ],
    [pathname, t],
  );

  return (
    <>
      <header className="pointer-events-none fixed z-2000 inset-x-0 top-2 z-50 px-3 sm:top-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <nav className="pointer-events-auto flex h-16 items-center justify-between rounded-full border border-white/50 bg-md-cream/70 px-3 shadow-[0_8px_32px_rgba(29,10,3,0.08)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 hover:bg-md-cream/80 md:h-[72px] md:px-5">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3 rounded-full pr-4 pl-1.5 py-1.5 text-md-brown-dark outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-md-gold/60 hover:bg-white/40"
              aria-label={t("brand", { defaultValue: "Moroccool" })}
            >
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gradient-to-br from-md-brown-dark to-[#3A1E11] text-md-gold shadow-md transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg md:h-11 md:w-11">
                <Compass className="h-5 w-5 md:h-5 md:w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 font-display text-xl font-extrabold tracking-tight text-md-brown-dark transition-colors duration-300 group-hover:text-black md:text-2xl">
                {t("brand", { defaultValue: "Morocco Discovery" })}
              </span>
            </Link>

            <div className="hidden items-center rounded-full border border-white/40 bg-white/30 p-1.5 shadow-inner backdrop-blur-md lg:flex gap-1">
              {navItems.map(({ href, label, icon: Icon, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={getDesktopLinkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={`h-4 w-4 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              {!user ? (
                <Link
                  className="hidden h-11 items-center justify-center rounded-full border-2 border-md-gold/30 bg-transparent px-5 text-sm font-bold text-md-brown-dark transition-all duration-300 hover:border-md-gold hover:bg-md-gold/10 hover:text-md-brown-dark xl:inline-flex"
                  href="/business/signup"
                >
                  {t("nav.listBusiness", { defaultValue: "List your business" })}
                </Link>
              ) : null}
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-md-gold to-[#f0c341] px-5 text-sm font-bold text-md-brown-dark shadow-[0_4px_14px_rgba(212,175,55,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-md-gold/60 sm:px-6"
                href={accountHref}
              >
                {!user ? (
                  <LogIn className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                ) : businessOwner ? (
                  <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
                ) : null}
                <span>{accountLabel}</span>
              </Link>
            </div>
          </nav>

          <nav
            className="pointer-events-auto mt-3 flex items-center justify-around rounded-[2rem] border border-white/10 bg-md-brown-dark/95 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-3xl backdrop-saturate-200 md:hidden"
            aria-label={t("nav.mobileNavigation", { defaultValue: "Mobile navigation" })}
          >
            {navItems.map(({ href, label, icon: Icon, active }) => (
              <Link
                key={href}
                href={href}
                className={getMobileLinkClass(active)}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={`h-5 w-5 flex-none transition-transform duration-300 ${active ? 'scale-110 drop-shadow-sm' : ''}`} aria-hidden="true" />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}

"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "next-i18next/client";
import { Bed, BriefcaseBusiness, Compass, Home, LogIn, Utensils, X } from "lucide-react";
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

function getMobileMenuLinkClass(isActive: boolean) {
  return [
    "group flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-semibold transition-all duration-300",
    isActive
      ? "bg-gradient-to-r from-md-gold/20 to-md-gold/5 text-md-gold shadow-[inset_0_0_0_1px_rgba(212,175,55,0.3)]"
      : "text-md-sand/80 hover:text-white hover:bg-white/5",
  ].join(" ");
}

function isBusinessOwner(profile: NavbarProfile) {
  return profile?.role === "business_owner";
}

export function Navbar({ user, profile }: { user: User | null, profile: NavbarProfile }) {
  const { t } = useT("common");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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

            {/* Desktop nav links */}
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
                className="hidden lg:inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-md-gold to-[#f0c341] px-5 text-sm font-bold text-md-brown-dark shadow-[0_4px_14px_rgba(212,175,55,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-md-gold/60 sm:px-6"
                href={accountHref}
              >
                {!user ? (
                  <LogIn className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                ) : businessOwner ? (
                  <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
                ) : null}
                <span>{accountLabel}</span>
              </Link>

              {/* Hamburger button – visible on mobile/tablet */}
              <button
                type="button"
                className="pointer-events-auto relative z-[60] grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-md-brown-dark to-[#3A1E11] text-md-gold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-md-gold/60 lg:hidden"
                onClick={toggleMenu}
                aria-label={mobileMenuOpen ? t("nav.closeMenu", { defaultValue: "Close menu" }) : t("nav.openMenu", { defaultValue: "Open menu" })}
                aria-expanded={mobileMenuOpen}
              >
                <div className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
                  <span
                    className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out ${
                      mobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out ${
                      mobileMenuOpen ? "scale-x-0 opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out ${
                      mobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[55] transition-all duration-500 lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto visible"
            : "pointer-events-none invisible"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        />

        {/* Slide-in panel */}
        <nav
          className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-gradient-to-b from-md-brown-dark via-[#2A1508] to-[#1A0D04] shadow-[-8px_0_40px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label={t("nav.mobileNavigation", { defaultValue: "Mobile navigation" })}
        >
          {/* Menu header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 pb-6 pt-20">
            <span className="font-display text-xl font-extrabold tracking-tight text-md-gold">
              {t("nav.menu", { defaultValue: "Menu" })}
            </span>
            <button
              type="button"
              onClick={closeMenu}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-md-sand/80 transition-all duration-300 hover:bg-white/20 hover:text-white"
              aria-label={t("nav.closeMenu", { defaultValue: "Close menu" })}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              {navItems.map(({ href, label, icon: Icon, active }, index) => (
                <li
                  key={href}
                  className="transition-all duration-500"
                  style={{
                    transitionDelay: mobileMenuOpen ? `${100 + index * 60}ms` : "0ms",
                    opacity: mobileMenuOpen ? 1 : 0,
                    transform: mobileMenuOpen ? "translateX(0)" : "translateX(24px)",
                  }}
                >
                  <Link
                    href={href}
                    className={getMobileMenuLinkClass(active)}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    <span
                      className={`grid h-10 w-10 flex-none place-items-center rounded-xl transition-all duration-300 ${
                        active
                          ? "bg-md-gold/20 text-md-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                          : "bg-white/5 text-md-sand/60 group-hover:bg-white/10 group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>{label}</span>
                    {active && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-md-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu footer */}
          <div
            className="border-t border-white/10 px-5 py-6 space-y-4 transition-all duration-500"
            style={{
              transitionDelay: mobileMenuOpen ? "340ms" : "0ms",
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <div className="sm:hidden">
              <LanguageSwitcher />
            </div>
            {!user && (
              <Link
                href="/business/signup"
                className="flex h-12 items-center justify-center rounded-2xl border border-md-gold/30 text-sm font-bold text-md-gold transition-all duration-300 hover:border-md-gold hover:bg-md-gold/10"
                onClick={closeMenu}
              >
                {t("nav.listBusiness", { defaultValue: "List your business" })}
              </Link>
            )}
            <Link
              href={accountHref}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-md-gold to-[#f0c341] text-sm font-bold text-md-brown-dark shadow-[0_4px_14px_rgba(212,175,55,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)]"
              onClick={closeMenu}
            >
              {!user ? (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              ) : businessOwner ? (
                <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              ) : null}
              <span>{accountLabel}</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}

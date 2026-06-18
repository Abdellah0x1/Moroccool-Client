"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  Settings,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { userSignOut } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  {
    href: "/business/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/business/bookings",
    label: "Bookings",
    icon: CalendarDays,
  },
  {
    href: "/business/availability",
    label: "Availability",
    icon: CalendarCheck,
  },
  {
    href: '/business/reviews',
    label: 'Reviews',
    icon: Star
  },
  {
    href: "/business/listing",
    label: "Listing",
    icon: Sparkles,
  },
  {
    href: "/business/profile",
    label: "Business profile",
    icon: Building2,
  }
];


function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="mt-5 space-y-1 px-3" aria-label="Business navigation">
      <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
        Menu
      </p>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${active
              ? "border-l-4 border-md-green bg-md-green/10 text-md-green"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
              }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${active ? "text-md-green" : "text-gray-400"}`}
              aria-hidden="true"
            />
            <span className="min-w-0 truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFrame({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-200 px-5 py-5">
        <Link href="/business/dashboard" className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-md-green text-sm font-bold text-white">
            M
          </span>
          <span>
            <span className="block text-[17px] font-bold leading-none text-gray-950">
              Moroccool
            </span>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              Partner console
            </span>
          </span>
        </Link>
      </div>

      <SidebarNav onNavigate={onNavigate} />

      <div className="mt-auto border-t border-gray-200 px-3 py-4">
        <Link
          href="/"
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
        >
          <PanelLeft className="h-[18px] w-[18px] text-gray-400" aria-hidden="true" />
          Public site
        </Link>
        <form action={userSignOut}>
          <Button
            type="submit"
            variant="ghost"
            className="mt-1 h-10 w-full justify-start gap-3 px-3 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}

export function BusinessDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname.startsWith("/business/signup")) {
    return <>{children}</>;
  }

  const currentItem = NAV_ITEMS.find((item) => isActivePath(pathname, item.href));
  const CurrentIcon = currentItem?.icon ?? LayoutDashboard;

  return (
    <div className="business-dashboard-shell min-h-screen bg-gray-50 font-body text-gray-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-gray-200 lg:block">
        <SidebarFrame />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-gray-950/35"
            aria-label="Close business navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[min(320px,85vw)] border-r border-gray-200 shadow-xl">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600"
                aria-label="Close business navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <SidebarFrame onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-600 lg:hidden"
                aria-label="Open business navigation"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-md-green/10 text-md-green">
                <CurrentIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  Business console
                </p>
                <h1 className="truncate text-lg font-bold text-gray-950">
                  {currentItem?.label ?? "Partner workspace"}
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-md-green/20 bg-md-green/10 px-3 text-xs font-bold uppercase tracking-[0.12em] text-md-green">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Owner
              </span>
              <Link
                href="/business/profile"
                className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100"
                aria-label="Business profile"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

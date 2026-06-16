import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Mail,
  UserRound,
  BookOpen,
  User,
} from "lucide-react";
import { getT } from "next-i18next/server";
import { getCurrentProfile, requireUser } from "@/lib/auth";

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "M";
}

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = await getT("profile");
  const user = await requireUser();
  const profile = await getCurrentProfile();

  const name =
    profile?.name ||
    String(user.user_metadata?.name || user.user_metadata?.full_name || "") ||
    t("fallbackName", { defaultValue: "Morocco Explorer" });
  const email =
    profile?.email ||
    user.email ||
    t("fallbackEmail", { defaultValue: "No email attached" });
  const role = profile?.role || t("fallbackRole", { defaultValue: "traveler" });

  return (
    <main className="min-h-screen bg-md-cream font-body text-md-brown-dark selection:bg-md-gold/30">
      <section className="relative overflow-hidden bg-md-brown-dark px-6 pb-32 pt-44 md:pt-40">
        <Image
          src="/images/hero.jpg"
          alt={t("hero.alt", { defaultValue: "Moroccan courtyard" })}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35 transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-md-brown-dark/70 via-md-brown-dark/50 to-md-brown-dark/90" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-md-gold/40 bg-md-cream/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-md-gold backdrop-blur-md shadow-sm">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t("hero.eyebrow", { defaultValue: "Profile" })}
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-tight text-md-cream md:text-7xl drop-shadow-md">
            {t("hero.title", {
              defaultValue: "Your Morocco Discovery account",
            })}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-md-sand md:text-lg drop-shadow">
            {t("hero.description", {
              defaultValue:
                "Review your account details, check your current access, and keep your travel profile ready for the next itinerary.",
            })}
          </p>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-20 grid max-w-7xl gap-8 px-6 pb-20 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="flex flex-col items-center rounded-2xl border border-md-gold/20 bg-white/95 px-6 py-10 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl h-fit">
          <div className="relative -mt-20 mb-4 grid h-32 w-32 place-items-center rounded-full border-4 border-white bg-md-brown-dark font-display text-5xl font-bold text-md-gold shadow-lg">
            {getInitial(name)}
            <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-2 border-white bg-green-500" title="Online" />
          </div>
          <h2 className="font-display text-3xl font-bold text-md-brown-dark text-center">
            {name}
          </h2>
          <p className="mt-2 text-sm text-md-muted/80 text-center flex items-center gap-2">
            <Mail className="h-4 w-4" /> {email}
          </p>
          <span className="mt-6 rounded-full border border-md-gold/30 bg-gradient-to-r from-md-sand to-md-cream px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-md-green shadow-sm">
            {role}
          </span>

          <nav className="mt-8 w-full flex flex-col gap-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-md-brown-dark transition-colors hover:bg-md-cream hover:text-md-green focus:bg-md-cream"
            >
              <User className="h-5 w-5" />
              Account Details
            </Link>
            <Link
              href="/profile/bookings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-md-brown-dark transition-colors hover:bg-md-cream hover:text-md-green focus:bg-md-cream"
            >
              <BookOpen className="h-5 w-5" />
              My Bookings
            </Link>
          </nav>

          <div className="mt-8 w-full border-t border-md-gold/15 pt-8">
            <Link
              href="/destinations"
              className="group flex w-full items-center justify-center gap-3 rounded-full bg-md-green px-5 py-3.5 text-sm font-bold text-md-cream shadow-md transition-all duration-300 hover:bg-md-green-soft hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-md-gold/60"
            >
              <Compass className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
              {t("actions.exploreDestinations", {
                defaultValue: "Explore destinations",
              })}
            </Link>
          </div>
        </aside>

        <div className="space-y-8">
          {children}
        </div>
      </section>
    </main>
  );
}

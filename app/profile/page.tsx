import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Compass,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getT } from "next-i18next/server";
import { userSignOut } from "@/app/actions/auth-actions";
import { getCurrentProfile, requireUser } from "@/lib/auth";

function formatDate(value: string | undefined, locale: string, fallback: string) {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale || "en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "M";
}

export default async function ProfilePage() {
  const { t, lng } = await getT("profile");
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const notAvailable = t("notAvailable", { defaultValue: "Not available" });

  const name =
    profile?.name ||
    String(user.user_metadata?.name || user.user_metadata?.full_name || "") ||
    t("fallbackName", { defaultValue: "Morocco Explorer" });
  const email =
    profile?.email ||
    user.email ||
    t("fallbackEmail", { defaultValue: "No email attached" });
  const role = profile?.role || t("fallbackRole", { defaultValue: "traveler" });
  const joinedAt = formatDate(profile?.created_at || user.created_at, lng, notAvailable);

  const details = [
    {
      label: t("details.fullName", { defaultValue: "Full name" }),
      value: name,
      icon: UserRound,
    },
    {
      label: t("details.email", { defaultValue: "Email address" }),
      value: email,
      icon: Mail,
    },
    {
      label: t("details.role", { defaultValue: "Account role" }),
      value: role,
      icon: ShieldCheck,
    },
    {
      label: t("details.memberSince", { defaultValue: "Member since" }),
      value: joinedAt,
      icon: CalendarDays,
    },
  ];

  return (
    <main className="min-h-screen bg-md-cream font-body text-md-brown-dark">
      <section className="relative overflow-hidden bg-md-brown-dark px-6 pb-16 pt-44 md:pt-36">
        <Image
          src="/images/hero.jpg"
          alt={t("hero.alt", { defaultValue: "Moroccan courtyard" })}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-md-brown-dark/50" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-md-gold/40 bg-md-cream/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-md-gold backdrop-blur">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t("hero.eyebrow", { defaultValue: "Profile" })}
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-tight text-md-cream md:text-7xl">
            {t("hero.title", {
              defaultValue: "Your Morocco Discovery account",
            })}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-md-sand md:text-lg">
            {t("hero.description", {
              defaultValue:
                "Review your account details, check your current access, and keep your travel profile ready for the next itinerary.",
            })}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded-lg border border-md-gold/20 bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border border-md-gold/30 bg-md-brown-dark font-display text-4xl font-bold text-md-gold shadow-sm">
              {getInitial(name)}
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold text-md-brown-dark">
              {name}
            </h2>
            <p className="mt-2 max-w-full break-words text-sm text-md-muted">
              {email}
            </p>
            <span className="mt-5 rounded-full border border-md-gold/30 bg-md-sand px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-md-green">
              {role}
            </span>
          </div>

          <div className="mt-8 border-t border-md-gold/15 pt-6">
            <Link
              href="/destinations"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-md-green px-5 py-3 text-sm font-bold text-md-cream shadow-sm transition duration-200 hover:bg-md-green-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-md-gold/60"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              {t("actions.exploreDestinations", {
                defaultValue: "Explore destinations",
              })}
            </Link>
          </div>
        </aside>

        <div className="space-y-8">
          <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-md-sand text-md-green">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                  {t("details.sectionEyebrow", {
                    defaultValue: "Account details",
                  })}
                </p>
                <h2 className="font-display text-3xl font-bold text-md-brown-dark">
                  {t("details.sectionTitle", {
                    defaultValue: "Personal information",
                  })}
                </h2>
              </div>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {details.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-lg border border-md-sand-dark bg-md-cream px-5 py-4"
                >
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="mt-3 break-words text-base font-semibold text-md-brown-dark">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-lg border border-md-gold/20 bg-md-brown-dark px-6 py-8 text-md-cream shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold">
                  {t("session.eyebrow", { defaultValue: "Session" })}
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold">
                  {t("session.title", { defaultValue: "Signed in securely" })}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-md-sand">
                  {t("session.description", {
                    defaultValue:
                      "Sign out when you are done using this device.",
                  })}
                </p>
              </div>

              <form action={userSignOut}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-md-gold px-5 py-3 text-sm font-bold text-md-brown-dark shadow-sm transition duration-200 hover:bg-md-gold-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-md-gold/70"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t("actions.signOut", { defaultValue: "Sign out" })}
                </button>
              </form>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

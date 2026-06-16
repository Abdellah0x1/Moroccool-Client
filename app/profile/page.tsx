import {
  CalendarDays,
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
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(locale || "en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function ProfilePage() {
  const { t, lng } = await getT("profile");
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const notAvailable = t("notAvailable", { defaultValue: "Not available" });

  const name = profile?.name || String(user.user_metadata?.name || user.user_metadata?.full_name || "") || t("fallbackName", { defaultValue: "Morocco Explorer" });
  const email = profile?.email || user.email || t("fallbackEmail", { defaultValue: "No email attached" });
  const role = profile?.role || t("fallbackRole", { defaultValue: "traveler" });
  const joinedAt = formatDate(profile?.created_at || user.created_at, lng, notAvailable);

  const details = [
    { label: t("details.fullName", { defaultValue: "Full name" }), value: name, icon: UserRound },
    { label: t("details.email", { defaultValue: "Email address" }), value: email, icon: Mail },
    { label: t("details.role", { defaultValue: "Account role" }), value: role, icon: ShieldCheck },
    { label: t("details.memberSince", { defaultValue: "Member since" }), value: joinedAt, icon: CalendarDays },
  ];

  return (
    <>
      <section className="rounded-2xl border border-md-gold/20 bg-white/90 px-6 py-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl sm:px-10 sm:py-10">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-md-sand/50 text-md-green shadow-inner">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
              {t("details.sectionEyebrow", { defaultValue: "Account details" })}
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold text-md-brown-dark">
              {t("details.sectionTitle", { defaultValue: "Personal information" })}
            </h2>
          </div>
        </div>

        <dl className="mt-10 grid gap-5 sm:grid-cols-2">
          {details.map(({ label, value, icon: Icon }) => (
            <div key={label} className="group flex flex-col justify-center rounded-xl border border-md-sand-dark bg-md-cream/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-md-gold/40 hover:bg-md-cream hover:shadow-md">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark/80">
                <Icon className="h-4 w-4 text-md-green transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                {label}
              </dt>
              <dd className="mt-3 break-words text-lg font-semibold text-md-brown-dark">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-md-gold/20 bg-md-brown-dark px-6 py-8 text-md-cream shadow-lg sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-md-gold/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold">
              {t("session.eyebrow", { defaultValue: "Session" })}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">
              {t("session.title", { defaultValue: "Signed in securely" })}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-md-sand/80">
              {t("session.description", { defaultValue: "Sign out when you are done using this device." })}
            </p>
          </div>

          <form action={userSignOut} className="shrink-0">
            <button type="submit" className="group inline-flex items-center justify-center gap-3 rounded-full bg-md-gold px-6 py-3.5 text-sm font-bold text-md-brown-dark shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-md-gold-soft hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-md-gold/70">
              <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
              {t("actions.signOut", { defaultValue: "Sign out" })}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

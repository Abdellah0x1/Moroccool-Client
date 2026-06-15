import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Cookie,
  Database,
  FileText,
  Globe2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { getT } from "next-i18next/server";

export const metadata: Metadata = {
  title: "Privacy Policy | Morocco Discovery",
  description:
    "Learn how Morocco Discovery collects, uses, protects, and manages personal information.",
};

function getItems(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

export default async function PrivacyPolicyPage() {
  const { t } = await getT("privacy");
  const lastUpdated = t("lastUpdatedDate", { defaultValue: "June 4, 2026" });
  const highlights = [
    {
      icon: UserCheck,
      label: t("highlights.account.label", { defaultValue: "Account data" }),
      value: t("highlights.account.value", {
        defaultValue: "Name, email, authentication provider, and profile details",
      }),
    },
    {
      icon: Database,
      label: t("highlights.travel.label", { defaultValue: "Travel activity" }),
      value: t("highlights.travel.value", {
        defaultValue:
          "Searches, saved preferences, reviews, and booking inquiries",
      }),
    },
    {
      icon: LockKeyhole,
      label: t("highlights.protection.label", { defaultValue: "Protection" }),
      value: t("highlights.protection.value", {
        defaultValue:
          "Access controls, secure sessions, and trusted infrastructure",
      }),
    },
  ];

  const sections = [
    {
      title: t("sections.collect.title", {
        defaultValue: "Information We Collect",
      }),
      icon: FileText,
      items: getItems(t("sections.collect.items", { returnObjects: true })),
    },
    {
      title: t("sections.use.title", { defaultValue: "How We Use Information" }),
      icon: Globe2,
      items: getItems(t("sections.use.items", { returnObjects: true })),
    },
    {
      title: t("sections.providers.title", {
        defaultValue: "Authentication And Service Providers",
      }),
      icon: ShieldCheck,
      items: getItems(t("sections.providers.items", { returnObjects: true })),
    },
    {
      title: t("sections.cookies.title", { defaultValue: "Cookies And Sessions" }),
      icon: Cookie,
      items: getItems(t("sections.cookies.items", { returnObjects: true })),
    },
    {
      title: t("sections.choices.title", { defaultValue: "Your Choices" }),
      icon: UserCheck,
      items: getItems(t("sections.choices.items", { returnObjects: true })),
    },
    {
      title: t("sections.retention.title", {
        defaultValue: "Data Retention And Security",
      }),
      icon: LockKeyhole,
      items: getItems(t("sections.retention.items", { returnObjects: true })),
    },
  ];

  return (
    <main className="min-h-screen bg-md-cream font-body text-md-brown-dark">
      <section className="relative overflow-hidden bg-md-brown-dark px-6 pb-16 pt-44 md:pt-36">
        <Image
          src="/images/hero.jpg"
          alt={t("hero.alt", { defaultValue: "Moroccan riad courtyard" })}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-md-brown-dark/50" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-md-gold/40 bg-md-cream/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-md-gold backdrop-blur">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {t("hero.eyebrow", { defaultValue: "Privacy Policy" })}
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-tight text-md-cream md:text-7xl">
            {t("hero.title", {
              defaultValue: "How Morocco Discovery protects your information.",
            })}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-md-sand md:text-lg">
            {t("hero.description", {
              defaultValue:
                "This policy explains what we collect, why we use it, and the choices you have when using Morocco Discovery.",
            })}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-md-gold/25 bg-md-cream/10 px-4 py-3 text-sm font-semibold text-md-sand backdrop-blur">
            <CalendarDays className="h-4 w-4 text-md-gold" aria-hidden="true" />
            {t("hero.lastUpdated", {
              date: lastUpdated,
              defaultValue: "Last updated: {{date}}",
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-md-gold/15 bg-md-sand px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {highlights.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-md-gold/20 bg-white px-5 py-5 shadow-sm"
            >
              <Icon className="h-5 w-5 text-md-green" aria-hidden="true" />
              <h2 className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                {label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-md-muted">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
              {t("summary.eyebrow", { defaultValue: "Summary" })}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-md-brown-dark">
              {t("summary.title", { defaultValue: "Privacy at a glance" })}
            </h2>
            <p className="mt-4 text-sm leading-7 text-md-muted">
              {t("summary.description", {
                defaultValue:
                  "Morocco Discovery uses personal information to operate accounts, personalize travel discovery, maintain secure sessions, and respond to user requests.",
              })}
            </p>
            <Link
              href="mailto:contact@moroccodiscovery.com"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-md-green px-5 py-3 text-sm font-bold text-md-cream shadow-sm transition duration-200 hover:bg-md-green-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-md-gold/60"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("summary.cta", { defaultValue: "Contact privacy team" })}
            </Link>
          </div>
        </aside>

        <div className="space-y-6">
          {sections.map(({ title, icon: Icon, items }) => (
            <article
              key={title}
              className="rounded-lg border border-md-gold/20 bg-white px-6 py-7 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-md-sand text-md-green">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="font-display text-3xl font-bold text-md-brown-dark">
                  {title}
                </h2>
              </div>

              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-md-muted">
                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-md-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <section className="rounded-lg border border-md-gold/20 bg-md-brown-dark px-6 py-8 text-md-cream shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold">
              {t("contact.eyebrow", { defaultValue: "Contact" })}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold">
              {t("contact.title", { defaultValue: "Questions about this policy" })}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-md-sand">
              {t("contact.description", {
                defaultValue:
                  "For privacy requests or questions, contact Morocco Discovery at contact@moroccodiscovery.com or write to 123 Avenue Mohammed V, Gueliz, Marrakech 40000.",
              })}
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

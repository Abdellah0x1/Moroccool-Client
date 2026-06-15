import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck,
  ChevronDown,
  CreditCard,
  HelpCircle,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  Utensils,
} from "lucide-react";
import { getT } from "next-i18next/server";

export const metadata: Metadata = {
  title: "FAQ | Morocco Discovery",
  description:
    "Find answers about Morocco Discovery accounts, destinations, restaurants, planning, privacy, and support.",
};

type FaqQuestion = {
  question: string;
  answer: string;
};

function getQuestions(value: unknown): FaqQuestion[] {
  return Array.isArray(value) ? (value as FaqQuestion[]) : [];
}

export default async function FAQPage() {
  const { t } = await getT("faq");
  const categories = [
    {
      label: t("categories.accounts.label", { defaultValue: "Accounts" }),
      icon: UserRound,
      description: t("categories.accounts.description", {
        defaultValue: "Login, signup, profiles, and saved preferences.",
      }),
    },
    {
      label: t("categories.travel.label", { defaultValue: "Travel" }),
      icon: MapPin,
      description: t("categories.travel.description", {
        defaultValue: "Destinations, stays, restaurants, and itineraries.",
      }),
    },
    {
      label: t("categories.privacy.label", { defaultValue: "Privacy" }),
      icon: ShieldCheck,
      description: t("categories.privacy.description", {
        defaultValue: "Data, OAuth providers, cookies, and account control.",
      }),
    },
  ];

  const faqs = [
    {
      category: t("sections.accounts.title", { defaultValue: "Accounts" }),
      icon: UserRound,
      questions: getQuestions(
        t("sections.accounts.questions", { returnObjects: true }),
      ),
    },
    {
      category: t("sections.planning.title", { defaultValue: "Planning" }),
      icon: CalendarCheck,
      questions: getQuestions(
        t("sections.planning.questions", { returnObjects: true }),
      ),
    },
    {
      category: t("sections.payments.title", { defaultValue: "Payments" }),
      icon: CreditCard,
      questions: getQuestions(
        t("sections.payments.questions", { returnObjects: true }),
      ),
    },
    {
      category: t("sections.privacy.title", {
        defaultValue: "Privacy And Security",
      }),
      icon: ShieldCheck,
      questions: getQuestions(
        t("sections.privacy.questions", { returnObjects: true }),
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-md-cream font-body text-md-brown-dark">
      <section className="relative overflow-hidden bg-md-brown-dark px-6 pb-16 pt-44 md:pt-36">
        <Image
          src="/images/hero.jpg"
          alt={t("hero.alt", { defaultValue: "Moroccan architecture" })}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-md-brown-dark/50" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-md-gold/40 bg-md-cream/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-md-gold backdrop-blur">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            {t("hero.eyebrow", { defaultValue: "FAQ" })}
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-tight text-md-cream md:text-7xl">
            {t("hero.title", {
              defaultValue: "Answers for planning with confidence.",
            })}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-md-sand md:text-lg">
            {t("hero.description", {
              defaultValue:
                "Find quick guidance about accounts, travel discovery, bookings, privacy, and support across Morocco Discovery.",
            })}
          </p>
        </div>
      </section>

      <section className="border-y border-md-gold/15 bg-md-sand px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {categories.map(({ label, icon: Icon, description }) => (
            <div
              key={label}
              className="rounded-lg border border-md-gold/20 bg-white px-5 py-5 shadow-sm"
            >
              <Icon className="h-5 w-5 text-md-green" aria-hidden="true" />
              <h2 className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                {label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-md-muted">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
            <Sparkles className="h-6 w-6 text-md-gold" aria-hidden="true" />
            <h2 className="mt-4 font-display text-3xl font-bold text-md-brown-dark">
              {t("sidebar.title", { defaultValue: "Need a direct answer?" })}
            </h2>
            <p className="mt-4 text-sm leading-7 text-md-muted">
              {t("sidebar.description", {
                defaultValue:
                  "For account, booking, or privacy questions that are not covered here, contact the Morocco Discovery team.",
              })}
            </p>
            <Link
              href="mailto:contact@moroccodiscovery.com"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-md-green px-5 py-3 text-sm font-bold text-md-cream shadow-sm transition duration-200 hover:bg-md-green-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-md-gold/60"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("sidebar.cta", { defaultValue: "Contact support" })}
            </Link>
          </div>
        </aside>

        <div className="space-y-8">
          {faqs.map(({ category, icon: Icon, questions }) => (
            <section
              key={category}
              className="rounded-lg border border-md-gold/20 bg-white px-6 py-7 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-md-sand text-md-green">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="font-display text-3xl font-bold text-md-brown-dark">
                  {category}
                </h2>
              </div>

              <div className="mt-6 divide-y divide-md-sand-dark">
                {questions.map(({ question, answer }) => (
                  <details key={question} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-md-brown-dark transition duration-200 hover:text-md-green">
                      <span>{question}</span>
                      <ChevronDown
                        className="h-5 w-5 flex-none text-md-gold transition duration-200 group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-md-muted">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-lg border border-md-gold/20 bg-md-brown-dark px-6 py-8 text-md-cream shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold">
                  {t("moreHelp.eyebrow", { defaultValue: "More help" })}
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold">
                  {t("moreHelp.title", {
                    defaultValue: "Explore popular sections",
                  })}
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-2 rounded-full border border-md-gold/30 px-4 py-2 text-sm font-bold text-md-sand transition duration-200 hover:bg-md-gold hover:text-md-brown-dark"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {t("moreHelp.destinations", { defaultValue: "Destinations" })}
                </Link>
                <Link
                  href="/restaurants"
                  className="inline-flex items-center gap-2 rounded-full border border-md-gold/30 px-4 py-2 text-sm font-bold text-md-sand transition duration-200 hover:bg-md-gold hover:text-md-brown-dark"
                >
                  <Utensils className="h-4 w-4" aria-hidden="true" />
                  {t("moreHelp.restaurants", { defaultValue: "Restaurants" })}
                </Link>
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center gap-2 rounded-full border border-md-gold/30 px-4 py-2 text-sm font-bold text-md-sand transition duration-200 hover:bg-md-gold hover:text-md-brown-dark"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {t("moreHelp.privacy", { defaultValue: "Privacy" })}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

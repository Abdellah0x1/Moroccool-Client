import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Ban,
  CalendarCheck,
  CalendarDays,
  CircleAlert,
  Clock3,
  Hotel,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Utensils,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { getBusinessByOwnerId, getListingByBusinessId } from "@/lib/business";

const DAY_STATUSES = [
  { label: "Open normally", value: "open" },
  { label: "Limited", value: "limited" },
  { label: "Fully booked", value: "full" },
  { label: "Closed", value: "closed" },
];

const SETUP_REQUIREMENTS = [
  {
    label: "Weekly rhythm",
    title: "Bookable days and regular hours",
    description: "Choose which weekdays accept table requests and when each service opens and closes.",
    icon: CalendarDays,
  },
  {
    label: "Service inventory",
    title: "Lunch, dinner, and custom blocks",
    description: "Release bookable seats per service window and mark blocks as open, limited, full, or closed.",
    icon: Clock3,
  },
  {
    label: "Party rules",
    title: "Guest count and seating limits",
    description: "Set the minimum party, maximum party, seating duration, and large-group handling.",
    icon: UsersRound,
  },
  {
    label: "Exceptions",
    title: "Closures, private events, and notes",
    description: "Override a specific date when staffing, weather, buyouts, or holidays change capacity.",
    icon: Ban,
  },
];

const BOOKING_RULES = [
  {
    label: "Confirmation mode",
    value: "Manual approval",
    detail: "Every request stays pending until the restaurant confirms or declines it.",
  },
  {
    label: "Advance notice",
    value: "2 hours",
    detail: "Guests cannot request a table too close to service without calling.",
  },
  {
    label: "Booking window",
    value: "30 days",
    detail: "How far into the future guests can submit table requests.",
  },
  {
    label: "Table hold",
    value: "15 minutes",
    detail: "How long a confirmed table is held before staff can release it.",
  },
];

const SERVICE_WINDOWS = [
  {
    label: "Lunch",
    start: "12:00",
    end: "15:00",
    seats: 28,
    maxParty: 8,
    status: "Open",
    note: "Normal service",
  },
  {
    label: "Dinner",
    start: "19:00",
    end: "23:00",
    seats: 42,
    maxParty: 10,
    status: "Limited",
    note: "Few tables left",
  },
  {
    label: "Custom block",
    start: "20:00",
    end: "22:00",
    seats: 0,
    maxParty: 0,
    status: "Fully booked",
    note: "Large group reservation",
  },
];

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getWeekDays() {
  const today = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      label: index === 0 ? "Today" : new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
      day: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date),
      month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      selected: index === 0,
    };
  });
}

function LockedState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="grid min-h-[calc(100vh-160px)] place-items-center">
      <section className="w-full max-w-3xl rounded-lg border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-md-sand text-md-green">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
          Availability
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-md-brown-dark">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-md-muted">
          {description}
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href={ctaHref}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-md-green px-5 text-sm font-bold text-white transition hover:bg-md-brown-dark"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default async function BusinessAvailabilityPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== "business_owner") {
    redirect("/profile");
  }

  const business = await getBusinessByOwnerId(user.id);
  const listing = business ? await getListingByBusinessId(Number(business.id)) : null;
  const listingType = String(listing?.type ?? "").toLowerCase();
  const selectedDate = new Date();
  const weekDays = getWeekDays();

  if (!listing) {
    return (
      <LockedState
        icon={Sparkles}
        title="Create your restaurant listing first"
        description="Availability opens after your public restaurant listing exists, so guests know which place they are requesting."
        ctaLabel="Create listing"
        ctaHref="/business/listing"
      />
    );
  }

  if (listingType !== "restaurant") {
    return (
      <LockedState
        icon={Hotel}
        title="Hotel availability uses room rules"
        description="This page is built for restaurant table requests. Hotel availability should stay with rooms, check-in rules, and stay details."
        ctaLabel="Edit listing"
        ctaHref="/business/listing"
      />
    );
  }

  const summaryCards = [
    {
      label: "Today's status",
      value: "Open normally",
      icon: BadgeCheck,
      className: "text-md-green",
    },
    {
      label: "Bookable seats",
      value: "70",
      icon: UsersRound,
      className: "text-md-green",
    },
    {
      label: "Next blocked period",
      value: "Dinner full",
      icon: Ban,
      className: "text-red-700",
    },
    {
      label: "Rule set",
      value: "Manual",
      icon: CalendarCheck,
      className: "text-md-gold-dark",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="border-b border-gray-200 pb-6">
        <div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-md-green/20 bg-md-green/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-md-green">
                <Utensils className="h-4 w-4" aria-hidden="true" />
                Restaurant listing live
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
                Availability
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Define the schedule, capacity, and booking rules guests use
                when they request a table at {listing.name}.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                Selected restaurant
              </p>
              <p className="mt-2 text-xl font-bold text-gray-950">
                {listing.name}
              </p>
              <p className="mt-1 text-sm text-gray-600">{listing.city}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, value, icon: Icon, className }) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm"
            >
              <Icon className={`h-5 w-5 ${className}`} aria-hidden="true" />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-950">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                  Admin setup
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-md-brown-dark">
                  What the restaurant specifies
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-md-muted">
                These rules turn regular opening hours into table inventory the
                booking flow can evaluate before a request reaches staff.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {SETUP_REQUIREMENTS.map(({ label, title, description, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-lg border border-md-gold/20 bg-white px-5 py-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-md-sand text-md-green">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                        {label}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-bold text-md-brown-dark">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-md-muted">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-md-sand text-md-green">
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                  Booking rules
                </p>
                <h2 className="font-display text-3xl font-bold text-md-brown-dark">
                  Default request settings
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                  Confirmation mode
                </span>
                <select
                  defaultValue="manual"
                  className="mt-2 h-11 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-3 text-sm font-bold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
                >
                  <option value="manual">Manual approval</option>
                  <option value="instant">Instant confirmation</option>
                  <option value="call_only">Call restaurant only</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                  Seating duration
                </span>
                <select
                  defaultValue="90"
                  className="mt-2 h-11 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-3 text-sm font-bold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
                >
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                  <option value="150">150 minutes</option>
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                    Min party
                  </span>
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="mt-2 h-11 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-3 text-sm font-bold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                    Max party
                  </span>
                  <input
                    type="number"
                    min="1"
                    defaultValue="10"
                    className="mt-2 h-11 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-3 text-sm font-bold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                    Advance notice
                  </span>
                  <select
                    defaultValue="2"
                    className="mt-2 h-11 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-3 text-sm font-bold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="4">4 hours</option>
                    <option value="24">1 day</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                    Booking window
                  </span>
                  <select
                    defaultValue="30"
                    className="mt-2 h-11 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-3 text-sm font-bold text-md-brown-dark outline-none transition focus:border-md-gold focus:bg-white"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                  </select>
                </label>
              </div>
            </div>

            <label className="mt-6 block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                Guest-facing availability note
              </span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-4 py-3 text-sm text-md-brown-dark outline-none transition placeholder:text-md-muted focus:border-md-gold focus:bg-white"
                placeholder="Large groups may require a phone confirmation. Terrace seating depends on weather."
                defaultValue=""
              />
            </label>
          </section>

          <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                  Date
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-md-brown-dark">
                  {formatFullDate(selectedDate)}
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-md-sand-dark bg-md-cream px-4 text-sm font-bold text-md-brown-dark transition hover:border-md-gold hover:bg-white"
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Calendar
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {weekDays.map(({ label, day, month, selected }) => (
                <button
                  key={`${label}-${day}`}
                  type="button"
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    selected
                      ? "border-md-green bg-md-green text-white"
                      : "border-md-sand-dark bg-md-cream text-md-brown-dark hover:border-md-gold hover:bg-white"
                  }`}
                >
                  <span className="block text-xs font-bold uppercase tracking-[0.14em]">
                    {label}
                  </span>
                  <span className="mt-2 block font-display text-2xl font-bold">
                    {day}
                  </span>
                  <span className="block text-xs font-semibold">{month}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-md-sand text-md-green">
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                  Day status
                </p>
                <h2 className="font-display text-3xl font-bold text-md-brown-dark">
                  Request availability
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {DAY_STATUSES.map(({ label, value }) => {
                const selected = value === "open";

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                      selected
                        ? "border-md-green bg-md-green text-white"
                        : "border-md-sand-dark bg-md-cream text-md-brown-dark hover:border-md-gold hover:bg-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <label className="mt-6 block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                Owner note
              </span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-4 py-3 text-sm text-md-brown-dark outline-none transition placeholder:text-md-muted focus:border-md-gold focus:bg-white"
                placeholder="Private event, staff shortage, terrace closed..."
                defaultValue=""
              />
            </label>
          </section>

          <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
                  Service windows
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-md-brown-dark">
                  Lunch, dinner, and time blocks
                </h2>
              </div>
              <Button type="button" variant="outline" className="h-10 gap-2 border-md-gold/30 bg-white font-bold text-md-brown-dark hover:bg-md-sand">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add time block
              </Button>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-md-gold/20">
              <div className="hidden grid-cols-[1fr_100px_100px_105px_105px_135px_1fr_64px] gap-3 bg-md-sand px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark xl:grid">
                <span>Window</span>
                <span>Starts</span>
                <span>Ends</span>
                <span>Seats</span>
                <span>Max party</span>
                <span>Status</span>
                <span>Note</span>
                <span className="text-right">Actions</span>
              </div>

              {SERVICE_WINDOWS.map((window) => (
                <div
                  key={`${window.label}-${window.start}`}
                  className="grid gap-3 border-t border-md-gold/15 px-4 py-4 first:border-t-0 xl:grid-cols-[1fr_100px_100px_105px_105px_135px_1fr_64px] xl:items-center"
                >
                  <div>
                    <p className="font-bold text-md-brown-dark">{window.label}</p>
                    <p className="text-xs text-md-muted xl:hidden">
                      {window.start} - {window.end}
                    </p>
                  </div>
                  {[
                    ["Starts", "time", window.start],
                    ["Ends", "time", window.end],
                    ["Seats", "number", String(window.seats)],
                    ["Max party", "number", String(window.maxParty)],
                  ].map(([label, type, value]) => (
                    <label key={`${window.label}-${label}`} className="block">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark xl:sr-only">
                        {label}
                      </span>
                      <input
                        type={type}
                        min={type === "number" ? "0" : undefined}
                        defaultValue={value}
                        className="h-10 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-3 text-sm font-semibold text-md-brown-dark outline-none focus:border-md-gold focus:bg-white"
                      />
                    </label>
                  ))}
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark xl:sr-only">
                      Status
                    </span>
                    <select
                      defaultValue={window.status}
                      className="h-10 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-3 text-sm font-bold text-md-brown-dark outline-none focus:border-md-gold focus:bg-white"
                    >
                      <option>Open</option>
                      <option>Limited</option>
                      <option>Fully booked</option>
                      <option>Closed</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-md-gold-dark xl:sr-only">
                      Note
                    </span>
                    <input
                      type="text"
                      defaultValue={window.note}
                      className="h-10 w-full rounded-lg border border-md-sand-dark bg-md-cream/40 px-3 text-sm text-md-brown-dark outline-none focus:border-md-gold focus:bg-white"
                    />
                  </label>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-lg border border-md-sand-dark text-md-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${window.label}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
              Active rules
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-md-brown-dark">
              Request guardrails
            </h2>

            <dl className="mt-5 divide-y divide-md-gold/15 border-y border-md-gold/15">
              {BOOKING_RULES.map(({ label, value, detail }) => (
                <div key={label} className="py-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.16em] text-md-gold-dark">
                    {label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-md-brown-dark">
                    {value}
                  </dd>
                  <dd className="mt-1 text-xs leading-5 text-md-muted">
                    {detail}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-lg border border-md-gold/20 bg-md-brown-dark px-6 py-6 text-md-cream shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold">
              Quick actions
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">
              Adjust today
            </h2>

            <div className="mt-5 grid gap-3">
              {[
                { label: "Close full day", icon: Ban, className: "text-red-200" },
                { label: "Mark lunch limited", icon: CircleAlert, className: "text-md-gold" },
                { label: "Mark dinner full", icon: Clock3, className: "text-md-sand" },
                { label: "Reset to normal hours", icon: RotateCcw, className: "text-md-green" },
              ].map(({ label, icon: Icon, className }) => (
                <button
                  key={label}
                  type="button"
                  className="flex h-11 items-center justify-between rounded-lg border border-md-gold/20 bg-md-cream/10 px-4 text-sm font-bold text-md-cream transition hover:border-md-gold/45 hover:bg-md-cream/15"
                >
                  <span>{label}</span>
                  <Icon className={`h-4 w-4 ${className}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-md-gold/20 bg-white px-6 py-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-md-gold-dark">
              Booking inbox
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-md-brown-dark">
              Requests live separately
            </h2>
            <p className="mt-3 text-sm leading-6 text-md-muted">
              Availability controls what guests can request. The bookings inbox
              is where the restaurant confirms or declines each request.
            </p>
            <Link
              href="/business/bookings"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-md-green px-4 text-sm font-bold text-white transition hover:bg-md-brown-dark"
            >
              View bookings
            </Link>
          </section>
        </aside>
      </section>

      <div className="sticky bottom-0 border-t border-md-gold/20 bg-white/95 px-6 py-3 backdrop-blur lg:hidden">
        <Button type="button" className="h-11 w-full gap-2 bg-md-green font-bold text-white hover:bg-md-brown-dark">
          <Save className="h-4 w-4" aria-hidden="true" />
          Save availability
        </Button>
      </div>
    </div>
  );
}

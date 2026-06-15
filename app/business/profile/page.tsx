import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  EyeOff,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getBusinessByOwnerId } from "@/lib/business";
import { getCurrentProfile, requireUser } from "@/lib/auth";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLabel(value: string | null | undefined, fallback = "Not set") {
  if (!value) return fallback;

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusMeta(status: string | null | undefined) {
  switch (status) {
    case "approved":
      return {
        label: "Approved",
        description: "Your business is ready to appear in Moroccool listings.",
        icon: BadgeCheck,
        className: "border-md-green/25 bg-md-green/10 text-md-green",
      };
    case "rejected":
      return {
        label: "Needs attention",
        description: "Our team could not approve this application yet.",
        icon: EyeOff,
        className: "border-red-200 bg-red-50 text-red-700",
      };
    case "needs_changes":
      return {
        label: "Changes requested",
        description: "A few details need updating before approval.",
        icon: ClipboardCheck,
        className: "border-md-gold/30 bg-md-gold/10 text-md-gold-dark",
      };
    case "pending_review":
    default:
      return {
        label: "Pending review",
        description: "Your application is in the review queue.",
        icon: Clock3,
        className: "border-md-gold/30 bg-md-gold/10 text-md-gold-dark",
      };
  }
}

export default async function BusinessProfilePage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.role !== "business_owner") {
    redirect("/profile");
  }

  const business = await getBusinessByOwnerId(user.id);
  const statusMeta = getStatusMeta(business?.status);
  const StatusIcon = statusMeta.icon;
  const ownerName =
    profile?.name ||
    String(user.user_metadata?.name || user.user_metadata?.full_name || "") ||
    "Business owner";

  const details = [
    {
      label: "Business name",
      value: business?.name,
      icon: Building2,
    },
    {
      label: "City",
      value: formatLabel(business?.city),
      icon: MapPin,
    },
    {
      label: "Address",
      value: business?.address,
      icon: MapPin,
    },
    {
      label: "Business email",
      value: business?.email,
      icon: Mail,
    },
    {
      label: "Business phone",
      value: business?.phone,
      icon: Phone,
    },
    {
      label: "Owner",
      value: ownerName,
      icon: ShieldCheck,
    },
    {
      label: "Submitted",
      value: formatDate(business?.created_at),
      icon: CalendarDays,
    },
    {
      label: "Last updated",
      value: formatDate(business?.updated_at),
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
            Business profile
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            {business?.name || "Business details"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Review the application details attached to your owner account.
          </p>
        </div>

        <div className={`rounded-lg border px-4 py-3 ${statusMeta.className}`}>
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em]">
                Application status
              </p>
              <p className="mt-0.5 text-sm font-bold">{statusMeta.label}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                Submitted details
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-950">
                Business information
              </h2>
            </div>
            <Building2 className="h-5 w-5 text-md-green" aria-hidden="true" />
          </div>

          {business ? (
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              {details.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4"
                >
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="mt-3 break-words text-sm font-semibold text-gray-950">
                    {value || "Not set"}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-md-gold/35 bg-gray-50 px-6 py-10 text-center">
              <Building2 className="mx-auto h-10 w-10 text-md-gold-dark" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-bold text-gray-950">
                No business application found
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600">
                Your owner account exists, but no business profile is attached
                yet. Submit the partner form again or contact the Moroccool
                team if this happened after signup.
              </p>
              <Link
                href="/business/signup"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-md-green px-4 text-sm font-bold text-white transition hover:bg-md-brown-dark"
              >
                Submit business details
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              Review process
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-950">
              What happens next
            </h2>
            <div className="mt-5 space-y-4">
              {[
                "Moroccool reviews your business details.",
                "The team confirms contact information and listing fit.",
                "Approved partners become eligible for customer booking requests.",
              ].map((step, index) => (
                <div key={step} className="flex gap-3">
                  <div className="grid h-7 w-7 flex-none place-items-center rounded-full bg-md-green/10 text-xs font-bold text-md-green">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-gray-600">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-md-green" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                Account
              </p>
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-950">
              Signed in as {ownerName}
            </h2>
            <p className="mt-2 break-words text-sm leading-6 text-gray-600">
              {profile?.email || user.email}
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}


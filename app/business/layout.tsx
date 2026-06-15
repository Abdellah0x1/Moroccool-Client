import { BusinessDashboardShell } from "@/components/BusinessDashboardShell";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BusinessDashboardShell>{children}</BusinessDashboardShell>;
}


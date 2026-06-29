"use client";

import { usePathname } from "next/navigation";
import { ScrollToTop } from "./ScrollToTop";

export function RouteChrome({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBusinessConsole =
    pathname.startsWith("/business") && !pathname.startsWith("/business/signup");

  if (isBusinessConsole) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <div className="flex-grow">{children}</div>
      {footer}
      <ScrollToTop />
    </>
  );
}


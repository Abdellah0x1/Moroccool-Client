import {
  initServerI18next,
  getT,
  getResources,
} from "next-i18next/server";

import { I18nProvider } from "next-i18next/client";
import i18nConfig from "../i18n.config";
import { NavbarServer } from "../components/navbarServer";
import { Footer } from "../components/footer";
import { RouteChrome } from "@/components/RouteChrome";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });


initServerI18next(i18nConfig);

const namespaces = [
  "common",
  "home",
  "places",
  "restaurants",
  "faq",
  "privacy",
  "profile",
  "notFound",
  "login",
  "signup",
];



export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { i18n, lng } = await getT();
  const resources = getResources(i18n, namespaces);

  return (
    <html lang={lng} dir={lng === "ar" ? "rtl" : "ltr"} className={cn("font-sans", geist.variable)}>
      <body className="bg-md-brown-light text-md-brown-dark flex flex-col min-h-screen">
        <I18nProvider
          language={lng}
          resources={resources}
          supportedLngs={i18nConfig.supportedLngs}
          defaultNS={i18nConfig.defaultNS}
          fallbackLng={i18nConfig.fallbackLng}
        >
          <RouteChrome navbar={<NavbarServer />} footer={<Footer />}>
            {children}
          </RouteChrome>
        </I18nProvider>
      </body>
    </html>
  );
}

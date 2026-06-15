import type { I18nConfig } from "next-i18next/proxy";

const i18nConfig: I18nConfig = {
  supportedLngs: ["en", "fr", "ar"],
  fallbackLng: "en",
  defaultNS: "common",
  ns: [
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
  ],

  // Important: no /en /fr /ar in the URL
  localeInPath: false,

  resourceLoader: (language, namespace) =>
    import(`./app/i18n/locales/${language}/${namespace}.json`),
};

export default i18nConfig;

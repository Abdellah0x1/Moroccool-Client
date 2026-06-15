"use client";

import { useState } from "react";
import { useChangeLanguage, useT } from "next-i18next/client";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { t } = useT("common");
  const { i18n } = useTranslation();
  const changeServerLanguage = useChangeLanguage();
  const [isChanging, setIsChanging] = useState(false);

  async function changeLanguage(lang: string) {
    if (lang === i18n.language) return;

    setIsChanging(true);
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      await changeServerLanguage(lang);
    } finally {
      setIsChanging(false);
    }
  }

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      disabled={isChanging}
      aria-label={t("language.select", { defaultValue: "Select language" })}
      className="h-11 rounded-full border border-md-gold/25 bg-white/80 px-3 text-xs font-bold uppercase text-md-brown-dark shadow-sm outline-none transition duration-200 hover:border-md-gold/50 focus:border-md-gold focus:ring-2 focus:ring-md-gold/20"
    >
      <option value="en">EN</option>
      <option value="fr">FR</option>
      <option value="ar">AR</option>
    </select>
  );
}

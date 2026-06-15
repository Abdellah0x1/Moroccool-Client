"use client";

import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { useT } from "next-i18next/client";

export function Footer() {
  const { t } = useT("common");

  return (
    <footer className="bg-md-brown-dark text-md-cream border-t border-md-gold/20">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
            <h3 className="text-3xl font-display font-bold text-md-gold">
              {t("brand", { defaultValue: "Morocco Discovery" })}
            </h3>
            <p className="text-md-sand-dark text-sm leading-relaxed">
              {t("footer.description", {
                defaultValue:
                  "Experience the magic of Morocco. From the bustling souks of Marrakech to the serene dunes of the Sahara, discover a world of luxury and heritage.",
              })}
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" aria-label={t("footer.facebook", { defaultValue: "Facebook" })} className="w-10 h-10 rounded-full bg-md-brown flex items-center justify-center text-md-gold hover:bg-md-gold hover:text-md-brown-dark transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label={t("footer.instagram", { defaultValue: "Instagram" })} className="w-10 h-10 rounded-full bg-md-brown flex items-center justify-center text-md-gold hover:bg-md-gold hover:text-md-brown-dark transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label={t("footer.twitter", { defaultValue: "Twitter" })} className="w-10 h-10 rounded-full bg-md-brown flex items-center justify-center text-md-gold hover:bg-md-gold hover:text-md-brown-dark transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-bold text-md-gold uppercase tracking-wider text-sm mb-2">{t("footer.exploreTitle", { defaultValue: "Explore" })}</h4>
            <Link href="/destinations" className="text-md-sand hover:text-md-gold transition-colors duration-200">{t("footer.destinations", { defaultValue: "Destinations" })}</Link>
            <Link href="/restaurants" className="text-md-sand hover:text-md-gold transition-colors duration-200">{t("footer.fineDining", { defaultValue: "Fine Dining" })}</Link>
            <Link href="/experiences" className="text-md-sand hover:text-md-gold transition-colors duration-200">{t("footer.experiences", { defaultValue: "Experiences" })}</Link>
            <Link href="/itineraries" className="text-md-sand hover:text-md-gold transition-colors duration-200">{t("footer.itineraries", { defaultValue: "Curated Itineraries" })}</Link>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-bold text-md-gold uppercase tracking-wider text-sm mb-2">{t("footer.supportTitle", { defaultValue: "Support" })}</h4>
            <Link href="/about" className="text-md-sand hover:text-md-gold transition-colors duration-200">{t("footer.about", { defaultValue: "About Us" })}</Link>
            <Link href="/contact" className="text-md-sand hover:text-md-gold transition-colors duration-200">{t("footer.contact", { defaultValue: "Contact" })}</Link>
            <Link href="/faq" className="text-md-sand hover:text-md-gold transition-colors duration-200">{t("footer.faq", { defaultValue: "FAQ" })}</Link>
            <Link href="/privacy-policy" className="text-md-sand hover:text-md-gold transition-colors duration-200">{t("footer.privacy", { defaultValue: "Privacy Policy" })}</Link>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-bold text-md-gold uppercase tracking-wider text-sm mb-2">{t("footer.contactTitle", { defaultValue: "Contact Us" })}</h4>
            <div className="flex items-start gap-3 text-md-sand text-sm">
              <MapPin className="w-5 h-5 text-md-gold shrink-0 mt-0.5" />
              <p className="whitespace-pre-line">
                {t("footer.address", {
                  defaultValue: "123 Avenue Mohammed V,\nGueliz, Marrakech 40000",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3 text-md-sand text-sm">
              <Phone className="w-5 h-5 text-md-gold shrink-0" />
              <p>+212 524 12 34 56</p>
            </div>
            <div className="flex items-center gap-3 text-md-sand text-sm">
              <Mail className="w-5 h-5 text-md-gold shrink-0" />
              <p>contact@moroccodiscovery.com</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-md-brown mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-md-muted">
          <p>
            &copy; {new Date().getFullYear()} {t("footer.copyright", { defaultValue: "Morocco Discovery. All rights reserved." })}
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-md-gold transition-colors duration-200">{t("footer.terms", { defaultValue: "Terms of Service" })}</Link>
            <Link href="/privacy-policy" className="hover:text-md-gold transition-colors duration-200">{t("footer.privacy", { defaultValue: "Privacy Policy" })}</Link>
            <Link href="/cookies" className="hover:text-md-gold transition-colors duration-200">{t("footer.cookiePolicy", { defaultValue: "Cookie Policy" })}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

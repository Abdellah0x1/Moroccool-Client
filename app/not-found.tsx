import Link from "next/link";
import { Compass } from "lucide-react";
import { getT } from "next-i18next/server";

export default async function NotFound() {
  const { t } = await getT("notFound");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-md-cream text-md-brown-dark relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-md-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-md-green/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Icon & 404 */}
        <div className="relative mb-8">
          <Compass className="w-24 h-24 text-md-gold/20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          <h1 className="text-8xl md:text-9xl font-display font-bold text-md-gold drop-shadow-sm relative z-10">
            404
          </h1>
        </div>
        
        {/* Messaging */}
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          {t("title", { defaultValue: "Lost in the Medina" })}
        </h2>
        
        <p className="text-md-muted font-body mb-12 text-lg leading-relaxed">
          {t("description", {
            defaultValue:
              "It seems you've wandered off the map. Even the most seasoned travelers sometimes find themselves on unexpected paths, but this particular route isn't in our curated guide.",
          })}
        </p>
        
        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/"
            className="font-body font-bold text-sm bg-md-brown-dark text-md-cream px-8 py-3.5 rounded-full hover:bg-md-gold hover:text-md-brown-dark transition-colors duration-300 shadow-lg"
          >
            {t("home", { defaultValue: "Return to the Oasis (Home)" })}
          </Link>
          <Link 
            href="/destinations"
            className="font-body font-bold text-sm bg-transparent border-2 border-md-brown-dark/20 text-md-brown-dark px-8 py-3.5 rounded-full hover:border-md-gold hover:text-md-gold transition-colors duration-300"
          >
            {t("destinations", { defaultValue: "Explore Destinations" })}
          </Link>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > 400);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className={`
                fixed bottom-6 right-6 z-50
                flex h-11 w-11 items-center justify-center
                rounded-full border border-md-gold/30 bg-md-brown-dark/90
                text-md-gold shadow-lg backdrop-blur-sm
                transition-all duration-300
                hover:bg-md-brown-dark hover:border-md-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]
                hover:-translate-y-0.5
                ${visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0 pointer-events-none"
                }
            `}
        >
            <ArrowUp className="h-5 w-5" />
        </button>
    );
}

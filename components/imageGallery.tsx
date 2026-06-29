"use client"

import Image from "next/image";
import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"


export function ImageGallery({ images, name }: { images: string[], name: string }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const isOpen = selectedIndex !== null;

    const close = useCallback(() => setSelectedIndex(null), []);

    const goNext = useCallback(() => {
        setSelectedIndex((prev) =>
            prev !== null ? (prev + 1) % images.length : null
        );
    }, [images.length]);

    const goPrev = useCallback(() => {
        setSelectedIndex((prev) =>
            prev !== null ? (prev - 1 + images.length) % images.length : null
        );
    }, [images.length]);

    /* Keyboard support: Escape / Arrow keys */
    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        }

        document.body.style.overflow = "hidden";     // prevent background scroll
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, close, goNext, goPrev]);

    return (
        <>
            {/* ── Grid ── */}
            <div className="grid gap-4 sm:grid-cols-2">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className="group relative h-64 cursor-pointer overflow-hidden rounded-lg border border-md-gold/10 shadow-sm"
                        onClick={() => setSelectedIndex(index)}
                    >
                        <Image
                            src={img}
                            alt={`${name} gallery image ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Hover overlay hint */}
                        <div className="absolute inset-0 flex items-center justify-center bg-md-brown-dark/0 transition-colors duration-300 group-hover:bg-md-brown-dark/20">
                            <span className="translate-y-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-md-brown-dark opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                View
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Modal ── */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[2001] flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={close}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-md-brown-dark/80 backdrop-blur-md" />

                    {/* Content wrapper */}
                    <div
                        className="relative flex max-h-[90vh] max-w-5xl flex-col items-center gap-4 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={close}
                            className="absolute -top-2 -right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-110"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Image */}
                        <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                            <Image
                                src={images[selectedIndex!]}
                                alt={`${name} gallery image ${selectedIndex! + 1}`}
                                width={1200}
                                height={800}
                                className="max-h-[80vh] w-auto object-contain"
                            />
                        </div>

                        {/* Navigation arrows + counter (only if multiple images) */}
                        {images.length > 1 && (
                            <>
                                {/* Left arrow */}
                                <button
                                    onClick={goPrev}
                                    className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-110 sm:-translate-x-full sm:mr-4"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                {/* Right arrow */}
                                <button
                                    onClick={goNext}
                                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-110 sm:translate-x-full sm:ml-4"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>

                                {/* Counter pill */}
                                <div className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 shadow-lg backdrop-blur-md">
                                    {selectedIndex! + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

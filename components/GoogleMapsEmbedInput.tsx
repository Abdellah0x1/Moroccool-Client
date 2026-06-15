"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ExternalLink, MapPinned } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function normalizeHtmlEntities(value: string) {
    return value.replaceAll("&amp;", "&").trim();
}

export function extractGoogleMapsEmbedSrc(value: string) {
    const cleaned = normalizeHtmlEntities(value);
    const iframeSrc = cleaned.match(/\bsrc=(["'])(.*?)\1/i)?.[2];
    const candidate = normalizeHtmlEntities(iframeSrc ?? cleaned);

    try {
        const url = new URL(candidate);
        const hostname = url.hostname.toLowerCase();
        const isGoogleEmbed =
            url.protocol === "https:" &&
            ["www.google.com", "google.com"].includes(hostname) &&
            url.pathname === "/maps/embed";
        const isLegacyGoogleEmbed =
            url.protocol === "https:" &&
            hostname === "maps.google.com" &&
            url.pathname === "/maps" &&
            url.searchParams.get("output") === "embed";

        if (isGoogleEmbed || isLegacyGoogleEmbed) {
            return url.toString();
        }
    } catch {
        return "";
    }

    return "";
}

export function GoogleMapsEmbedInput({ defaultValue = "" }: { defaultValue?: string | null }) {
    const [rawValue, setRawValue] = useState(defaultValue ?? "");
    const embedUrl = useMemo(() => extractGoogleMapsEmbedSrc(rawValue), [rawValue]);
    const hasInvalidValue = rawValue.trim().length > 0 && !embedUrl;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-sm font-bold text-md-brown-dark">
                    Google Maps iframe src
                </Label>
                <Input
                    value={rawValue}
                    onChange={(event) => setRawValue(event.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="h-12 border-md-sand-dark bg-md-cream/40 text-md-brown-dark transition focus:border-md-gold focus:bg-white"
                />
                <input type="hidden" name="google_maps_embed_url" value={embedUrl} />
                <p className="text-xs leading-5 text-md-muted">
                    In Google Maps, open Share, choose Embed a map, then paste the iframe
                    src here. You can also paste the full iframe code.
                </p>
            </div>

            {embedUrl ? (
                <div className="overflow-hidden rounded-xl border border-md-gold/20 bg-md-cream shadow-sm">
                    <iframe
                        src={embedUrl}
                        className="h-[360px] w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Maps location preview"
                    />
                    <div className="flex items-center justify-between gap-4 border-t border-md-gold/15 bg-white px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-md-green">
                            <MapPinned className="h-4 w-4" aria-hidden="true" />
                            Location preview attached
                        </div>
                        <a
                            href={embedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-md-gold-dark transition hover:text-md-green"
                        >
                            Open preview
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-md-sand-dark bg-md-cream/50 px-6 text-center">
                    <div>
                        <MapPinned className="mx-auto h-9 w-9 text-md-gold-dark" aria-hidden="true" />
                        <p className="mt-4 text-sm font-bold text-md-brown-dark">
                            Paste a Google Maps embed URL to preview the location.
                        </p>
                        <p className="mt-2 max-w-md text-xs leading-5 text-md-muted">
                            Only Google Maps embed URLs are accepted so the preview stays safe.
                        </p>
                    </div>
                </div>
            )}

            {hasInvalidValue ? (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 flex-none" aria-hidden="true" />
                    Paste a valid Google Maps embed src, not a regular share link.
                </div>
            ) : null}
        </div>
    );
}

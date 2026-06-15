"use client";

import { useEffect, useRef, useState } from "react";
import type { LeafletMouseEvent, Map as LeafletMap } from "leaflet";

const DEFAULT_LAT = 31.7917;
const DEFAULT_LNG = -7.0926;
const DEFAULT_ZOOM = 6;

export function LocationPicker() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const [lat, setLat] = useState(DEFAULT_LAT);
    const [lng, setLng] = useState(DEFAULT_LNG);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);

    useEffect(() => {
        let map: LeafletMap | null = null;

        async function initMap() {
            const L = await import("leaflet");

            if (!mapRef.current) return;

            const leafletMap = L.map(mapRef.current).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
            map = leafletMap;

            L.tileLayer(
                "https://tiles.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
                {
                    attribution:
                        '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/">CARTO</a>',
                }
            ).addTo(leafletMap);

            const markerIcon = L.divIcon({
                className: "",
                html: '<div style="height:24px;width:24px;border-radius:999px 999px 999px 0;background:#146C3C;border:3px solid #FCF9F8;box-shadow:0 8px 18px rgba(29,10,3,.28);transform:rotate(-45deg);"></div>',
                iconAnchor: [12, 24],
                iconSize: [24, 24],
            });

            const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
                draggable: true,
                icon: markerIcon,
            }).addTo(leafletMap);

            leafletMap.on("click", (event: LeafletMouseEvent) => {
                const nextLat = Number(event.latlng.lat.toFixed(6));
                const nextLng = Number(event.latlng.lng.toFixed(6));

                marker.setLatLng([nextLat, nextLng]);
                setLat(nextLat);
                setLng(nextLng);
            });

            marker.on("dragend", () => {
                const pos = marker.getLatLng();
                setLat(Number(pos.lat.toFixed(6)));
                setLng(Number(pos.lng.toFixed(6)));
            });

            leafletMap.on("zoomend", () => {
                setZoom(leafletMap.getZoom());
            });
        }

        initMap();

        return () => {
            if (map) map.remove();
        };
    }, []);

    return (
        <div className="space-y-4">
            <div ref={mapRef} className="h-[360px] w-full rounded-lg border" />

            <p className="text-sm text-md-muted">
                Click the map or drag the pin to set the exact business location.
            </p>

            <input type="hidden" name="latitude" value={lat} />
            <input type="hidden" name="longitude" value={lng} />
            <input type="hidden" name="map_zoom" value={zoom} />
        </div>
    );
}

"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface MapReseller {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  lat: number;
  lng: number;
}

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm",
    },
  ],
};

export function ResellersMap({ resellers }: { resellers: MapReseller[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] =
      resellers.length > 0 ? [resellers[0].lng, resellers[0].lat] : [-47.8825, -15.7942];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center,
      zoom: resellers.length > 0 ? 4 : 3,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    for (const r of resellers) {
      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "50%";
      el.style.background = "#8e6f53";
      el.style.border = "2px solid #ffffff";
      el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";

      const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(
        `<div style="font-family: Inter, sans-serif; font-size: 12.5px; padding: 2px;">
          <strong>${r.name}</strong><br/>
          <span style="color:#78716c">${[r.city, r.state].filter(Boolean).join("/") || "-"}</span>
        </div>`,
      );

      new maplibregl.Marker({ element: el }).setLngLat([r.lng, r.lat]).setPopup(popup).addTo(map);
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [resellers]);

  return <div ref={containerRef} className="h-[480px] w-full rounded-xl border border-line" />;
}

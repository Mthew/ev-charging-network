"use client";

import { useEffect, useRef, useState } from "react";
import { googleMapsLoader } from "@/lib/google-maps-loader";
import { MAP_DARK_STYLE } from "@/config/constants";
import { set } from "zod";
import { he } from "zod/v4/locales";

// Type declarations at the top
declare global {
  interface Window {
    google?: typeof google;
  }
}

export interface Location {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: "desired" | "charging" | "submission";
}

interface GoogleMapsProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  showHeatmap?: boolean;
  className?: string;
}

// Default center: Medellín, Colombia
const MEDELLIN_CENTER = { lat: 6.2442, lng: -75.5812 };

// Global heatmap layer variable for cleanup
let heatMapLayer: google.maps.visualization.HeatmapLayer | null = null;

export default function GoogleMaps({
  locations = [],
  center = MEDELLIN_CENTER,
  zoom = 12,
  onMapClick,
  showHeatmap = false,
  className = "",
}: Omit<GoogleMapsProps, "height">) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [heatmapData, setHeatmapData] = useState<google.maps.MVCArray | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (map && window.google) {
      updateMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, locations]);

  const initializeMap = async () => {
    try {
      // Check if API key is configured
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey || apiKey === "your_google_maps_api_key_here") {
        console.warn("Google Maps API key not found. Showing demo map.");
        showDemoMap();
        return;
      }

      // Use centralized loader to prevent multiple initialization
      await googleMapsLoader.load();

      if (mapRef.current && window.google) {
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          styles: MAP_DARK_STYLE,
        });

        // Add click listener if provided
        if (onMapClick) {
          newMap.addListener("click", (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              onMapClick(event.latLng.lat(), event.latLng.lng());
            }
          });
        }

        setMap(newMap);
      }
    } catch (err) {
      console.error("Error loading Google Maps:", err);
      setError(`Error loading Google Maps: ${err}`);
      showDemoMap();
    } finally {
      setIsLoading(false);
    }
  };

  const showDemoMap = () => {
    setIsLoading(false);
    // The demo map is shown by default in the JSX below
  };

  const updateMarkers = () => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    if (heatMapLayer) {
      heatMapLayer.setMap(null);
    }
    // if (heatmapData != null) {
    //   while (heatmapData.getLength() > 0) {
    //     heatmapData.removeAt(0);
    //   }
    // }

    // Create new markers
    const newMarkers = locations.map((location) => {
      const marker = new window.google!.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.title,
        icon: getMarkerIcon(location.type),
      });

      // Add info window
      const infoWindow = new window.google!.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${
              location.title
            }</h3>
            ${
              location.description
                ? `<p style="margin: 0; font-size: 12px;">${location.description}</p>`
                : ""
            }
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    let _heatmapData = null;

    // If showing heatmap, create heat map
    if (
      showHeatmap &&
      locations.length > 0 &&
      window.google?.maps?.visualization
    ) {
      _heatmapData = new google.maps.MVCArray([
        ...locations.map(
          (location) =>
            new window.google!.maps.LatLng(location.lat, location.lng)
        ),
      ]);

      if (heatMapLayer) {
        heatMapLayer.setMap(map);
        heatMapLayer.setData(_heatmapData);
      } else {
        heatMapLayer = new window.google!.maps.visualization.HeatmapLayer({
          data: _heatmapData,
          map: map,
          radius: 20,
          opacity: 0.6,
        });
      }
    }

    // Adjust map bounds to fit all markers
    if (newMarkers.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      map.fitBounds(bounds);

      // Don't zoom in too much for single markers
      if (newMarkers.length === 1) {
        const currentZoom = map.getZoom();
        if (currentZoom !== null && currentZoom !== undefined) {
          map.setZoom(Math.min(currentZoom, 15));
        }
      }
    }

    setHeatmapData(heatmapData);
    setMarkers(newMarkers);
  };

  const getMarkerIcon = (type?: string) => {
    const baseUrl = "data:image/svg+xml;charset=UTF-8,";

    switch (type) {
      case "desired":
        return (
          baseUrl +
          encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3b82f6"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `)
        );
      case "charging":
        return (
          baseUrl +
          encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10b981"/>
            <path d="M12 6l-2 4h1.5v3l2-4H12V6z" fill="white"/>
          </svg>
        `)
        );
      default:
        return (
          baseUrl +
          encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `)
        );
    }
  };

  if (error || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={`relative bg-slate-800 rounded-lg border border-slate-600 ${className}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">
              Demo Map - Medellín
            </h3>
            <p className="text-sm mb-2">Google Maps API Key Required</p>
            <div className="text-xs space-y-1">
              <p>Locations: {locations.length}</p>
              {locations.length > 0 && (
                <div className="space-y-1">
                  {locations.slice(0, 3).map((loc, idx) => (
                    <div key={idx} className="text-left">
                      <span className="text-blue-400">📍</span> {loc.title}
                    </div>
                  ))}
                  {locations.length > 3 && (
                    <p>... and {locations.length - 3} more</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demo markers overlay */}
        {locations.length > 0 && (
          <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-2">
            <div className="flex items-center space-x-2 text-xs text-white">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Desired Locations</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center z-10">
          <div className="text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>Cargando mapa...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
}

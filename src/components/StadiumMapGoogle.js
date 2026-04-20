"use client";

import React, { useState, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  HeatmapLayer,
  OverlayViewF,
} from "@react-google-maps/api";
import { STADIUMS, mapZonesToCoordinates } from "../lib/mapUtils";
import styles from "./StadiumMap.module.css";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

// Soft minimal style for Google Maps
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#dcfce7" }],
  },
  {
    featureType: "poi.sports_complex",
    elementType: "geometry",
    stylers: [{ color: "#bbf7d0" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#bae6fd" }],
  },
];

const libraries = ["visualization"];

export default function StadiumMapGoogle({
  stadiumData,
  selectedStadium,
  setSelectedStadium,
  activeZone,
  activeActionTarget,
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const center = useMemo(() => {
    return {
      lat: STADIUMS[selectedStadium].lat,
      lng: STADIUMS[selectedStadium].lng,
    };
  }, [selectedStadium]);

  const mappedZones = useMemo(() => {
    if (!isLoaded || !stadiumData || !window.google) return [];
    return mapZonesToCoordinates(stadiumData, center.lat, center.lng);
  }, [isLoaded, stadiumData, center]);

  // Convert logical stadium zones into heatmap weighted points
  const heatmapData = useMemo(() => {
    if (!mappedZones.length || !window.google) return [];

    return mappedZones.map((zone) => ({
      location: new window.google.maps.LatLng(
        zone.location.lat,
        zone.location.lng,
      ),
      weight: zone.data.densityScore, // Drive heatmap intensity by real density
    }));
  }, [mappedZones]);

  // Fallback if Maps fails to load or no API key is provided
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || loadError) {
    return (
      <div className={styles.fallbackContainer}>
        <div className={styles.fallbackMessage}>
          <h3>Map Unavailable</h3>
          <p>
            Please provide a valid Google Maps API Key in .env to view the
            interactive Heatmap.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded)
    return <div className={styles.loadingMap}>Loading Map Interfaces...</div>;

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapRoot}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={17}
          mapTypeId="satellite"
          options={{
            mapTypeId: "hybrid",
            styles: mapStyles,
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {/* Heatmap Layer */}
          {heatmapData.length > 0 && (
            <HeatmapLayer
              data={heatmapData}
              options={{
                radius: 40,
                opacity: 0.8,
                // Soft gradient from blue (low) -> yellow (med) -> red (high)
                gradient: [
                  "rgba(0, 255, 255, 0)",
                  "rgba(5, 150, 105, 1)" /* Emerald */,
                  "rgba(217, 119, 6, 1)" /* Amber */,
                  "rgba(225, 29, 72, 1)" /* Rose */,
                ],
              }}
            />
          )}

          {/* Overlay Icons for Landmarks */}
          {mappedZones.map((zone) => {
            let icon = "📍";
            if (zone.name.includes("Food")) icon = "🍔";
            if (zone.name.includes("Restroom")) icon = "🚻";
            if (zone.name.includes("Gate")) icon = "🚪";

            const isActionTarget = activeActionTarget === zone.name;

            return (
              <OverlayViewF
                key={zone.name}
                position={zone.location}
                mapPaneName={OverlayViewF.OVERLAY_MOUSE_TARGET}
              >
                <div
                  className={isActionTarget ? styles.actionPulseMarker : ""}
                  style={{
                    transform:
                      activeZone === zone.name
                        ? "translate(-50%, -50%) scale(1.3)"
                        : "translate(-50%, -50%)",
                    background:
                      isActionTarget
                        ? "#3b82f6"
                        : activeZone === zone.name
                          ? "rgba(59, 130, 246, 0.95)"
                          : "rgba(255, 255, 255, 0.95)",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    boxShadow:
                      isActionTarget
                        ? "0 0 20px #3b82f6"
                        : activeZone === zone.name
                          ? "0 0 15px rgba(59, 130, 246, 0.8)"
                          : "0 2px 6px rgba(0,0,0,0.15)",
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap",
                    color:
                      isActionTarget || activeZone === zone.name
                        ? "#ffffff"
                        : "#0f172a",
                    border:
                      isActionTarget
                        ? "2px solid #ffffff"
                        : activeZone === zone.name
                          ? "2px solid #ffffff"
                          : "1px solid #cbd5e1",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    pointerEvents: "none",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>{icon}</span> {zone.name}
                </div>
              </OverlayViewF>
            );
          })}
        </GoogleMap>
      </div>
    </div>
  );
}

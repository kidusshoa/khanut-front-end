"use client";

import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import { MapPin, Navigation } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  color?: string;
  onClick?: () => void;
}

interface BusinessMapProps {
  latitude: number;
  longitude: number;
  businessName: string;
  zoom?: number;
  height?: string;
  markers?: MarkerData[];
  onViewportChange?: (viewport: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) => void;
}

export function BusinessMap({
  latitude,
  longitude,
  businessName,
  zoom = 14,
  height = "250px",
  markers = [],
  onViewportChange,
}: BusinessMapProps) {
  const [viewport, setViewport] = useState({
    latitude,
    longitude,
    zoom,
  });

  const [popupInfo, setPopupInfo] = useState<MarkerData | null>(null);

  // Function to handle fullscreen toggle
  const toggleFullscreen = () => {
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;

    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Function to center map on Addis Ababa
  const centerOnAddis = () => {
    const newViewport = {
      latitude: 9.0222,
      longitude: 38.7578,
      zoom: 12,
    };
    setViewport(newViewport);
    if (onViewportChange) {
      onViewportChange(newViewport);
    }
  };

  return (
    <div
      id="map-container"
      className={`h-[${height}] w-full rounded-lg overflow-hidden relative`}
      style={{ height }}
    >
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        <button
          onClick={toggleFullscreen}
          className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors"
          title="Toggle fullscreen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
        <button
          onClick={centerOnAddis}
          className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors"
          title="Center on Addis Ababa"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </button>
      </div>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={viewport}
        onMove={(evt) => {
          const newViewport = evt.viewState;
          setViewport(newViewport);
          if (onViewportChange) {
            onViewportChange({
              latitude: newViewport.latitude,
              longitude: newViewport.longitude,
              zoom: newViewport.zoom,
            });
          }
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {/* Main marker (user location or primary business) */}
        <Marker latitude={latitude} longitude={longitude} anchor="bottom">
          <div className="relative">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
              {businessName}
            </div>
            <Navigation className="w-6 h-6 text-blue-600" />
          </div>
        </Marker>

        {/* Additional markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.latitude}
            longitude={marker.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              // Show popup info
              setPopupInfo(marker);

              // If marker has onClick handler, call it when marker is clicked
              if (marker.onClick) {
                marker.onClick();
              }
            }}
          >
            <MapPin className="w-6 h-6 text-red-500 cursor-pointer" />
          </Marker>
        ))}

        {/* Popup for marker info */}
        {popupInfo && (
          <Popup
            latitude={popupInfo.latitude}
            longitude={popupInfo.longitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            className="z-50"
          >
            <div className="p-2">
              <h3 className="font-medium text-sm">{popupInfo.name}</h3>
              {popupInfo.onClick && (
                <button
                  onClick={popupInfo.onClick}
                  className="mt-2 text-xs text-orange-600 hover:text-orange-700 underline"
                >
                  View Profile
                </button>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

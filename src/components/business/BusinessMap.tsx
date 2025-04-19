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
}

interface BusinessMapProps {
  latitude: number;
  longitude: number;
  businessName: string;
  zoom?: number;
  height?: string;
  markers?: MarkerData[];
}

export function BusinessMap({
  latitude,
  longitude,
  businessName,
  zoom = 14,
  height = "250px",
  markers = [],
}: BusinessMapProps) {
  const [viewport, setViewport] = useState({
    latitude,
    longitude,
    zoom,
  });

  const [popupInfo, setPopupInfo] = useState<MarkerData | null>(null);

  return (
    <div
      className={`h-[${height}] w-full rounded-lg overflow-hidden`}
      style={{ height }}
    >
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={viewport}
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
              setPopupInfo(marker);
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
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

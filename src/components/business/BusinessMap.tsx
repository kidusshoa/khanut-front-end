"use client";

import { useState } from "react";
import Map, { Marker } from "react-map-gl";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface BusinessMapProps {
  latitude: number;
  longitude: number;
  businessName: string;
}

export function BusinessMap({ latitude, longitude, businessName }: BusinessMapProps) {
  const [viewport, setViewport] = useState({
    latitude,
    longitude,
    zoom: 14,
  });

  return (
    <div className="h-[250px] w-full rounded-lg overflow-hidden">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={viewport}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <Marker
          latitude={latitude}
          longitude={longitude}
          anchor="bottom"
        >
          <MapPin className="w-6 h-6 text-red-500" />
        </Marker>
      </Map>
    </div>
  );
}

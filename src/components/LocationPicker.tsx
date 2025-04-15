"use client";

import { useState, useCallback } from "react";
import Map, { Marker, MapLayerMouseEvent } from "react-map-gl";
import { MapPin } from "lucide-react";
import { LocationSearch } from "./LocationSearch";
import "mapbox-gl/dist/mapbox-gl.css";

interface LocationPickerProps {
  onSelect: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export function LocationPicker({
  onSelect,
  initialLatitude = 8.9806,
  initialLongitude = 38.7578,
}: LocationPickerProps) {
  const [marker, setMarker] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });

  const [viewport, setViewport] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
    zoom: 12,
  });

  const handleClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const coords = event.lngLat;
      setMarker({
        latitude: coords.lat,
        longitude: coords.lng,
      });
      onSelect(coords.lat, coords.lng);
    },
    [onSelect]
  );

  const handleSearchSelect = (latitude: number, longitude: number) => {
    setMarker({ latitude, longitude });
    setViewport({
      latitude,
      longitude,
      zoom: 15,
    });
    onSelect(latitude, longitude);
  };

  return (
    <div className="space-y-4">
      <LocationSearch onSelectLocation={handleSearchSelect} />

      <div className="h-[400px] w-full rounded-lg overflow-hidden">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={viewport}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onClick={handleClick}
        >
          <Marker
            latitude={marker.latitude}
            longitude={marker.longitude}
            anchor="bottom"
          >
            <MapPin className="w-6 h-6 text-red-500" />
          </Marker>
        </Map>
      </div>

      <div className="text-sm text-gray-500">
        Selected coordinates: {marker.latitude.toFixed(6)},{" "}
        {marker.longitude.toFixed(6)}
      </div>
    </div>
  );
}

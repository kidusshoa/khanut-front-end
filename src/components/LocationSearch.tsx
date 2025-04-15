"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface LocationSearchProps {
  onSelectLocation: (latitude: number, longitude: number) => void;
}

export function LocationSearch({ onSelectLocation }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchLocation = async (query: string) => {
    if (!query) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }&country=ET&types=place,address`
      );
      const data = await response.json();
      setSuggestions(data.features);
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (feature: any) => {
    const [lng, lat] = feature.center;
    onSelectLocation(lat, lng);
    setSuggestions([]);
    setSearchQuery(feature.place_name);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchLocation(e.target.value);
          }}
          placeholder="Search for a location..."
          className="w-full px-4 py-2 pr-10 border rounded-md"
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          {suggestions.map((feature) => (
            <button
              key={feature.id}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => handleSelectLocation(feature)}
            >
              {feature.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

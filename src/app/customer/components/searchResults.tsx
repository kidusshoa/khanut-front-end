"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

interface SearchableItem {
  id: number;
  name: string;
  category: string;
  type: string;
  description: string;
  location?: string;
  rating?: number;
  image?: string;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState<SearchableItem[]>([]);

  useEffect(() => {
    const allData: SearchableItem[] = [
      {
        id: 1,
        name: "Delicious Eats",
        category: "Restaurant",
        type: "Business",
        description: "A top-rated restaurant with diverse cuisines.",
        location: "Haramaya, Ethiopia",
        rating: 4.5,
        image: "/restaurant.jpg",
      },
      {
        id: 2,
        name: "Tech Fix Center",
        category: "Electronics Repair",
        type: "Business",
        description: "Expert repairs for all electronic devices.",
        location: "Dire Dawa, Ethiopia",
        rating: 4.2,
        image: "/repair.jpg",
      },
      {
        id: 3,
        name: "Smartphone Screen Replacement",
        category: "Repair Service",
        type: "Service",
        description: "Quick and reliable screen replacement for smartphones.",
      },
      {
        id: 4,
        name: "Organic Honey",
        category: "Food Product",
        type: "Product",
        description: "Locally sourced organic honey with health benefits.",
      },
    ];

    const filteredResults = allData.filter((item) =>
      [item.name, item.category, item.type, item.description, item.location]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(query.toLowerCase()))
    );

    setResults(filteredResults);
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Search Results for "{query}"
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.length > 0 ? (
          results.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">
                  {item.category} - {item.type}
                </p>
                <p className="text-sm text-gray-500">{item.description}</p>
                {item.location && (
                  <p className="text-gray-600 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />{" "}
                    {item.location}
                  </p>
                )}
                {item.rating !== undefined && (
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={`mr-1 ${
                          index < Math.round(item.rating ?? 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-gray-600">({item.rating})</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No results found matching "{query}".</p>
        )}
      </div>
    </div>
  );
}

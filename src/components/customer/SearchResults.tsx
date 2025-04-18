"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

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

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "business":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "service":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "product":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h2>
      
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <Link href={`/item/${item.id}`} key={item.id} className="group">
              <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                {item.image ? (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${getTypeColor(item.type)}`}
                      variant="outline"
                    >
                      {item.type}
                    </Badge>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center relative">
                    <span className="text-muted-foreground">No image</span>
                    <Badge
                      className={`absolute top-2 right-2 ${getTypeColor(item.type)}`}
                      variant="outline"
                    >
                      {item.type}
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.category}
                  </p>
                  <p className="text-sm mt-2 line-clamp-2">
                    {item.description}
                  </p>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  {item.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {item.location}
                    </div>
                  )}
                  
                  {item.rating !== undefined && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 text-sm">{item.rating}</span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground">
            We couldn't find any matches for "{query}". Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}

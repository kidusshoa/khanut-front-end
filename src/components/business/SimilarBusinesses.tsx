"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { businessDetailApi } from "@/services/businessDetail";
import { toast } from "react-hot-toast";

interface SimilarBusinessesProps {
  businessId: string;
  category: string;
}

export function SimilarBusinesses({ businessId, category }: SimilarBusinessesProps) {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarBusinesses = async () => {
      try {
        setIsLoading(true);
        const data = await businessDetailApi.getSimilarBusinesses(businessId, category);
        setBusinesses(data.slice(0, 3)); // Limit to 3 similar businesses
      } catch (error) {
        console.error("Error fetching similar businesses:", error);
        // Don't show error toast as this is not critical
      } finally {
        setIsLoading(false);
      }
    };

    if (businessId && category) {
      fetchSimilarBusinesses();
    }
  }, [businessId, category]);

  if (isLoading || businesses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <div key={business._id} className="flex items-start space-x-3">
          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.name}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <Building className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{business.name}</h4>
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{business.city || "Location not specified"}</span>
            </div>
            
            {business.rating && (
              <div className="flex items-center mt-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs ml-1">{business.rating.toFixed(1)}</span>
              </div>
            )}
            
            <Button
              variant="link"
              className="p-0 h-auto text-orange-600 hover:text-orange-700 text-sm mt-1"
              onClick={() => router.push(`/businesses/${business._id}`)}
            >
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

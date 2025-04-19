"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Building,
  Star,
  Store,
  Utensils,
  Briefcase,
  Scissors,
  Home,
  Car,
  Laptop,
  Book,
  Shirt,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";

import { BusinessMap } from "@/components/business/BusinessMap";
import { toast } from "react-hot-toast";
import api from "@/services/api";

interface NearbyContentProps {
  customerId: string;
}

interface Business {
  _id: string;
  name: string;
  description: string;
  category?: string;
  city: string;
  location: {
    coordinates: [number, number];
  };
  profilePicture?: string;
  distance: number;
  rating?: number;
  reviewCount?: number;
}

export default function NearbyContent({ customerId }: NearbyContentProps) {
  const router = useRouter();
  const { data: session } = useSession(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [distance, setDistance] = useState<number>(5); // Default 5km radius
  const [category, setCategory] = useState<string>("all");
  const [isMapView, setIsMapView] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get user's location
  useEffect(() => {
    const getUserLocation = () => {
      setIsLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });

            // Get location name from coordinates
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=place`
              );
              const data = await response.json();
              if (data.features && data.features.length > 0) {
                setLocationName(data.features[0].place_name);
              }
            } catch (error) {
              console.error("Error fetching location name:", error);
            }

            setIsLoading(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            toast.success("Using default location: Addis Ababa, Ethiopia");
            // Set default location to Addis Ababa
            setUserLocation({ lat: 9.0222, lng: 38.7578 });
            setLocationName("Addis Ababa, Ethiopia");
            setIsLoading(false);
          }
        );
      } else {
        toast.success("Using default location: Addis Ababa, Ethiopia");
        // Set default location to Addis Ababa
        setUserLocation({ lat: 9.0222, lng: 38.7578 });
        setLocationName("Addis Ababa, Ethiopia");
        setIsLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Set map view as default on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsMapView(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // State for map search location
  const [mapSearchLocation, setMapSearchLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Fetch nearby businesses
  const {
    data: nearbyBusinesses,
    isLoading: isBusinessesLoading,
    error: queryError,
    refetch,
  } = useQuery<Business[]>({
    queryKey: [
      "nearbyBusinesses",
      userLocation,
      mapSearchLocation,
      distance,
      category,
    ],
    queryFn: async () => {
      // Use map search location if available, otherwise use user location
      const searchLocation = mapSearchLocation || userLocation;

      if (!searchLocation) {
        console.log("No location available, returning empty array");
        return [];
      }

      try {
        // Log API configuration
        console.log("API base URL:", process.env.NEXT_PUBLIC_API_URL);
        console.log("API instance baseURL:", api.defaults.baseURL);

        const params: any = {
          lat: searchLocation.lat,
          lng: searchLocation.lng,
          distance: distance * 1000, // Convert to meters
        };

        if (category !== "all") {
          params.category = category;
        }

        // For debugging - log the full URL being called
        const url = `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/businesses/nearby?lat=${params.lat}&lng=${params.lng}&distance=${
          params.distance
        }${params.category ? `&category=${params.category}` : ""}`;
        console.log("Calling API URL:", url);
        console.log("Request parameters:", params);

        // Make direct fetch call for debugging
        console.log("Attempting direct fetch call...");
        try {
          const directResponse = await fetch(url);
          const directData = await directResponse.json();
          console.log("Direct fetch response:", directData);
        } catch (directError) {
          console.error("Direct fetch error:", directError);
        }

        // Make sure we're using the correct endpoint path with axios
        console.log("Attempting axios call...");
        const response = await api.get("/businesses/nearby", { params });
        console.log("Nearby businesses API response:", response.data);

        // If we get here, the request was successful
        toast.success(`Found ${response.data.length} nearby businesses`);
        return response.data || [];
      } catch (error: any) {
        console.error("Error fetching nearby businesses:", error);

        // More detailed error handling
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);

          if (error.response.status === 404) {
            toast.error(
              "API endpoint not found. Please check server configuration."
            );
          } else {
            toast.error(
              `Failed to load nearby businesses: ${
                error.response.data?.message || error.response.statusText
              }`
            );
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Error request:", error.request);
          toast.error(
            "No response from server. Please check your internet connection."
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          toast.error(`Failed to load nearby businesses: ${error.message}`);
        }

        return [];
      }
    },
    enabled: !!userLocation,
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retrying
  });

  // Log query error if present
  useEffect(() => {
    if (queryError) {
      console.error("Query error:", queryError);
    }
  }, [queryError]);

  // No mock data - using real data from API only

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "restaurant":
        return <Utensils className="h-4 w-4" />;
      case "beauty":
        return <Scissors className="h-4 w-4" />;
      case "electronics":
        return <Laptop className="h-4 w-4" />;
      case "automotive":
        return <Car className="h-4 w-4" />;
      case "home":
        return <Home className="h-4 w-4" />;
      case "fashion":
        return <Shirt className="h-4 w-4" />;
      case "books":
        return <Book className="h-4 w-4" />;
      case "cafe":
        return <Coffee className="h-4 w-4" />;
      case "retail":
        return <Store className="h-4 w-4" />;
      case "professional":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Store className="h-4 w-4" />;
    }
  };

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Nearby Businesses
          </h1>
          <p className="text-muted-foreground">
            Discover businesses and services near you
          </p>
        </div>

        {/* Location and Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-600" />
            <span className="font-medium">
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : locationName ? (
                locationName
              ) : (
                "Location not available"
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Distance:</span>
              <Select
                value={distance.toString()}
                onValueChange={(value) => setDistance(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 km</SelectItem>
                  <SelectItem value="2">2 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="20">20 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Category:</span>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Restaurant">Restaurant</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Cafe">Cafe</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isMapView ? "outline" : "default"}
                size="sm"
                className={
                  !isMapView ? "bg-orange-600 hover:bg-orange-700" : ""
                }
                onClick={() => setIsMapView(false)}
              >
                <Building className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={isMapView ? "default" : "outline"}
                size="sm"
                className={isMapView ? "bg-orange-600 hover:bg-orange-700" : ""}
                onClick={() => setIsMapView(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
          </div>
        </div>

        {/* Maximize Map Button (visible on smaller screens) */}
        {!isMapView && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full md:hidden flex items-center justify-center gap-2 bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300"
            onClick={() => setIsMapView(true)}
          >
            <MapPin className="h-4 w-4" />
            <span>View Full Map</span>
          </Button>
        )}

        {/* Map View */}
        {isMapView && userLocation && (
          <div className="rounded-lg overflow-hidden border h-[700px] w-full relative">
            <BusinessMap
              latitude={(mapSearchLocation || userLocation).lat}
              longitude={(mapSearchLocation || userLocation).lng}
              businessName={
                mapSearchLocation ? "Search Location" : "Your Location"
              }
              zoom={12}
              height="700px"
              markers={
                nearbyBusinesses
                  ? nearbyBusinesses.map((business: Business) => ({
                      latitude: business.location.coordinates[1],
                      longitude: business.location.coordinates[0],
                      name: business.name,
                      id: business._id,
                      onClick: () => {
                        // Navigate to business profile page
                        router.push(
                          `/customer/${customerId}/businesses/${business._id}`
                        );
                      },
                    }))
                  : []
              }
              onViewportChange={(newViewport) => {
                // Store the current map center for potential search
                setMapSearchLocation({
                  lat: newViewport.latitude,
                  lng: newViewport.longitude,
                });
              }}
            />

            {/* Search at this location button */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <Button
                onClick={() => {
                  if (mapSearchLocation) {
                    // Update location name
                    fetch(
                      `https://api.mapbox.com/geocoding/v5/mapbox.places/${mapSearchLocation.lng},${mapSearchLocation.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=place`
                    )
                      .then((response) => response.json())
                      .then((data) => {
                        if (data.features && data.features.length > 0) {
                          setLocationName(data.features[0].place_name);
                        } else {
                          setLocationName(
                            `Location at ${mapSearchLocation.lat.toFixed(
                              4
                            )}, ${mapSearchLocation.lng.toFixed(4)}`
                          );
                        }
                      })
                      .catch((error) => {
                        console.error("Error fetching location name:", error);
                        setLocationName(
                          `Location at ${mapSearchLocation.lat.toFixed(
                            4
                          )}, ${mapSearchLocation.lng.toFixed(4)}`
                        );
                      });

                    // Refetch businesses at this location
                    refetch();
                    toast.success("Searching for businesses at this location");
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 shadow-lg"
              >
                Search This Area
              </Button>
            </div>
          </div>
        )}

        {/* List View */}
        {!isMapView && (
          <div className="space-y-6">
            {isBusinessesLoading || isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-lg border overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between pt-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : nearbyBusinesses && nearbyBusinesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyBusinesses
                  .filter(
                    (business: Business) =>
                      category === "all" ||
                      business.category?.toLowerCase() ===
                        category.toLowerCase()
                  )
                  .map((business: Business) => (
                    <div
                      key={business._id}
                      className="rounded-lg overflow-hidden border bg-card hover:shadow-md transition-all cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/customer/${customerId}/businesses/${business._id}`
                        )
                      }
                    >
                      <div className="aspect-video relative overflow-hidden">
                        {business.profilePicture ? (
                          <img
                            src={business.profilePicture}
                            alt={business.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Building className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                            {formatDistance(business.distance)}
                          </Badge>
                        </div>
                        {business.profilePicture && (
                          <div className="absolute -bottom-6 left-4 h-12 w-12 rounded-full border-2 border-background overflow-hidden bg-background">
                            <img
                              src={business.profilePicture}
                              alt={`${business.name} logo`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                      <div className="p-4 pt-8">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{business.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm ml-1">
                              {business.rating
                                ? business.rating.toFixed(1)
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        {business.category && (
                          <div className="flex items-center mt-2">
                            <Badge
                              variant="outline"
                              className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 flex items-center gap-1"
                            >
                              {getCategoryIcon(business.category)}
                              {business.category}
                            </Badge>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {business.description}
                        </p>
                        <div className="flex items-center mt-3 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{business.city}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">
                  No nearby businesses found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {category !== "all"
                    ? `No ${category} businesses found within ${distance}km of ${
                        mapSearchLocation ? "this" : "your"
                      } location.`
                    : `No businesses found within ${distance}km of ${
                        mapSearchLocation ? "this" : "your"
                      } location.`}
                </p>
                <Button
                  onClick={() => {
                    setDistance(Math.min(distance * 2, 20));
                    if (category !== "all") {
                      setCategory("all");
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Expand Search Area
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}

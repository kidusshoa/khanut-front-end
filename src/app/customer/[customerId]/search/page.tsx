"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Filter, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BusinessCard } from "@/components/business/BusinessCard";
import { ServiceCard } from "@/components/business/ServiceCard";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import SearchHistory from "@/components/customer/SearchHistory";
import AdvancedSearchFilters, {
  SearchFilters,
} from "@/components/customer/AdvancedSearchFilters";
import { searchApi } from "@/services/search";

import { SearchResultsSkeleton } from "@/components/search/SearchResultsSkeleton";

export default function CustomerSearchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = params.customerId as string;

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Advanced search filters
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    category: initialCategory || undefined,
    serviceTypes: [],
    minRating: undefined,
    maxRating: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: undefined,
    order: "desc",
  });

  const [categories, setCategories] = useState<string[]>([]);

  // Define service type
  interface Service {
    _id: string;
    name: string;
    description: string;
    price: number;
    serviceType: "appointment" | "product" | "in_person";
    images: string[];
    duration?: number;
    inventory?: number;
    businessId?: string;
    businessName?: string;
  }

  // Define business type
  interface Business {
    _id: string;
    name: string;
    description: string;
    logo?: string;
    coverImage?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    city?: string;
    category?: string;
    rating?: number;
    reviewCount?: number;
    serviceTypes?: string[];
    categories?: string[];
  }

  // Define search results type
  interface SearchResults {
    businesses: Business[];
    services: Service[];
    totalBusinesses: number;
    totalServices: number;
    query: string;
  }

  // Fetch search results
  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useQuery<SearchResults>({
    queryKey: ["search", searchQuery, searchFilters],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return {
          businesses: [],
          services: [],
          totalBusinesses: 0,
          totalServices: 0,
          query: searchQuery,
        } as SearchResults;
      }

      // Use the advanced search API with all filters
      const result = await searchApi.searchAll({
        query: searchQuery,
        ...searchFilters,
      });

      // Extract unique categories from search results
      if (result?.businesses?.length > 0) {
        const uniqueCategories = Array.from(
          new Set(
            result.businesses
              .map((business: any) => business.category)
              .filter(Boolean)
          )
        ) as string[];
        setCategories(uniqueCategories);
      }

      return result as SearchResults;
    },
    enabled: !!searchQuery.trim(),
  });

  // Update URL when search query or filters change
  useEffect(() => {
    if (searchQuery) {
      const queryParams = new URLSearchParams();
      queryParams.set("q", searchQuery);

      // Add filters to URL
      if (searchFilters.category) {
        queryParams.set("category", searchFilters.category);
      }

      // Add other filters as needed
      // This keeps the URL clean with just the essential parameters

      router.push(`/customer/${customerId}/search?${queryParams.toString()}`);
    }
  }, [searchQuery, searchFilters.category, router, customerId]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    refetch();
  };

  // Function to handle direct business navigation
  const handleBusinessClick = (businessId: string) => {
    // Include search query and fromSearch flag in the URL
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set("q", searchQuery);
    queryParams.set("fromSearch", "true");

    const queryString = queryParams.toString();
    router.push(
      `/customer/${customerId}/search/${businessId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for businesses or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Advanced Search Filters */}
          <AdvancedSearchFilters
            filters={searchFilters}
            categories={categories}
            onFilterChange={(newFilters) => {
              setSearchFilters(newFilters);
              refetch();
            }}
            onClearFilters={() => {
              setSearchFilters({
                category: undefined,
                serviceTypes: [],
                minRating: undefined,
                maxRating: undefined,
                minPrice: undefined,
                maxPrice: undefined,
                sortBy: undefined,
                order: "desc",
              });
              refetch();
            }}
          />

          {/* Search History */}
          <SearchHistory
            customerId={customerId}
            currentQuery={searchQuery}
            onSelectQuery={(query) => {
              setSearchQuery(query);
              // Trigger search with the selected query
              const queryParams = new URLSearchParams();
              queryParams.set("q", query);
              if (searchFilters.category) {
                queryParams.set("category", searchFilters.category);
              }
              router.push(
                `/customer/${customerId}/search?${queryParams.toString()}`
              );
            }}
          />
        </form>
      </div>

      {isLoading ? (
        <SearchResultsSkeleton />
      ) : searchQuery && searchResults ? (
        <div>
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="businesses">Businesses</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {searchResults.businesses?.length > 0 ||
              searchResults.services?.length > 0 ? (
                <>
                  {searchResults.businesses?.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Businesses</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.businesses.map((business: Business) => (
                          <div
                            key={business._id}
                            onClick={() => handleBusinessClick(business._id)}
                            className="cursor-pointer"
                          >
                            <BusinessCard
                              key={`card-${business._id}`}
                              business={{
                                ...business,
                                name: business.name || "Unnamed Business",
                                description:
                                  business.description ||
                                  "No description available",
                                category: business.category,
                                city: business.city,
                                customerId: customerId,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.services?.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Services</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.services.map((service: Service) => (
                          <ServiceCard
                            key={service._id}
                            service={{
                              _id: service._id,
                              name: service.name || "Unnamed Service",
                              description:
                                service.description ||
                                "No description available",
                              price: service.price || 0,
                              serviceType: service.serviceType || "product",
                              images: service.images || [],
                              customerId: customerId,
                              businessId: service.businessId || "",
                              businessName: service.businessName || "Business",
                            }}
                            onDelete={() => {}}
                            onEdit={() => {}}
                            showActions={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No results found for "{searchQuery}"
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="businesses">
              {searchResults.businesses?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.businesses.map((business: Business) => (
                    <div
                      key={business._id}
                      onClick={() => handleBusinessClick(business._id)}
                      className="cursor-pointer"
                    >
                      <BusinessCard
                        key={`card-${business._id}`}
                        business={{
                          _id: business._id,
                          name: business.name || "Unnamed Business",
                          description:
                            business.description || "No description available",
                          logo: business.logo,
                          coverImage: business.coverImage,
                          address: business.address,
                          city: business.city,
                          category: business.category,
                          rating: business.rating,
                          reviewCount: business.reviewCount,
                          serviceTypes: business.serviceTypes,
                          categories: business.categories,
                          customerId: customerId, // Pass customer ID to the business card
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No businesses found for "{searchQuery}"
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="services">
              {searchResults.services?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.services.map((service: Service) => (
                    <ServiceCard
                      key={service._id}
                      service={{
                        _id: service._id,
                        name: service.name || "Unnamed Service",
                        description:
                          service.description || "No description available",
                        price: service.price || 0,
                        serviceType: service.serviceType || "product",
                        images: service.images || [],
                        duration: service.duration,
                        inventory: service.inventory,
                        customerId: customerId, // Pass customer ID to the service card
                        businessId: service.businessId || "",
                        businessName: service.businessName || "Business",
                      }}
                      onDelete={() => {}}
                      onEdit={() => {}}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No services found for "{searchQuery}"
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Enter a search term to find businesses and services
          </p>
        </div>
      )}
    </CustomerDashboardLayout>
  );
}

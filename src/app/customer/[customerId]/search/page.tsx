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
import { searchApi } from "@/services/search";
import { LoadingState } from "@/components/ui/loading-state";

export default function CustomerSearchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = params.customerId as string;

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch search results
  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { businesses: [], services: [] };
      // Update the searchApi call to include category if it exists
      const result = await searchApi.searchAll({ query: searchQuery });

      // Client-side filtering by category if needed
      if (selectedCategory && result.businesses) {
        result.businesses = result.businesses.filter(
          (b) => b.category === selectedCategory
        );
      }

      // Extract unique categories from search results
      if (result?.businesses?.length > 0) {
        const uniqueCategories = Array.from(
          new Set(
            result.businesses
              .map((business) => business.category)
              .filter(Boolean)
          )
        ) as string[];
        setCategories(uniqueCategories);
      }

      return result;
    },
    enabled: !!searchQuery.trim(),
  });

  // Update URL when search query or category changes
  useEffect(() => {
    if (searchQuery) {
      const queryParams = new URLSearchParams();
      queryParams.set("q", searchQuery);
      if (selectedCategory) {
        queryParams.set("category", selectedCategory);
      }
      router.push(`/customer/${customerId}/search?${queryParams.toString()}`);
    }
  }, [searchQuery, selectedCategory, router, customerId]);

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

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Filter className="h-4 w-4 mr-1" />
                <span>Filter by category:</span>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCategory && (
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {selectedCategory}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-purple-200 dark:hover:bg-purple-900/30"
                    onClick={() => setSelectedCategory("")}
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          )}

          {/* Search History */}
          <SearchHistory
            customerId={customerId}
            currentQuery={searchQuery}
            onSelectQuery={(query) => {
              setSearchQuery(query);
              // Trigger search with the selected query
              const queryParams = new URLSearchParams();
              queryParams.set("q", query);
              if (selectedCategory) {
                queryParams.set("category", selectedCategory);
              }
              router.push(
                `/customer/${customerId}/search?${queryParams.toString()}`
              );
            }}
          />
        </form>
      </div>

      {isLoading ? (
        <LoadingState message="Searching..." size="md" />
      ) : searchQuery && searchResults ? (
        <div>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
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
                        {searchResults.businesses.map((business) => (
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
                        {searchResults.services.map((service) => (
                          <ServiceCard
                            key={service._id}
                            service={{
                              ...service,
                              name: service.name || "Unnamed Service",
                              description:
                                service.description ||
                                "No description available",
                              price: service.price || 0,
                              serviceType: service.serviceType || "product",
                              images: service.images || [],
                              customerId: customerId,
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
                  {searchResults.businesses.map((business) => (
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
                  {searchResults.services.map((service) => (
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

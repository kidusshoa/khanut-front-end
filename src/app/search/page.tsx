"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Calendar,
  ShoppingBag,
  MapPin,
  Star,
  Loader2,
  X,
  Building,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCard } from "@/components/business/ServiceCard";
import { BusinessCard } from "@/components/business/BusinessCard";
import { serviceApi } from "@/services/service";
import { searchApi } from "@/services/search";
import { toast } from "react-hot-toast";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("query") || "";
  const initialType = searchParams.get("type") || "all";
  const initialSearchType = searchParams.get("searchType") || "all";

  // Check if we have a customer ID in the session
  // This is a fallback in case the middleware doesn't handle the redirect
  useEffect(() => {
    // This is a simplified example - you would need to implement proper session handling
    const checkCustomerSession = async () => {
      try {
        // You would typically get this from your auth provider
        const session = await fetch("/api/auth/session").then((res) =>
          res.json()
        );

        if (session?.user?.customerId) {
          // Redirect to customer-specific search
          router.replace(
            `/customer/${session.user.customerId}/search${
              initialQuery ? `?q=${encodeURIComponent(initialQuery)}` : ""
            }`
          );
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkCustomerSession();
  }, [router, initialQuery]);

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<
    "all" | "businesses" | "services"
  >(initialSearchType as any);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: initialType,
    priceRange: [0, 10000],
    rating: 0,
    sortBy: "relevance",
  });

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setBusinesses([]);
        setServices([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Prepare filter parameters
        const filterParams: Record<string, any> = {};

        if (filters.type !== "all") {
          filterParams.serviceType = filters.type;
        }

        if (filters.rating > 0) {
          filterParams.minRating = filters.rating;
        }

        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
          filterParams.minPrice = filters.priceRange[0];
          filterParams.maxPrice = filters.priceRange[1];
        }

        // Determine sort parameters
        let sort, order;
        switch (filters.sortBy) {
          case "price_low":
            sort = "price";
            order = "asc";
            break;
          case "price_high":
            sort = "price";
            order = "desc";
            break;
          case "rating":
            sort = "rating";
            order = "desc";
            break;
          case "newest":
            sort = "createdAt";
            order = "desc";
            break;
          default:
            // Default relevance sorting
            break;
        }

        // Call the search API
        const searchResults = await searchApi.searchAll({
          query,
          filters: filterParams,
          sort,
          order,
        });

        setBusinesses(searchResults.businesses || []);
        setServices(searchResults.services || []);
      } catch (error) {
        console.error("Error performing search:", error);
        toast.error("Failed to perform search");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, filters, initialQuery, initialType]);

  // We don't need the applyFilters function anymore as filtering is done on the server

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Update URL with search parameters
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.type !== "all") params.set("type", filters.type);
    if (searchType !== "all") params.set("searchType", searchType);

    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterApply = () => {
    // Update URL with filter parameters
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.type !== "all") params.set("type", filters.type);
    if (searchType !== "all") params.set("searchType", searchType);

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      priceRange: [0, 10000],
      rating: 0,
      sortBy: "relevance",
    });

    // Update URL
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (searchType !== "all") params.set("searchType", searchType);

    router.push(`/search?${params.toString()}`);
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "product":
        return <ShoppingBag className="h-4 w-4" />;
      case "in_person":
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search</h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for businesses and services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
            Search
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              <div className="py-4 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Service Type</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="type-all"
                        checked={filters.type === "all"}
                        onCheckedChange={() =>
                          handleFilterChange("type", "all")
                        }
                      />
                      <Label htmlFor="type-all" className="ml-2">
                        All Types
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="type-appointment"
                        checked={filters.type === "appointment"}
                        onCheckedChange={() =>
                          handleFilterChange("type", "appointment")
                        }
                      />
                      <Label
                        htmlFor="type-appointment"
                        className="ml-2 flex items-center"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Appointments
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="type-product"
                        checked={filters.type === "product"}
                        onCheckedChange={() =>
                          handleFilterChange("type", "product")
                        }
                      />
                      <Label
                        htmlFor="type-product"
                        className="ml-2 flex items-center"
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Products
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="type-in-person"
                        checked={filters.type === "in_person"}
                        onCheckedChange={() =>
                          handleFilterChange("type", "in_person")
                        }
                      />
                      <Label
                        htmlFor="type-in-person"
                        className="ml-2 flex items-center"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        In-Person Services
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Price Range</h3>
                  <div className="space-y-4">
                    <Slider
                      value={filters.priceRange}
                      min={0}
                      max={10000}
                      step={100}
                      onValueChange={(value) =>
                        handleFilterChange("priceRange", value)
                      }
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatPrice(filters.priceRange[0])}</span>
                      <span>{formatPrice(filters.priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Minimum Rating</h3>
                  <div className="flex items-center space-x-2">
                    {[0, 1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={
                          filters.rating === rating ? "default" : "outline"
                        }
                        size="sm"
                        className={
                          filters.rating === rating ? "bg-orange-600" : ""
                        }
                        onClick={() => handleFilterChange("rating", rating)}
                      >
                        {rating === 0 ? (
                          "Any"
                        ) : (
                          <div className="flex items-center">
                            {rating}
                            <Star className="h-3 w-3 ml-1" />
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Sort By</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="sort-relevance"
                        checked={filters.sortBy === "relevance"}
                        onCheckedChange={() =>
                          handleFilterChange("sortBy", "relevance")
                        }
                      />
                      <Label htmlFor="sort-relevance" className="ml-2">
                        Relevance
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="sort-price-low"
                        checked={filters.sortBy === "price_low"}
                        onCheckedChange={() =>
                          handleFilterChange("sortBy", "price_low")
                        }
                      />
                      <Label htmlFor="sort-price-low" className="ml-2">
                        Price: Low to High
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="sort-price-high"
                        checked={filters.sortBy === "price_high"}
                        onCheckedChange={() =>
                          handleFilterChange("sortBy", "price_high")
                        }
                      />
                      <Label htmlFor="sort-price-high" className="ml-2">
                        Price: High to Low
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="sort-rating"
                        checked={filters.sortBy === "rating"}
                        onCheckedChange={() =>
                          handleFilterChange("sortBy", "rating")
                        }
                      />
                      <Label htmlFor="sort-rating" className="ml-2">
                        Highest Rated
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="sort-newest"
                        checked={filters.sortBy === "newest"}
                        onCheckedChange={() =>
                          handleFilterChange("sortBy", "newest")
                        }
                      />
                      <Label htmlFor="sort-newest" className="ml-2">
                        Newest
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    onClick={handleFilterApply}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </form>
      </div>

      {/* Active filters */}
      {(filters.type !== "all" ||
        filters.rating > 0 ||
        filters.sortBy !== "relevance" ||
        filters.priceRange[0] > 0 ||
        filters.priceRange[1] < 10000) && (
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="text-sm text-gray-500 mr-2 flex items-center">
            Active Filters:
          </div>

          {filters.type !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              {getServiceTypeIcon(filters.type)}
              {filters.type === "appointment" && "Appointments"}
              {filters.type === "product" && "Products"}
              {filters.type === "in_person" && "In-Person"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  handleFilterChange("type", "all");
                  handleFilterApply();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
            <Badge variant="outline" className="flex items-center gap-1">
              {formatPrice(filters.priceRange[0])} -{" "}
              {formatPrice(filters.priceRange[1])}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  handleFilterChange("priceRange", [0, 10000]);
                  handleFilterApply();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.rating > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              {filters.rating}+ <Star className="h-3 w-3 ml-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  handleFilterChange("rating", 0);
                  handleFilterApply();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.sortBy !== "relevance" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Sort:{" "}
              {filters.sortBy
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  handleFilterChange("sortBy", "relevance");
                  handleFilterApply();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={clearFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Search Type Tabs */}
      <Tabs
        defaultValue={searchType}
        value={searchType}
        onValueChange={(value) =>
          setSearchType(value as "all" | "businesses" | "services")
        }
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Grid className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
          <TabsTrigger value="businesses" className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>Businesses</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Services</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : ((searchType === "all" || searchType === "businesses") &&
          businesses.length > 0) ||
        ((searchType === "all" || searchType === "services") &&
          services.length > 0) ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {searchType === "all"
              ? businesses.length + services.length
              : searchType === "businesses"
              ? businesses.length
              : services.length}
            {(searchType === "all"
              ? businesses.length + services.length
              : searchType === "businesses"
              ? businesses.length
              : services.length) === 1
              ? "result"
              : "results"}{" "}
            found
            {query ? ` for "${query}"` : ""}
          </p>

          {/* Businesses Results */}
          {(searchType === "all" || searchType === "businesses") &&
            businesses.length > 0 && (
              <div className="mb-8">
                {searchType === "all" && (
                  <h2 className="text-xl font-semibold mb-4">Businesses</h2>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((business) => (
                    <BusinessCard key={business._id} business={business} />
                  ))}
                </div>
              </div>
            )}

          {/* Services Results */}
          {(searchType === "all" || searchType === "services") &&
            services.length > 0 && (
              <div>
                {searchType === "all" && (
                  <h2 className="text-xl font-semibold mb-4">Services</h2>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      onDelete={() => {}}
                      onEdit={() => {}}
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-500 mb-6">
            {query
              ? `No ${
                  searchType === "businesses"
                    ? "businesses"
                    : searchType === "services"
                    ? "services"
                    : "results"
                } matching "${query}" with the selected filters.`
              : `No ${
                  searchType === "businesses"
                    ? "businesses"
                    : searchType === "services"
                    ? "services"
                    : "results"
                } match the selected filters.`}
          </p>
          <Button
            onClick={clearFilters}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

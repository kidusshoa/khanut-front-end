"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ShoppingBag,
  MapPin,
  Search,
  Filter,
  Star,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { ServiceCard } from "@/components/business/ServiceCard";
import { serviceApi } from "@/services/service";
import { toast } from "react-hot-toast";

interface ServicesContentProps {
  customerId: string;
}

export default function ServicesContent({ customerId }: ServicesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  
  const [activeTab, setActiveTab] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Fetch services
  const {
    data: services = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["customerServices", activeTab, priceRange, sortBy, selectedRating],
    queryFn: async () => {
      const params: any = {
        limit: 100,
      };

      if (activeTab !== "all") {
        params.serviceType = activeTab;
      }

      if (priceRange[0] > 0 || priceRange[1] < 5000) {
        params.minPrice = priceRange[0];
        params.maxPrice = priceRange[1];
      }

      if (selectedRating) {
        params.minRating = selectedRating;
      }

      switch (sortBy) {
        case "price_low":
          params.sort = "price";
          params.order = "asc";
          break;
        case "price_high":
          params.sort = "price";
          params.order = "desc";
          break;
        case "rating":
          params.sort = "rating";
          params.order = "desc";
          break;
        case "newest":
        default:
          params.sort = "createdAt";
          params.order = "desc";
          break;
      }

      return serviceApi.getAllServices(params);
    },
  });

  // Filter services by search query
  const filteredServices = services.filter((service: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.businessName?.toLowerCase().includes(query)
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled client-side, so no need to do anything here
  };

  const clearFilters = () => {
    setPriceRange([0, 5000]);
    setSortBy("newest");
    setSelectedRating(null);
    setSearchQuery("");
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4 mr-1" />;
      case "product":
        return <ShoppingBag className="h-4 w-4 mr-1" />;
      case "in_person":
        return <MapPin className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Browse and book services from local businesses
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form
            onSubmit={handleSearch}
            className="relative flex-grow"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>

          <div className="flex gap-2">
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Services</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Service Type</h3>
                    <Tabs
                      defaultValue={activeTab}
                      value={activeTab}
                      onValueChange={(value) => {
                        setActiveTab(value);
                        // Update URL
                        const params = new URLSearchParams(searchParams.toString());
                        if (value !== "all") {
                          params.set("type", value);
                        } else {
                          params.delete("type");
                        }
                        router.push(`/customer/${customerId}/services?${params.toString()}`);
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-2 mb-2">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="appointment">Appointments</TabsTrigger>
                      </TabsList>
                      <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="product">Products</TabsTrigger>
                        <TabsTrigger value="in_person">In-Person</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Price Range</h3>
                    <div className="px-2">
                      <Slider
                        defaultValue={priceRange}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={5000}
                        step={100}
                        className="mb-6"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(priceRange[0])}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(priceRange[1])}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Rating</h3>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                          <Checkbox
                            id={`rating-${rating}`}
                            checked={selectedRating === rating}
                            onCheckedChange={(checked) => {
                              setSelectedRating(checked ? rating : null);
                            }}
                          />
                          <Label htmlFor={`rating-${rating}`} className="flex items-center">
                            {Array.from({ length: rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 text-yellow-500 fill-yellow-500"
                              />
                            ))}
                            {Array.from({ length: 5 - rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 text-muted-foreground"
                              />
                            ))}
                            <span className="ml-1">& Up</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Sort By</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sort-newest"
                          checked={sortBy === "newest"}
                          onCheckedChange={(checked) => {
                            if (checked) setSortBy("newest");
                          }}
                        />
                        <Label htmlFor="sort-newest">Newest</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sort-price-low"
                          checked={sortBy === "price_low"}
                          onCheckedChange={(checked) => {
                            if (checked) setSortBy("price_low");
                          }}
                        />
                        <Label htmlFor="sort-price-low">Price: Low to High</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sort-price-high"
                          checked={sortBy === "price_high"}
                          onCheckedChange={(checked) => {
                            if (checked) setSortBy("price_high");
                          }}
                        />
                        <Label htmlFor="sort-price-high">Price: High to Low</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sort-rating"
                          checked={sortBy === "rating"}
                          onCheckedChange={(checked) => {
                            if (checked) setSortBy("rating");
                          }}
                        />
                        <Label htmlFor="sort-rating">Highest Rated</Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      clearFilters();
                      setIsFilterSheetOpen(false);
                    }}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Clear Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {(priceRange[0] > 0 || priceRange[1] < 5000 || selectedRating || sortBy !== "newest") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                className="px-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear filters</span>
              </Button>
            )}
          </div>
        </div>

        {/* Service Type Tabs */}
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            // Update URL
            const params = new URLSearchParams(searchParams.toString());
            if (value !== "all") {
              params.set("type", value);
            } else {
              params.delete("type");
            }
            router.push(`/customer/${customerId}/services?${params.toString()}`);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="appointment" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="product" className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="in_person" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>In-Person</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredServices.map((service: any) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    showActions={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                {getServiceTypeIcon(activeTab)}
                <h3 className="text-lg font-medium mb-1">No services found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? `No services matching "${searchQuery}" with the selected filters.`
                    : `No ${
                        activeTab === "all" ? "" : activeTab + " "
                      }services found with the selected filters.`}
                </p>
                <Button onClick={clearFilters} className="bg-orange-600 hover:bg-orange-700">
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CustomerDashboardLayout>
  );
}

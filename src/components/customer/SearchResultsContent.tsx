"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { ServiceCard } from "@/components/business/ServiceCard";
import { BusinessCard } from "@/components/business/BusinessCard";
import { searchApi } from "@/services/search";
import { toast } from "react-hot-toast";

interface SearchResultsContentProps {
  customerId: string;
}

export default function SearchResultsContent({ customerId }: SearchResultsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialSearchType = searchParams.get("searchType") || "all";
  
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<"all" | "businesses" | "services">(initialSearchType as any);
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setBusinesses([]);
        setServices([]);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Call the search API
        const searchResults = await searchApi.searchAll({
          query,
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
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (searchType !== "all") params.set("searchType", searchType);
    
    router.push(`/customer/${customerId}/search-results?${params.toString()}`);
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
          <p className="text-muted-foreground">
            {query ? `Results for "${query}"` : "Search for businesses and services"}
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
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
        </form>

        {/* Search Type Tabs */}
        <Tabs 
          defaultValue={searchType} 
          value={searchType} 
          onValueChange={(value) => setSearchType(value as "all" | "businesses" | "services")}
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
        
        {/* Search Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (searchType === "all" || searchType === "businesses") && businesses.length > 0 || 
           (searchType === "all" || searchType === "services") && services.length > 0 ? (
          <div>
            {/* Businesses Results */}
            {(searchType === "all" || searchType === "businesses") && businesses.length > 0 && (
              <div className="mb-8">
                {searchType === "all" && <h2 className="text-xl font-semibold mb-4">Businesses</h2>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((business) => (
                    <BusinessCard key={business._id} business={business} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Services Results */}
            {(searchType === "all" || searchType === "services") && services.length > 0 && (
              <div>
                {searchType === "all" && <h2 className="text-xl font-semibold mb-4">Services</h2>}
                
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
        ) : query ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">No results found</h3>
            <p className="text-muted-foreground mb-6">
              No {searchType === "businesses" ? "businesses" : searchType === "services" ? "services" : "results"} matching "{query}".
            </p>
            <Button
              onClick={() => router.push(`/customer/${customerId}/services`)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">Search for something</h3>
            <p className="text-muted-foreground mb-6">
              Enter a search term to find businesses and services.
            </p>
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}

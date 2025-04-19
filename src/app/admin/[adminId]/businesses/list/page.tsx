"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Business {
  _id: string;
  name: string;
  ownerId: string;
  status?: string;
  approved: boolean;
  city: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  services: any[];
  reviews: any[];
  createdAt: string;
  updatedAt: string;
  legalDoc: string;
}

interface ApiResponse {
  businesses: Business[];
  pagination: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export default function BusinessListPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const accessToken = Cookies.get("client-token");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/businesses/list`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data.businesses)) {
        setBusinesses(response.data.businesses);
      } else {
        setError("Invalid businesses data format");
        setBusinesses([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load businesses");

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Cookies.remove("client-token");
        Cookies.remove("user-role");
        router.push("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // Filter businesses based on search term and active tab
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "approved") return matchesSearch && business.approved;
    if (activeTab === "pending") return matchesSearch && !business.approved;

    return matchesSearch;
  });

  // Render loading skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="gap-2" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Business Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all businesses on the platform.
          </p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          className="gap-2"
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            placeholder="Search businesses..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <Building2 className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <XCircle className="h-4 w-4" />
              Pending
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Business cards */}
      {filteredBusinesses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">
              No businesses found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business, index) => (
            <motion.div
              key={business._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <Badge variant={business.approved ? "default" : "outline"}>
                      {business.approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {business.city || "Location not specified"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3 mb-4">
                    {business.description || "No description available"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {business.services && business.services.length > 0 ? (
                      business.services.slice(0, 3).map((service, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {service.name || "Service"}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        No services
                      </Badge>
                    )}
                    {business.services && business.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{business.services.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-xs text-muted-foreground">
                    Added: {new Date(business.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {business.legalDoc && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        asChild
                      >
                        <a
                          href={business.legalDoc}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Document</span>
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Details</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card className="bg-orange-50 border-orange-100">
        <CardContent className="flex flex-col md:flex-row justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            <span className="font-medium">
              Total: {businesses.length} businesses
            </span>
            <span className="text-sm text-muted-foreground">
              ({businesses.filter((b) => b.approved).length} approved,{" "}
              {businesses.filter((b) => !b.approved).length} pending)
            </span>
          </div>
          <Button variant="outline" size="sm" className="gap-1 mt-2 md:mt-0">
            <Download className="h-4 w-4" />
            <span>Export List</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

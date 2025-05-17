"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Layers, ArrowLeft, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceCard } from "@/components/business/ServiceCard";
import { categoryApi } from "@/services/category";
import { toast } from "react-hot-toast";

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;
  const [category, setCategory] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceType, setServiceType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch category details
        const categoryData = await categoryApi.getCategoryById(categoryId);
        setCategory(categoryData);

        // Fetch services in this category
        const servicesData = await categoryApi.getServicesByCategory(
          categoryId
        );
        setServices(servicesData);
        setFilteredServices(servicesData);
      } catch (error) {
        console.error("Error fetching category details:", error);
        toast.error("Failed to load category details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [categoryId]);

  useEffect(() => {
    // Apply filters when services, serviceType, or sortBy changes
    let filtered = [...services];

    // Filter by service type
    if (serviceType !== "all") {
      filtered = filtered.filter(
        (service) => service.serviceType === serviceType
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        // Default to newest
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    setFilteredServices(filtered);
  }, [services, serviceType, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Category not found
        </h1>
        <p className="text-gray-600 mb-6">
          The category you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/categories")}>
          Browse Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/categories")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Categories
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg mr-4">
            {category.icon ? (
              <span className="text-2xl">{category.icon}</span>
            ) : (
              <Layers className="h-6 w-6 text-orange-600" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 mt-1">{category.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-500 mr-2">Type:</span>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredServices.length > 0 ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {filteredServices.length}{" "}
            {filteredServices.length === 1 ? "service" : "services"} found
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
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
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-500 mb-6">
            {serviceType === "all"
              ? "There are no services in this category yet."
              : `There are no ${serviceType} services in this category.`}
          </p>
          {serviceType !== "all" && (
            <Button
              onClick={() => setServiceType("all")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Show All Services
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

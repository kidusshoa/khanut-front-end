"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Clock,
  Calendar,
  ShoppingBag,
  Tag,
  Store,
  Utensils,
  Briefcase,
  ShoppingCart,
  Scissors,
  Home,
  Car,
  Laptop,
  Book,
  Heart,
  Shirt,
  Coffee,
  LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BusinessCardProps {
  business: {
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
    rating?: number;
    reviewCount?: number;
    serviceTypes?: string[];
    categories?: string[];
    category?: string;
    customerId?: string;
  };
}

export function BusinessCard({ business }: BusinessCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatAddress = (address: any) => {
    if (!address) return "Location not specified";

    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
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
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  // Helper function to get an icon based on business category
  const getCategoryIcon = (category: string) => {
    const categoryMap: Record<string, LucideIcon> = {
      Restaurant: Utensils,
      Cafe: Coffee,
      Retail: Store,
      Electronics: Laptop,
      Clothing: Shirt,
      Books: Book,
      Automotive: Car,
      Health: Heart,
      Beauty: Scissors,
      Home: Home,
      Professional: Briefcase,
      Shopping: ShoppingCart,
    };

    // Default icon if category doesn't match
    const Icon = categoryMap[category] || Tag;
    return <Icon className="h-3.5 w-3.5" />;
  };

  return (
    <Link
      href={
        business.customerId
          ? `/customer/${business.customerId}/businesses/${business._id}`
          : `/businesses/${business._id}`
      }
      className="group"
    >
      <div className="rounded-lg overflow-hidden border border-border bg-card transition-all hover:shadow-md h-full flex flex-col">
        <div className="aspect-video relative overflow-hidden">
          {business.coverImage && !imageError ? (
            <img
              src={business.coverImage}
              alt={business.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {business.name.charAt(0)}
              </div>
            </div>
          )}

          {business.logo && (
            <div className="absolute bottom-3 left-3 h-12 w-12 rounded-full border-2 border-white overflow-hidden bg-white">
              <img
                src={business.logo}
                alt={`${business.name} logo`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = "";
                  e.currentTarget.className = "hidden";
                }}
              />
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg line-clamp-1 group-hover:text-orange-600 transition-colors">
              {business.name}
            </h3>
            {business.rating !== undefined && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="text-sm">{business.rating.toFixed(1)}</span>
                {business.reviewCount && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({business.reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {business.category && (
            <div className="mb-2">
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 flex items-center gap-1 px-2 py-1"
              >
                {getCategoryIcon(business.category)}
                {business.category}
              </Badge>
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {business.description}
          </p>

          {business.address && (
            <div className="flex items-start mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 mr-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground line-clamp-1">
                {formatAddress(business.address)}
              </span>
            </div>
          )}

          {!business.address && business.city && (
            <div className="flex items-start mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 mr-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground line-clamp-1">
                {business.city}
              </span>
            </div>
          )}

          <div className="mt-auto">
            {business.serviceTypes && business.serviceTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {business.serviceTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className={cn(
                      type === "appointment" &&
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
                      type === "product" &&
                        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
                      type === "in_person" &&
                        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    )}
                  >
                    <div className="flex items-center">
                      {getServiceTypeIcon(type)}
                      {type === "appointment" && "Appointments"}
                      {type === "product" && "Products"}
                      {type === "in_person" && "In-Person"}
                    </div>
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Link
                href={
                  business.customerId
                    ? `/customer/${business.customerId}/businesses/${business._id}`
                    : `/businesses/${business._id}`
                }
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full bg-orange-600 hover:bg-orange-700"
                )}
              >
                View Business
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

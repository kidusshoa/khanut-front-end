import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Calendar,
  ShoppingBag,
  MapPin,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ServiceActions } from "./ServiceActions";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface ServiceCardProps {
  service: {
    _id: string;
    name: string;
    description: string;
    price: number;
    serviceType: "appointment" | "product" | "in_person";
    images: string[];
    duration?: number;
    inventory?: number;
    customerId?: string;
    businessId: string;
    businessName?: string;
    availability?: {
      days: string[];
      startTime: string;
      endTime: string;
    };
  };
  onDelete: () => void;
  onEdit: () => void;
  showActions?: boolean;
}

export function ServiceCard({
  service,
  onDelete,
  onEdit,
  showActions = true,
}: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      toast.success(`Added ${service.name} to favorites`);
    } else {
      toast.success(`Removed ${service.name} from favorites`);
    }
    // TODO: Implement API call to save favorite status
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

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case "appointment":
        return "Appointment";
      case "product":
        return "Product";
      case "in_person":
        return "In-Person";
      default:
        return type;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {service.images && service.images.length > 0 ? (
          <div className="h-full w-full relative">
            <img
              src={service.images[0]}
              alt={service.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-product.jpg";
              }}
            />
          </div>
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-orange-600">
            <div className="flex items-center">
              {getServiceTypeIcon(service.serviceType)}
              {getServiceTypeLabel(service.serviceType)}
            </div>
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full bg-white/80 hover:bg-white ${
              isFavorite ? "text-red-500" : "text-gray-500"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite();
            }}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-1 truncate">{service.name}</h3>
        <p className="text-orange-600 font-medium mb-2">
          {formatPrice(service.price)}
        </p>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
          {service.description}
        </p>

        {service.serviceType === "appointment" && service.duration && (
          <p className="text-sm text-gray-500">
            <span className="font-medium">Duration:</span> {service.duration}{" "}
            minutes
          </p>
        )}

        {service.serviceType === "product" &&
          service.inventory !== undefined && (
            <p className="text-sm text-gray-500">
              <span className="font-medium">In Stock:</span> {service.inventory}{" "}
              units
            </p>
          )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        {showActions ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="text-gray-600 hover:text-orange-600"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        ) : (
          <div className="w-full">
            <Link
              href={
                service.customerId
                  ? `/customer/${service.customerId}/services/${service._id}`
                  : `/services/${service._id}`
              }
              className="block w-full mb-2"
            >
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            <ServiceActions service={service} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

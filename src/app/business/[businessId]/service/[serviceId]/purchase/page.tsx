"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  Info,
  CreditCard,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";

// Fetch service details
const fetchServiceDetails = async (serviceId: string) => {
  try {
    console.log("Fetching service details for ID:", serviceId);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/services/${serviceId}`;
    console.log("Service URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Service endpoint failed:",
        response.status,
        response.statusText
      );
      throw new Error(
        `Failed to fetch service details: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Service data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching service details:", error);
    throw error;
  }
};

// Fetch business details
const fetchBusinessDetails = async (businessId: string) => {
  try {
    console.log("Fetching business details for ID:", businessId);

    // Try the primary endpoint first
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/businesses/${businessId}`;
      console.log("Trying primary URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Business data received from primary endpoint:", data);
        return data;
      }

      console.error(
        "Primary endpoint failed:",
        response.status,
        response.statusText
      );
      // If primary endpoint fails, we'll try the fallback
    } catch (primaryError) {
      console.error("Error with primary endpoint:", primaryError);
      // Continue to fallback
    }

    // Try fallback endpoint
    const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/business/${businessId}`;
    console.log("Trying fallback URL:", fallbackUrl);

    const fallbackResponse = await fetch(fallbackUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!fallbackResponse.ok) {
      console.error(
        "Both endpoints failed. Fallback response:",
        fallbackResponse.status,
        fallbackResponse.statusText
      );
      throw new Error(
        `Failed to fetch business details: ${fallbackResponse.status} ${fallbackResponse.statusText}`
      );
    }

    const fallbackData = await fallbackResponse.json();
    console.log("Business data received from fallback endpoint:", fallbackData);
    return fallbackData;
  } catch (error) {
    console.error("Error fetching business details:", error);
    throw error;
  }
};

// Add to cart
const addToCart = async (productData: any) => {
  try {
    console.log("Adding to cart:", productData);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`;
    console.log("Cart URL:", url);

    const token = Cookies.get("client-token");
    if (!token) {
      throw new Error(
        "Authentication required. Please log in to add items to cart."
      );
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      console.error(
        "Add to cart failed:",
        response.status,
        response.statusText
      );
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to add to cart: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Added to cart successfully:", data);
    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Check user authentication
const checkAuth = () => {
  const token = Cookies.get("client-token");
  return !!token;
};

// Interfaces
interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  businessId: string;
  serviceType: "product";
  images: string[];
  inventory: number;
}

interface Business {
  _id: string;
  name: string;
  category: string;
  city: string;
  profilePicture?: string;
}

export default function PurchaseProductPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;
  const serviceId = params.serviceId as string;
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  // Fetch service details
  const {
    data: service,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useQuery({
    queryKey: ["serviceDetails", serviceId],
    queryFn: () => fetchServiceDetails(serviceId),
    retry: 1,
  });

  // Fetch business details
  const { data: business, isLoading: isBusinessLoading } = useQuery({
    queryKey: ["businessDetails", businessId],
    queryFn: () => fetchBusinessDetails(businessId),
    retry: 1,
    enabled: !!service,
  });

  // Handle quantity change
  const increaseQuantity = () => {
    if (service && quantity < service.inventory) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });

      // Redirect to login page
      router.push(
        `/auth/login?redirect=/business/${businessId}/service/${serviceId}/purchase`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const cartData = {
        serviceId,
        businessId,
        quantity,
      };

      await addToCart(cartData);

      toast({
        title: "Added to Cart",
        description: `${service.name} has been added to your cart.`,
      });

      // Redirect to cart page
      router.push("/customer/cart");
    } catch (error) {
      toast({
        title: "Failed to Add to Cart",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase this item.",
        variant: "destructive",
      });

      // Redirect to login page
      router.push(
        `/auth/login?redirect=/business/${businessId}/service/${serviceId}/purchase`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const cartData = {
        serviceId,
        businessId,
        quantity,
      };

      await addToCart(cartData);

      // Redirect to checkout page
      router.push("/customer/checkout");
    } catch (error) {
      toast({
        title: "Failed to Process",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isServiceLoading || isBusinessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (serviceError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-500">
            Error Loading Product
          </h2>
          <p className="text-muted-foreground">
            {serviceError instanceof Error
              ? serviceError.message
              : "Failed to load product details"}
          </p>
          <Button
            onClick={() =>
              router.push(`/business/${businessId}/services/public`)
            }
            className="mt-4"
          >
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  // If we have no service data but no error occurred, show a not found message
  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold">Product Not Found</h2>
          <p className="text-muted-foreground">
            The product you're looking for could not be found or may have been
            removed.
          </p>
          <Button
            onClick={() =>
              router.push(`/business/${businessId}/services/public`)
            }
            className="mt-4"
          >
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  // If service is not a product type, redirect to details page
  if (service.serviceType !== "product") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 max-w-md text-center">
          <h2 className="text-xl font-semibold">Invalid Service Type</h2>
          <p className="text-muted-foreground">
            This service is not available for purchase as a product.
          </p>
          <Button
            onClick={() =>
              router.push(
                `/business/${businessId}/service/${serviceId}/details`
              )
            }
            className="mt-4"
          >
            View Service Details
          </Button>
        </div>
      </div>
    );
  }

  // If product is out of stock
  if (service.inventory === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() =>
              router.push(
                `/business/${businessId}/service/${serviceId}/details`
              )
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product Details
          </Button>

          <div className="flex items-center justify-center min-h-[30vh]">
            <div className="flex flex-col items-center gap-2 max-w-md text-center">
              <h2 className="text-xl font-semibold">Product Out of Stock</h2>
              <p className="text-muted-foreground">
                This product is currently out of stock. Please check back later.
              </p>
              <Button
                onClick={() =>
                  router.push(`/business/${businessId}/services/public`)
                }
                className="mt-4"
              >
                Browse Other Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header with back button */}
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() =>
              router.push(
                `/business/${businessId}/service/${serviceId}/details`
              )
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product Details
          </Button>
        </div>

        <h1 className="text-2xl font-bold">Purchase Product</h1>

        {!isAuthenticated && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to purchase this product. Please{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-yellow-600 underline"
                onClick={() =>
                  router.push(
                    `/auth/login?redirect=/business/${businessId}/service/${serviceId}/purchase`
                  )
                }
              >
                log in
              </Button>{" "}
              or{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-yellow-600 underline"
                onClick={() =>
                  router.push(
                    `/auth/register?redirect=/business/${businessId}/service/${serviceId}/purchase`
                  )
                }
              >
                create an account
              </Button>
              .
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Product Image */}
          <div>
            <Card className="overflow-hidden">
              <div className="h-[300px] w-full bg-muted">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {service.images && service.images.length > 1 && (
                <CardContent className="pt-4">
                  <div className="grid grid-cols-4 gap-2">
                    {service.images
                      .slice(0, 4)
                      .map((image: string, index: number) => (
                        <div
                          key={index}
                          className="h-16 w-full bg-muted rounded-md overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`${service.name} - Image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Middle Column - Product Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{business?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    In Stock
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {service.inventory} available
                  </span>
                </div>

                <div className="text-2xl font-bold">
                  ${service.price.toFixed(2)}
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {service.description || "No description available."}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Quantity</h3>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={service.inventory}
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (
                          !isNaN(value) &&
                          value >= 1 &&
                          value <= service.inventory
                        ) {
                          setQuantity(value);
                        }
                      }}
                      className="w-16 mx-2 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={increaseQuantity}
                      disabled={quantity >= service.inventory}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  onClick={handleBuyNow}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Buy Now
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span>${service.price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span>{quantity}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Subtotal:</span>
                  <span>${(service.price * quantity).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping:</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Tax:</span>
                  <span>Calculated at checkout</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${(service.price * quantity).toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Delivery options available at checkout</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Secure payment processing with Chapa</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

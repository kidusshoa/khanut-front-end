"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { serviceApi } from "@/services/service";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { AddServiceModal } from "@/components/business/AddServiceModal";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  const productId = params.productId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch the product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the product by ID
        const response = await serviceApi.getServiceById(productId);
        console.log("Fetched product:", response);
        
        // Verify this is a product type service
        if (response.serviceType !== "product") {
          throw new Error("This service is not a product");
        }
        
        setProduct(response);
        setIsModalOpen(true);
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product");
        toast.error("Failed to load product. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Handle service updated
  const handleServiceUpdated = (service: any) => {
    toast.success("Product updated successfully!");
    // Navigate back to products page
    router.push(`/business/${businessId}/products`);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Navigate back to products page
    router.push(`/business/${businessId}/products`);
  };

  if (isLoading) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Error Loading Product</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            onClick={() => router.push(`/business/${businessId}/products`)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Back to Products
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout businessId={businessId}>
      <div className="flex items-center justify-center min-h-[60vh]">
        {/* Show loading indicator while modal is opening */}
        {!isModalOpen && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        )}

        {/* Render the AddServiceModal with product data for editing */}
        {product && (
          <AddServiceModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            businessId={businessId}
            onServiceAdded={handleServiceUpdated}
            initialServiceType="product"
            initialData={product}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

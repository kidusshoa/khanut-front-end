"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AddServiceModal } from "@/components/business/AddServiceModal";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AddProductPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Handle service added
  const handleServiceAdded = (service: any) => {
    toast.success("Product added successfully!");
    // Navigate back to products page
    router.push(`/business/${businessId}/products`);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Navigate back to products page
    router.push(`/business/${businessId}/products`);
  };

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

        {/* Render the AddServiceModal with product type pre-selected */}
        <AddServiceModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          businessId={businessId}
          onServiceAdded={handleServiceAdded}
          initialServiceType="product"
        />
      </div>
    </DashboardLayout>
  );
}

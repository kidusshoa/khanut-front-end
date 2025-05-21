"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { paymentApi } from "@/services/payment";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ChapaPaymentButtonProps {
  orderId?: string;
  appointmentId?: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  onSuccess?: (txRef: string) => void;
  onError?: (error: any) => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children?: React.ReactNode;
}

export function ChapaPaymentButton({
  orderId,
  appointmentId,
  amount,
  customerEmail,
  customerName,
  onSuccess,
  onError,
  className,
  variant = "default",
  children,
}: ChapaPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      if (!orderId && !appointmentId) {
        throw new Error("Either orderId or appointmentId must be provided");
      }

      // Prepare payment data
      const paymentData = {
        amount,
        email: customerEmail,
        name: customerName,
        // Add any additional data needed for the payment
      };

      // Initialize payment based on whether it's for an order or appointment
      let response;
      if (orderId) {
        response = await paymentApi.initializeOrderPayment(orderId, paymentData);
      } else if (appointmentId) {
        response = await paymentApi.initializeAppointmentPayment(appointmentId, paymentData);
      }

      // Check if we have a checkout URL
      if (response?.data?.checkout_url) {
        // Open the Chapa checkout page in a new window
        window.open(response.data.checkout_url, "_blank");
        
        // Store the transaction reference for verification
        const txRef = response.data.tx_ref;
        localStorage.setItem("pendingPaymentTxRef", txRef);
        
        toast({
          title: "Payment Initiated",
          description: "Please complete your payment in the opened window",
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(txRef);
        }
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={className}
      variant={variant}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || "Pay with Chapa"
      )}
    </Button>
  );
}

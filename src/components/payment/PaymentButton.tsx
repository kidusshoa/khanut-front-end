import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";
import { paymentApi } from "@/services/payment";

interface PaymentButtonProps {
  type: "order" | "appointment";
  id: string;
  disabled?: boolean;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onSuccess?: (checkoutUrl: string) => void;
  onError?: (error: Error) => void;
}

export default function PaymentButton({
  type,
  id,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      let paymentResult;

      if (type === "order") {
        paymentResult = await paymentApi.initializeOrderPayment(id);
      } else {
        paymentResult = await paymentApi.initializeAppointmentPayment(id);
      }

      // If onSuccess callback is provided, call it with the checkout URL
      if (onSuccess) {
        onSuccess(paymentResult.data.checkout_url);
      } else {
        // Otherwise, redirect to the checkout URL
        window.location.href = paymentResult.data.checkout_url;
      }
    } catch (error) {
      console.error("Payment initialization error:", error);

      // Show error toast
      toast.error(
        error instanceof Error ? error.message : "Failed to initialize payment"
      );

      // If onError callback is provided, call it with the error
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoading}
      onClick={handlePayment}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay Now
        </>
      )}
    </Button>
  );
}

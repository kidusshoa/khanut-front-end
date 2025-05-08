"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { paymentApi } from "@/services/payment";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    "loading" | "success" | "failed" | "error"
  >("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      try {
        // Get transaction reference and order ID from URL
        const txRef = searchParams.get("tx_ref");
        const orderIdParam = searchParams.get("orderId");

        if (orderIdParam) {
          setOrderId(orderIdParam);
        }

        if (!txRef) {
          setStatus("error");
          setMessage(
            "Missing transaction reference. Unable to verify payment."
          );
          return;
        }

        // Verify payment
        const result = await paymentApi.verifyPayment(txRef);

        if (result.success) {
          setStatus("success");
          setMessage("Payment completed successfully!");

          // If we don't have orderId from URL, get it from the payment result
          if (!orderIdParam && result.payment?.referenceId) {
            setOrderId(result.payment.referenceId);
          }
        } else {
          setStatus("failed");
          setMessage("Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "An error occurred while verifying payment"
        );
      }
    };

    verifyPaymentStatus();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "failed":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "error":
        return <AlertCircle className="h-16 w-16 text-amber-500" />;
    }
  };

  const handleViewOrder = () => {
    if (orderId) {
      router.push(`/customer/orders/${orderId}`);
    }
  };

  const handleGoHome = () => {
    router.push("/customer/dashboard");
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Payment Status</CardTitle>
          <CardDescription>
            {status === "loading"
              ? "Please wait while we verify your payment"
              : "Your payment has been processed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="my-4">{getStatusIcon()}</div>
          <p className="text-center text-lg font-medium">{message}</p>
          {status === "success" && (
            <p className="text-center text-sm text-muted-foreground">
              Thank you for your payment. Your order is now being processed.
            </p>
          )}
          {status === "failed" && (
            <p className="text-center text-sm text-muted-foreground">
              We couldn't process your payment. Please try again or contact
              customer support.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          {status !== "loading" && (
            <>
              {orderId && status === "success" && (
                <Button onClick={handleViewOrder}>View Order</Button>
              )}
              <Button variant="outline" onClick={handleGoHome}>
                Go to Dashboard
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-md mx-auto py-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Payment Status</CardTitle>
              <CardDescription>
                Please wait while we verify your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="my-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <p className="text-center text-lg font-medium">
                Loading payment details...
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

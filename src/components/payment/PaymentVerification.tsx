"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentApi } from "@/services/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

interface PaymentVerificationProps {
  customerId: string;
  redirectPath?: string;
}

export function PaymentVerification({
  customerId,
  redirectPath = "/customer",
}: PaymentVerificationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Get transaction reference from URL or localStorage
  const txRef = searchParams.get("tx_ref") || localStorage.getItem("pendingPaymentTxRef");

  const verifyPayment = async () => {
    if (!txRef) {
      setStatus("error");
      setMessage("No transaction reference found");
      return;
    }

    try {
      setStatus("loading");
      setMessage("Verifying your payment...");

      const response = await paymentApi.verifyPayment(txRef);

      if (response.status === "success") {
        setStatus("success");
        setMessage("Payment successful!");
        setPaymentDetails(response.data);
        
        // Clear the pending payment reference
        localStorage.removeItem("pendingPaymentTxRef");
      } else {
        setStatus("error");
        setMessage(response.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("error");
      setMessage("Failed to verify payment. Please try again.");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [txRef]);

  const handleRedirect = () => {
    // Redirect to the appropriate page based on status
    if (status === "success") {
      router.push(`${redirectPath}/${customerId}/orders`);
    } else {
      router.push(`${redirectPath}/${customerId}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Payment Verification</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 text-orange-500 animate-spin mb-4" />
            <p className="text-center text-muted-foreground">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-center text-muted-foreground mb-4">{message}</p>
            
            {paymentDetails && (
              <div className="w-full bg-muted p-4 rounded-md text-sm">
                <p><strong>Amount:</strong> {paymentDetails.amount}</p>
                <p><strong>Transaction ID:</strong> {paymentDetails.transactionId}</p>
                <p><strong>Date:</strong> {new Date(paymentDetails.createdAt).toLocaleString()}</p>
              </div>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
            <p className="text-center text-muted-foreground mb-4">{message}</p>
            <Button 
              variant="outline" 
              onClick={verifyPayment}
              className="mb-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRedirect} 
          className="w-full"
          variant={status === "success" ? "default" : "secondary"}
        >
          {status === "success" ? "View Orders" : "Return to Dashboard"}
        </Button>
      </CardFooter>
    </Card>
  );
}

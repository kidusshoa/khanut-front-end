"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

export default function MockPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get parameters from URL
  const appointmentId = searchParams.get("appointmentId");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount") || "0";
  const returnUrl = searchParams.get("returnUrl") || "/";

  // Handle payment completion
  const handleCompletePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      toast.success("Payment completed successfully!");
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (appointmentId) {
          router.push(`/customer/me/appointments/${appointmentId}`);
        } else if (orderId) {
          router.push(`/customer/me/orders/${orderId}`);
        } else {
          router.push(returnUrl);
        }
      }, 2000);
    }, 1500);
  };

  // Handle payment cancellation
  const handleCancelPayment = () => {
    toast.error("Payment cancelled");
    
    if (appointmentId) {
      router.push(`/customer/me/appointments/${appointmentId}`);
    } else if (orderId) {
      router.push(`/customer/me/orders/${orderId}`);
    } else {
      router.push(returnUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Mock Payment Gateway</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            This is a mock payment page for testing purposes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
              <p className="text-center text-muted-foreground">
                Your payment has been processed successfully. You will be redirected shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-md">
                <h3 className="font-medium mb-2">Payment Details</h3>
                <div className="space-y-2">
                  {appointmentId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Appointment ID:</span>
                      <span className="font-medium">{appointmentId.substring(0, 8)}...</span>
                    </div>
                  )}
                  {orderId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">{orderId.substring(0, 8)}...</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{parseInt(amount).toLocaleString()} ETB</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-3">Payment Method</h3>
                <div className="border rounded-md p-3 flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">Test Card</p>
                    <p className="text-sm text-muted-foreground">**** **** **** 4242</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        {!isSuccess && (
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
              onClick={handleCompletePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Pay ${parseInt(amount).toLocaleString()} ETB`}
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleCancelPayment}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

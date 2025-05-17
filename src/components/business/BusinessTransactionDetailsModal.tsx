"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Calendar, Clock, User, Building, FileText, Mail, Phone } from "lucide-react";
import Link from "next/link";

interface BusinessTransactionDetailsModalProps {
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export default function BusinessTransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  businessId,
}: BusinessTransactionDetailsModalProps) {
  const router = useRouter();

  if (!transaction) return null;

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "refunded":
        return <Badge variant="secondary">Refunded</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get payment type label
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "order":
        return "Product Order";
      case "appointment":
        return "Service Appointment";
      default:
        return type;
    }
  };

  // Navigate to related item
  const handleViewRelatedItem = () => {
    if (transaction.paymentType === "order") {
      router.push(`/business/${businessId}/orders/${transaction.referenceId}`);
    } else if (transaction.paymentType === "appointment") {
      router.push(`/business/${businessId}/appointments/${transaction.referenceId}`);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information about this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Transaction ID */}
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-sm">{transaction._id}</span>
          </div>

          {/* Status and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Status</span>
              <div>{getStatusBadge(transaction.status)}</div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-medium">
                {transaction.amount.toFixed(2)} {transaction.currency}
              </span>
            </div>
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Date</span>
                <span>{dayjs(transaction.createdAt).format("MMM D, YYYY")}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Time</span>
                <span>{dayjs(transaction.createdAt).format("h:mm A")}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          {transaction.customerId && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Customer Information</h4>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Customer</span>
                    <span>
                      {typeof transaction.customerId === "object" && transaction.customerId.name
                        ? transaction.customerId.name
                        : "Customer ID: " + transaction.customerId}
                    </span>
                  </div>
                </div>
                
                {typeof transaction.customerId === "object" && transaction.customerId.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span>{transaction.customerId.email}</span>
                    </div>
                  </div>
                )}
                
                {typeof transaction.customerId === "object" && transaction.customerId.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span>{transaction.customerId.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Payment Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Payment Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Type</span>
                <span>{getPaymentTypeLabel(transaction.paymentType)}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Method</span>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{transaction.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Information */}
          {transaction.chapaReference && (
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Payment Reference</span>
              <span className="font-mono text-sm">{transaction.chapaReference}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:w-auto w-full"
          >
            Close
          </Button>
          {transaction.referenceId && (
            <Button
              onClick={handleViewRelatedItem}
              className="sm:w-auto w-full bg-orange-600 hover:bg-orange-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              View {transaction.paymentType === "order" ? "Order" : "Appointment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

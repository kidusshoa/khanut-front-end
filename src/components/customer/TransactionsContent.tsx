"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { paymentApi } from "@/services/payment";
import {
  Eye,
  FileText,
  CreditCard,
  Search,
  Download,
  Filter,
} from "lucide-react";
import Link from "next/link";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import TransactionDetailsModal from "@/components/customer/TransactionDetailsModal";
import { toast } from "react-hot-toast";

interface TransactionsContentProps {
  customerId: string;
}

export default function TransactionsContent({
  customerId,
}: TransactionsContentProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Prepare query parameters
  const queryParams = {
    page,
    limit,
    status: statusFilter as
      | "pending"
      | "completed"
      | "failed"
      | "cancelled"
      | undefined,
    startDate: dateRange?.from
      ? dayjs(dateRange.from).format("YYYY-MM-DD")
      : undefined,
    endDate: dateRange?.to
      ? dayjs(dateRange.to).format("YYYY-MM-DD")
      : undefined,
  };

  // Fetch transactions
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["customerTransactions", customerId, queryParams],
    queryFn: () => paymentApi.getCustomerPayments(customerId, queryParams),
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filter changes
  };

  // Handle date range change
  const handleDateRangeChange = (range: { from: Date; to: Date } | null) => {
    setDateRange(range);
    setPage(1); // Reset to first page when date range changes
  };

  // Handle transaction details view
  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

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

  // Export transactions as CSV
  const handleExportCSV = () => {
    if (!data?.transactions) return;

    const headers = ["Date", "Amount", "Type", "Status", "Reference"];
    const csvData = data.transactions.map((transaction: any) => [
      dayjs(transaction.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      `${transaction.amount} ${transaction.currency}`,
      getPaymentTypeLabel(transaction.paymentType),
      transaction.status,
      transaction.chapaReference || transaction._id,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row: string[]) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${dayjs().format("YYYY-MM-DD")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Transactions exported successfully");
  };

  // Loading state
  if (isLoading) {
    return (
      <CustomerDashboardLayout>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Transaction History
          </h1>
          <Card>
            <CardHeader>
              <CardTitle>Your Transactions</CardTitle>
              <CardDescription>
                View your payment history and transaction details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex flex-col space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </CustomerDashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CustomerDashboardLayout>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Transaction History
          </h1>
          <Card>
            <CardHeader>
              <CardTitle>Your Transactions</CardTitle>
              <CardDescription>
                View your payment history and transaction details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-red-500">
                  Failed to load transaction history
                </p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
                <Button
                  onClick={() => refetch()}
                  className="mt-4 bg-orange-600 hover:bg-orange-700"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CustomerDashboardLayout>
    );
  }

  // Empty state
  if (!data?.transactions || data.transactions.length === 0) {
    return (
      <CustomerDashboardLayout>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Transaction History
          </h1>
          <Card>
            <CardHeader>
              <CardTitle>Your Transactions</CardTitle>
              <CardDescription>
                View your payment history and transaction details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm text-muted-foreground">
                  {statusFilter || dateRange
                    ? "No transactions match your current filters. Try adjusting your search criteria."
                    : "You haven't made any payments yet"}
                </p>
                {(statusFilter || dateRange) && (
                  <Button
                    onClick={() => {
                      setStatusFilter("");
                      setDateRange(null);
                      refetch();
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </CustomerDashboardLayout>
    );
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Transaction History
          </h1>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Transactions</CardTitle>
            <CardDescription>
              View your payment history and transaction details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search transactions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
              </div>
              <div className="flex flex-1 gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((transaction: any) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        {dayjs(transaction.createdAt).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell>
                        {transaction.amount.toFixed(2)} {transaction.currency}
                      </TableCell>
                      <TableCell>
                        {getPaymentTypeLabel(transaction.paymentType)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {transaction.chapaReference
                            ? transaction.chapaReference.substring(0, 10) +
                              "..."
                            : transaction._id.substring(0, 10) + "..."}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(transaction)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          {transaction.paymentType === "order" && (
                            <Link
                              href={`/customer/${customerId}/orders/${transaction.referenceId}`}
                            >
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View Order
                              </Button>
                            </Link>
                          )}
                          {transaction.paymentType === "appointment" && (
                            <Link
                              href={`/customer/${customerId}/appointments/${transaction.referenceId}`}
                            >
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View Appointment
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data.pagination && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, data.pagination.totalItems)} of{" "}
                  {data.pagination.totalItems} transactions
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: Math.min(5, data.pagination.totalPages) },
                      (_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setPage(pageNumber)}
                              isActive={page === pageNumber}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}

                    {data.pagination.totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setPage(data.pagination.totalPages)}
                            isActive={page === data.pagination.totalPages}
                          >
                            {data.pagination.totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage((p) =>
                            Math.min(data.pagination.totalPages, p + 1)
                          )
                        }
                        disabled={page === data.pagination.totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          customerId={customerId}
        />
      )}
    </CustomerDashboardLayout>
  );
}

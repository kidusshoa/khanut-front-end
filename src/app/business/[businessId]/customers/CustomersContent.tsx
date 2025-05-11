"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  User,
  Loader2,
  AlertTriangle,
  Download,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import dayjs from "dayjs";

// Mock data for customers
const mockCustomers = [
  {
    id: "c1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+251 91 234 5678",
    avatar: null,
    totalSpent: 1250.75,
    lastPurchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    status: "active",
    orders: 5,
    appointments: 3,
  },
  {
    id: "c2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+251 92 345 6789",
    avatar: null,
    totalSpent: 875.50,
    lastPurchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    status: "active",
    orders: 3,
    appointments: 2,
  },
  {
    id: "c3",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "+251 93 456 7890",
    avatar: null,
    totalSpent: 2100.25,
    lastPurchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    status: "active",
    orders: 8,
    appointments: 5,
  },
  {
    id: "c4",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "+251 94 567 8901",
    avatar: null,
    totalSpent: 450.00,
    lastPurchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    status: "inactive",
    orders: 2,
    appointments: 1,
  },
  {
    id: "c5",
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+251 95 678 9012",
    avatar: null,
    totalSpent: 1875.30,
    lastPurchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    status: "active",
    orders: 7,
    appointments: 4,
  },
];

interface CustomersContentProps {
  businessId: string;
}

export default function CustomersContent({ businessId }: CustomersContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter customers based on active tab
  const filteredCustomers = customers.filter((customer) => {
    if (activeTab === "active") {
      return customer.status === "active";
    } else if (activeTab === "inactive") {
      return customer.status === "inactive";
    }
    return true;
  });

  // Filter customers based on search query
  const searchedCustomers = filteredCustomers.filter((customer) => {
    if (!searchQuery) return true;
    return (
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    );
  });

  // Handle customer details view
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsOpen(true);
  };

  // Handle message customer
  const handleMessageCustomer = (customerId: string) => {
    router.push(`/business/${businessId}/messages?customer=${customerId}`);
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

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage and view information about your customers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden md:flex">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center w-full md:w-auto">
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button variant="ghost" size="icon" className="ml-2">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {searchedCustomers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Contact</TableHead>
                      <TableHead className="hidden lg:table-cell">Total Spent</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Purchase</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={customer.avatar || ""} />
                              <AvatarFallback className="bg-orange-100 text-orange-600">
                                {customer.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <p className="text-sm">{customer.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {customer.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "ETB",
                          }).format(customer.totalSpent)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {dayjs(customer.lastPurchase).format("MMM D, YYYY")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={customer.status === "active" ? "default" : "secondary"}
                            className={
                              customer.status === "active"
                                ? "bg-green-500 hover:bg-green-600"
                                : ""
                            }
                          >
                            {customer.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMessageCustomer(customer.id)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewCustomer(customer)}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Delete Customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No customers found</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  {searchQuery
                    ? `No customers match the search term "${searchQuery}"`
                    : activeTab !== "all"
                    ? `No ${activeTab} customers found`
                    : "You don't have any customers yet"}
                </p>
                {!searchQuery && activeTab === "all" && (
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Customer
                  </Button>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {searchedCustomers.length} of {customers.length} customers
            </p>
            {/* Pagination would go here */}
          </CardFooter>
        </Card>
      </div>

      {/* Customer Details Dialog */}
      <Dialog
        open={isCustomerDetailsOpen}
        onOpenChange={setIsCustomerDetailsOpen}
      >
        <DialogContent className="max-w-3xl">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Customer Details</DialogTitle>
                <DialogDescription>
                  View detailed information about this customer
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="md:col-span-1">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={selectedCustomer.avatar || ""} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl">
                          {selectedCustomer.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-medium">{selectedCustomer.name}</h3>
                      <p className="text-muted-foreground mb-4">
                        Customer since{" "}
                        {dayjs().subtract(Math.floor(Math.random() * 365), "day").format("MMM YYYY")}
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMessageCustomer(selectedCustomer.id)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Implement call functionality
                            window.location.href = `tel:${selectedCustomer.phone}`;
                          }}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-muted-foreground">
                            {selectedCustomer.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-muted-foreground">
                            {selectedCustomer.phone}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Total Spent</p>
                          <p className="text-2xl font-bold">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "ETB",
                            }).format(selectedCustomer.totalSpent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Orders</p>
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-orange-500" />
                            <p className="text-2xl font-bold">{selectedCustomer.orders}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Appointments</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            <p className="text-2xl font-bold">
                              {selectedCustomer.appointments}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCustomerDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Edit Customer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

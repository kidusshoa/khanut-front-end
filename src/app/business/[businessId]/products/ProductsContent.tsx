"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Package,
  Loader2,
  AlertTriangle,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { serviceApi } from "@/services/service";
import { getBusinessServices } from "@/services/businessApi";
import api from "@/services/api";
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
import { FallbackImage } from "@/components/ui/fallback-image";

// Define the product interface
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  inventory?: number;
  sku?: string;
  serviceType: string;
  businessId: string;
  images: string[];
  status?: string;
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
}

interface ProductsContentProps {
  businessId: string;
}

export default function ProductsContent({ businessId }: ProductsContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let fetchedProducts: Product[] = [];
        let correctBusinessId = businessId;

        // First, try to get the correct businessId from the business status
        try {
          const statusResponse = await api.get("/business/status");
          correctBusinessId = statusResponse.data.businessId;
          console.log(
            "Got correct business ID from status:",
            correctBusinessId
          );
        } catch (statusError) {
          console.error("Failed to get business status:", statusError);
          // Continue with the provided businessId
        }

        try {
          // First try to fetch products using the getServicesByType API
          console.log(
            "Trying getServicesByType API with businessId:",
            correctBusinessId
          );
          const response = await serviceApi.getServicesByType(
            correctBusinessId,
            "product",
            {
              limit: 100,
            }
          );

          // The response is an array of services directly, not an object with a services property
          console.log("API Response from getServicesByType:", response);

          // Map the response to our Product interface and add status
          if (Array.isArray(response)) {
            fetchedProducts = response.map((service: any) => ({
              ...service,
              status:
                service.inventory && service.inventory > 0
                  ? "in_stock"
                  : "out_of_stock",
            }));
          }
        } catch (typeError) {
          console.error("Error with getServicesByType API:", typeError);
          console.log("Falling back to getBusinessServices API...");

          // Fallback to getBusinessServices API
          try {
            console.log(
              "Calling getBusinessServices with businessId:",
              correctBusinessId
            );
            const allServices = await getBusinessServices(correctBusinessId);
            console.log("API Response from getBusinessServices:", allServices);

            // Filter for products only and map to our Product interface
            if (Array.isArray(allServices)) {
              fetchedProducts = allServices
                .filter((service: any) => service.serviceType === "product")
                .map((service: any) => ({
                  ...service,
                  status:
                    service.inventory && service.inventory > 0
                      ? "in_stock"
                      : "out_of_stock",
                }));
            } else {
              console.log(
                "getBusinessServices did not return an array:",
                allServices
              );
            }
          } catch (fallbackError) {
            console.error("Error with fallback API:", fallbackError);
            throw fallbackError; // Re-throw to be caught by the outer catch
          }
        }

        setProducts(fetchedProducts);

        // Log the number of products found
        console.log(`Found ${fetchedProducts.length} products`);

        // If no products were found but there was no error, set a friendly message
        if (fetchedProducts.length === 0) {
          console.log("No products found for this business");
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products");
        toast.error("Failed to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (businessId) {
      fetchProducts();
    }
  }, [businessId]);

  // Filter products based on active tab
  const filteredProducts = products.filter((product) => {
    if (activeTab === "in_stock") {
      return product.status === "in_stock";
    } else if (activeTab === "out_of_stock") {
      return product.status === "out_of_stock";
    }
    return true;
  });

  // Filter products based on search query
  const searchedProducts = filteredProducts.filter((product) => {
    if (!searchQuery) return true;
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Sort products
  const sortedProducts = [...searchedProducts].sort((a, b) => {
    if (!sortField) return 0;

    let valueA, valueB;

    switch (sortField) {
      case "name":
        valueA = a.name;
        valueB = b.name;
        break;
      case "price":
        valueA = a.price;
        valueB = b.price;
        break;
      case "inventory":
        valueA = a.inventory;
        valueB = b.inventory;
        break;
      case "sku":
        valueA = a.sku;
        valueB = b.sku;
        break;
      default:
        return 0;
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle product details view
  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
  };

  // Handle edit product
  const handleEditProduct = (productId: string) => {
    router.push(`/business/${businessId}/products/${productId}/edit`);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        setIsLoading(true);
        // Call the API to delete the product
        await serviceApi.deleteService(productId);

        // Update the local state
        setProducts(products.filter((product) => product._id !== productId));
        toast.success("Product deleted successfully");

        // Close the product details dialog if open
        if (isProductDetailsOpen) {
          setIsProductDetailsOpen(false);
        }
      } catch (err: any) {
        console.error("Error deleting product:", err);
        toast.error(
          err.message || "Failed to delete product. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
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
          <h2 className="text-xl font-semibold">Error Loading Products</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product inventory and catalog
            </p>
          </div>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => router.push(`/business/${businessId}/products/new`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center w-full md:w-auto">
                <Input
                  placeholder="Search products..."
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
                  <TabsTrigger value="in_stock">In Stock</TabsTrigger>
                  <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {sortedProducts.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("name")}
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                        >
                          Product
                          {sortField === "name" && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("sku")}
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                        >
                          SKU
                          {sortField === "sku" && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("price")}
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                        >
                          Price
                          {sortField === "price" && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("inventory")}
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                        >
                          Inventory
                          {sortField === "inventory" && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                              <FallbackImage
                                src={product.images[0] || ""}
                                alt={product.name}
                                width={40}
                                height={40}
                                fallbackSrc="/placeholder-product.jpg"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "ETB",
                          }).format(product.price)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {product.inventory}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={
                              product.status === "in_stock"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              product.status === "in_stock"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }
                          >
                            {product.status === "in_stock"
                              ? "In Stock"
                              : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProduct(product._id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  {searchQuery
                    ? `No products match the search term "${searchQuery}"`
                    : activeTab !== "all"
                    ? `No ${activeTab.replace("_", " ")} products found`
                    : "You don't have any products yet"}
                </p>
                {!searchQuery && activeTab === "all" && (
                  <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() =>
                      router.push(`/business/${businessId}/products/new`)
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {sortedProducts.length} of {products.length} products
            </p>
            {/* Pagination would go here */}
          </CardFooter>
        </Card>
      </div>

      {/* Product Details Dialog */}
      <Dialog
        open={isProductDetailsOpen}
        onOpenChange={setIsProductDetailsOpen}
      >
        <DialogContent className="max-w-3xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Product Details</DialogTitle>
                <DialogDescription>
                  View detailed information about this product
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <div className="aspect-square rounded-md overflow-hidden bg-muted mb-4">
                    <FallbackImage
                      src={selectedProduct.images[0] || ""}
                      alt={selectedProduct.name}
                      width={400}
                      height={400}
                      fallbackSrc="/placeholder-product.jpg"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {selectedProduct.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-xl font-bold">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "ETB",
                        }).format(selectedProduct.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Inventory</p>
                      <p className="text-xl font-bold">
                        {selectedProduct.inventory || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">SKU</p>
                      <p className="text-muted-foreground">
                        {selectedProduct.sku || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-muted-foreground">
                        {selectedProduct.categoryId
                          ? selectedProduct.categoryId
                          : "Uncategorized"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge
                        variant={
                          selectedProduct.status === "in_stock"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          selectedProduct.status === "in_stock"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {selectedProduct.status === "in_stock"
                          ? "In Stock"
                          : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsProductDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEditProduct(selectedProduct._id)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteProduct(selectedProduct._id);
                    setIsProductDetailsOpen(false);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

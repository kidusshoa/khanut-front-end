"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  Package,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  ArrowUpDown,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { InventoryEditModal } from "@/components/business/InventoryEditModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// TypeScript interfaces
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  businessId: string;
  serviceType: "product";
  inventory: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Business {
  _id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  email: string;
  phone: string;
  profilePicture?: string;
}

// Fetch products for a business
const fetchBusinessProducts = async (businessId: string): Promise<Product[]> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/services/business/${businessId}/type/product`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching business products:", error);
    throw error;
  }
};

// Fetch business details
const fetchBusinessDetails = async (businessId: string): Promise<Business> => {
  try {
    // Try the primary endpoint first
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/businesses/${businessId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      console.error("Primary endpoint failed:", response.status);
      // If primary endpoint fails, we'll try the fallback
    } catch (primaryError) {
      console.error("Error with primary endpoint:", primaryError);
      // Continue to fallback
    }

    // Try fallback endpoint
    const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/business/${businessId}`;

    const fallbackResponse = await fetch(fallbackUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!fallbackResponse.ok) {
      throw new Error(`Failed to fetch business details: ${fallbackResponse.status}`);
    }

    const fallbackData = await fallbackResponse.json();
    return fallbackData;
  } catch (error) {
    console.error("Error fetching business details:", error);
    throw error;
  }
};

// Update product inventory
const updateProductInventory = async (productId: string, inventory: number): Promise<Product> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/services/${productId}/inventory`;
    
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inventory }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update inventory: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating product inventory:", error);
    throw error;
  }
};

export default function BusinessInventoryPage({
  params: { businessId },
}: {
  params: { businessId: string };
}): React.ReactNode {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Fetch business details
  const {
    data: business,
    isLoading: isBusinessLoading,
    error: businessError,
  } = useQuery({
    queryKey: ["businessDetails", businessId],
    queryFn: () => fetchBusinessDetails(businessId),
    retry: 1,
  });
  
  // Fetch products
  const {
    data: products = [],
    isLoading: isProductsLoading,
    refetch,
    error: productsError,
  } = useQuery({
    queryKey: ["businessProducts", businessId],
    queryFn: () => fetchBusinessProducts(businessId),
    retry: 1,
  });
  
  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: ({ productId, inventory }: { productId: string; inventory: number }) => 
      updateProductInventory(productId, inventory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessProducts", businessId] });
      toast({
        title: "Inventory Updated",
        description: "Product inventory has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update inventory.",
        variant: "destructive",
      });
    },
  });
  
  // Handle inventory update
  const handleInventoryUpdate = (productId: string, inventory: number): void => {
    updateInventoryMutation.mutate({ productId, inventory });
  };
  
  // Handle edit product
  const handleEditProduct = (product: Product): void => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  
  // Handle delete product
  const handleDeleteProduct = (product: Product): void => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete product
  const confirmDeleteProduct = async (): Promise<void> => {
    if (!selectedProduct) return;
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/services/${selectedProduct._id}`;
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`);
      }
      
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["businessProducts", businessId] });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete product.",
        variant: "destructive",
      });
    }
  };
  
  // Filter products by status
  const filterProductsByStatus = (products: Product[], status: string): Product[] => {
    if (status === "all") return products;
    if (status === "in_stock") return products.filter(p => p.inventory >= 5);
    if (status === "low_stock") return products.filter(p => p.inventory > 0 && p.inventory < 5);
    if (status === "out_of_stock") return products.filter(p => p.inventory === 0);
    return products;
  };
  
  // Filter and sort products
  const filteredProducts = [...products]
    .filter((product: Product) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    })
    .filter(product => filterProductsByStatus([product], activeTab).length > 0)
    .sort((a: Product, b: Product) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "price") {
        return sortOrder === "asc"
          ? a.price - b.price
          : b.price - a.price;
      } else if (sortBy === "inventory") {
        return sortOrder === "asc"
          ? a.inventory - b.inventory
          : b.inventory - a.inventory;
      } else if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  
  // Get inventory status
  const getInventoryStatus = (inventory: number): React.ReactNode => {
    if (inventory === 0) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Out of Stock
        </Badge>
      );
    } else if (inventory < 5) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          In Stock
        </Badge>
      );
    }
  };
  
  // Define table columns
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            if (sortBy === "name") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy("name");
              setSortOrder("asc");
            }
          }}
          className="p-0 hover:bg-transparent"
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                {product.description}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            if (sortBy === "price") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy("price");
              setSortOrder("asc");
            }
          }}
          className="p-0 hover:bg-transparent"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">${row.original.price.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "inventory",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            if (sortBy === "inventory") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy("inventory");
              setSortOrder("asc");
            }
          }}
          className="p-0 hover:bg-transparent"
        >
          Inventory
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const inventory = row.original.inventory;
        return (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">{inventory}</span>
              {getInventoryStatus(inventory)}
            </div>
            <Progress 
              value={Math.min(inventory * 10, 100)} 
              className="h-2"
              indicatorClassName={
                inventory === 0
                  ? "bg-red-500"
                  : inventory < 5
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }
            />
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            if (sortBy === "date") {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy("date");
              setSortOrder("asc");
            }
          }}
          className="p-0 hover:bg-transparent"
        >
          Added On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditProduct(product)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteProduct(product)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
  
  // Calculate inventory statistics
  const totalProducts = products.length;
  const outOfStockProducts = products.filter((p: Product) => p.inventory === 0).length;
  const lowStockProducts = products.filter((p: Product) => p.inventory > 0 && p.inventory < 5).length;
  const inStockProducts = products.filter((p: Product) => p.inventory >= 5).length;
  
  // Loading state
  if (isBusinessLoading || isProductsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (businessError || productsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2 max-w-md text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h2 className="text-xl font-semibold text-red-500">Error Loading Data</h2>
            <p className="text-muted-foreground">
              {businessError instanceof Error
                ? businessError.message
                : productsError instanceof Error
                ? productsError.message
                : "Failed to load data"}
            </p>
            <Button onClick={() => router.push(`/business/${businessId}`)} className="mt-4">
              Back to Business
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex flex-col gap-4">
          <Button 
            variant="outline" 
            className="w-fit"
            onClick={() => router.push(`/business/${businessId}/profile`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Business Profile
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {business?.name} - Inventory
              </h1>
              <p className="text-muted-foreground">
                Manage product inventory and stock levels
              </p>
            </div>
          </div>
        </div>
        
        {/* Inventory Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{inStockProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="in_stock">In Stock</TabsTrigger>
            <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
            <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Products Found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No products match your search criteria."
                    : activeTab === "all"
                    ? "This business hasn't added any products yet."
                    : activeTab === "in_stock"
                    ? "No products are currently in stock."
                    : activeTab === "low_stock"
                    ? "No products are currently low in stock."
                    : "No products are currently out of stock."}
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredProducts}
                searchColumn="name"
                searchPlaceholder="Filter products..."
              />
            )}
          </TabsContent>
        </Tabs>
        
        {/* Low Stock Warning */}
        {lowStockProducts > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-start gap-4 p-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Low Stock Alert</h3>
                <p className="text-sm text-yellow-700">
                  This business has {lowStockProducts} product(s) with low inventory levels.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Out of Stock Warning */}
        {outOfStockProducts > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-start gap-4 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Out of Stock Alert</h3>
                <p className="text-sm text-red-700">
                  This business has {outOfStockProducts} product(s) that are currently out of stock.
                  These items are not available for purchase until restocked.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Edit Modal */}
      {selectedProduct && (
        <InventoryEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
          onUpdate={handleInventoryUpdate}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{selectedProduct?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

// Mock data for products
const mockProducts = [
  {
    id: "p1",
    name: "Premium Coffee Beans",
    description: "Freshly roasted Ethiopian coffee beans, 500g package",
    price: 350.00,
    inventory: 45,
    sku: "COF-001",
    category: "Coffee",
    images: ["/placeholder-product.jpg"],
    status: "in_stock",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
  },
  {
    id: "p2",
    name: "Handmade Ceramic Mug",
    description: "Artisan crafted ceramic mug, perfect for coffee or tea",
    price: 250.00,
    inventory: 20,
    sku: "MUG-002",
    category: "Kitchenware",
    images: ["/placeholder-product.jpg"],
    status: "in_stock",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
  },
  {
    id: "p3",
    name: "Coffee Grinder",
    description: "Manual coffee grinder with adjustable settings",
    price: 650.00,
    inventory: 12,
    sku: "GRD-003",
    category: "Kitchenware",
    images: ["/placeholder-product.jpg"],
    status: "in_stock",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
  },
  {
    id: "p4",
    name: "Coffee Gift Set",
    description: "Gift set including coffee beans, mug, and brewing guide",
    price: 850.00,
    inventory: 0,
    sku: "GFT-004",
    category: "Gift Sets",
    images: ["/placeholder-product.jpg"],
    status: "out_of_stock",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 90 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 days ago
  },
  {
    id: "p5",
    name: "Coffee Filter Papers",
    description: "Pack of 100 filter papers for pour-over coffee",
    price: 120.00,
    inventory: 75,
    sku: "FLT-005",
    category: "Accessories",
    images: ["/placeholder-product.jpg"],
    status: "in_stock",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
];

interface ProductsContentProps {
  businessId: string;
}

export default function ProductsContent({ businessId }: ProductsContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      // In a real app, you would call an API to delete the product
      setProducts(products.filter((product) => product.id !== productId));
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
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.map((product) => (
                      <TableRow key={product.id}>
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
                            variant={product.status === "in_stock" ? "default" : "secondary"}
                            className={
                              product.status === "in_stock"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }
                          >
                            {product.status === "in_stock" ? "In Stock" : "Out of Stock"}
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
                              onClick={() => handleEditProduct(product.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
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
                    onClick={() => router.push(`/business/${businessId}/products/new`)}
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
                    <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
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
                      <p className="text-xl font-bold">{selectedProduct.inventory}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">SKU</p>
                      <p className="text-muted-foreground">{selectedProduct.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-muted-foreground">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge
                        variant={selectedProduct.status === "in_stock" ? "default" : "secondary"}
                        className={
                          selectedProduct.status === "in_stock"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {selectedProduct.status === "in_stock" ? "In Stock" : "Out of Stock"}
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
                  onClick={() => handleEditProduct(selectedProduct.id)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteProduct(selectedProduct.id);
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

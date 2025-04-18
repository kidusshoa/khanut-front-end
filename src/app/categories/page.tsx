"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Grid, 
  Layers, 
  Loader2,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryApi } from "@/services/category";
import { toast } from "react-hot-toast";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await categoryApi.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (icon: string) => {
    // In a real app, you would have a mapping of icon names to components
    // For now, we'll just return a default icon
    return <Layers className="h-8 w-8 text-orange-500" />;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
        
        <Button 
          onClick={() => router.push("/search")}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Grid className="mr-2 h-4 w-4" />
          Browse All Services
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card 
              key={category._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/categories/${category._id}`)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="mb-4">
                  {category.icon ? getCategoryIcon(category.icon) : <Layers className="h-8 w-8 text-orange-500" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="mt-auto text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  Browse Services
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-500 mb-6">
            There are no service categories available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}

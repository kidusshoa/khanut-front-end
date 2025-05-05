"use client";

import { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface SearchFilters {
  category?: string;
  serviceTypes?: string[];
  serviceType?: string;
  minRating?: number;
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  categories: string[];
  onFilterChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

export default function AdvancedSearchFilters({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
}: AdvancedSearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 5000,
  ]);

  // Service types options
  const serviceTypeOptions = [
    { value: "appointment", label: "Appointments" },
    { value: "product", label: "Products" },
    { value: "in_person", label: "In-Person Services" },
  ];

  // Sort options
  const sortOptions = [
    { value: "rating", label: "Rating" },
    { value: "name", label: "Name" },
    { value: "price", label: "Price" },
    { value: "createdAt", label: "Newest" },
  ];

  // Handle local filter changes
  const handleLocalFilterChange = (key: keyof SearchFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle service type checkbox changes
  const handleServiceTypeChange = (type: string, checked: boolean) => {
    setLocalFilters((prev) => {
      const currentTypes = prev.serviceTypes || [];
      if (checked) {
        return { ...prev, serviceTypes: [...currentTypes, type] };
      } else {
        return {
          ...prev,
          serviceTypes: currentTypes.filter((t) => t !== type),
        };
      }
    });
  };

  // Handle price range changes
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setLocalFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setLocalFilters({});
    setPriceRange([0, 5000]);
    onClearFilters();
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.serviceTypes && filters.serviceTypes.length > 0) count++;
    if (filters.serviceType) count++;
    if (filters.minRating) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.sortBy) count++;
    return count;
  };

  const activeFilterCount = countActiveFilters();

  return (
    <div className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="ml-1 bg-orange-600 hover:bg-orange-700">
                  {activeFilterCount}
                </Badge>
              )}
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        <CollapsibleContent>
          <div className="p-4 border rounded-lg mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Category</Label>
              <Select
                value={localFilters.category || ""}
                onValueChange={(value) =>
                  handleLocalFilterChange("category", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service types filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Service Types
              </Label>
              <div className="space-y-2">
                {serviceTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-type-${option.value}`}
                      checked={
                        localFilters.serviceTypes?.includes(option.value) ||
                        false
                      }
                      onCheckedChange={(checked) =>
                        handleServiceTypeChange(
                          option.value,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`service-type-${option.value}`}
                      className="text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Minimum Rating
              </Label>
              <div className="flex items-center space-x-2">
                <Select
                  value={localFilters.minRating?.toString() || ""}
                  onValueChange={(value) =>
                    handleLocalFilterChange(
                      "minRating",
                      value ? parseFloat(value) : undefined
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any rating</SelectItem>
                    <SelectItem value="3">
                      <div className="flex items-center">
                        <span className="mr-2">3+</span>
                        <div className="flex">
                          {[1, 2, 3].map((star) => (
                            <Star
                              key={star}
                              className="h-3 w-3 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="4">
                      <div className="flex items-center">
                        <span className="mr-2">4+</span>
                        <div className="flex">
                          {[1, 2, 3, 4].map((star) => (
                            <Star
                              key={star}
                              className="h-3 w-3 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="4.5">
                      <div className="flex items-center">
                        <span className="mr-2">4.5+</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-3 w-3 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price range filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Price Range (ETB)
              </Label>
              <div className="pt-6 px-2">
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={5000}
                  step={100}
                  onValueChange={handlePriceRangeChange}
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{priceRange[0]} ETB</span>
                  <span>{priceRange[1]} ETB</span>
                </div>
              </div>
            </div>

            {/* Sort options */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Sort By</Label>
              <div className="flex gap-2">
                <Select
                  value={localFilters.sortBy || ""}
                  onValueChange={(value) =>
                    handleLocalFilterChange("sortBy", value || undefined)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default</SelectItem>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={localFilters.order || "desc"}
                  onValueChange={(value) =>
                    handleLocalFilterChange(
                      "order",
                      value as "asc" | "desc"
                    )
                  }
                  disabled={!localFilters.sortBy}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Highest</SelectItem>
                    <SelectItem value="asc">Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Apply filters button */}
            <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
              <Button
                onClick={applyFilters}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

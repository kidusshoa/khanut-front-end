"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Edit, TestTube } from "lucide-react";
import { adminPicksApi } from "@/services/adminPicks";

interface CustomerPreference {
  customerId: string;
  preferredCategories: string[];
  description: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

export default function AdminPicksManager() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<CustomerPreference[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testCustomerId, setTestCustomerId] = useState<string>("");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestLoading, setIsTestLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all in parallel
      const [preferencesData, categoriesData, customersData] =
        await Promise.all([
          adminPicksApi.getAdminPicks(),
          adminPicksApi.getAdminPicksCategories(),
          adminPicksApi.getCustomersForAdminPicks(),
        ]);

      setPreferences(preferencesData);
      setCategories(categoriesData);
      setAvailableCustomers(customersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  // Handle adding/editing preference
  const handleSavePreference = async () => {
    try {
      if (isEditMode) {
        // Update existing preference
        await adminPicksApi.updateAdminPick(
          editingCustomerId,
          selectedCategories,
          description
        );
        toast.success("Preference updated successfully");
      } else {
        // Add new preference
        if (!selectedCustomer) {
          toast.error("Please select a customer");
          return;
        }

        await adminPicksApi.updateAdminPick(
          selectedCustomer,
          selectedCategories,
          description
        );
        toast.success("Preference added successfully");
      }

      // Reset form and refresh data
      resetForm();
      fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving preference:", error);
      toast.error("Failed to save preference");
    }
  };

  // Handle editing preference
  const handleEditPreference = (preference: CustomerPreference) => {
    setIsEditMode(true);
    setEditingCustomerId(preference.customerId);
    setSelectedCategories(preference.preferredCategories);
    setDescription(preference.description);
    setIsDialogOpen(true);
  };

  // Handle testing recommendations
  const handleTestRecommendations = async (customerId: string) => {
    setIsTestLoading(true);
    setTestResults([]);
    setIsTestDialogOpen(true);
    setTestCustomerId(customerId);
    try {
      const results = await adminPicksApi.testAdminPicks(customerId);
      setTestResults(results);
    } catch (error) {
      console.error("Error testing recommendations:", error);
      toast.error("Failed to test recommendations");
    } finally {
      setIsTestLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setIsEditMode(false);
    setEditingCustomerId("");
    setSelectedCustomer("");
    setSelectedCategories([]);
    setDescription("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Admin Picks</CardTitle>
            <CardDescription>
              Manage personalized recommendations for specific customers
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchData}
              variant="outline"
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode
                      ? "Edit Customer Preferences"
                      : "Add Customer Preferences"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode
                      ? "Update the recommendation preferences for this customer"
                      : "Set up personalized recommendation preferences for a customer"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {!isEditMode && (
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Select
                        value={selectedCustomer}
                        onValueChange={setSelectedCustomer}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCustomers.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              {customer.name} ({customer.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Preferred Categories</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([
                                  ...selectedCategories,
                                  category,
                                ]);
                              } else {
                                setSelectedCategories(
                                  selectedCategories.filter(
                                    (cat) => cat !== category
                                  )
                                );
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="capitalize"
                          >
                            {category.replace(/_/g, " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the customer's preferences"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSavePreference}>
                    {isEditMode ? "Update" : "Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : preferences.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Preferred Categories</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preferences.map((preference) => (
                <TableRow key={preference.customerId}>
                  <TableCell>
                    {preference.user ? (
                      <div>
                        <div className="font-medium">
                          {preference.user.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {preference.user.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {preference.customerId}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {preference.preferredCategories.map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="capitalize"
                        >
                          {category.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{preference.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleTestRecommendations(preference.customerId)
                        }
                      >
                        <TestTube className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPreference(preference)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No Admin Picks configured yet.</p>
            <p className="mt-2">
              Click &quot;Add Customer&quot; to set up personalized
              recommendations.
            </p>
          </div>
        )}
      </CardContent>

      {/* Test Results Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Test Recommendations</DialogTitle>
            <DialogDescription>
              Preview the recommendations that will be shown to this customer
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isTestLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : testResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResults.map((result) => (
                  <Card key={result._id}>
                    <div className="aspect-video relative overflow-hidden">
                      {result.coverImage ? (
                        <img
                          src={result.coverImage}
                          alt={result.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{result.name}</h3>
                      <div className="flex items-center mt-1 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {result.category}
                        </Badge>
                        <div className="ml-auto flex items-center">
                          <span className="text-amber-500 font-medium">
                            {result.predictionScore}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.description || "No description available"}
                      </p>
                      {result.recommendationReason && (
                        <p className="text-sm mt-2 text-muted-foreground italic">
                          {result.recommendationReason}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recommendations found for this customer.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTestDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

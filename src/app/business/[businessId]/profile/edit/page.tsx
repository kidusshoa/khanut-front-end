"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, ArrowLeft, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getBusinessDetails, updateBusinessProfile, updateBusinessPicture } from "@/services/businessApi";

// Business categories
const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Retail",
  "Healthcare",
  "Beauty & Wellness",
  "Professional Services",
  "Education",
  "Technology",
  "Entertainment",
  "Automotive",
  "Home Services",
  "Other"
];

// Business types
const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Corporation",
  "Limited Liability Company (LLC)",
  "Cooperative",
  "Nonprofit Organization",
  "Franchise",
  "Other"
];

// Ethiopian cities
const ETHIOPIAN_CITIES = [
  "Addis Ababa",
  "Dire Dawa",
  "Mekelle",
  "Gondar",
  "Bahir Dar",
  "Hawassa",
  "Adama",
  "Jimma",
  "Dessie",
  "Debre Berhan",
  "Jijiga",
  "Shashamane",
  "Bishoftu",
  "Sodo",
  "Arba Minch",
  "Hosaena",
  "Harar",
  "Dilla",
  "Nekemte",
  "Debre Markos",
  "Kombolcha",
  "Debre Tabor",
  "Asella",
  "Woldiya",
  "Axum",
  "Gambella",
  "Burayu",
  "Shire",
  "Ambo",
  "Arsi Negele",
  "Other"
];

export default function BusinessProfileEditPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    city: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    businessType: "",
    latitude: "",
    longitude: "",
    openingHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "10:00", close: "15:00", closed: false },
      sunday: { open: "10:00", close: "15:00", closed: true },
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      tiktok: "",
      youtube: "",
    }
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Fetch business details
  const { data: business, isLoading, error } = useQuery({
    queryKey: ["businessProfile", businessId],
    queryFn: () => getBusinessDetails(businessId),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => updateBusinessProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessProfile", businessId] });
      toast.success("Business profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update business profile");
      console.error("Update error:", error);
    }
  });
  
  // Update profile picture mutation
  const updatePictureMutation = useMutation({
    mutationFn: (file: File) => updateBusinessPicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessProfile", businessId] });
      toast.success("Profile picture updated successfully");
      setProfileImage(null);
    },
    onError: (error) => {
      toast.error("Failed to update profile picture");
      console.error("Update picture error:", error);
    }
  });
  
  // Initialize form with business data
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        description: business.description || "",
        category: business.category || "",
        city: business.city || "",
        email: business.email || "",
        phone: business.phone || "",
        website: business.website || "",
        address: business.address || "",
        businessType: business.businessType || "",
        latitude: business.location?.coordinates?.[1]?.toString() || "",
        longitude: business.location?.coordinates?.[0]?.toString() || "",
        openingHours: business.openingHours || {
          monday: { open: "09:00", close: "17:00", closed: false },
          tuesday: { open: "09:00", close: "17:00", closed: false },
          wednesday: { open: "09:00", close: "17:00", closed: false },
          thursday: { open: "09:00", close: "17:00", closed: false },
          friday: { open: "09:00", close: "17:00", closed: false },
          saturday: { open: "10:00", close: "15:00", closed: false },
          sunday: { open: "10:00", close: "15:00", closed: true },
        },
        socialMedia: business.socialMedia || {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          tiktok: "",
          youtube: "",
        }
      });
    }
  }, [business]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle social media change
  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };
  
  // Handle opening hours change
  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day as keyof typeof prev.openingHours],
          [field]: value
        }
      }
    }));
  };
  
  // Handle closed day toggle
  const handleClosedToggle = (day: string, closed: boolean) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day as keyof typeof prev.openingHours],
          closed
        }
      }
    }));
  };
  
  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update profile
      await updateProfileMutation.mutateAsync(formData);
      
      // Update profile picture if selected
      if (profileImage) {
        await updatePictureMutation.mutateAsync(profileImage);
      }
      
      // Navigate back to profile page
      router.push(`/business/${businessId}/profile`);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-muted-foreground">Loading business profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2 max-w-md text-center">
            <h2 className="text-xl font-semibold text-red-500">
              Error Loading Business
            </h2>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Failed to load business details"}
            </p>
            <Button onClick={() => router.push(`/business/${businessId}`)} className="mt-4">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Business Profile</h1>
            <p className="text-muted-foreground">
              Update your business information and settings
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/business/${businessId}/profile`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Upload a profile picture for your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage 
                        src={profileImagePreview || business?.profilePicture} 
                        alt={business?.name} 
                      />
                      <AvatarFallback className="text-3xl">
                        {business?.name?.charAt(0) || "B"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Label 
                    htmlFor="profile-picture" 
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Label>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      type="button" 
                      variant={activeTab === "basic" ? "default" : "ghost"} 
                      className="justify-start"
                      onClick={() => setActiveTab("basic")}
                    >
                      Basic Information
                    </Button>
                    <Button 
                      type="button" 
                      variant={activeTab === "contact" ? "default" : "ghost"} 
                      className="justify-start"
                      onClick={() => setActiveTab("contact")}
                    >
                      Contact & Location
                    </Button>
                    <Button 
                      type="button" 
                      variant={activeTab === "hours" ? "default" : "ghost"} 
                      className="justify-start"
                      onClick={() => setActiveTab("hours")}
                    >
                      Business Hours
                    </Button>
                    <Button 
                      type="button" 
                      variant={activeTab === "social" ? "default" : "ghost"} 
                      className="justify-start"
                      onClick={() => setActiveTab("social")}
                    >
                      Social Media
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="space-y-6">
              {/* Basic Information */}
              {activeTab === "basic" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Update your business name, description, and category
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Business Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={5}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Business Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleSelectChange("category", value)}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select
                          value={formData.businessType}
                          onValueChange={(value) => handleSelectChange("businessType", value)}
                        >
                          <SelectTrigger id="businessType">
                            <SelectValue placeholder="Select a business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Contact & Location */}
              {activeTab === "contact" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact & Location</CardTitle>
                    <CardDescription>
                      Update your contact information and business location
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => handleSelectChange("city", value)}
                      >
                        <SelectTrigger id="city">
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          {ETHIOPIAN_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude (Optional)</Label>
                        <Input
                          id="latitude"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          placeholder="e.g., 9.0222"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude (Optional)</Label>
                        <Input
                          id="longitude"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          placeholder="e.g., 38.7468"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Business Hours */}
              {activeTab === "hours" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Hours</CardTitle>
                    <CardDescription>
                      Set your regular business hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                      const dayData = formData.openingHours[day as keyof typeof formData.openingHours];
                      return (
                        <div key={day} className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-4 items-center">
                          <div className="font-medium capitalize">{day}</div>
                          <Input
                            type="time"
                            value={dayData.open}
                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                            disabled={dayData.closed}
                          />
                          <Input
                            type="time"
                            value={dayData.close}
                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                            disabled={dayData.closed}
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`closed-${day}`}
                              checked={dayData.closed}
                              onChange={(e) => handleClosedToggle(day, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor={`closed-${day}`} className="text-sm">Closed</Label>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
              
              {/* Social Media */}
              {activeTab === "social" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                    <CardDescription>
                      Add your social media profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.socialMedia.facebook}
                        onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                        placeholder="https://facebook.com/yourbusiness"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.socialMedia.instagram}
                        onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                        placeholder="https://instagram.com/yourbusiness"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={formData.socialMedia.twitter}
                        onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                        placeholder="https://twitter.com/yourbusiness"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.socialMedia.linkedin}
                        onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/company/yourbusiness"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tiktok">TikTok</Label>
                      <Input
                        id="tiktok"
                        value={formData.socialMedia.tiktok}
                        onChange={(e) => handleSocialMediaChange("tiktok", e.target.value)}
                        placeholder="https://tiktok.com/@yourbusiness"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={formData.socialMedia.youtube}
                        onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                        placeholder="https://youtube.com/c/yourbusiness"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardFooter className="flex justify-between pt-6">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => router.push(`/business/${businessId}/profile`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateProfileMutation.isPending || updatePictureMutation.isPending}
                  >
                    {(updateProfileMutation.isPending || updatePictureMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {!(updateProfileMutation.isPending || updatePictureMutation.isPending) && (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

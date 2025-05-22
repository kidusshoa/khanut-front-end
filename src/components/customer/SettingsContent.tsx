"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  LogOut,
  Save,
  Loader2,
  Camera,
  Trash2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import api from "@/services/api";

// Validation schemas
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\+?[0-9\s]{10,15}$/, "Please enter a valid phone number"),
  city: z.string().min(2, "City must be at least 2 characters"),
  profilePicture: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
  newPassword: z.string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

interface SettingsContentProps {
  customerId: string;
}

export default function SettingsContent({ customerId }: SettingsContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Profile form with validation
  const { 
    register: profileRegister, 
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
    watch: watchProfile
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      profilePicture: "",
    },
  });

  // Password form with validation
  const { 
    register: passwordRegister, 
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Notification form with validation
  const {
    register: notificationRegister,
    handleSubmit: handleNotificationSubmit,
    formState: { errors: notificationErrors },
    setValue: setNotificationValue,
    watch: watchNotification
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
    },
  });

  // Fetch user profile data
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["userProfile", customerId],
    queryFn: async () => {
      try {
        // This would be a real API call in production
        // const response = await api.get(`/users/${customerId}`);
        // return response.data;
        
        // Mock data for development
        return {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+251 91 234 5678",
          city: "Addis Ababa",
          profilePicture: "",
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
        };
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile");
        return null;
      }
    },
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData) {
      // Update profile form
      setProfileValue("name", userData.name || "");
      setProfileValue("email", userData.email || "");
      setProfileValue("phone", userData.phone || "");
      setProfileValue("city", userData.city || "");
      setProfileValue("profilePicture", userData.profilePicture || "");
      
      // Update notification form
      setNotificationValue("emailNotifications", userData.emailNotifications || false);
      setNotificationValue("pushNotifications", userData.pushNotifications || false);
      setNotificationValue("marketingEmails", userData.marketingEmails || false);
    }
  }, [userData, setProfileValue, setNotificationValue]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      setIsLoading(true);
      try {
        // This would be a real API call in production
        // const response = await api.put(`/users/${customerId}/profile`, data);
        // return response.data;
        
        // Mock response for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          message: "Profile updated successfully",
        };
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", customerId] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile");
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      setIsLoading(true);
      try {
        // This would be a real API call in production
        // const response = await api.put(`/users/${customerId}/password`, {
        //   currentPassword: data.currentPassword,
        //   newPassword: data.newPassword,
        // });
        // return response.data;
        
        // Mock response for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validate current password (mock validation)
        if (data.currentPassword !== "password123") {
          throw new Error("Current password is incorrect");
        }
        
        return {
          success: true,
          message: "Password updated successfully",
        };
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      resetPassword();
      toast.success("Password updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update password");
    },
  });
  
  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      setIsLoading(true);
      try {
        // This would be a real API call in production
        // const response = await api.put(`/users/${customerId}/notifications`, data);
        // return response.data;
        
        // Mock response for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          data: {
            emailNotifications: data.emailNotifications,
            pushNotifications: data.pushNotifications,
            marketingEmails: data.marketingEmails,
          },
        };
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", customerId] });
      toast.success("Notification preferences updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update notification preferences");
    },
  });
  
  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
  };
  
  const onNotificationSubmit = (data: NotificationFormValues) => {
    updateNotificationsMutation.mutate(data);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // This would be a real API call in production
      // await api.delete(`/users/${customerId}`);
      
      // Mock deletion for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await signOut({ redirect: false });
      router.push("/login");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isUserLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          {watchProfile("profilePicture") ? (
                            <AvatarImage src={watchProfile("profilePicture")} alt={watchProfile("name")} />
                          ) : (
                            <AvatarFallback className="text-2xl">
                              {watchProfile("name")?.charAt(0) || "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background"
                        >
                          <Camera className="h-4 w-4" />
                          <span className="sr-only">Upload profile picture</span>
                        </Button>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              <User className="mr-2 inline-block h-4 w-4" />
                              Full Name
                            </Label>
                            <Input
                              id="name"
                              placeholder="Enter your full name"
                              {...profileRegister("name")}
                            />
                            {profileErrors.name && (
                              <p className="text-sm text-red-500">{profileErrors.name.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">
                              <Mail className="mr-2 inline-block h-4 w-4" />
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              {...profileRegister("email")}
                            />
                            {profileErrors.email && (
                              <p className="text-sm text-red-500">{profileErrors.email.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">
                              <Phone className="mr-2 inline-block h-4 w-4" />
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              placeholder="Enter your phone number"
                              {...profileRegister("phone")}
                            />
                            {profileErrors.phone && (
                              <p className="text-sm text-red-500">{profileErrors.phone.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">
                              <MapPin className="mr-2 inline-block h-4 w-4" />
                              City
                            </Label>
                            <Input
                              id="city"
                              placeholder="Enter your city"
                              {...profileRegister("city")}
                            />
                            {profileErrors.city && (
                              <p className="text-sm text-red-500">{profileErrors.city.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          className="pl-10 pr-10"
                          {...passwordRegister("currentPassword")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="pl-10 pr-10"
                          {...passwordRegister("newPassword")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showNewPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className="pl-10 pr-10"
                          {...passwordRegister("confirmPassword")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>
                    Manage your account settings and security options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Sign Out</h4>
                      <p className="text-sm text-muted-foreground">
                        Sign out of your account on this device
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all your data
                      </p>
                    </div>
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about your bookings and orders via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        {...notificationRegister("emailNotifications")}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications on your device
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        {...notificationRegister("pushNotifications")}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketingEmails">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional emails and special offers
                        </p>
                      </div>
                      <Switch
                        id="marketingEmails"
                        {...notificationRegister("marketingEmails")}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Bell className="mr-2 h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerDashboardLayout>
  );
}

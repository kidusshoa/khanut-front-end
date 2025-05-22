"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Validation schemas
const accountFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[0-9\s]{10,15}$/, "Please enter a valid phone number"),
  notificationsEnabled: z.boolean(),
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

type AccountFormValues = z.infer<typeof accountFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, AlertTriangle, LogOut } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { businessDetailApi } from "@/services/businessDetail";
import { signOut } from "next-auth/react";

interface SettingsContentProps {
  businessId: string;
}

export default function SettingsContent({ businessId }: SettingsContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("account");
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account settings form with validation
  const { 
    register: accountRegister, 
    handleSubmit: handleAccountSubmit,
    formState: { errors: accountErrors },
    setValue: setAccountValue,
    watch: watchAccount
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      notificationsEnabled: true,
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

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
    newReviewAlerts: true,
  });

  // Fetch business details
  const {
    data: business,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["businessDetail", businessId],
    queryFn: () => businessDetailApi.getBusinessById(businessId),
    enabled: !!businessId,
  });

  // Initialize form with business data
  useEffect(() => {
    if (business && session?.user) {
      setAccountValue("email", session.user.email || "");
      setAccountValue("name", session.user.name || "");
      setAccountValue("phone", business.phone || "");
      setAccountValue("notificationsEnabled", true);
    }
  }, [business, session, setAccountValue]);

  // We don't need these handlers anymore as React Hook Form handles the input changes

  // Handle notification toggle
  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  // Save account settings
  const onAccountSubmit = async (data: AccountFormValues) => {
    setIsSaving(true);
    try {
      // API call would go here
      console.log("Saving account settings:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Account settings saved successfully");
    } catch (error) {
      console.error("Error saving account settings:", error);
      toast.error("Failed to save account settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      // API call would go here
      console.log("Changing password:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Password changed successfully");
      resetPassword(); // Reset form after successful submission
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Save notification settings
  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Notification settings saved successfully");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification settings");
    } finally {
      setIsSaving(false);
    }
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
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Settings</h2>
          <p className="text-muted-foreground mb-4">
            There was a problem loading your settings. Please try again.
          </p>
          <Button onClick={() => router.refresh()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Separator />

        <Tabs
          defaultValue="account"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account information and email preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form className="space-y-6" onSubmit={handleAccountSubmit(onAccountSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        {...accountRegister("email")}
                        type="email"
                        placeholder="Enter your email"
                      />
                      {accountErrors.email && (
                        <p className="text-sm text-red-500">{accountErrors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        {...accountRegister("name")}
                        type="text"
                        placeholder="Enter your name"
                      />
                      {accountErrors.name && (
                        <p className="text-sm text-red-500">{accountErrors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...accountRegister("phone")}
                        type="tel"
                        placeholder="Enter your phone number"
                      />
                      {accountErrors.phone && (
                        <p className="text-sm text-red-500">{accountErrors.phone.message}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notifications"
                        {...accountRegister("notificationsEnabled")}
                        checked={watchAccount("notificationsEnabled")}
                        onCheckedChange={(checked) => {
                          setAccountValue("notificationsEnabled", checked === true);
                        }}
                      />
                      <label
                        htmlFor="notifications"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable notifications
                      </label>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full sm:w-auto"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      {...passwordRegister("currentPassword")}
                      type="password"
                      placeholder="Enter your current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      {...passwordRegister("newPassword")}
                      type="password"
                      placeholder="Enter your new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      {...passwordRegister("confirmPassword")}
                      type="password"
                      placeholder="Confirm your new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full mt-4"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive general email notifications
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() =>
                      handleNotificationToggle("emailNotifications")
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders about upcoming appointments
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.appointmentReminders}
                    onCheckedChange={() =>
                      handleNotificationToggle("appointmentReminders")
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and offers
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={() =>
                      handleNotificationToggle("marketingEmails")
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Review Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you receive new reviews
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.newReviewAlerts}
                    onCheckedChange={() =>
                      handleNotificationToggle("newReviewAlerts")
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveNotificationSettings}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

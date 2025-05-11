"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
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

  // Account settings form
  const [accountForm, setAccountForm] = useState({
    email: "",
    name: "",
    phone: "",
    notificationsEnabled: true,
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
      setAccountForm({
        email: session.user.email || "",
        name: session.user.name || "",
        phone: business.phone || "",
        notificationsEnabled: true,
      });
    }
  }, [business, session]);

  // Handle account form input change
  const handleAccountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password form input change
  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  // Save account settings
  const handleSaveAccountSettings = async () => {
    setIsSaving(true);
    try {
      // API call would go here
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
  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={accountForm.name}
                    onChange={handleAccountInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={accountForm.email}
                    onChange={handleAccountInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={accountForm.phone}
                    onChange={handleAccountInputChange}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifications"
                    checked={accountForm.notificationsEnabled}
                    onCheckedChange={(checked) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        notificationsEnabled: checked,
                      }))
                    }
                  />
                  <Label htmlFor="notifications">
                    Enable email notifications
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveAccountSettings}
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
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logout</CardTitle>
                <CardDescription>
                  Sign out of your account on this device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full sm:w-auto"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
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
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="bg-orange-600 hover:bg-orange-700"
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
              </CardFooter>
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

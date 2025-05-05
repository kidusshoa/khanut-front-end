"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  ShieldCheck,
  Heart,
  Clock,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoutButton } from "@/components/ui/logout-button";
import { ProfilePictureUpload } from "@/components/customer/ProfilePictureUpload";
import { userService, CustomerProfile } from "@/services/user";
import { toast } from "react-hot-toast";

export default function CustomerProfilePage({
  params,
}: {
  params: { customerId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Check if user is accessing their own profile
    if (status === "authenticated" && session?.user?.id !== params.customerId) {
      toast.error("You can only view your own profile");
      router.push(`/customer/${session?.user?.id}/profile`);
      return;
    }

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getCustomerProfile();
        setProfile(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          location: data.location || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, session, params.customerId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateCustomerProfile(formData);
      setProfile((prev: any) => ({ ...prev, ...formData }));
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto mt-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your personal information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              router.push(`/customer/${params.customerId}/settings`)
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <LogoutButton variant="destructive" />
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Clock className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart className="h-4 w-4" />
            Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="relative pb-2">
              <div className="flex flex-col items-center">
                <ProfilePictureUpload
                  currentImage={profile?.profilePicture}
                  name={profile?.name}
                  onUploadSuccess={(imageUrl) => {
                    setProfile((prev) =>
                      prev ? { ...prev, profilePicture: imageUrl } : null
                    );
                  }}
                />
                <CardTitle className="text-xl">{profile?.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {profile?.email}
                </CardDescription>
                <Badge variant="outline" className="mt-2 gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Customer
                </Badge>
              </div>
              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>

            <CardContent className="pt-4">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Your location"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: profile?.name || "",
                          phone: profile?.phone || "",
                          location: profile?.location || "",
                        });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-orange-500" />
                        {profile?.name || "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Email Address
                      </p>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-orange-500" />
                        {profile?.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-orange-500" />
                        {profile?.phone || "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        {profile?.location || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Member Since
                      </p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent appointments, orders, and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Activity history will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Businesses</CardTitle>
              <CardDescription>
                Businesses you've saved as favorites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Your favorite businesses will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

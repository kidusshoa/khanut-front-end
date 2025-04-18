"use client";

import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Trash2,
  X,
  RefreshCw,
  UserPlus,
  Filter,
  MoreHorizontal,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  createdAt: string;
  role?: string;
  avatar?: string;
  lastLogin?: string;
  status?: "active" | "inactive" | "suspended";
}

export default function ManageUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchUsers = async () => {
    setRefreshing(true);
    const accessToken = Cookies.get("client-token");

    if (!accessToken) {
      router.push("/login");
      return;
    }

    try {
      const res = await axios.get(
        "https://khanut.onrender.com/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Add some mock data for UI demonstration
      const enhancedUsers = res.data.users.map((user: UserData) => ({
        ...user,
        role: user.role || "customer",
        status: Math.random() > 0.8 ? "inactive" : "active",
        lastLogin: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 86400000
        ).toISOString(),
      }));

      setUsers(enhancedUsers);
      setError(null);
    } catch (err) {
      toast.error("Failed to load users");
      console.error(err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (action: "warn" | "delete") => {
    if (!selectedUser || (action === "warn" && !reason.trim())) {
      toast.error("Please provide a reason.");
      return;
    }

    const confirmed = confirm(`Are you sure you want to ${action} this user?`);
    if (!confirmed) return;

    try {
      const accessToken = Cookies.get("client-token");

      if (action === "warn") {
        await axios.post(
          `https://khanut.onrender.com/api/admin/users/${selectedUser._id}/warn`,
          { reason },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } else if (action === "delete") {
        await axios.delete(
          `https://khanut.onrender.com/api/admin/users/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      toast.success(`User ${action}ed successfully`);
      setSelectedUser(null);
      setReason("");
      fetchUsers();
    } catch (err) {
      toast.error(`Failed to ${action} user.`);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and active tab
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active")
      return matchesSearch && user.status === "active";
    if (activeTab === "inactive")
      return matchesSearch && user.status === "inactive";

    return matchesSearch;
  });

  // Render loading skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="gap-2" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all users on the platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchUsers}
            variant="outline"
            className="gap-2"
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <User className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <Badge
                variant="success"
                className="h-2 w-2 p-0 rounded-full mr-1"
              />
              Active
            </TabsTrigger>
            <TabsTrigger value="inactive" className="gap-2">
              <Badge
                variant="outline"
                className="h-2 w-2 p-0 rounded-full mr-1"
              />
              Inactive
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* User cards */}
      {filteredUsers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">No users found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <User size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{user.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={user.status === "active" ? "success" : "outline"}
                    >
                      {user.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2 text-sm">
                    {user.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                      {user.lastLogin && (
                        <span className="text-xs">
                          Last active:{" "}
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>View Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-yellow-600">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>Warn User</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete User</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card className="bg-orange-50 border-orange-100">
        <CardContent className="flex flex-col md:flex-row justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Total: {users.length} users</span>
            <span className="text-sm text-muted-foreground">
              ({users.filter((u) => u.status === "active").length} active,{" "}
              {users.filter((u) => u.status !== "active").length} inactive)
            </span>
          </div>
          <Button variant="outline" size="sm" className="gap-1 mt-2 md:mt-0">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </Button>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Transition appear show={!!selectedUser} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedUser(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-bold text-gray-900">
                      User Profile
                    </Dialog.Title>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <User size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedUser?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedUser?.email}
                      </p>
                      <Badge
                        variant={
                          selectedUser?.status === "active"
                            ? "success"
                            : "outline"
                        }
                        className="mt-1"
                      >
                        {selectedUser?.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm">
                          {selectedUser?.phone || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm">
                          {selectedUser?.location || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="text-sm">
                          {new Date(
                            selectedUser?.createdAt || ""
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="text-sm">
                          {selectedUser?.role || "Customer"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for action:
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-3 border rounded-md text-sm"
                        rows={3}
                        placeholder="Write your reason here..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-between gap-3">
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleAction("delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete User
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                      onClick={() => handleAction("warn")}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Send Warning
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

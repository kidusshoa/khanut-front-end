"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Database,
  RefreshCw,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText,
  Brain,
  Activity,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { adminRecommendationApi, RecommendationServiceHealth, RecommendationStats } from "@/services/adminRecommendation";

export default function RecommendationsPage({ params }: { params: { adminId: string } }) {
  const { adminId } = params;
  const router = useRouter();
  const { data: session } = useSession();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [health, setHealth] = useState<RecommendationServiceHealth | null>(null);
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch recommendation health and stats
  const fetchRecommendationData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch health and stats in parallel
      const [healthData, statsData] = await Promise.all([
        adminRecommendationApi.getRecommendationHealth(),
        adminRecommendationApi.getRecommendationStats()
      ]);
      
      setHealth(healthData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Error fetching recommendation data:", err);
      setError(err.message || "Failed to fetch recommendation data");
      toast.error("Failed to fetch recommendation data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Trigger data sync and model retraining
  const handleSyncData = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const response = await adminRecommendationApi.syncRecommendationData();
      toast.success(response.message || "Recommendation data synced successfully");
      
      // Refresh data after sync
      await fetchRecommendationData();
    } catch (err: any) {
      console.error("Error syncing recommendation data:", err);
      toast.error(err.message || "Failed to sync recommendation data");
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    if (session) {
      fetchRecommendationData();
    }
  }, [session]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!session && !isLoading) {
      router.push(`/admin/${adminId}/login`);
    }
  }, [session, isLoading, router, adminId]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recommendation Engine</h1>
          <p className="text-muted-foreground">
            Manage and monitor the recommendation system.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchRecommendationData}
            variant="outline"
            className="gap-2"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button 
            onClick={handleSyncData}
            className="gap-2 bg-orange-600 hover:bg-orange-700"
            disabled={isSyncing}
          >
            <Database className={`h-4 w-4 ${isSyncing ? "animate-pulse" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync & Retrain"}
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Service Health Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Recommendation Service Health
          </CardTitle>
          <CardDescription>
            Status of the recommendation service and its components
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : health ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Service Status:</span>
                <Badge 
                  variant={health.status === "healthy" ? "success" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {health.status === "healthy" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {health.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span>Data Files:</span>
                  <Badge variant={health.data_files_exist ? "outline" : "destructive"}>
                    {health.data_files_exist ? "Available" : "Missing"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Model Files:</span>
                  <Badge variant={health.model_files_exist ? "outline" : "destructive"}>
                    {health.model_files_exist ? "Available" : "Missing"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>MongoDB Connection:</span>
                  <Badge variant={health.mongodb_connected ? "outline" : "destructive"}>
                    {health.mongodb_connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Version:</span>
                  <Badge variant="secondary">{health.version}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Could not connect to recommendation service</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recommendation System Statistics
          </CardTitle>
          <CardDescription>
            Data and model statistics for the recommendation engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Training Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Reviews</span>
                        <span className="font-medium">{stats.totalReviews}</span>
                      </div>
                      <Progress value={Math.min(stats.totalReviews / 10, 100)} />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Businesses</span>
                        <span className="font-medium">{stats.totalBusinesses}</span>
                      </div>
                      <Progress value={Math.min(stats.totalBusinesses / 5, 100)} />
                    </div>
                    
                    {stats.lastTrainingDate && (
                      <div className="pt-2">
                        <span className="text-sm text-muted-foreground">Last Trained:</span>
                        <span className="ml-2">
                          {new Date(stats.lastTrainingDate).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Model Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge 
                        variant={stats.modelStatus === "trained" ? "success" : "warning"}
                      >
                        {stats.modelStatus}
                      </Badge>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        {stats.modelStatus === "trained" 
                          ? "The recommendation model is trained and ready to use."
                          : "The recommendation model needs to be trained."}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleSyncData}
                      variant="outline" 
                      className="w-full"
                      disabled={isSyncing}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      {isSyncing ? "Training in progress..." : "Train Model"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Could not fetch recommendation statistics</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

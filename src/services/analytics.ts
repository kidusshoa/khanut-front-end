// Simple analytics service to track user interactions
import api from "./api";

export const analyticsService = {
  // Track business profile view
  trackBusinessView: async (businessId: string, customerId?: string) => {
    try {
      // Only log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`Analytics: Business view - businessId: ${businessId}, customerId: ${customerId || "anonymous"}`);
      }
      
      // In production, we would send this to the backend
      if (process.env.NODE_ENV === "production") {
        await api.post("/analytics/view", {
          businessId,
          customerId,
          eventType: "business_view",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.error("Failed to track business view:", error);
    }
  },
  
  // Track service view
  trackServiceView: async (serviceId: string, businessId: string, customerId?: string) => {
    try {
      // Only log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`Analytics: Service view - serviceId: ${serviceId}, businessId: ${businessId}, customerId: ${customerId || "anonymous"}`);
      }
      
      // In production, we would send this to the backend
      if (process.env.NODE_ENV === "production") {
        await api.post("/analytics/view", {
          serviceId,
          businessId,
          customerId,
          eventType: "service_view",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.error("Failed to track service view:", error);
    }
  },
  
  // Track user interaction
  trackInteraction: async (eventType: string, data: Record<string, any>) => {
    try {
      // Only log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`Analytics: ${eventType}`, data);
      }
      
      // In production, we would send this to the backend
      if (process.env.NODE_ENV === "production") {
        await api.post("/analytics/event", {
          eventType,
          data,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.error(`Failed to track ${eventType}:`, error);
    }
  }
};

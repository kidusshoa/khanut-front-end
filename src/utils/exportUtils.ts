/**
 * Utility functions for exporting data
 */

import { BusinessAnalytics } from "@/services/businessAnalyticsApi";

/**
 * Convert analytics data to CSV format
 * @param analytics Analytics data to convert
 * @returns CSV string
 */
export const analyticsToCSV = (analytics: BusinessAnalytics): string => {
  // Create CSV header
  const header = "Category,Metric,Value\n";
  
  // Create rows for revenue data
  const revenueRows = [
    `Revenue,Total,${analytics.revenue.total}`,
    `Revenue,Today,${analytics.revenue.today}`,
    `Revenue,This Week,${analytics.revenue.thisWeek}`,
    `Revenue,This Month,${analytics.revenue.thisMonth}`,
  ].join("\n");
  
  // Create rows for orders data
  const ordersRows = [
    `Orders,Total,${analytics.orders.total}`,
    `Orders,Today,${analytics.orders.today}`,
    `Orders,This Week,${analytics.orders.thisWeek}`,
    `Orders,This Month,${analytics.orders.thisMonth}`,
    `Orders,Pending,${analytics.orders.pending}`,
    `Orders,Completed,${analytics.orders.completed}`,
  ].join("\n");
  
  // Create rows for customers data
  const customersRows = [
    `Customers,Total,${analytics.customers.total}`,
    `Customers,New,${analytics.customers.new}`,
    `Customers,Returning,${analytics.customers.returning}`,
  ].join("\n");
  
  // Create rows for appointments data
  const appointmentsRows = [
    `Appointments,Total,${analytics.appointments.total}`,
    `Appointments,Today,${analytics.appointments.today}`,
    `Appointments,This Week,${analytics.appointments.thisWeek}`,
    `Appointments,Upcoming,${analytics.appointments.upcoming}`,
    `Appointments,Completed,${analytics.appointments.completed}`,
  ].join("\n");
  
  // Combine all rows
  return header + [revenueRows, ordersRows, customersRows, appointmentsRows].join("\n");
};

/**
 * Download data as a CSV file
 * @param data CSV string
 * @param filename Filename for the downloaded file
 */
export const downloadCSV = (data: string, filename: string): void => {
  // Create a blob with the CSV data
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  // Add the link to the document
  document.body.appendChild(link);
  
  // Click the link to download the file
  link.click();
  
  // Remove the link from the document
  document.body.removeChild(link);
};

/**
 * Export analytics data as CSV
 * @param analytics Analytics data to export
 * @param businessName Name of the business (for the filename)
 */
export const exportAnalyticsAsCSV = (
  analytics: BusinessAnalytics,
  businessName: string
): void => {
  const formattedBusinessName = businessName.replace(/\s+/g, "_").toLowerCase();
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const filename = `${formattedBusinessName}_analytics_${date}.csv`;
  
  const csvData = analyticsToCSV(analytics);
  downloadCSV(csvData, filename);
};

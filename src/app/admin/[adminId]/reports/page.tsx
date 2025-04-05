"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { FaDownload } from "react-icons/fa";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

interface ReportData {
  totalUsers: number;
  totalBusinesses: number;
  totalReviews: number;
  pendingApprovals: number;
  pendingReviews: number;
  monthlyUsers: { month: string; count: number }[];
  monthlyBusinesses: { month: string; count: number }[];
}

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const accessToken = Cookies.get('client-token');
        
        if (!accessToken) {
          router.push('/login');
          return;
        }

        const response = await fetch('https://khanut.onrender.com/api/admin/reports', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }

        const data: ReportData = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching report data:", error);
        setError("Failed to load report data");
        if (error instanceof Error && error.message.includes('401')) {
          Cookies.remove('client-token');
          Cookies.remove('user-role');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [router]);

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Exported CSV (simulated)");
    }, 1000);
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto py-8 px-4">Loading reports...</div>;
  }

  if (error) {
    return <div className="max-w-6xl mx-auto py-8 px-4 text-red-500">{error}</div>;
  }

  if (!reportData) {
    return <div className="max-w-6xl mx-auto py-8 px-4">No report data available</div>;
  }

 
  const businessData = reportData.monthlyBusinesses.map(item => ({
    name: item.month,
    businesses: item.count
  }));

  const reviewBreakdown = [
    { name: "Pending Reviews", value: reportData.pendingReviews },
    { name: "Total Reviews", value: reportData.totalReviews },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-orange-500 mb-6">
        Platform Reports
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-orange-600">{reportData.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500">Total Businesses</p>
          <p className="text-2xl font-bold text-orange-600">{reportData.totalBusinesses}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-2xl font-bold text-orange-600">{reportData.totalReviews}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-700 mb-4">
            New Businesses by Month
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={businessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="businesses" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-700 mb-4">
            Review Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reviewBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#82ca9d"
                label
              >
                {reviewBreakdown.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-10 text-right">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded shadow hover:bg-orange-700 disabled:opacity-50"
          onClick={handleExport}
          disabled={downloading}
        >
          <FaDownload /> {downloading ? "Exporting..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
}
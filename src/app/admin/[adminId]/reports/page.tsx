"use client";

import { useState } from "react";
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

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const stats = {
  users: 350,
  businesses: 120,
  reviews: 489,
};

const businessData = [
  { name: "Jan", businesses: 12 },
  { name: "Feb", businesses: 18 },
  { name: "Mar", businesses: 22 },
  { name: "Apr", businesses: 15 },
];

const reviewBreakdown = [
  { name: "1 Star", value: 30 },
  { name: "3 Star", value: 120 },
  { name: "5 Star", value: 339 },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Exported CSV (simulated)");
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        Platform Reports
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-blue-600">{stats.users}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500">Total Businesses</p>
          <p className="text-2xl font-bold text-blue-600">{stats.businesses}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-2xl font-bold text-blue-600">{stats.reviews}</p>
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
            Review Rating Breakdown
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
          onClick={handleExport}
          disabled={downloading}
        >
          <FaDownload /> {downloading ? "Exporting..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
}

// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

// "use client";

// import { useEffect, useState } from "react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
// import { FaDownload } from "react-icons/fa";
// import Papa from "papaparse";

// const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

// export default function ReportsPage() {
//   const [stats, setStats] = useState({ users: 0, businesses: 0, reviews: 0 });
//   const [businessData, setBusinessData] = useState([]);
//   const [reviewBreakdown, setReviewBreakdown] = useState([]);
//   const [downloading, setDownloading] = useState(false);
//   const [filter, setFilter] = useState("monthly");

//   useEffect(() => {
//     async function fetchStats() {
//       try {
//         const res = await fetch(`/api/admin/stats?range=${filter}`);
//         const data = await res.json();
//         setStats(data.totals);
//         setBusinessData(data.businessChart);
//         setReviewBreakdown(data.reviewChart);
//       } catch (error) {
//         console.error("Failed to load stats:", error);
//       }
//     }
//     fetchStats();
//   }, [filter]);

//   const handleExport = () => {
//     setDownloading(true);
//     const csv = Papa.unparse([
//       ["Metric", "Value"],
//       ["Users", stats.users],
//       ["Businesses", stats.businesses],
//       ["Reviews", stats.reviews],
//     ]);
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", `platform-report-${filter}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     setTimeout(() => setDownloading(false), 1000);
//   };

//   return (
//     <div className="max-w-6xl mx-auto py-8 px-4">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-blue-700">Platform Reports</h2>
//         <select
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//           className="border border-gray-300 rounded px-3 py-1 text-sm"
//         >
//           <option value="monthly">Monthly</option>
//           <option value="yearly">Yearly</option>
//         </select>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//         <div className="bg-white p-6 rounded shadow text-center">
//           <p className="text-sm text-gray-500">Total Users</p>
//           <p className="text-2xl font-bold text-blue-600">{stats.users}</p>
//         </div>
//         <div className="bg-white p-6 rounded shadow text-center">
//           <p className="text-sm text-gray-500">Total Businesses</p>
//           <p className="text-2xl font-bold text-blue-600">{stats.businesses}</p>
//         </div>
//         <div className="bg-white p-6 rounded shadow text-center">
//           <p className="text-sm text-gray-500">Total Reviews</p>
//           <p className="text-2xl font-bold text-blue-600">{stats.reviews}</p>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-2 gap-8">
//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="font-semibold text-gray-700 mb-4">New Businesses ({filter})</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={businessData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="businesses" fill="#8884d8" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="font-semibold text-gray-700 mb-4">Review Rating Breakdown</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={reviewBreakdown}
//                 dataKey="value"
//                 nameKey="name"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={100}
//                 fill="#82ca9d"
//                 label
//               >
//                 {reviewBreakdown.map((_, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       <div className="mt-10 text-right">
//         <button
//           className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
//           onClick={handleExport}
//           disabled={downloading}
//         >
//           <FaDownload /> {downloading ? "Exporting..." : "Export CSV"}
//         </button>
//       </div>
//     </div>
//   );
// }

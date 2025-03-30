"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FaTachometerAlt,
  FaBuilding,
  FaUsers,
  FaComments,
  FaFileAlt,
  FaCog,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathParts = pathname.split("/");
  const adminId = pathParts[2] || "defaultAdminId";

  const navItems = [
    {
      name: "Dashboard",
      icon: FaTachometerAlt,
      path: `/admin/${adminId}/dashboard`,
    },
    {
      name: "Businesses",
      icon: FaBuilding,
      path: `/admin/${adminId}/businesses`,
    },
    { name: "Users", icon: FaUsers, path: `/admin/${adminId}/users` },
    { name: "Reviews", icon: FaComments, path: `/admin/${adminId}/reviews` },
    { name: "Reports", icon: FaFileAlt, path: `/admin/${adminId}/reports` },
    { name: "Settings", icon: FaCog, path: `/admin/${adminId}/settings` },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 md:h-screen h-full w-64 bg-blue-800 text-white p-4 space-y-4 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center md:hidden">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <FaTimes size={20} />
          </button>
        </div>
        <h2 className="text-xl font-bold mb-6 hidden md:block">Admin Panel</h2>
        {navItems.map(({ name, icon: Icon, path }) => (
          <Link
            key={name}
            href={path}
            className={`flex items-center p-2 rounded hover:bg-blue-600 ${
              pathname === path ? "bg-blue-700" : ""
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="mr-3" /> {name}
          </Link>
        ))}
      </aside>

      {/* Content with topbar */}
      <div className="flex-1 flex flex-col">
        {/* Mobile topbar */}
        <div className="md:hidden bg-blue-800 text-white p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <FaBars size={24} />
          </button>
        </div>

        <main className="flex-1 bg-gray-100 p-6">
          <header className="text-lg font-semibold mb-4 hidden md:block">
            Admin Dashboard
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

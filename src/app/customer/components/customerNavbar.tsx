"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const pathParts = pathname.split("/");
  const customerId = pathParts[2] || "defaultCustomerId";

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
      <h1 className="text-lg font-bold">Local Business Finder</h1>

      <div className="md:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <ul className="hidden md:flex space-x-6">
        <li>
          <Link
            href={`/customer/${customerId}/home`}
            className="hover:text-gray-300"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href={`/customer/${customerId}/categories`}
            className="hover:text-gray-300"
          >
            Categories
          </Link>
        </li>
        <li>
          <Link
            href={`/customer/${customerId}/favorites`}
            className="hover:text-gray-300"
          >
            Favorites
          </Link>
        </li>
        <li>
          <Link
            href={`/customer/${customerId}/profile`}
            className="hover:text-gray-300"
          >
            Profile
          </Link>
        </li>
      </ul>

      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-blue-700 text-white p-4 flex flex-col space-y-4 shadow-lg">
          <Link
            href={`/customer/${customerId}/home`}
            className="hover:text-gray-300"
          >
            Home
          </Link>
          <Link
            href={`/customer/${customerId}/categories`}
            className="hover:text-gray-300"
          >
            Categories
          </Link>
          <Link
            href={`/customer/${customerId}/favorites`}
            className="hover:text-gray-300"
          >
            Favorites
          </Link>
          <Link
            href={`/customer/${customerId}/profile`}
            className="hover:text-gray-300"
          >
            Profile
          </Link>
        </div>
      )}
    </nav>
  );
}

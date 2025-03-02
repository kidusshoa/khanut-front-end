"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaHeart,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function CustomerPage() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const businesses = [
    {
      id: 1,
      name: "Delicious Eats",
      category: "Restaurant",
      location: "Haramaya, Ethiopia",
      rating: 4.5,
      image: "/restaurant.jpg",
    },
    {
      id: 2,
      name: "Tech Fix Center",
      category: "Electronics Repair",
      location: "Dire Dawa, Ethiopia",
      rating: 4.2,
      image: "/repair.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-lg font-bold">Local Business Finder</h1>
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        <ul className="hidden md:flex space-x-6">
          <li>
            <a href="#" className="hover:text-gray-300">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-300">
              Categories
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-300">
              Favorites
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-300">
              Profile
            </a>
          </li>
        </ul>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 text-white p-4 flex flex-col space-y-4">
          <a href="#" className="hover:text-gray-300">
            Home
          </a>
          <a href="#" className="hover:text-gray-300">
            Categories
          </a>
          <a href="#" className="hover:text-gray-300">
            Favorites
          </a>
          <a href="#" className="hover:text-gray-300">
            Profile
          </a>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative flex items-center bg-white p-3 rounded-lg shadow-md max-w-md mx-auto mt-6">
        <FaSearch className="text-gray-500 absolute left-3" />
        <input
          type="text"
          placeholder="Search for businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none"
        />
      </div>

      {/* Business Listings */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {businesses.map((biz) => (
          <motion.div
            key={biz.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={biz.image}
              alt={biz.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{biz.name}</h3>
              <p className="text-gray-600 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-500" /> {biz.location}
              </p>
              <p className="text-sm text-gray-500">{biz.category}</p>
              <div className="flex items-center mt-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`mr-1 ${
                      index < Math.round(biz.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">({biz.rating})</span>
              </div>
              <button className="mt-3 flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg">
                <FaHeart className="mr-2" /> Save
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

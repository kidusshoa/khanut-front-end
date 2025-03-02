import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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

      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-blue-700 text-white p-4 flex flex-col space-y-4 shadow-lg">
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
    </nav>
  );
}

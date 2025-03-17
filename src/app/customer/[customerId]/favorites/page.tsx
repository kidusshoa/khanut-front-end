"use client";
import { useState } from "react";
import { FaHeart, FaMapMarkerAlt, FaStar } from "react-icons/fa";

interface FavoriteItem {
  id: number;
  name: string;
  category: string;
  location: string;
  rating: number;
  image: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
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
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.length > 0 ? (
          favorites.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-red-500" />{" "}
                  {item.location}
                </p>
                <p className="text-sm text-gray-500">{item.category}</p>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`mr-1 ${
                        index < Math.round(item.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">({item.rating})</span>
                </div>
                <button
                  className="mt-3 flex items-center px-3 py-2 bg-red-500 text-white rounded-lg"
                  onClick={() =>
                    setFavorites(favorites.filter((fav) => fav.id !== item.id))
                  }
                >
                  <FaHeart className="mr-2" /> Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No favorites added yet.</p>
        )}
      </div>
    </div>
  );
}

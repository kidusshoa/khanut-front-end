import React from "react";
import Image from "next/image";
import { FaMapMarkerAlt, FaStar, FaRegStar } from "react-icons/fa";

interface CardProps {
  id: number;
  name: string;
  category: string;
  type: string;
  description: string;
  location?: string;
  rating?: number;
  image?: string;
}

const Card: React.FC<CardProps> = ({
  id,
  name,
  category,
  type,
  description,
  location,
  rating,
  image
}) => {
  return (
    <div className="max-w-sm rounded-xl relative overflow-hidden shadow-lg bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image section with fallback */}
      <div className="relative h-48 w-full bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm">No image available</span>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-5">
        {/* Category and Type badges */}
        <div className="flex justify-between items-center mb-3">
          <span className="inline-block bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
            {category}
          </span>
          <span className="text-gray-500 text-xs">{type}</span>
        </div>

       
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{name}</h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        
        {location && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <FaMapMarkerAlt className="text-red-400 mr-1" />
            <span>{location}</span>
          </div>
        )}

        
        {rating !== undefined && (
          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                i < Math.floor(rating) ? (
                  <FaStar key={i} className="text-yellow-400 w-4 h-4" />
                ) : (
                  <FaRegStar key={i} className="text-yellow-400 w-4 h-4" />
                )
              ))}
            </div>
            <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
          </div>
        )}

        
        <div className="absolute bottom-2">
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <button className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors">
            View Details
          </button>
          
        </div></div>
      </div>
    </div>
  );
};

export default Card;
// components/BusinessList.tsx
"use client";
import Card from "./card";

const businesses = [
  {
    id: 1,
    name: "Delicious Eats",
    category: "Restaurant",
    type: "Business",
    description: "A top-rated restaurant with diverse cuisines.",
    location: "Haramaya, Ethiopia",
    rating: 4.5,
    image: "/restaurant.jpg",
  },
  {
    id: 2,
    name: "Tech Fix Center",
    category: "Electronics Repair",
    type: "Business",
    description: "Expert repairs for all electronic devices.",
    location: "Dire Dawa, Ethiopia",
    rating: 4.2,
    image: "/repair.jpg",
  },
  {
    id: 3,
    name: "Smartphone Screen Replacement",
    category: "Repair Service",
    type: "Service",
    description: "Quick and reliable screen replacement for smartphones.",
  },
  {
    id: 4,
    name: "Organic Honey",
    category: "Food Product",
    type: "Product",
    description: "Locally sourced organic honey with health benefits.",
  },
];

export default function BusinessList() {
  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 mt-10 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Featured Businesses
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {businesses.map((business) => (
            <Card
              key={business.id}
              id={business.id}
              name={business.name}
              category={business.category}
              type={business.type}
              description={business.description}
              location={business.location}
              rating={business.rating}
              image={business.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

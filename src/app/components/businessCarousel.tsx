import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function BusinessCarousel() {
  const [current, setCurrent] = useState(0);
  const businesses = [
    {
      name: "Tomoca Coffee",
      image: "/tomoca.webp",
    },

    {
      name: "Kategna Restaurant",
      image: "/ketega.jpeg",
    },
    {
      name: "Addis Fruit & Vegetable Market Center",
      image: "/merkato.webp",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % businesses.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [businesses.length]);

  return (
    <div className="lg:col-span-2">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg text-gray-600">
            Simplifying search for local businesses
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
              {businesses[current].name}
            </h1>
            <div className="relative flex items-center justify-center"></div>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-[#f3ff75] px-6 py-3 font-medium text-black transition-colors hover:bg-orange-300"
            >
              See More
              <span className="rounded-full bg-black p-1">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </span>
            </Link>
          </div>
          <div className="relative h-64 w-64 md:h-80 md:w-80">
            <Image
              src={businesses[current].image}
              alt={businesses[current].name}
              width={320}
              height={320}
              className="object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

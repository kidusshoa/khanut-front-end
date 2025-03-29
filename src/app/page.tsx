'use client'
import Image from "next/image"
import { Search, Heart, ArrowUpRight, Diamond } from "lucide-react"
import { useEffect,useState } from "react";
import Link from "next/link"
import { FaPlus } from "react-icons/fa"
import React from "react"
import LogoCarousel from "./components/infinitecorusal";
import BusinessList from "./components/bussiness";




export function BusinessCarousel() {
  const [current, setCurrent] = useState(0);
  const businesses = [
    {
      name: "Tomoca Coffee",
      image:"/tomoca.webp"
    },
    
    {
      name: "Kategna Restaurant",
      image:"/ketega.jpeg"
    },
    {
      name: "Addis Fruit & Vegetable Market Center",
      image:"/merkato.webp"
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
            <div className="relative flex items-center justify-center">
           
          </div>
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




export default function Home() {
 
  return (
    <div className="min-h-screen bg-[#e9edf0] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
       
        <nav className="mb-6 flex items-center justify-between rounded-full bg-white p-2 shadow-sm">
          <div className="flex items-center">
            <div className="mr-4 flex items-center px-3 font-bold">
          
              <span className="text-lg text-orange-500">KHANUT</span>
            </div>
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search products..."
                className="w-64 rounded-full border-0 bg-gray-100 py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-orange-500 p-1.5">
                <Search className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
        
            <div className="flex items-center gap-2 rounded-full bg-white p-1 pl-3 shadow-sm">
              <span className="hidden md:inline">Ryman Alex</span>
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-orange-500">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  alt="User"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-24">
          {/* Main Content - Left and Center */}
          <BusinessCarousel/>
         

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Popular Colors */}
            <div className="rounded-3xl flex justify-center flex-col items-center bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Register</h3>
              <div className="flex gap-4">
               
                <button className="h-10  pl-8 pr-8 text-white rounded-lg  bg-orange-500 ring-2 ring-offset-2 ring-orange-500"> Log In</button>
                <button className="h-10  pl-8 pr-8 rounded-lg bg-zinc-200 ring-2 ring-offset-2 ring-zinc-200 ">Sign Up</button>
                
              </div>
            </div>

            {/* New Gen X-Bud */}
            <div className="relative rounded-3xl flex flex-col items-center text-white bg-orange-500 justify-center p-6 shadow-sm">
              <div>
                <h3 className="text-lg font-semibold">Add Your Bussiness</h3>
             
              </div>
              <div className="h-32  flex justify-center items-center w-full">
             <FaPlus size={70}/>
              
              </div>
              <button className="absolute bottom-4 right-4 rounded-full bg-white p-2 shadow-md">
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            {/* VR Headset */}
           
          </div>
        </div>
        <LogoCarousel />
        <BusinessList/>


      </div>
    </div>
  )
}


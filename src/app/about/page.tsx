import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, Target, HeartPulse, MapPin, Clock, Phone, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            About <span className="text-blue-600">Khanut</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering local businesses and connecting communities across Ethiopia through innovative technology solutions.
          </p>
        </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Khanut was born from a vision to bridge the gap between local businesses and their communities in Ethiopia. We understand the challenges small businesses face in gaining visibility and connecting with customers in the digital age.
                </p>
                <p>
                  Our platform is designed to be more than just a directory – it's a growth partner for businesses and a trusted resource for customers seeking quality local services.
                </p>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <MapPin className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">Local Focus</h3>
                    <p className="text-sm text-gray-500">Supporting Ethiopian businesses</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Clock className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">24/7 Access</h3>
                    <p className="text-sm text-gray-500">Shop anytime, anywhere</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Phone className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">Direct Contact</h3>
                    <p className="text-sm text-gray-500">Easy communication</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Mail className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-gray-900">Stay Updated</h3>
                    <p className="text-sm text-gray-500">Get the latest offers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
          <div className="bg-white/20 p-3 rounded-full w-fit mb-6">
            <Store className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4">For Business Owners</h2>
          <p className="mb-6 text-blue-100">
            Grow your business with our powerful tools designed specifically for Ethiopian entrepreneurs. Showcase your products, manage orders, and connect with local customers – all in one place.
          </p>
          <Link 
            href="/register/business-owner"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Register Your Business
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-8 text-white">
          <div className="bg-white/20 p-3 rounded-full w-fit mb-6">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4">For Customers</h2>
          <p className="mb-6 text-emerald-100">
            Discover amazing local businesses right in your neighborhood. From restaurants to services, find exactly what you need while supporting your community's economy.
          </p>
          <Link 
            href="/register/customer"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
          >
            Join as Customer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Core Values</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-600">
                  To revolutionize local commerce in Ethiopia by providing accessible technology solutions that empower businesses and enrich communities.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <HeartPulse className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community First</h3>
                <p className="text-gray-600">
                  We're dedicated to fostering strong local economies by creating meaningful connections between businesses and their customers.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join Khanut today and be part of Ethiopia's growing digital marketplace. Whether you're a business or a customer, we have something special for you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register/business-owner"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Store className="h-5 w-5" />
                Register Your Business
              </Link>
              <Link
                href="/register/customer"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Users className="h-5 w-5" />
                Join as Customer
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Have Questions?</h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6">
            Our team is here to help you get the most out of Khanut.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

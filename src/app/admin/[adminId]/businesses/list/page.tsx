'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface Business {
  _id: string;
  name: string;
  ownerId: string;
  status?: string; 
  approved: boolean; 
  city: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  services: any[];
  reviews: any[];
  createdAt: string;
  updatedAt: string;
  legalDoc:string;
}

interface ApiResponse {
  businesses: Business[];
  pagination: {
    
    total?: number;
    page?: number;
    limit?: number;
  };
}

export default function BusinessListPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = Cookies.get('client-token');
        
        if (!accessToken) {
          router.push('/login');
          return;
        }

        const response = await axios.get<ApiResponse>(
          "https://khanut.onrender.com/api/admin/businesses/list", 
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

       
        if (response.data && Array.isArray(response.data.businesses)) {
          setBusinesses(response.data.businesses);
        } else {
          setError("Invalid businesses data format");
          setBusinesses([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to load businesses");
        
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          Cookies.remove('client-token');
          Cookies.remove('user-role');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <div className="p-4">Loading businesses...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

 
  const approvedBusinesses = businesses.filter((b) => b.approved);

  return (
    <div className="mb-6">
      <h2 className="text-xl text-orange-500 font-bold">Approved Businesses</h2>
      <p className="text-gray-600 mb-4">
        A full list of verified and approved businesses.
      </p>

      {approvedBusinesses.length === 0 ? (
        <div className="p-4 bg-gray-100 rounded">
          No approved businesses found.
        </div>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-orange-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">City</th>
             
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Approved</th>
              <th className="p-3 text-left">Legal Document</th>
            </tr>
          </thead>
          <tbody>
            {approvedBusinesses.map((biz) => (
              <tr key={biz._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium text-orange-900">{biz.name}</td>
                <td className="p-3">{biz.city || 'N/A'}</td>
                
                <td className="p-3 text-sm">{biz.description || 'N/A'}</td>
                <td className="p-3">
                  {biz.approved ? 'Yes' : 'No'}
                </td>
                <td className="p-3 text-orange-600">
                  {biz.legalDoc ? (
                    <a
                      href={biz.legalDoc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 underline"
                    >
                      View
                    </a>
                  ) : 'None available'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
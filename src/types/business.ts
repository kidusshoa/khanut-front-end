// Business related types

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  [key: string]: string | undefined;
}

export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface BusinessLocation {
  type: string;
  coordinates: number[]; // [longitude, latitude]
}

export interface Business {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  city?: string;
  address?: BusinessAddress;
  location?: BusinessLocation;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  serviceTypes?: string[];
  businessHours?: BusinessHours;
  rating?: number;
  reviewCount?: number;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  services?: any[];
  reviews?: any[];
}

export interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  serviceType: "appointment" | "product" | "in_person";
  businessId: string;
  image?: string;
  category?: string;
  availability?: {
    days?: string[];
    startTime?: string;
    endTime?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  customerId?: string; // Added for UI purposes
}

export interface ReviewAuthor {
  _id: string;
  name?: string;
  profilePicture?: string;
  email?: string;
}

export interface Review {
  _id: string;
  businessId: string;
  customerId?: string;
  authorId?: ReviewAuthor;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessSearchResult {
  businesses: Business[];
  total: number;
  page: number;
  limit: number;
}

import api from "./api";

interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  category?: string;
  city?: string;
  serviceTypes?: string | string[];
  serviceType?: string;
  minRating?: number;
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  filters?: Record<string, any>;
}

export const searchApi = {
  // Search businesses by name
  searchBusinessesByName: async (params: SearchParams) => {
    try {
      const { query, page = 1, limit = 10, sort, order, filters } = params;

      let url = `/search/business?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;

      // Add any additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url += `&${key}=${encodeURIComponent(value)}`;
          }
        });
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error searching businesses by name:", error);
      throw error;
    }
  },

  // Search businesses by description
  searchBusinessesByDescription: async (params: SearchParams) => {
    try {
      const { query, page = 1, limit = 10, sort, order, filters } = params;

      let url = `/search/description?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;

      // Add any additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url += `&${key}=${encodeURIComponent(value)}`;
          }
        });
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error searching businesses by description:", error);
      throw error;
    }
  },

  // Search businesses by their services
  searchBusinessesByServices: async (params: SearchParams) => {
    try {
      const { query, page = 1, limit = 10, sort, order, filters } = params;

      let url = `/search/services?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;

      // Add any additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url += `&${key}=${encodeURIComponent(value)}`;
          }
        });
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error searching businesses by services:", error);
      throw error;
    }
  },

  // Advanced search using the new backend endpoint
  searchAll: async (params: SearchParams) => {
    try {
      const {
        query,
        category,
        city,
        serviceTypes,
        serviceType,
        minRating,
        maxRating,
        minPrice,
        maxPrice,
        sort,
        order,
        lat,
        lng,
        page = 1,
        limit = 10,
      } = params;

      // Build query string
      let url = `/search/advanced?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`;

      // Add filters
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (city) url += `&city=${encodeURIComponent(city)}`;

      // Add service type filters
      if (serviceTypes) {
        if (Array.isArray(serviceTypes)) {
          serviceTypes.forEach((type) => {
            url += `&serviceTypes=${encodeURIComponent(type)}`;
          });
        } else {
          url += `&serviceTypes=${encodeURIComponent(serviceTypes)}`;
        }
      }

      if (serviceType) url += `&serviceType=${encodeURIComponent(serviceType)}`;

      // Add rating filters
      if (minRating !== undefined) url += `&minRating=${minRating}`;
      if (maxRating !== undefined) url += `&maxRating=${maxRating}`;

      // Add price filters
      if (minPrice !== undefined) url += `&minPrice=${minPrice}`;
      if (maxPrice !== undefined) url += `&maxPrice=${maxPrice}`;

      // Add sorting
      if (sort) url += `&sortBy=${sort}`;
      if (order) url += `&order=${order}`;

      // Add location for geo-sorting
      if (lat !== undefined && lng !== undefined) {
        url += `&lat=${lat}&lng=${lng}`;
      }

      // Add any additional filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url += `&${key}=${encodeURIComponent(value)}`;
          }
        });
      }

      // Make the request
      const response = await api.get(url);
      const data = response.data;

      return {
        businesses: data.businesses || [],
        services: data.services || [],
        totalBusinesses: data.pagination?.totalItems || 0,
        totalServices: data.pagination?.totalServices || 0,
        pagination: data.pagination,
        query,
      };
    } catch (error) {
      console.error("Error performing advanced search:", error);

      // Fallback to old search method if advanced search fails
      try {
        console.log("Falling back to legacy search method");
        const { query, category, city } = params;

        // Create filters object with category and city if provided
        const filters = { ...params.filters };
        if (category) filters.category = category;
        if (city) filters.city = city;

        // Make parallel requests to all search endpoints
        const [businessResults, descriptionResults, servicesResults] =
          await Promise.all([
            searchApi.searchBusinessesByName({ ...params, filters }),
            searchApi.searchBusinessesByDescription({ ...params, filters }),
            searchApi.searchBusinessesByServices({ ...params, filters }),
          ]);

        // Combine and deduplicate results
        const allBusinesses = [
          ...(businessResults?.businesses || []),
          ...(descriptionResults?.businesses || []),
          ...(servicesResults?.businesses || []),
        ];

        // Deduplicate by business ID
        const uniqueBusinesses = Array.from(
          new Map(
            allBusinesses.map((business) => [business._id, business])
          ).values()
        );

        // Get all services from the services search
        const allServices = servicesResults?.services || [];

        return {
          businesses: uniqueBusinesses,
          services: allServices,
          totalBusinesses: uniqueBusinesses.length,
          totalServices: allServices.length,
          query,
        };
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
        throw error; // Throw the original error
      }
    }
  },

  // Get business by ID
  getBusinessById: async (businessId: string) => {
    try {
      const response = await api.get(`/businesses/${businessId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching business by ID:", error);
      throw error;
    }
  },
};

import api from "./api";

interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  category?: string;
  city?: string;
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

  // Comprehensive search across all search endpoints
  searchAll: async (params: SearchParams) => {
    try {
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
    } catch (error) {
      console.error("Error performing comprehensive search:", error);
      throw error;
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

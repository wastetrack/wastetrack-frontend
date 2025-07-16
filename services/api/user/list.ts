import axios from 'axios';
import {
  UserListParams,
  UserListResponse,
  InstitutionSearchParams,
  InstitutionSearchResponse,
  UserListItem,
  FlatUserListResponse,
} from '@/types';
import { getTokenManager } from '@/lib/token-manager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Configure axios instance for authenticated requests
const authenticatedApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure axios instance for public requests (no authentication required)
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authenticated requests
authenticatedApiClient.interceptors.request.use(
  async (config) => {
    // Only try to get token in browser environment
    if (typeof window !== 'undefined') {
      const tokenManager = getTokenManager();
      const token = await tokenManager.getValidAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for authenticated requests
authenticatedApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Try to refresh token one more time
      const tokenManager = getTokenManager();
      const refreshedToken = await tokenManager.getValidAccessToken();

      if (refreshedToken && error.config && !error.config._retry) {
        error.config._retry = true;
        error.config.headers.Authorization = `Bearer ${refreshedToken}`;
        return authenticatedApiClient.request(error.config);
      } else {
        // If refresh fails, logout
        tokenManager.logout();
      }
    }
    return Promise.reject(error);
  }
);

export const userListAPI = {
  async getUserList(params: UserListParams = {}): Promise<UserListResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Set default values
      queryParams.append('page', (params.page || 1).toString());
      queryParams.append('size', (params.size || 10).toString());

      // Add optional parameters if provided
      if (params.role) {
        queryParams.append('role', params.role);
      }
      if (params.province) {
        queryParams.append('province', params.province);
      }
      if (params.institution) {
        queryParams.append('institution', params.institution);
      }

      const response = await authenticatedApiClient.get(
        `/api/users?${queryParams.toString()}`
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('User List Error:', error.response?.data);

        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch user list';

        throw new Error(errorMessage);
      }
      console.log('Network Error:', error);
      throw new Error('Network error occurred. Please try again.');
    }
  },

  async getFlatUserList(
    params: UserListParams = {}
  ): Promise<FlatUserListResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', (params.page || 1).toString());
      queryParams.append('size', (params.size || 10).toString());

      if (params.role) queryParams.append('role', params.role);
      if (params.province) queryParams.append('province', params.province);
      if (params.institution)
        queryParams.append('institution', params.institution);

      const response = await authenticatedApiClient.get(
        `/api/users?${queryParams.toString()}`
      );

      return response.data; // ✅ langsung cocok dengan FlatUserListResponse
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('User List Error:', error.response?.data);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch user list';
        throw new Error(errorMessage);
      }

      throw new Error('Network error occurred. Please try again.');
    }
  },

  async getInstitutionSuggestions(
    params: InstitutionSearchParams
  ): Promise<InstitutionSearchResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Map collector roles to their corresponding bank roles for searching
      let targetRole = params.role;
      if (params.role === 'waste_collector_unit') {
        targetRole = 'waste_bank_unit';
      } else if (params.role === 'waste_collector_central') {
        targetRole = 'waste_bank_central';
      }

      queryParams.append('role', targetRole);
      queryParams.append('size', (params.limit || 10).toString());
      queryParams.append('page', '1');

      // Add institution filter if query is provided
      if (params.query && params.query.trim()) {
        queryParams.append('institution', params.query.trim());
      }

      console.log(
        'Institution Search - Request URL:',
        `/api/users?${queryParams.toString()}`
      );
      console.log('Institution Search - Target Role:', targetRole);
      console.log('Institution Search - Query:', params.query);

      // Use public API client for institution suggestions (no authentication required)
      const response = await publicApiClient.get(
        `/api/users?${queryParams.toString()}`
      );

      console.log('Institution Search - API Response:', response.data);

      // Handle different response structures
      let users = [];
      if (response.data?.data?.users) {
        users = response.data.data.users;
      } else if (response.data?.users) {
        users = response.data.users;
      } else if (Array.isArray(response.data?.data)) {
        users = response.data.data;
      } else if (Array.isArray(response.data)) {
        users = response.data;
      }

      console.log('Institution Search - Raw users data:', users);

      // Extract unique institutions from the user list
      const uniqueInstitutions = new Map();

      if (Array.isArray(users)) {
        users.forEach((user: UserListItem) => {
          if (user && user.institution && user.institution.trim()) {
            const institutionKey = user.institution.toLowerCase().trim();
            if (!uniqueInstitutions.has(institutionKey)) {
              uniqueInstitutions.set(institutionKey, {
                id: user.id || '',
                institution: user.institution.trim(),
                role: user.role || targetRole,
                address: user.address || '',
                city: user.city || '',
                province: user.province || '',
              });
            }
          }
        });
      }

      const institutions = Array.from(uniqueInstitutions.values());
      console.log('Institution Search - Processed institutions:', institutions);

      return {
        data: {
          institutions: institutions,
        },
        message: 'Institutions fetched successfully',
      };
    } catch (error) {
      console.error('Institution Search Error:', error);

      if (axios.isAxiosError(error)) {
        console.log('Institution Search Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });

        // For public endpoint, don't throw error - just return empty results
        return {
          data: {
            institutions: [],
          },
          message:
            error.response?.data?.message || 'Failed to fetch institutions',
        };
      }

      console.log('Institution Search Network Error:', error);
      // Return empty results instead of throwing
      return {
        data: {
          institutions: [],
        },
        message: 'Network error occurred',
      };
    }
  },

  // Method khusus untuk register form - tidak memerlukan authentication
  async getPublicInstitutionSuggestions(
    params: InstitutionSearchParams
  ): Promise<InstitutionSearchResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Map collector roles to their corresponding bank roles for searching
      let targetRole = params.role;
      if (params.role === 'waste_collector_unit') {
        targetRole = 'waste_bank_unit';
      } else if (params.role === 'waste_collector_central') {
        targetRole = 'waste_bank_central';
      }

      // Use a larger limit to get more results for better filtering
      queryParams.append('role', targetRole);
      queryParams.append('size', '50'); // Get more results to filter from
      queryParams.append('page', '1');

      // Add institution filter if query is provided
      if (params.query && params.query.trim()) {
        queryParams.append('institution', params.query.trim());
      }

      console.log(
        'Public Institution Search - Request URL:',
        `/api/public/users?${queryParams.toString()}`
      );
      console.log('Public Institution Search - Target Role:', targetRole);
      console.log('Public Institution Search - Query:', params.query);

      // Try public endpoint first
      let response;
      try {
        response = await publicApiClient.get(
          `/api/public/users?${queryParams.toString()}`
        );
      } catch {
        console.log('Public endpoint failed, trying regular endpoint...');
        // Fallback to regular endpoint without authentication
        response = await publicApiClient.get(
          `/api/users?${queryParams.toString()}`
        );
      }

      console.log('Public Institution Search - API Response:', response.data);

      // Handle different response structures
      let users = [];
      if (response.data?.data?.users) {
        users = response.data.data.users;
      } else if (response.data?.users) {
        users = response.data.users;
      } else if (Array.isArray(response.data?.data)) {
        users = response.data.data;
      } else if (Array.isArray(response.data)) {
        users = response.data;
      }

      console.log('Public Institution Search - Raw users data:', users);

      // Extract unique institutions from the user list
      const uniqueInstitutions = new Map();
      const queryLower = params.query ? params.query.toLowerCase().trim() : '';

      if (Array.isArray(users)) {
        users.forEach((user: UserListItem) => {
          if (user && user.institution && user.institution.trim()) {
            const institutionName = user.institution.trim();
            const institutionKey = institutionName.toLowerCase();

            // If there's a query, filter institutions that contain the query
            if (!queryLower || institutionKey.includes(queryLower)) {
              if (!uniqueInstitutions.has(institutionKey)) {
                uniqueInstitutions.set(institutionKey, {
                  id: user.id || '',
                  institution: institutionName,
                  role: user.role || targetRole,
                  address: user.address || '',
                  city: user.city || '',
                  province: user.province || '',
                });
              }
            }
          }
        });
      }

      // Limit the results to the requested limit and sort alphabetically
      const institutions = Array.from(uniqueInstitutions.values())
        .sort((a, b) => a.institution.localeCompare(b.institution))
        .slice(0, params.limit || 10);

      console.log(
        'Public Institution Search - Processed institutions:',
        institutions
      );

      return {
        data: {
          institutions: institutions,
        },
        message: 'Institutions fetched successfully',
      };
    } catch (error) {
      console.error('Public Institution Search Error:', error);

      if (axios.isAxiosError(error)) {
        console.log('Public Institution Search Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });

        // For any error, just return empty results
        return {
          data: {
            institutions: [],
          },
          message:
            error.response?.data?.message || 'Failed to fetch institutions',
        };
      }

      console.log('Public Institution Search Network Error:', error);
      // Return empty results instead of throwing
      return {
        data: {
          institutions: [],
        },
        message: 'Network error occurred',
      };
    }
  },
};

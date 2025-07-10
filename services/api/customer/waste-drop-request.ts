import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Try to refresh token one more time
      const tokenManager = getTokenManager();
      const refreshedToken = await tokenManager.getValidAccessToken();

      if (refreshedToken && error.config && !error.config._retry) {
        error.config._retry = true;
        error.config.headers.Authorization = `Bearer ${refreshedToken}`;
        return apiClient.request(error.config);
      } else {
        // If refresh fails, logout
        tokenManager.logout();
      }
    }
    return Promise.reject(error);
  }
);

export interface LocationRequest {
  latitude: number;
  longitude: number;
}

export interface LocationResponse {
  latitude: number;
  longitude: number;
}

export interface WasteDropRequestItems {
  waste_type_ids: string[];
  quantities: number[];
}

export interface WasteDropRequestRequest {
  delivery_type: 'pickup' | 'dropoff';
  customer_id: string;
  user_phone_number?: string;
  waste_bank_id?: string;
  assigned_collector_id?: string;
  total_price: number;
  image_url?: string;
  appointment_location?: LocationRequest;
  appointment_date?: string; // Format: "YYYY-MM-DD" (e.g., "2025-07-03")
  appointment_start_time?: string; // Format: "HH:MM:SS+07:00" (e.g., "09:00:00+07:00")
  appointment_end_time?: string; // Format: "HH:MM:SS+07:00" (e.g., "11:00:00+07:00")
  notes?: string;
  items: WasteDropRequestItems;
}

export interface WasteDropRequestSimpleResponse {
  id: string;
  delivery_type: 'pickup' | 'dropoff';
  customer_id: string;
  user_phone_number?: string;
  waste_bank_id?: string;
  assigned_collector_id?: string;
  total_price: number;
  image_url?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  appointment_location?: LocationResponse;
  appointment_date?: string;
  appointment_start_time?: string;
  appointment_end_time?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WasteDropRequestResponse {
  data: WasteDropRequestSimpleResponse;
}

export interface CreateWasteDropRequestResponse {
  data: WasteDropRequestSimpleResponse;
}

export const wasteDropRequestAPI = {
  // Create a new waste drop request
  async createWasteDropRequest(
    requestData: WasteDropRequestRequest
  ): Promise<CreateWasteDropRequestResponse> {
    try {
      console.log('Making API call to create waste drop request:', requestData);
      const response = await apiClient.post(
        `/api/customer/waste-drop-requests`,
        requestData
      );
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to create waste drop request';
        throw new Error(errorMessage);
      }
      throw new Error(
        'Network error occurred while creating waste drop request'
      );
    }
  },

  // Get waste drop request by ID
  async getWasteDropRequest(
    requestId: string
  ): Promise<WasteDropRequestResponse> {
    try {
      console.log('Making API call to get waste drop request:', requestId);
      const response = await apiClient.get(
        `/api/waste-drop-requests/${requestId}`
      );
      console.log('Raw API response:', response);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste drop request';
        throw new Error(errorMessage);
      }
      throw new Error(
        'Network error occurred while fetching waste drop request'
      );
    }
  },

  // Get waste drop requests for a customer
  async getCustomerWasteDropRequests(params?: {
    delivery_type?: string;
    waste_bank_id?: string;
    appointment_date?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<{
    data: WasteDropRequestSimpleResponse[];
    paging?: {
      page: number;
      size: number;
      total_item: number;
      total_page: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.delivery_type) {
        queryParams.append('delivery_type', params.delivery_type);
      }
      if (params?.waste_bank_id) {
        queryParams.append('waste_bank_id', params.waste_bank_id);
      }
      if (params?.appointment_date) {
        queryParams.append('appointment_date', params.appointment_date);
      }
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.size) {
        queryParams.append('size', params.size.toString());
      }

      console.log('Making API call to get waste drop requests:', params);
      const response = await apiClient.get(
        `/api/waste-drop-requests?${queryParams.toString()}`
      );
      console.log('Raw API response:', response);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste drop requests';
        throw new Error(errorMessage);
      }
      throw new Error(
        'Network error occurred while fetching waste drop requests'
      );
    }
  },
};

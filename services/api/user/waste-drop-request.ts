// services/api/waste-drop-request.ts

import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  WasteDropRequestListParams,
  WasteDropRequestListResponse,
  WasteDropRequestDetailResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Configure axios instance for authenticated requests
const authenticatedApiClient = axios.create({
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

export const wasteDropRequestAPI = {
  /**
   * Get list of waste drop requests with optional filtering and pagination
   */
  async getWasteDropRequests(
    params?: WasteDropRequestListParams
  ): Promise<WasteDropRequestListResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add all filtering parameters
      if (params?.delivery_type) {
        queryParams.append('delivery_type', params.delivery_type);
      }
      if (params?.customer_id) {
        queryParams.append('customer_id', params.customer_id);
      }
      if (params?.waste_bank_id) {
        queryParams.append('waste_bank_id', params.waste_bank_id);
      }
      if (params?.assigned_collector_id) {
        queryParams.append(
          'assigned_collector_id',
          params.assigned_collector_id
        );
      }
      if (params?.status) {
        queryParams.append('status', params.status);
      }

      // Date/Time parameters
      if (params?.appointment_date) {
        queryParams.append('appointment_date', params.appointment_date);
      }
      if (params?.appointment_start_time) {
        queryParams.append(
          'appointment_start_time',
          params.appointment_start_time
        );
      }
      if (params?.appointment_end_time) {
        queryParams.append('appointment_end_time', params.appointment_end_time);
      }
      if (params?.date_from) {
        queryParams.append('date_from', params.date_from);
      }
      if (params?.date_to) {
        queryParams.append('date_to', params.date_to);
      }

      // Location parameters
      if (params?.latitude) {
        queryParams.append('latitude', params.latitude.toString());
      }
      if (params?.longitude) {
        queryParams.append('longitude', params.longitude.toString());
      }
      if (params?.radius) {
        queryParams.append('radius', params.radius.toString());
      }

      // Pagination parameters
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.size) {
        queryParams.append('size', params.size.toString());
      }

      // Sorting parameters
      if (params?.sort_by) {
        queryParams.append('sort_by', params.sort_by);
      }
      if (params?.sort_order) {
        queryParams.append('sort_order', params.sort_order);
      }

      const queryString = queryParams.toString();
      const url = `/api/waste-drop-requests${queryString ? `?${queryString}` : ''}`;

      const response = await authenticatedApiClient.get(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste drop requests';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get waste drop request details by ID
   */
  async getWasteDropRequestById(
    id: string
  ): Promise<WasteDropRequestDetailResponse> {
    try {
      const response = await authenticatedApiClient.get(
        `/api/waste-drop-requests/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste drop request details';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get waste drop requests for specific customer
   */
  async getCustomerWasteDropRequests(
    customerId: string,
    params?: Omit<WasteDropRequestListParams, 'customer_id'>
  ): Promise<WasteDropRequestListResponse> {
    return this.getWasteDropRequests({
      ...params,
      customer_id: customerId,
    });
  },

  /**
   * Get waste drop requests for specific waste bank
   */
  async getWasteBankRequests(
    wasteBankId: string,
    params?: Omit<WasteDropRequestListParams, 'waste_bank_id'>
  ): Promise<WasteDropRequestListResponse> {
    return this.getWasteDropRequests({
      ...params,
      waste_bank_id: wasteBankId,
    });
  },

  /**
   * Get waste drop requests by status
   */
  async getRequestsByStatus(
    status: 'pending' | 'assigned' | 'collecting' | 'completed' | 'cancelled',
    params?: Omit<WasteDropRequestListParams, 'status'>
  ): Promise<WasteDropRequestListResponse> {
    return this.getWasteDropRequests({
      ...params,
      status,
    });
  },

  /**
   * Get pending pickup requests near location
   */
  async getNearbyPickupRequests(
    latitude: number,
    longitude: number,
    radius: number = 10, // default 10km
    params?: WasteDropRequestListParams
  ): Promise<WasteDropRequestListResponse> {
    return this.getWasteDropRequests({
      ...params,
      delivery_type: 'pickup',
      status: 'pending',
      latitude,
      longitude,
      radius,
    });
  },
};

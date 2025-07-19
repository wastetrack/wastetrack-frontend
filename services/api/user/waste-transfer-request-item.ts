// services/api/waste-transfer-item-offerings.ts

import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  WasteTransferItemOfferingsListParams,
  WasteTransferItemOfferingsListResponse,
  WasteTransferItemOfferingsDetailResponse,
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

export const wasteTransferItemOfferingsAPI = {
  /**
   * Get list of waste transfer item offerings with optional filtering and pagination
   */
  async getWasteTransferItemOfferings(
    params?: WasteTransferItemOfferingsListParams
  ): Promise<WasteTransferItemOfferingsListResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add filtering parameters
      if (params?.transfer_form_id) {
        queryParams.append('transfer_form_id', params.transfer_form_id);
      }
      if (params?.waste_type_id) {
        queryParams.append('waste_type_id', params.waste_type_id);
      }

      // Pagination parameters
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.size) {
        queryParams.append('size', params.size.toString());
      }

      const queryString = queryParams.toString();
      const url = `/api/waste-transfer-item-offerings${queryString ? `?${queryString}` : ''}`;

      const response = await authenticatedApiClient.get(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste transfer item offerings';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get waste transfer item offering details by ID
   */
  async getWasteTransferItemOfferingById(
    id: string
  ): Promise<WasteTransferItemOfferingsDetailResponse> {
    try {
      const response = await authenticatedApiClient.get(
        `/api/waste-transfer-item-offerings/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste transfer item offering details';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get waste transfer item offerings for specific transfer form
   */
  async getOfferingsByTransferForm(
    transferFormId: string,
    params?: Omit<WasteTransferItemOfferingsListParams, 'transfer_form_id'>
  ): Promise<WasteTransferItemOfferingsListResponse> {
    return this.getWasteTransferItemOfferings({
      ...params,
      transfer_form_id: transferFormId,
    });
  },

  /**
   * Get waste transfer item offerings for specific waste type
   */
  async getOfferingsByWasteType(
    wasteTypeId: string,
    params?: Omit<WasteTransferItemOfferingsListParams, 'waste_type_id'>
  ): Promise<WasteTransferItemOfferingsListResponse> {
    return this.getWasteTransferItemOfferings({
      ...params,
      waste_type_id: wasteTypeId,
    });
  },

  /**
   * Get accepted offerings (where accepted_weight > 0)
   */
  async getAcceptedOfferings(
    params?: WasteTransferItemOfferingsListParams
  ): Promise<WasteTransferItemOfferingsListResponse> {
    const result = await this.getWasteTransferItemOfferings(params);

    // Filter accepted offerings on client side
    const acceptedOfferings = result.data.filter(
      (offering) => offering.accepted_weight > 0
    );

    return {
      ...result,
      data: acceptedOfferings,
      paging: {
        ...result.paging,
        total_item: acceptedOfferings.length,
        total_page: Math.ceil(acceptedOfferings.length / result.paging.size),
      },
    };
  },

  /**
   * Get pending offerings (where accepted_weight = 0)
   */
  async getPendingOfferings(
    params?: WasteTransferItemOfferingsListParams
  ): Promise<WasteTransferItemOfferingsListResponse> {
    const result = await this.getWasteTransferItemOfferings(params);

    // Filter pending offerings on client side
    const pendingOfferings = result.data.filter(
      (offering) => offering.accepted_weight === 0
    );

    return {
      ...result,
      data: pendingOfferings,
      paging: {
        ...result.paging,
        total_item: pendingOfferings.length,
        total_page: Math.ceil(pendingOfferings.length / result.paging.size),
      },
    };
  },
};

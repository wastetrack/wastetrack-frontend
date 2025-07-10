import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  CreateWastePriceResponse,
  UpdateWastePriceRequest,
  UpdateWastePriceResponse,
  DeleteWastePriceResponse,
} from '@/types';

interface WasteBankPricedTypeRequest {
  waste_type_id: string;
  custom_price_per_kgs: number;
  waste_bank_id: string;
}

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

export const wasteBankPriceAPI = {
  /**
   * Batch create waste types with prices for waste bank
   * POST /api/waste-bank/batch-waste-type-prices
   */
  async batchCreateWasteBankPrices(
    data: WasteBankPricedTypeRequest[]
  ): Promise<CreateWastePriceResponse> {
    try {
      const response = await authenticatedApiClient.post(
        '/api/waste-bank/batch-waste-type-prices',
        data
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          `API Error ${error.response?.status}: Failed to batch create waste type prices`;

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Update waste bank waste type price by ID
   * PUT /api/waste-bank/waste-type-prices/:id
   */
  async updateWasteBankPrice(
    id: string,
    data: UpdateWastePriceRequest
  ): Promise<UpdateWastePriceResponse> {
    try {
      const response = await authenticatedApiClient.put(
        `/api/waste-bank/waste-type-prices/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to update waste bank price';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Delete waste bank waste type price by ID
   * DELETE /api/waste-bank/waste-type-prices/:id
   */
  async deleteWasteBankPrice(id: string): Promise<DeleteWastePriceResponse> {
    try {
      const response = await authenticatedApiClient.delete(
        `/api/waste-bank/waste-type-prices/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to delete waste bank price';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },
};

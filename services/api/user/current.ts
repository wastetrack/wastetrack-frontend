import axios from 'axios';
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

// Request interceptor for authenticated requests
authenticatedApiClient.interceptors.request.use(
    async (config) => {
        // Only try to get token in browser environment
        if (typeof window !== 'undefined') {
            try {
                const tokenManager = getTokenManager();
                const token = await tokenManager.getValidAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.warn('Failed to get auth token:', error);
                // Continue without token
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
            try {
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
                    // Optionally redirect to login page
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
            } catch (refreshError) {
                console.warn('Failed to refresh token:', refreshError);
                // Continue with original error
            }
        }
        return Promise.reject(error);
    }
);

// Interface for Location Response
export interface LocationResponse {
    latitude: number;
    longitude: number;
}

// Interface for Current User Response (based on actual API schema)
export interface CurrentUser {
    id: string;
    username: string;
    email: string;
    role: string;
    avatar_url?: string;
    phone_number?: string;
    institution?: string;
    address?: string;
    city?: string;
    province?: string;
    points: number;
    balance: number;
    location?: LocationResponse;
    is_email_verified: boolean;
    access_token?: string;
    refresh_token?: string;
    created_at: string;
    updated_at: string;
}

// Interface for API Response
export interface CurrentUserResponse {
    data: CurrentUser;
}

// Interface for Error Response
export interface ApiError {
    error?: string;
    message?: string;
    details?: unknown;
}

export const currentUserAPI = {
    /**
     * Get current authenticated user information
     * GET /api/users/current
     */
    async getCurrentUser(): Promise<CurrentUserResponse> {
        try {
            const response = await authenticatedApiClient.get('/api/users/current');
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const errorData = err.response?.data as ApiError;
                const errorMessage =
                    errorData?.error ||
                    errorData?.message ||
                    `Failed to fetch current user: ${err.response?.status ?? ''} ${err.response?.statusText ?? ''}`;

                const status = err.response?.status;
                if (status === 401) {
                    throw new Error('Authentication required. Please login again.');
                } else if (status === 403) {
                    throw new Error('Access denied. You do not have permission to access this resource.');
                } else if (status === 404) {
                    throw new Error('User not found.');
                } else if (status !== undefined && status >= 500) {
                    throw new Error('Server error occurred. Please try again later.');
                }

                throw new Error(errorMessage);
            }
            throw new Error('Network error occurred. Please check your connection and try again.');
        }
    },

    /**
     * Check if user is authenticated by trying to fetch current user
     * Returns null if not authenticated
     */
    async checkAuthStatus(): Promise<CurrentUser | null> {
        try {
            const response = await this.getCurrentUser();
            return response.data;
        } catch {
            return null;
        }
    },

    /**
     * Get user profile information only
     */
    async getUserProfile(): Promise<Partial<CurrentUser> | null> {
        try {
            const response = await this.getCurrentUser();
            const user = response.data;
            return {
                phone_number: user.phone_number,
                institution: user.institution,
                address: user.address,
                city: user.city,
                province: user.province,
                location: user.location,
                avatar_url: user.avatar_url,
            };
        } catch {
            return null;
        }
    },

    /**
     * Get user ID for API requests
     */
    async getUserId(): Promise<string | null> {
        try {
            const response = await this.getCurrentUser();
            return response.data.id;
        } catch {
            return null;
        }
    },
};

// Export types for use in other components

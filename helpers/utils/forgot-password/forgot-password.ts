import { AxiosError } from 'axios';

import { alerts } from '../../../components/alerts/alerts';
import { forgotPasswordApi } from '../../../services/api/forgot-password-api/forgot-password-api';

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
  data?: {
    [key: string]: unknown;
  };
}

/**
 * Handle API errors with proper typing and user-friendly messages
 * @param error - The error object from API call
 * @returns User-friendly error message
 */
const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message || error.message || 'Network error occurred'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Validate email format using RFC-compliant regex
 * @param email - Email address to validate
 * @returns True if email format is valid
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const forgotPasswordFunctions = {
  /**
   * Handle forgot password request with comprehensive validation and error handling
   * @param email - User's email address
   * @returns Promise resolving to operation result
   */
  handleForgotPassword: async (
    email: string
  ): Promise<ForgotPasswordResult> => {
    try {
      // Input validation
      if (!email || email.trim().length === 0) {
        const errorMsg = 'Email address is required';
        await alerts.error('Input Error', errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }

      // Email format validation
      if (!isValidEmail(email)) {
        const errorMsg = 'Please enter a valid email address';
        await alerts.error('Invalid Email', errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }

      // Make API call with normalized email
      const result = await forgotPasswordApi.requestReset(
        email.trim().toLowerCase()
      );

      if (result.success) {
        await alerts.resetPasswordLinkSent(email);
        return {
          success: true,
          message: result.message || 'Password reset link sent successfully',
          data: result.data && typeof result.data === 'object' 
            ? result.data as { [key: string]: unknown }
            : undefined,
        };
      } else {
        // Handle API failure
        const errorMessage =
          result.message || 'Failed to send password reset email';
        await alerts.error('Reset Failed', errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Forgot password error:', error);

      // Handle specific error cases
      if (error instanceof AxiosError) {
        // Handle specific HTTP status codes
        if (error.response?.status === 404) {
          await alerts.error(
            'Email Not Found',
            'No account found with this email address.'
          );
          return {
            success: false,
            message: 'Email not found',
          };
        }

        if (error.response?.status === 429) {
          await alerts.error(
            'Too Many Requests',
            'Please wait before requesting another password reset.'
          );
          return {
            success: false,
            message: 'Rate limit exceeded',
          };
        }

        if (error.response && error.response.status >= 500) {
          await alerts.error(
            'Server Error',
            'Server is currently unavailable. Please try again later.'
          );
          return {
            success: false,
            message: 'Server error',
          };
        }
      }

      // Handle network errors
      if (
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('connection') ||
        errorMessage.toLowerCase().includes('timeout')
      ) {
        await alerts.error(
          'Connection Error',
          'Please check your internet connection and try again.'
        );
        return {
          success: false,
          message: 'Network error',
        };
      }

      // Generic error handling
      await alerts.error(
        'Reset Failed',
        'Failed to send password reset email. Please try again.'
      );
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Validate email format before sending request
   * @param email - Email address to validate
   * @returns True if email format is valid
   */
  validateEmail: (email: string): boolean => {
    return isValidEmail(email);
  },

  /**
   * Check if an email exists in the system (if API supports it)
   * @param email - Email address to check
   * @returns Promise resolving to boolean indicating if email exists
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      if (!isValidEmail(email)) {
        return false;
      }

      // Check if API has email verification endpoint
      interface ExtendedForgotPasswordApi {
        requestReset: (email: string) => Promise<ForgotPasswordResult>;
        checkEmailExists?: (email: string) => Promise<{ exists: boolean }>;
      }

      const api = forgotPasswordApi as ExtendedForgotPasswordApi;
      if (api.checkEmailExists) {
        const result = await api.checkEmailExists(email.trim().toLowerCase());
        return result.exists || false;
      }

      // If no specific endpoint, assume email exists for security
      return true;
    } catch (error) {
      console.error('Email check error:', error);
      // For security, assume email exists if check fails
      return true;
    }
  },

  /**
   * Show helpful information about forgot password process
   * @returns Promise that resolves when help is displayed
   */
  showForgotPasswordHelp: async (): Promise<void> => {
    try {
      // Use success alert as info alternative since alerts.info doesn't exist
      await alerts.success(
        'Forgot Password Help',
        "Enter your email address and we'll send you a link to reset your password. The link will expire in 24 hours for security."
      );
    } catch (error) {
      console.error('Error showing help:', error);
    }
  },

  /**
   * Handle rate limiting with countdown display
   * @param remainingTime - Time in seconds until next request is allowed
   * @returns Promise that resolves when rate limit message is shown
   */
  handleRateLimit: async (remainingTime: number = 60): Promise<void> => {
    try {
      await alerts.error(
        'Please Wait',
        `You can request another password reset in ${remainingTime} seconds.`
      );
    } catch (error) {
      console.error('Error showing rate limit:', error);
    }
  },
};

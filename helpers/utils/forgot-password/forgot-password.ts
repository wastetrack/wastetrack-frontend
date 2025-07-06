import { AxiosError } from 'axios';
import { showToast } from '@/components/ui';
import { Alert } from '@/components/ui';
import { forgotPasswordAPI } from '@/services/api/auth';

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
        const errorMsg = 'Alamat email wajib diisi';
        showToast.error(errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }

      // Email format validation
      if (!isValidEmail(email)) {
        const errorMsg = 'Masukkan alamat email yang valid';
        showToast.error(errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Show confirmation modal before sending
      const confirmResult = await Alert.confirm({
        title: 'Konfirmasi Email',
        text: `Apakah Anda yakin ingin mengirim link reset password ke ${normalizedEmail}?`,
        confirmButtonText: 'Ya, Kirim',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
      });

      // If user cancels, return early
      if (!confirmResult.isConfirmed) {
        return {
          success: false,
          message: 'Reset password dibatalkan',
        };
      }

      // Use toast.promise for the password reset request
      const forgotPasswordPromise = async () => {
        const result = await forgotPasswordAPI.requestReset(normalizedEmail);

        if (!result.success) {
          // Check for specific error messages from backend
          if (result.message === 'Email not found') {
            throw new Error(
              'Email tidak ditemukan dalam sistem. Pastikan email yang Anda masukkan sudah terdaftar.'
            );
          }
          throw new Error(
            result.message || 'Gagal mengirim email reset password'
          );
        }

        return result;
      };

      // Execute with toast promise and handle result properly
      try {
        await showToast.promise(forgotPasswordPromise(), {
          loading: 'Mengirim link reset password...',
          success: () => {
            return `Link reset password telah dikirim ke ${email}! Silakan cek email Anda dan ikuti petunjuknya.`;
          },
          error: (error) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Gagal mengirim email reset password';

            // Return user-friendly message for "Email not found"
            if (errorMessage.includes('Email tidak ditemukan')) {
              return errorMessage; // Already in Indonesian
            }

            return errorMessage;
          },
        });

        return {
          success: true,
          message: 'Password reset link sent successfully',
        };
      } catch (error) {
        // The toast already showed the error, just return the result
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Gagal mengirim email reset password';

        // Check for specific backend error messages
        if (
          errorMessage.includes('Email not found') ||
          errorMessage.includes('Email tidak ditemukan')
        ) {
          return {
            success: false,
            message: 'Email not found',
          };
        }

        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Forgot password error:', error);

      // Handle specific error cases
      if (
        errorMessage.includes('Email not found') ||
        errorMessage.includes('Email tidak ditemukan')
      ) {
        // This case is already handled by the toast.promise error handler
        return {
          success: false,
          message: 'Email not found',
        };
      }

      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Email not found',
          };
        }

        if (error.response?.status === 429) {
          return {
            success: false,
            message: 'Rate limit exceeded',
          };
        }

        if (error.response && error.response.status >= 500) {
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
        return {
          success: false,
          message: 'Network error',
        };
      }

      // Generic error handling
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
  /**
   * Check if an email exists in the system (simplified version)
   * @param email - Email address to check
   * @returns Promise resolving to boolean indicating if email format is valid
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      if (!isValidEmail(email)) {
        return false;
      }

      // Since backend doesn't have email checking endpoint yet,
      // we only validate format here
      return true;
    } catch (error) {
      console.error('Email check error:', error);
      return false;
    }
  },

  /**
   * Show helpful information about forgot password process
   * @returns Promise that resolves when help is displayed
   */
  showForgotPasswordHelp: async (): Promise<void> => {
    try {
      showToast.info(
        'Masukkan alamat email Anda dan kami akan mengirimkan link untuk mereset password. Link akan kedaluwarsa dalam 24 jam untuk keamanan.',
        { duration: 6000 }
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
      showToast.warning(
        `Anda dapat meminta reset password lagi dalam ${remainingTime} detik.`,
        { duration: remainingTime * 1000 }
      );
    } catch (error) {
      console.error('Error showing rate limit:', error);
    }
  },
};

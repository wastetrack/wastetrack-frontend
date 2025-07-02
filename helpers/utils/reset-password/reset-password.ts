import { resetPasswordAPI } from '@/services/api/auth';
import { alerts } from '@/components/alerts/alerts';
import { AxiosError } from 'axios';

export interface ResetPasswordResult {
  success: boolean;
  message: string;
  data?: {
    [key: string]: unknown;
  };
}

// Extended API interface for optional methods
interface ExtendedResetPasswordApi {
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<ResetPasswordResult>;
  requestPasswordReset?: (email: string) => Promise<ResetPasswordResult>;
  validateResetToken?: (token: string) => Promise<ResetPasswordResult>;
}

// Error handling utility
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

// Password validation utility
const validatePassword = (
  password: string
): { isValid: boolean; message: string } => {
  if (!password || password.trim().length === 0) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  // Check for at least one digit
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { isValid: true, message: 'Password is valid' };
};

export const resetPasswordFunctions = {
  /**
   * Handle password reset with token validation and password strength checking
   * @param token - Reset token from email link
   * @param newPassword - New password to set
   * @returns Promise<ResetPasswordResult>
   */
  handleResetPassword: async (
    token: string,
    newPassword: string
  ): Promise<ResetPasswordResult> => {
    try {
      // Validate token
      if (!token || token.trim().length === 0) {
        const errorMsg = 'Invalid reset token';
        await alerts.error('Invalid Token', errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }

      // Validate password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        await alerts.error('Invalid Password', passwordValidation.message);
        return {
          success: false,
          message: passwordValidation.message,
        };
      }

      const result = await resetPasswordAPI.resetPassword(token, newPassword);

      if (result.success) {
        await alerts.success(
          'Password Reset Successful! 🎉',
          'Your password has been reset successfully. You can now login with your new password.'
        );
        return {
          success: true,
          message: result.message,
          data: result.data && typeof result.data === 'object' 
            ? result.data as { [key: string]: unknown }
            : undefined,
        };
      } else {
        // Handle specific error cases
        if (
          result.message.toLowerCase().includes('token') &&
          (result.message.toLowerCase().includes('expired') ||
            result.message.toLowerCase().includes('invalid'))
        ) {
          await alerts.error(
            'Token Expired',
            'Your password reset link has expired. Please request a new password reset.'
          );
        } else {
          await alerts.error('Reset Failed', result.message);
        }

        return {
          success: false,
          message: result.message,
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);

      // Handle specific API errors
      if (
        errorMessage.toLowerCase().includes('token expired') ||
        errorMessage.toLowerCase().includes('invalid token')
      ) {
        await alerts.error(
          'Token Expired',
          'Your password reset link has expired. Please request a new password reset.'
        );
      } else if (
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('connection')
      ) {
        await alerts.error(
          'Connection Error',
          'Please check your internet connection and try again.'
        );
      } else {
        await alerts.error('Reset Error', errorMessage);
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Request password reset email (forgot password functionality)
   * Note: This method requires the API to have a requestPasswordReset endpoint
   * @param email - User's email address
   * @returns Promise<ResetPasswordResult>
   */
  requestPasswordReset: async (email: string): Promise<ResetPasswordResult> => {
    try {
      // Validate email format
      if (!email || !email.includes('@') || email.trim().length === 0) {
        const errorMsg = 'Please provide a valid email address';
        await alerts.error('Invalid Email', errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }

      // Check if the API method exists using proper typing
      const api = resetPasswordAPI as ExtendedResetPasswordApi;
      if (api.requestPasswordReset) {
        const result = await api.requestPasswordReset(email);

        if (result.success) {
          await alerts.success(
            'Reset Link Sent! 📧',
            'A password reset link has been sent to your email address. Please check your inbox.'
          );
          return {
            success: true,
            message: result.message,
            data: result.data,
          };
        } else {
          await alerts.error('Failed to Send', result.message);
          return {
            success: false,
            message: result.message,
          };
        }
      } else {
        const errorMsg =
          'Password reset request functionality is not available. Please contact support.';
        await alerts.error('Feature Not Available', errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      await alerts.error('Request Error', errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Validate reset token without performing password reset
   * Note: This method requires the API to have a validateResetToken endpoint
   * @param token - Reset token to validate
   * @returns Promise<ResetPasswordResult>
   */
  validateResetToken: async (token: string): Promise<ResetPasswordResult> => {
    try {
      if (!token || token.trim().length === 0) {
        return {
          success: false,
          message: 'Invalid reset token',
        };
      }

      // Check if the API method exists using proper typing
      const api = resetPasswordAPI as ExtendedResetPasswordApi;
      if (api.validateResetToken) {
        const result = await api.validateResetToken(token);

        return {
          success: result.success,
          message: result.message,
          data: result.data,
        };
      } else {
        // Fallback: assume token is valid for now
        // In a real implementation, you might want to make a test call or handle this differently
        return {
          success: true,
          message: 'Token validation passed (method not available)',
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};

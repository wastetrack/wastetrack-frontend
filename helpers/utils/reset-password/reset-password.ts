import { resetPasswordAPI } from '@/services/api/auth';
import { Alert } from '@/components/ui';
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
        Alert.error({
          title: 'Invalid Token',
          text: errorMsg,
        });
        return {
          success: false,
          message: errorMsg,
        };
      }

      // Validate password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        Alert.error({
          title: 'Invalid Password',
          text: passwordValidation.message,
        });
        return {
          success: false,
          message: passwordValidation.message,
        };
      }

      const result = await resetPasswordAPI.resetPassword(token, newPassword);

      if (result.success) {
        Alert.success({
          title: 'Password Reset Successful! 🎉',
          text: 'Your password has been reset successfully. You can now login with your new password.',
        });
        return {
          success: true,
          message: result.message,
          data:
            result.data && typeof result.data === 'object'
              ? (result.data as { [key: string]: unknown })
              : undefined,
        };
      } else {
        // Handle specific error cases
        if (
          result.message.toLowerCase().includes('token') &&
          (result.message.toLowerCase().includes('expired') ||
            result.message.toLowerCase().includes('invalid'))
        ) {
          Alert.error({
            title: 'Token Expired',
            text: 'Your password reset link has expired. Please request a new password reset.',
          });
        } else {
          Alert.error({
            title: 'Reset Failed',
            text: result.message,
          });
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
        Alert.error({
          title: 'Token Expired',
          text: 'Your password reset link has expired. Please request a new password reset.',
        });
      } else if (
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('connection')
      ) {
        Alert.error({
          title: 'Connection Error',
          text: 'Please check your internet connection and try again.',
        });
      } else {
        Alert.error({
          title: 'Reset Error',
          text: errorMessage,
        });
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
        Alert.error({
          title: 'Invalid Email',
          text: errorMsg,
        });
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
          Alert.success({
            title: 'Reset Link Sent! 📧',
            text: 'A password reset link has been sent to your email address. Please check your inbox.',
          });
          return {
            success: true,
            message: result.message,
            data: result.data,
          };
        } else {
          Alert.error({
            title: 'Failed to Send',
            text: result.message,
          });
          return {
            success: false,
            message: result.message,
          };
        }
      } else {
        const errorMsg =
          'Password reset request functionality is not available. Please contact support.';
        Alert.error({
          title: 'Feature Not Available',
          text: errorMsg,
        });
        return {
          success: false,
          message: errorMsg,
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.error({
        title: 'Request Error',
        text: errorMessage,
      });
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

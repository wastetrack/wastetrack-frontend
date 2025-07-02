import { emailVerificationApi } from '../../../services/api/email-verification-api/email-verification-api';
import { alerts } from '../../../components/alerts/alerts';
import { AxiosError } from 'axios';

// Types & Interfaces
export interface VerificationResult {
  success: boolean;
  message: string;
  isVerified?: boolean;
  data?: {
    is_email_verified?: boolean;
    [key: string]: unknown;
  };
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

// Functions
export const emailVerificationFunctions = {
  // Handle email verification from URL token
  handleEmailVerification: async (
    token: string
  ): Promise<VerificationResult> => {
    try {
      // Validate token
      if (!token || token.trim().length === 0) {
        const errorMsg = 'Invalid verification token';
        await alerts.emailVerificationFailed(errorMsg);
        return {
          success: false,
          message: errorMsg,
          isVerified: false,
        };
      }

      const result = await emailVerificationApi.verifyEmail(token);

      if (result.success) {
        await alerts.emailVerificationSuccess();

        return {
          success: true,
          message: result.message,
          isVerified: true,
        };
      } else {
        await alerts.emailVerificationFailed(result.message);

        return {
          success: false,
          message: result.message,
          isVerified: false,
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);

      await alerts.emailVerificationFailed(errorMessage);

      return {
        success: false,
        message: errorMessage,
        isVerified: false,
      };
    }
  },

  // Handle resend verification email
  handleResendVerification: async (
    email: string
  ): Promise<VerificationResult> => {
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        const errorMsg = 'Please provide a valid email address';
        await alerts.error('Invalid Email', errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }

      const result = await emailVerificationApi.resendVerification(email);

      if (result.success) {
        await alerts.emailVerificationSent();

        return {
          success: true,
          message: result.message,
        };
      } else {
        // Check if it's a cooldown error
        if (
          result.message.toLowerCase().includes('cooldown') ||
          result.message.toLowerCase().includes('wait') ||
          result.message.toLowerCase().includes('tunggu') ||
          result.message.toLowerCase().includes('rate limit')
        ) {
          // Extract time if available, default to 60 seconds
          const timeMatch = result.message.match(/(\d+)/);
          const remainingTime = timeMatch ? parseInt(timeMatch[1]) : 60;
          await alerts.emailVerificationCooldown(remainingTime);
        } else {
          await alerts.error('Failed to Send', result.message);
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
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('too many requests')
      ) {
        await alerts.emailVerificationCooldown(60);
      } else {
        await alerts.error('Error', errorMessage);
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Check if email is verified (silent check without alerts)
  checkEmailVerificationStatus: async (
    email: string
  ): Promise<VerificationResult> => {
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        return {
          success: false,
          message: 'Invalid email address',
          isVerified: false,
        };
      }

      const result = await emailVerificationApi.checkVerificationStatus(email);

      return {
        success: result.success,
        message: result.message,
        isVerified: result.data?.is_email_verified || false,
        data: result.data,
      };
    } catch (error) {
      const errorMessage = handleApiError(error);

      return {
        success: false,
        message: errorMessage,
        isVerified: false,
      };
    }
  },

  // Show email not verified alert for login
  showEmailNotVerifiedAlert: async (email: string): Promise<boolean> => {
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        await alerts.error(
          'Invalid Email',
          'Please provide a valid email address'
        );
        return false;
      }

      const result = await alerts.emailNotVerified(email);

      if (result.isConfirmed) {
        const resendResult =
          await emailVerificationFunctions.handleResendVerification(email);
        return resendResult.success;
      }

      return false;
    } catch (error) {
      const errorMessage = handleApiError(error);
      await alerts.error('Error', errorMessage);
      return false;
    }
  },
};

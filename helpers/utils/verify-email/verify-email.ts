import { emailVerificationAPI } from '@/services/api/auth';
import { Alert } from '@/components/ui';
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
        await Alert.error({
          title: 'Verifikasi Email Gagal',
          text: errorMsg,
        });
        return {
          success: false,
          message: errorMsg,
          isVerified: false,
        };
      }

      const result = await emailVerificationAPI.verifyEmail(token);

      if (result.success) {
        await Alert.success({
          title: 'Email Berhasil Diverifikasi! ✅',
          text: 'Selamat! Email Anda telah berhasil diverifikasi.',
        });

        return {
          success: true,
          message: result.message,
          isVerified: true,
        };
      } else {
        await Alert.error({
          title: 'Verifikasi Email Gagal',
          text: result.message,
        });

        return {
          success: false,
          message: result.message,
          isVerified: false,
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);

      await Alert.error({
        title: 'Verifikasi Email Gagal',
        text: errorMessage,
      });

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
        await Alert.error({
          title: 'Invalid Email',
          text: errorMsg,
        });
        return {
          success: false,
          message: errorMsg,
        };
      }

      const result = await emailVerificationAPI.resendVerification(email);

      if (result.success) {
        await Alert.success({
          title: 'Email Verifikasi Terkirim! 📧',
          text: 'Email verifikasi berhasil dikirim ke kotak masuk Anda.',
        });

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
          await Alert.info({
            title: 'Tunggu Sebentar ⏰',
            text: `Anda baru saja meminta email verifikasi. Silakan tunggu ${remainingTime} detik sebelum meminta lagi.`,
          });
        } else {
          await Alert.error({
            title: 'Failed to Send',
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
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('too many requests')
      ) {
        await Alert.info({
          title: 'Tunggu Sebentar ⏰',
          text: 'Anda baru saja meminta email verifikasi. Silakan tunggu 60 detik sebelum meminta lagi.',
        });
      } else {
        await Alert.error({
          title: 'Error',
          text: errorMessage,
        });
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

      const result = await emailVerificationAPI.checkVerificationStatus(email);

      // Type guard to safely access the data
      const isVerified =
        result.data &&
        typeof result.data === 'object' &&
        'is_email_verified' in result.data
          ? Boolean(
              (result.data as { is_email_verified?: boolean }).is_email_verified
            )
          : false;

      return {
        success: result.success,
        message: result.message,
        isVerified,
        data:
          result.data && typeof result.data === 'object'
            ? (result.data as {
                [key: string]: unknown;
                is_email_verified?: boolean;
              })
            : undefined,
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
        Alert.error({
          title: 'Invalid Email',
          text: 'Please provide a valid email address',
        });
        return false;
      }

      const result = await Alert.info({
        title: 'Email Not Verified',
        text: `Your email ${email} is not verified. Would you like to resend the verification email?`,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Resend Email',
        cancelButtonText: 'Cancel',
      });

      if (result.isConfirmed) {
        const resendResult =
          await emailVerificationFunctions.handleResendVerification(email);
        return resendResult.success;
      }

      return false;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.error({
        title: 'Error',
        text: errorMessage,
      });
      return false;
    }
  },
};

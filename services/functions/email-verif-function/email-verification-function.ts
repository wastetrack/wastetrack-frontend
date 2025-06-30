// Imports
import { emailVerificationApi } from '../../api/email-verification-api/email-verification-api';
import { alerts } from '../../../components/alerts/alerts';

// Types & Interfaces
export interface VerificationResult {
  success: boolean;
  message: string;
  isVerified?: boolean;
}

// Functions
export const emailVerificationFunctions = {
  // Handle email verification from URL token
  handleEmailVerification: async (token: string): Promise<VerificationResult> => {
    try {
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
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      
      await alerts.emailVerificationFailed(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        isVerified: false,
      };
    }
  },

  // Handle resend verification email
  handleResendVerification: async (email: string): Promise<VerificationResult> => {
    try {
      const result = await emailVerificationApi.resendVerification(email);
      
      if (result.success) {
        await alerts.emailVerificationSent();
        
        return {
          success: true,
          message: result.message,
        };
      } else {
        // Check if it's a cooldown error
        if (result.message.toLowerCase().includes('cooldown') || 
            result.message.toLowerCase().includes('wait') ||
            result.message.toLowerCase().includes('tunggu')) {
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
      
      await alerts.error('Error', errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Check if email is verified (silent check without alerts)
  checkEmailVerificationStatus: async (email: string): Promise<VerificationResult> => {
    try {
      const result = await emailVerificationApi.checkVerificationStatus(email);
      
      return {
        success: result.success,
        message: result.message,
        isVerified: result.data?.is_email_verified || false,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check verification status',
        isVerified: false,
      };
    }
  },

  // Show email not verified alert for login (moved to alerts.tsx)
  showEmailNotVerifiedAlert: async (email: string): Promise<boolean> => {
    const result = await alerts.emailNotVerified(email);

    if (result.isConfirmed) {
      const resendResult = await emailVerificationFunctions.handleResendVerification(email);
      return resendResult.success;
    }

    return false;
  },
};

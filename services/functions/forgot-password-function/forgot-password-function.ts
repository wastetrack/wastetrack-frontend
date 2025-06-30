import { forgotPasswordApi } from '../../api/forgot-password-api/forgot-password-api';
import { alerts } from '../../../components/alerts/alerts';

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
}

export const forgotPasswordFunctions = {
  handleForgotPassword: async (email: string): Promise<ForgotPasswordResult> => {
    try {
      const result = await forgotPasswordApi.requestReset(email);
      
      if (result.success) {
        await alerts.resetPasswordLinkSent(email);
        return {
          success: true,
          message: result.message,
        };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      // Use invalidResetToken as a generic error handler since genericError doesn't exist
      await alerts.invalidResetToken();
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
};

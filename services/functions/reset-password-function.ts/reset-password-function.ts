import { resetPasswordApi } from '../../api/reset-password-api/reset-password-api';
import { alerts } from '../../../components/alerts/alerts';

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

export const resetPasswordFunctions = {
  handleResetPassword: async (token: string, newPassword: string): Promise<ResetPasswordResult> => {
    try {
      const result = await resetPasswordApi.resetPassword(token, newPassword);
      
      if (result.success) {
        await alerts.success('Success', 'Your password has been reset successfully');
        return {
          success: true,
          message: result.message,
        };
      } else {
        await alerts.error('Failed', result.message);
        return {
          success: false,
          message: result.message,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      await alerts.error('Error', errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
};

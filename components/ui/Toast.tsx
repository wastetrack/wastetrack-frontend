'use client';

import { toast, ExternalToast } from 'sonner';

// Export the toast functions for easy usage
export const showToast = {
  success: (message: string, options?: ExternalToast) => {
    return toast.success(message, {
      duration: 5000,
      ...options,
    });
  },

  error: (message: string, options?: ExternalToast) => {
    return toast.error(message, {
      duration: 6000,
      ...options,
    });
  },

  warning: (message: string, options?: ExternalToast) => {
    return toast.warning(message, {
      duration: 5000,
      ...options,
    });
  },

  info: (message: string, options?: ExternalToast) => {
    return toast.info(message, {
      duration: 5000,
      ...options,
    });
  },

  loading: (message: string, options?: ExternalToast) => {
    return toast.loading(message, options);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  // Helper untuk custom actions
  withAction: (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    actionLabel: string,
    actionFn: () => void
  ) => {
    const options: ExternalToast = {
      action: {
        label: actionLabel,
        onClick: actionFn,
      },
    };

    return showToast[type](message, options);
  },

  // Helper untuk toast dengan deskripsi
  withDescription: (
    message: string,
    description: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const options: ExternalToast = {
      description,
    };

    return showToast[type](message, options);
  },

  // Helper untuk custom styling dengan Tailwind classes
  custom: (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    className?: string,
    options?: ExternalToast
  ) => {
    return showToast[type](message, {
      ...options,
      className: className,
    });
  },
};

// Re-export toast for direct usage if needed
export { toast } from 'sonner';

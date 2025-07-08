'use client';

import Swal from 'sweetalert2';

// Types untuk alert configuration
export interface AlertConfig {
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  title: string;
  text?: string;
  html?: string;
  iconColor?: string;
  confirmButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonText?: string;
  cancelButtonColor?: string;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  timer?: number;
  allowOutsideClick?: boolean;
  customClass?: {
    popup?: string;
    title?: string;
    htmlContainer?: string;
    confirmButton?: string;
    cancelButton?: string;
  };
}

// Default configurations untuk berbagai tipe alert
const defaultConfigs = {
  success: {
    iconColor: '#10b981',
    confirmButtonColor: '#10b981',
    customClass: {
      popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg shadow-lg',
      title: 'text-base sm:text-xl font-semibold text-gray-800',
      htmlContainer: 'text-sm sm:text-base text-gray-600',
      confirmButton: 'text-sm font-medium sm:text-base',
    },
  },
  error: {
    iconColor: '#ef4444',
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Mengerti',
    customClass: {
      popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg',
      title: 'text-xl sm:text-2xl font-semibold text-gray-800',
      htmlContainer: 'text-sm sm:text-base text-gray-600',
      confirmButton: 'text-sm sm:text-base',
    },
  },
  warning: {
    iconColor: '#f59e0b',
    confirmButtonColor: '#f59e0b',
    customClass: {
      popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg',
      title: 'text-base sm:text-xl font-semibold text-gray-800',
      htmlContainer: 'text-sm sm:text-base text-gray-600',
      confirmButton: 'text-sm font-medium sm:text-base',
    },
  },
  info: {
    iconColor: '#3b82f6',
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg',
      title: 'text-base sm:text-xl font-semibold text-gray-800',
      htmlContainer: 'text-sm sm:text-base text-gray-600',
      confirmButton: 'text-sm font-medium sm:text-base',
    },
  },
  confirm: {
    iconColor: '#f59e0b',
    showCancelButton: true,
    confirmButtonText: 'Ya, Lanjutkan',
    confirmButtonColor: '#f59e0b',
    cancelButtonText: 'Batal',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg',
      title: 'text-base sm:text-xl font-semibold text-gray-800',
      htmlContainer: 'text-sm sm:text-base text-gray-600',
      confirmButton: 'text-sm font-medium sm:text-base',
      cancelButton: 'text-sm font-medium sm:text-base',
    },
  },
  loading: {
    allowOutsideClick: false,
    showConfirmButton: false,
    customClass: {
      popup: 'w-[90%] max-w-sm rounded-md sm:rounded-lg',
      title: 'text-base font-semibold text-gray-800',
      htmlContainer: 'text-sm text-gray-600',
    },
  },
};

// Main Alert class
export class Alert {
  private static mergeConfig(
    type: keyof typeof defaultConfigs,
    config: AlertConfig
  ) {
    const defaultConfig = defaultConfigs[type];
    return {
      ...defaultConfig,
      ...config,
      customClass: {
        ...defaultConfig.customClass,
        ...config.customClass,
      },
    };
  }

  // Basic alert methods
  static success(config: AlertConfig) {
    const mergedConfig = this.mergeConfig('success', {
      icon: 'success',
      timer: 8000,
      showConfirmButton: false,
      ...config,
    });

    return Swal.fire(mergedConfig);
  }

  static error(config: AlertConfig) {
    const mergedConfig = this.mergeConfig('error', {
      icon: 'error',
      ...config,
    });

    return Swal.fire(mergedConfig);
  }

  static warning(config: AlertConfig) {
    const mergedConfig = this.mergeConfig('warning', {
      icon: 'warning',
      ...config,
    });

    return Swal.fire(mergedConfig);
  }

  static info(config: AlertConfig) {
    const mergedConfig = this.mergeConfig('info', {
      icon: 'info',
      ...config,
    });

    return Swal.fire(mergedConfig);
  }

  static confirm(config: AlertConfig) {
    const mergedConfig = this.mergeConfig('confirm', {
      icon: 'warning',
      ...config,
    });

    return Swal.fire(mergedConfig);
  }

  static loading(title: string = 'Memproses...') {
    try {
      const config = this.mergeConfig('loading', {
        title,
        html: '<div class="text-sm text-gray-600">Mohon tunggu sebentar</div>',
      });

      return Swal.fire({
        ...config,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } catch (error) {
      console.error('Loading alert error:', error);
    }
  }

  static close() {
    try {
      Swal.close();
    } catch (error) {
      console.error('Close alert error:', error);
    }
  }

  // Custom alert with full control
  static custom(config: AlertConfig) {
    return Swal.fire(config);
  }
}

// Hook untuk menggunakan alerts dalam React components
export const useAlert = () => {
  return {
    success: (config: AlertConfig) => Alert.success(config),
    error: (config: AlertConfig) => Alert.error(config),
    warning: (config: AlertConfig) => Alert.warning(config),
    info: (config: AlertConfig) => Alert.info(config),
    confirm: (config: AlertConfig) => Alert.confirm(config),
    loading: (title?: string) => Alert.loading(title),
    close: () => Alert.close(),
    custom: (config: AlertConfig) => Alert.custom(config),
  };
};

export default Alert;

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAPI } from '@/services/api/auth';
import { FormData } from '@/types';
import {
  validateForm,
  getRedirectPath,
} from '@/helpers/utils/register/register';
import { showToast } from '@/components/ui';

export function useRegisterLogic() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    username: '',
    phone_number: '',
    institution: '',
    institution_id: '',
    address: '',
    city: '',
    province: '',
    location: {
      latitude: 0,
      longitude: 0,
    },
    is_accepting_customer: true
  });

  const handleFormDataChange = (newFormData: FormData) => {
    setFormData(newFormData);
    if (error) setError('');
  };

  // ✅ Remove form event parameter, since preventDefault is handled in component
  const handleSubmit = async (submitData: FormData) => {
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      showToast.warning(`Data tidak valid: ${validationErrors.join(', ')}`, {
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use submitData (already transformed) instead of transforming again
      await showToast.promise(registerAPI.register(submitData), {
        loading: 'Membuat akun...',
        success: `Email verifikasi telah dikirim ke ${formData.email}. Silakan cek inbox atau folder spam Anda.`,
        error: 'Gagal membuat akun. Silakan coba lagi.',
      });

      const redirectPath = getRedirectPath();
      router.push(redirectPath);
    } catch (err) {
      console.error('Registration error:', err);

      const errorMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga';

      // ... existing error handling
      if (
        errorMessage.toLowerCase().includes('email') &&
        (errorMessage.toLowerCase().includes('already') ||
          errorMessage.toLowerCase().includes('exist'))
      ) {
        setError('Email sudah terdaftar');
        showToast.withAction(
          'Email sudah terdaftar. Silakan gunakan email lain atau login jika ini email Anda.',
          'error',
          'Login',
          () => router.push('/login')
        );
      } else if (
        errorMessage.includes('validation') ||
        errorMessage.includes('invalid')
      ) {
        setError('Data tidak valid');
        showToast.error(`Data tidak valid: ${errorMessage}`);
      } else if (
        errorMessage.includes('server') ||
        errorMessage.includes('500')
      ) {
        setError('Server bermasalah');
        showToast.error(
          'Server sedang mengalami gangguan. Silakan coba lagi nanti.'
        );
      } else {
        setError(errorMessage);
        showToast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    handleFormDataChange,
    handleSubmit,
  };
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAPI } from '@/services/api/auth';
import { FormData } from '@/types/auth';
import {
  validateForm,
  transformFormDataToApi,
  getRedirectPath,
} from '@/helpers/utils/register/register';
import { alerts } from '@/components/alerts/alerts';

export function useRegisterLogic() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    fullName: '',
    phone: '',
    phoneClean: '',
    institution: '',
    address: '',
    city: '',
    province: '',
    coordinates: null,
  });

  const handleFormDataChange = (newFormData: FormData) => {
    setFormData(newFormData);
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      await alerts.validationError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Show loading alert
      alerts.loading('Membuat akun...');

      // Transform and send data
      const apiData = transformFormDataToApi(formData);
      await registerAPI.register(apiData);

      // Close loading and show success with username
      alerts.close();
      await alerts.registrationSuccess(formData.fullName);

      // Redirect based on role
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
    } catch (err) {
      alerts.close();
      console.error('Registration error:', err);

      const errorMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga';

      // Handle specific error cases with reusable alerts
      if (
        errorMessage.toLowerCase().includes('email') &&
        (errorMessage.toLowerCase().includes('already') ||
          errorMessage.toLowerCase().includes('exist'))
      ) {
        setError('Email sudah terdaftar');
        const result = await alerts.emailAlreadyExists();
        if (result.isConfirmed) {
          router.push('/login');
        }
      } else if (
        errorMessage.includes('validation') ||
        errorMessage.includes('invalid')
      ) {
        setError('Data tidak valid');
        await alerts.validationError(errorMessage);
      } else if (
        errorMessage.includes('server') ||
        errorMessage.includes('500')
      ) {
        setError('Server bermasalah');
        await alerts.serverError();
      } else {
        setError(errorMessage);
        await alerts.genericError(errorMessage);
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

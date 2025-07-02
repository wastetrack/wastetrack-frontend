'use client';

import React from 'react';
import { RegisterForm } from '@/components/auth/register';
import { useRegisterLogic } from '@/hooks/useRegisterLogic';

export default function RegisterPage() {
  const {
    formData,
    loading,
    error,
    handleFormDataChange,
    handleSubmit,
  } = useRegisterLogic();

  return (
    <main className='flex min-h-screen w-full items-center justify-center bg-gray-50 font-poppins'>
      <div className='w-full max-w-3xl sm:rounded-xl sm:bg-white p-6 sm:shadow-sm'>
        <RegisterForm
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>
    </main>
  );
}

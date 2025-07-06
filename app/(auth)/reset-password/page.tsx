'use client';

import { Suspense } from 'react';
import {
  ResetPasswordForm,
  LoadingPage,
} from '@/components/auth/reset-password';

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import { VerifyEmailContent, VerifyEmailLoading } from '@/components/auth/verify-email';

// Export default component yang dibungkus dengan Suspense
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

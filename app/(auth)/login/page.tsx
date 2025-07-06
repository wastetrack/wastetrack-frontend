import React from 'react';
import { LoginForm, LoginInfo } from '@/components/auth/login';

export default function LoginPage() {
  return (
    <div>
      <main className='flex min-h-screen w-full bg-gray-50 font-poppins'>
        {/* Left Panel – Form Login */}
        <section className='flex w-full items-center justify-center p-6 lg:w-1/2'>
          <LoginForm />
        </section>

        {/* Right Panel – Informasi */}
        <LoginInfo />
      </main>
    </div>
  );
}

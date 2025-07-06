'use client';

import React from 'react';
import { Check, Bell, Zap } from 'lucide-react';

export default function LoginInfo() {
  return (
    <section className='hidden flex-col justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 text-white lg:flex lg:w-1/2'>
      <div className='mx-auto w-full px-6 sm:max-w-2xl lg:px-8 xl:px-12'>
        <h2 className='mb-4 text-center text-2xl font-bold leading-tight text-white lg:mb-6 lg:text-3xl xl:text-4xl'>
          Selamat Datang di WasteTrack
        </h2>
        <p className='mb-8 text-center text-base leading-relaxed text-white/90 lg:mb-12 lg:text-lg xl:text-xl'>
          Bergabunglah dengan kami untuk mewujudkan masa depan yang
          berkelanjutan melalui pengelolaan sampah yang efisien.
        </p>
        <div className='space-y-6'>
          <div className='flex transform items-center gap-4 rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/15 lg:gap-5 lg:p-5 xl:p-6'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm'>
              <Check className='h-6 w-6 text-emerald-600' />
            </div>
            <p className='text-base font-medium lg:text-lg'>
              Pantau progres pengelolaan sampah Anda
            </p>
          </div>
          <div className='flex transform items-center gap-4 rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/15 lg:gap-5 lg:p-5 xl:p-6'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm'>
              <Bell className='h-6 w-6 text-emerald-600' />
            </div>
            <p className='text-base font-medium lg:text-lg'>
              Dapatkan notifikasi penting
            </p>
          </div>
          <div className='flex transform items-center gap-4 rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/15 lg:gap-5 lg:p-5 xl:p-6'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm'>
              <Zap className='h-6 w-6 text-emerald-600' />
            </div>
            <p className='text-base font-medium lg:text-lg'>
              Solusi efisien dan berkelanjutan
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { Truck } from 'lucide-react';

export default function RequestsPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <Truck className='text-emerald-600' size={28} />
            Permintaan Offtaker
          </h1>
          <p className='mt-1 text-gray-600'>
            Ini halaman Permintaan Offtaker untuk Bank Sampah Pusat
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='text-center'>
          <Truck className='mx-auto mb-4 text-emerald-600' size={64} />
          <h2 className='text-xl font-semibold text-gray-900'>
            Halaman Permintaan Offtaker
          </h2>
          <p className='mt-2 text-gray-600'>
            Fitur untuk mengelola permintaan dari industri offtaker di Bank
            Sampah Pusat akan tersedia di sini.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Users } from 'lucide-react';

export default function CollectorsPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <Users className='text-emerald-600' size={28} />
            Manajemen Kolektor
          </h1>
          <p className='mt-1 text-gray-600'>
            Ini halaman Manajemen Kolektor untuk Bank Sampah Pusat
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='text-center'>
          <Users className='mx-auto mb-4 text-emerald-600' size={64} />
          <h2 className='text-xl font-semibold text-gray-900'>
            Halaman Manajemen Kolektor
          </h2>
          <p className='mt-2 text-gray-600'>
            Fitur untuk mengelola kolektor di Bank Sampah Pusat akan tersedia di
            sini.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <FileText className='text-emerald-600' size={28} />
            Laporan Unit
          </h1>
          <p className='mt-1 text-gray-600'>
            Ini halaman Laporan Unit untuk Bank Sampah Pusat
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='text-center'>
          <FileText className='mx-auto mb-4 text-emerald-600' size={64} />
          <h2 className='text-xl font-semibold text-gray-900'>
            Halaman Laporan Unit
          </h2>
          <p className='mt-2 text-gray-600'>
            Fitur untuk melihat laporan dari unit-unit Bank Sampah akan tersedia
            di sini.
          </p>
        </div>
      </div>
    </div>
  );
}

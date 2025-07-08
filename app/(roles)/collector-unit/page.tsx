'use client';

import { useState } from 'react';
import { LogoutButton } from '@/components/logout-button/logout-button';

export default function CollectorUnitDashboard() {
  const [stats] = useState({
    totalCollections: 156,
    completedTrips: 89,
    pendingTasks: 12,
    totalWasteCollected: 2340, // in kg
  });

  const [recentCollections] = useState([
    {
      id: 1,
      location: 'Jl. Raya Surabaya No. 123',
      date: '2025-07-08',
      status: 'completed',
      wasteType: 'Plastik',
      amount: 25.5,
    },
    {
      id: 2,
      location: 'Jl. Pemuda No. 456',
      date: '2025-07-08',
      status: 'in-progress',
      wasteType: 'Kertas',
      amount: 18.2,
    },
    {
      id: 3,
      location: 'Jl. Diponegoro No. 789',
      date: '2025-07-07',
      status: 'pending',
      wasteType: 'Logam',
      amount: 12.8,
    },
  ]);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Dashboard Unit Pengumpul
            </h1>
            <p className='text-gray-600'>
              Selamat datang di dashboard unit pengumpul sampah. Kelola tugas
              dan pantau aktivitas pengumpulan sampah Anda.
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Pengumpulan</p>
              <p className='text-2xl font-bold text-blue-600'>
                {stats.totalCollections}
              </p>
            </div>
            <div className='rounded-full bg-blue-100 p-3'>
              <svg
                className='h-6 w-6 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Perjalanan Selesai</p>
              <p className='text-2xl font-bold text-green-600'>
                {stats.completedTrips}
              </p>
            </div>
            <div className='rounded-full bg-green-100 p-3'>
              <svg
                className='h-6 w-6 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Tugas Pending</p>
              <p className='text-2xl font-bold text-orange-600'>
                {stats.pendingTasks}
              </p>
            </div>
            <div className='rounded-full bg-orange-100 p-3'>
              <svg
                className='h-6 w-6 text-orange-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Sampah (kg)</p>
              <p className='text-2xl font-bold text-purple-600'>
                {stats.totalWasteCollected}
              </p>
            </div>
            <div className='rounded-full bg-purple-100 p-3'>
              <svg
                className='h-6 w-6 text-purple-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Collections */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>
          Pengumpulan Terbaru
        </h2>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200'>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                  Lokasi
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                  Tanggal
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                  Jenis Sampah
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                  Jumlah (kg)
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentCollections.map((collection) => (
                <tr
                  key={collection.id}
                  className='border-b border-gray-100 hover:bg-gray-50'
                >
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {collection.location}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-600'>
                    {collection.date}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-600'>
                    {collection.wasteType}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-600'>
                    {collection.amount}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        collection.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : collection.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {collection.status === 'completed'
                        ? 'Selesai'
                        : collection.status === 'in-progress'
                          ? 'Dalam Proses'
                          : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>Aksi Cepat</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <button className='flex items-center rounded-lg bg-blue-50 p-4 transition-colors hover:bg-blue-100'>
            <div className='mr-3 rounded-full bg-blue-100 p-2'>
              <svg
                className='h-5 w-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
            </div>
            <div className='text-left'>
              <p className='font-medium text-gray-900'>Buat Tugas Baru</p>
              <p className='text-sm text-gray-600'>Tambah tugas pengumpulan</p>
            </div>
          </button>

          <button className='flex items-center rounded-lg bg-green-50 p-4 transition-colors hover:bg-green-100'>
            <div className='mr-3 rounded-full bg-green-100 p-2'>
              <svg
                className='h-5 w-5 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
            </div>
            <div className='text-left'>
              <p className='font-medium text-gray-900'>Lihat Laporan</p>
              <p className='text-sm text-gray-600'>Laporan pengumpulan</p>
            </div>
          </button>

          <button className='flex items-center rounded-lg bg-purple-50 p-4 transition-colors hover:bg-purple-100'>
            <div className='mr-3 rounded-full bg-purple-100 p-2'>
              <svg
                className='h-5 w-5 text-purple-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
            </div>
            <div className='text-left'>
              <p className='font-medium text-gray-900'>Lacak Perjalanan</p>
              <p className='text-sm text-gray-600'>Monitor rute aktif</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

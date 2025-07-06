'use client';

import React from 'react';
import { UserCheck, Plus, Search, Filter } from 'lucide-react';

export default function CollectorsPage() {
  // Mock data - replace with actual data from API
  const collectors = [
    {
      id: 1,
      name: 'Ahmad Hidayat',
      phone: '081234567890',
      area: 'Zona A - Perumahan Griya',
      status: 'active',
      joinDate: '2024-01-15',
      totalCollections: 245,
    },
    {
      id: 2,
      name: 'Sari Dewi',
      phone: '081234567891',
      area: 'Zona B - Komplek Mahasiswa',
      status: 'active',
      joinDate: '2024-02-20',
      totalCollections: 189,
    },
    {
      id: 3,
      name: 'Budi Prasetyo',
      phone: '081234567892',
      area: 'Zona C - Pasar Tradisional',
      status: 'inactive',
      joinDate: '2024-01-10',
      totalCollections: 156,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <UserCheck className='text-emerald-600' size={28} />
            Manajemen Kolektor
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola tim kolektor sampah unit Anda
          </p>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'>
            <Plus size={20} />
            Tambah Kolektor
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='relative flex-1'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400'
              size={20}
            />
            <input
              type='text'
              placeholder='Cari nama kolektor...'
              className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            />
          </div>
          <button className='flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50'>
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      {/* Collectors Table */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-6 py-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Daftar Kolektor
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Kolektor
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Area Tugas
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Total Koleksi
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {collectors.map((collector) => (
                <tr key={collector.id} className='hover:bg-gray-50'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {collector.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {collector.phone}
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {collector.area}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {collector.totalCollections}
                    </div>
                    <div className='text-sm text-gray-500'>koleksi</div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        collector.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {collector.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className='space-x-2 whitespace-nowrap px-6 py-4 text-sm font-medium'>
                    <button className='text-emerald-600 hover:text-emerald-900'>
                      Edit
                    </button>
                    <button className='text-red-600 hover:text-red-900'>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-emerald-600'>
              {collectors.filter((c) => c.status === 'active').length}
            </div>
            <div className='text-sm text-gray-600'>Kolektor Aktif</div>
          </div>
        </div>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {collectors.reduce((sum, c) => sum + c.totalCollections, 0)}
            </div>
            <div className='text-sm text-gray-600'>Total Koleksi</div>
          </div>
        </div>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {Math.round(
                collectors.reduce((sum, c) => sum + c.totalCollections, 0) /
                  collectors.length
              )}
            </div>
            <div className='text-sm text-gray-600'>Rata-rata per Kolektor</div>
          </div>
        </div>
      </div>
    </div>
  );
}

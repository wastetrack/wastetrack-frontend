'use client';

import { useState } from 'react';

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState('today');
  const [filterType, setFilterType] = useState('all');
  const [collections] = useState({
    today: [
      {
        id: 1,
        location: 'Jl. Raya Surabaya No. 123',
        time: '08:30',
        customer: 'Toko Sinar Jaya',
        wasteType: 'Plastik',
        amount: 25.5,
        status: 'collected',
        collector: 'Budi Santoso',
        vehicle: 'Truck A - B 1234 CD',
        photos: ['photo1.jpg', 'photo2.jpg'],
        notes: 'Sampah dalam kondisi baik, sudah dipilah',
        date: '2025-07-08',
      },
      {
        id: 2,
        location: 'Jl. Pemuda No. 456',
        time: '10:15',
        customer: 'Warung Pak Dedi',
        wasteType: 'Organik',
        amount: 18.2,
        status: 'pending',
        collector: 'Siti Aminah',
        vehicle: 'Truck B - B 5678 EF',
        photos: [],
        notes: '',
        date: '2025-07-08',
      },
      {
        id: 3,
        location: 'Jl. Diponegoro No. 789',
        time: '14:00',
        customer: 'Restoran Sederhana',
        wasteType: 'Kertas',
        amount: 12.8,
        status: 'in-progress',
        collector: 'Ahmad Rizki',
        vehicle: 'Truck C - B 9012 GH',
        photos: [],
        notes: '',
        date: '2025-07-08',
      },
    ],
    week: [
      {
        id: 4,
        location: 'Jl. Gubeng No. 321',
        time: '09:00',
        customer: 'Hotel Majapahit',
        wasteType: 'Organik',
        amount: 45.7,
        status: 'collected',
        collector: 'Dewi Sartika',
        vehicle: 'Truck D - B 3456 IJ',
        photos: ['photo3.jpg'],
        notes: 'Sampah organik dari kitchen hotel',
        date: '2025-07-07',
      },
      {
        id: 5,
        location: 'Jl. Kertajaya No. 654',
        time: '11:30',
        customer: 'Pabrik Tekstil Surabaya',
        wasteType: 'Logam',
        amount: 89.3,
        status: 'collected',
        collector: 'Budi Santoso',
        vehicle: 'Truck A - B 1234 CD',
        photos: ['photo4.jpg', 'photo5.jpg'],
        notes: 'Limbah logam dari proses produksi',
        date: '2025-07-06',
      },
      {
        id: 6,
        location: 'Jl. Mayjend Sungkono No. 111',
        time: '15:45',
        customer: 'Mall Ciputra World',
        wasteType: 'Plastik',
        amount: 67.1,
        status: 'collected',
        collector: 'Siti Aminah',
        vehicle: 'Truck B - B 5678 EF',
        photos: ['photo6.jpg'],
        notes: 'Sampah plastik dari food court',
        date: '2025-07-05',
      },
    ],
    month: [
      {
        id: 7,
        location: 'Jl. Rungkut No. 222',
        time: '08:00',
        customer: 'Pasar Atom',
        wasteType: 'Organik',
        amount: 156.8,
        status: 'collected',
        collector: 'Ahmad Rizki',
        vehicle: 'Truck C - B 9012 GH',
        photos: ['photo7.jpg', 'photo8.jpg'],
        notes: 'Sampah organik dari pedagang pasar',
        date: '2025-07-01',
      },
    ],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'collected':
        return 'Terkumpul';
      case 'in-progress':
        return 'Sedang Proses';
      case 'pending':
        return 'Menunggu';
      default:
        return status;
    }
  };

  const getWasteTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'plastik':
        return 'bg-blue-100 text-blue-800';
      case 'organik':
        return 'bg-green-100 text-green-800';
      case 'kertas':
        return 'bg-yellow-100 text-yellow-800';
      case 'logam':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const getCurrentData = () => {
    const data = collections[activeTab as keyof typeof collections];
    if (filterType === 'all') {
      return data;
    }
    return data.filter(
      (item) => item.wasteType.toLowerCase() === filterType.toLowerCase()
    );
  };

  const getTotalStats = () => {
    const data = getCurrentData();
    return {
      total: data.length,
      collected: data.filter((item) => item.status === 'collected').length,
      pending: data.filter((item) => item.status === 'pending').length,
      inProgress: data.filter((item) => item.status === 'in-progress').length,
      totalWeight: data.reduce((sum, item) => sum + item.amount, 0),
    };
  };

  const stats = getTotalStats();

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Data Pengumpulan Sampah
            </h1>
            <p className='text-gray-600'>
              Pantau dan kelola data pengumpulan sampah dari berbagai lokasi.
            </p>
          </div>
          <div className='flex space-x-3'>
            <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
              📊 Ekspor Data
            </button>
            <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
              + Tambah Pengumpulan
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <div className='rounded-lg bg-white p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Pengumpulan</p>
              <p className='text-xl font-bold text-gray-900'>{stats.total}</p>
            </div>
            <div className='rounded-full bg-gray-100 p-2'>
              <svg
                className='h-5 w-5 text-gray-600'
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

        <div className='rounded-lg bg-white p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Terkumpul</p>
              <p className='text-xl font-bold text-green-600'>
                {stats.collected}
              </p>
            </div>
            <div className='rounded-full bg-green-100 p-2'>
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
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Dalam Proses</p>
              <p className='text-xl font-bold text-blue-600'>
                {stats.inProgress}
              </p>
            </div>
            <div className='rounded-full bg-blue-100 p-2'>
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
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Menunggu</p>
              <p className='text-xl font-bold text-orange-600'>
                {stats.pending}
              </p>
            </div>
            <div className='rounded-full bg-orange-100 p-2'>
              <svg
                className='h-5 w-5 text-orange-600'
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

        <div className='rounded-lg bg-white p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Berat</p>
              <p className='text-xl font-bold text-purple-600'>
                {stats.totalWeight.toFixed(1)} kg
              </p>
            </div>
            <div className='rounded-full bg-purple-100 p-2'>
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
                  d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
          {/* Time Filter */}
          <div className='flex space-x-1 rounded-lg bg-gray-100 p-1'>
            <button
              onClick={() => setActiveTab('today')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'today'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setActiveTab('month')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Waste Type Filter */}
          <div className='flex items-center space-x-4'>
            <span className='text-sm text-gray-600'>Filter Jenis:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>Semua Jenis</option>
              <option value='plastik'>Plastik</option>
              <option value='organik'>Organik</option>
              <option value='kertas'>Kertas</option>
              <option value='logam'>Logam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Collections List */}
      <div className='rounded-lg bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Data Pengumpulan -{' '}
            {activeTab === 'today'
              ? 'Hari Ini'
              : activeTab === 'week'
                ? 'Minggu Ini'
                : 'Bulan Ini'}
          </h2>
        </div>
        <div className='p-6'>
          {getCurrentData().length === 0 ? (
            <div className='py-8 text-center'>
              <div className='mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100'>
                <svg
                  className='h-12 w-12 text-gray-400'
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
              <p className='text-gray-500'>
                Tidak ada data pengumpulan untuk periode ini
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {getCurrentData().map((collection) => (
                <div
                  key={collection.id}
                  className='rounded-lg border border-gray-200 p-6'
                >
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center space-x-2'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {collection.location}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getWasteTypeColor(collection.wasteType)}`}
                        >
                          {collection.wasteType}
                        </span>
                      </div>
                      <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-3'>
                        <div>
                          <span className='font-medium'>Customer:</span>{' '}
                          {collection.customer}
                        </div>
                        <div>
                          <span className='font-medium'>Waktu:</span>{' '}
                          {collection.time}
                          {collection.date && <span> - {collection.date}</span>}
                        </div>
                        <div>
                          <span className='font-medium'>Petugas:</span>{' '}
                          {collection.collector}
                        </div>
                        <div>
                          <span className='font-medium'>Kendaraan:</span>{' '}
                          {collection.vehicle}
                        </div>
                        <div>
                          <span className='font-medium'>Berat:</span>{' '}
                          {collection.amount} kg
                        </div>
                        <div>
                          <span className='font-medium'>Foto:</span>{' '}
                          {collection.photos.length} gambar
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(collection.status)}`}
                    >
                      {getStatusText(collection.status)}
                    </span>
                  </div>

                  {collection.notes && (
                    <div className='mb-4 rounded-lg bg-gray-50 p-3'>
                      <p className='text-sm text-gray-700'>
                        <span className='font-medium'>Catatan:</span>{' '}
                        {collection.notes}
                      </p>
                    </div>
                  )}

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      {collection.photos.length > 0 && (
                        <div className='flex items-center space-x-2'>
                          <svg
                            className='h-4 w-4 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                          </svg>
                          <span className='text-sm text-gray-600'>
                            {collection.photos.length} foto
                          </span>
                        </div>
                      )}
                      <div className='flex items-center space-x-2'>
                        <svg
                          className='h-4 w-4 text-gray-400'
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
                        <span className='text-sm text-gray-600'>
                          {collection.amount} kg
                        </span>
                      </div>
                    </div>

                    <div className='flex space-x-2'>
                      <button className='rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-50'>
                        Detail
                      </button>
                      <button className='rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-50'>
                        Edit
                      </button>
                      {collection.status === 'collected' && (
                        <button className='rounded-lg bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700'>
                          Lihat Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

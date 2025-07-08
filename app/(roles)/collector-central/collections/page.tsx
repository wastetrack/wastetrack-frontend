'use client';

import { useState } from 'react';

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');

  const [collectionsData] = useState({
    overview: {
      totalCollections: 15643,
      totalWaste: 287450, // kg
      activeUnits: 45,
      completedToday: 234,
      pendingToday: 28,
      regions: [
        'Surabaya Timur',
        'Surabaya Barat',
        'Surabaya Utara',
        'Surabaya Selatan',
        'Surabaya Pusat',
      ],
    },
    collections: [
      {
        id: 1,
        unitName: 'PT. Surabaya Waste Collection',
        region: 'Surabaya Timur',
        location: 'Jl. Raya Surabaya No. 123',
        customer: 'Toko Sinar Jaya',
        collectionTime: '08:30',
        collectionDate: '2025-07-08',
        wasteType: 'Plastik',
        amount: 25.5,
        status: 'completed',
        collector: 'Budi Santoso',
        vehicle: 'B 1234 CD',
        rating: 4.8,
        photos: 3,
        verified: true,
      },
      {
        id: 2,
        unitName: 'CV. Bersih Lingkungan',
        region: 'Surabaya Barat',
        location: 'Jl. Darmo No. 456',
        customer: 'Restoran Sederhana',
        collectionTime: '10:15',
        collectionDate: '2025-07-08',
        wasteType: 'Organik',
        amount: 42.3,
        status: 'in-progress',
        collector: 'Siti Aminah',
        vehicle: 'B 5678 EF',
        rating: 4.6,
        photos: 1,
        verified: false,
      },
      {
        id: 3,
        unitName: 'PT. Eco Waste Management',
        region: 'Surabaya Utara',
        location: 'Jl. Gubeng No. 789',
        customer: 'Hotel Majapahit',
        collectionTime: '14:00',
        collectionDate: '2025-07-08',
        wasteType: 'Kertas',
        amount: 18.7,
        status: 'pending',
        collector: 'Ahmad Rizki',
        vehicle: 'B 9012 GH',
        rating: 4.9,
        photos: 0,
        verified: true,
      },
      {
        id: 4,
        unitName: 'UD. Sampah Bersih',
        region: 'Surabaya Selatan',
        location: 'Jl. Mayjend Sungkono No. 321',
        customer: 'Pabrik Tekstil ABC',
        collectionTime: '09:45',
        collectionDate: '2025-07-08',
        wasteType: 'Logam',
        amount: 67.2,
        status: 'completed',
        collector: 'Dewi Sartika',
        vehicle: 'B 3456 IJ',
        rating: 4.7,
        photos: 2,
        verified: true,
      },
      {
        id: 5,
        unitName: 'PT. Green Solution',
        region: 'Surabaya Pusat',
        location: 'Jl. Tunjungan No. 654',
        customer: 'Mall Ciputra World',
        collectionTime: '11:30',
        collectionDate: '2025-07-08',
        wasteType: 'Plastik',
        amount: 89.1,
        status: 'completed',
        collector: 'Rudi Hermawan',
        vehicle: 'B 7890 KL',
        rating: 4.8,
        photos: 4,
        verified: true,
      },
      {
        id: 6,
        unitName: 'CV. Daur Ulang Mandiri',
        region: 'Surabaya Timur',
        location: 'Jl. Kertajaya No. 987',
        customer: 'Pasar Atom',
        collectionTime: '07:15',
        collectionDate: '2025-07-08',
        wasteType: 'Organik',
        amount: 156.4,
        status: 'pending',
        collector: 'Agus Susanto',
        vehicle: 'B 2468 MN',
        rating: 4.5,
        photos: 0,
        verified: false,
      },
    ],
    dailyStats: {
      '2025-07-08': { collections: 234, waste: 4850, units: 45 },
      '2025-07-07': { collections: 189, waste: 3920, units: 42 },
      '2025-07-06': { collections: 267, waste: 5230, units: 48 },
      '2025-07-05': { collections: 198, waste: 4100, units: 44 },
      '2025-07-04': { collections: 245, waste: 4680, units: 46 },
      '2025-07-03': { collections: 223, waste: 4450, units: 45 },
      '2025-07-02': { collections: 201, waste: 4200, units: 43 },
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
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
      case 'completed':
        return 'Selesai';
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

  const getFilteredData = () => {
    let filtered = collectionsData.collections;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    if (filterRegion !== 'all') {
      filtered = filtered.filter((item) => item.region === filterRegion);
    }

    return filtered;
  };

  const getStatsFromFiltered = () => {
    const data = getFilteredData();
    return {
      total: data.length,
      completed: data.filter((item) => item.status === 'completed').length,
      pending: data.filter((item) => item.status === 'pending').length,
      inProgress: data.filter((item) => item.status === 'in-progress').length,
      totalWeight: data.reduce((sum, item) => sum + item.amount, 0),
      verified: data.filter((item) => item.verified).length,
    };
  };

  const stats = getStatsFromFiltered();

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Monitoring Pengumpulan Sampah
            </h1>
            <p className='text-gray-600'>
              Pantau dan kelola aktivitas pengumpulan sampah dari seluruh unit
              pengumpul di Surabaya.
            </p>
          </div>
          <div className='flex space-x-3'>
            <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
              📊 Ekspor Laporan
            </button>
            <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Pengumpulan</p>
              <p className='text-2xl font-bold text-blue-600'>
                {collectionsData.overview.totalCollections.toLocaleString()}
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
              <p className='text-sm text-gray-600'>Total Sampah (kg)</p>
              <p className='text-2xl font-bold text-green-600'>
                {collectionsData.overview.totalWaste.toLocaleString()}
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
                  d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Unit Aktif</p>
              <p className='text-2xl font-bold text-purple-600'>
                {collectionsData.overview.activeUnits}
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
                  d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Selesai Hari Ini</p>
              <p className='text-2xl font-bold text-green-600'>
                {collectionsData.overview.completedToday}
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
              <p className='text-sm text-gray-600'>Pending Hari Ini</p>
              <p className='text-2xl font-bold text-orange-600'>
                {collectionsData.overview.pendingToday}
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
      </div>

      {/* Tabs */}
      <div className='rounded-lg bg-white shadow-sm'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'collections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Data Pengumpulan
              <span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600'>
                {stats.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Analitik
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Overview Harian
              </h3>

              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Daily Stats Chart */}
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-gray-900'>
                    Statistik 7 Hari Terakhir
                  </h4>
                  <div className='space-y-4'>
                    {Object.entries(collectionsData.dailyStats).map(
                      ([date, data]) => (
                        <div
                          key={date}
                          className='flex items-center justify-between rounded-lg bg-white p-3'
                        >
                          <div className='flex items-center space-x-3'>
                            <div className='h-3 w-3 rounded-full bg-blue-500'></div>
                            <span className='text-sm font-medium text-gray-900'>
                              {date}
                            </span>
                          </div>
                          <div className='flex items-center space-x-6 text-sm text-gray-600'>
                            <span>{data.collections} pengumpulan</span>
                            <span>{data.waste.toLocaleString()} kg</span>
                            <span>{data.units} unit</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Regional Distribution */}
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-gray-900'>
                    Distribusi Regional
                  </h4>
                  <div className='space-y-3'>
                    {collectionsData.overview.regions.map((region, index) => {
                      const regionData = collectionsData.collections.filter(
                        (item) => item.region === region
                      );
                      const regionStats = {
                        total: regionData.length,
                        completed: regionData.filter(
                          (item) => item.status === 'completed'
                        ).length,
                        weight: regionData.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        ),
                      };

                      return (
                        <div key={index} className='rounded-lg bg-white p-3'>
                          <div className='mb-2 flex items-center justify-between'>
                            <span className='font-medium text-gray-900'>
                              {region}
                            </span>
                            <span className='text-sm text-gray-600'>
                              {regionStats.total} pengumpulan
                            </span>
                          </div>
                          <div className='flex items-center justify-between text-sm text-gray-600'>
                            <span>{regionStats.completed} selesai</span>
                            <span>{regionStats.weight.toFixed(1)} kg</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className='text-md mb-4 font-medium text-gray-900'>
                  Aktivitas Terbaru
                </h4>
                <div className='space-y-3'>
                  {collectionsData.collections.slice(0, 3).map((collection) => (
                    <div
                      key={collection.id}
                      className='flex items-center justify-between rounded-lg bg-gray-50 p-4'
                    >
                      <div className='flex items-center space-x-3'>
                        <div
                          className={`h-3 w-3 rounded-full ${
                            collection.status === 'completed'
                              ? 'bg-green-500'
                              : collection.status === 'in-progress'
                                ? 'bg-blue-500'
                                : 'bg-orange-500'
                          }`}
                        ></div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {collection.unitName}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {collection.location} - {collection.customer}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium text-gray-900'>
                          {collection.amount} kg
                        </p>
                        <p className='text-xs text-gray-600'>
                          {collection.collectionTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'collections' && (
            <div className='space-y-6'>
              {/* Filters */}
              <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-600'>Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>Semua Status</option>
                      <option value='completed'>Selesai</option>
                      <option value='in-progress'>Sedang Proses</option>
                      <option value='pending'>Menunggu</option>
                    </select>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-600'>Regional:</span>
                    <select
                      value={filterRegion}
                      onChange={(e) => setFilterRegion(e.target.value)}
                      className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>Semua Region</option>
                      {collectionsData.overview.regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='flex items-center space-x-4 text-sm'>
                  <span className='text-gray-600'>
                    Menampilkan {stats.total} dari{' '}
                    {collectionsData.collections.length} data
                  </span>
                </div>
              </div>

              {/* Collections List */}
              <div className='space-y-4'>
                {getFilteredData().map((collection) => (
                  <div
                    key={collection.id}
                    className='rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md'
                  >
                    <div className='mb-4 flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center space-x-3'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {collection.unitName}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getWasteTypeColor(collection.wasteType)}`}
                          >
                            {collection.wasteType}
                          </span>
                          {collection.verified && (
                            <span className='inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800'>
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-3'>
                          <div>
                            <span className='font-medium'>Lokasi:</span>{' '}
                            {collection.location}
                          </div>
                          <div>
                            <span className='font-medium'>Customer:</span>{' '}
                            {collection.customer}
                          </div>
                          <div>
                            <span className='font-medium'>Region:</span>{' '}
                            {collection.region}
                          </div>
                          <div>
                            <span className='font-medium'>Waktu:</span>{' '}
                            {collection.collectionTime} -{' '}
                            {collection.collectionDate}
                          </div>
                          <div>
                            <span className='font-medium'>Petugas:</span>{' '}
                            {collection.collector}
                          </div>
                          <div>
                            <span className='font-medium'>Kendaraan:</span>{' '}
                            {collection.vehicle}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(collection.status)}`}
                      >
                        {getStatusText(collection.status)}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-6'>
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
                          <span className='text-sm font-medium text-gray-900'>
                            {collection.amount} kg
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <svg
                            className='h-4 w-4 text-yellow-400'
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                          </svg>
                          <span className='text-sm text-gray-600'>
                            {collection.rating}
                          </span>
                        </div>
                        {collection.photos > 0 && (
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
                              {collection.photos} foto
                            </span>
                          </div>
                        )}
                      </div>

                      <div className='flex space-x-2'>
                        <button className='rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-50'>
                          Detail
                        </button>
                        <button className='rounded-lg bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700'>
                          Verifikasi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Analisis Performa
              </h3>

              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Performance by Region */}
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-gray-900'>
                    Performa per Region
                  </h4>
                  <div className='space-y-4'>
                    {collectionsData.overview.regions.map((region) => {
                      const regionData = collectionsData.collections.filter(
                        (item) => item.region === region
                      );
                      const avgRating =
                        regionData.reduce((sum, item) => sum + item.rating, 0) /
                        regionData.length;
                      const completionRate =
                        (regionData.filter(
                          (item) => item.status === 'completed'
                        ).length /
                          regionData.length) *
                        100;

                      return (
                        <div key={region} className='rounded-lg bg-white p-4'>
                          <div className='mb-3 flex items-center justify-between'>
                            <h5 className='font-medium text-gray-900'>
                              {region}
                            </h5>
                            <span className='text-sm text-gray-600'>
                              {regionData.length} pengumpulan
                            </span>
                          </div>
                          <div className='grid grid-cols-2 gap-4 text-sm'>
                            <div>
                              <span className='text-gray-600'>Avg Rating:</span>
                              <span className='ml-2 font-medium'>
                                {avgRating.toFixed(1)}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-600'>Completion:</span>
                              <span className='ml-2 font-medium'>
                                {completionRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Performing Units */}
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-gray-900'>
                    Unit Terbaik
                  </h4>
                  <div className='space-y-3'>
                    {collectionsData.collections
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((collection, index) => (
                        <div
                          key={collection.id}
                          className='flex items-center justify-between rounded-lg bg-white p-3'
                        >
                          <div className='flex items-center space-x-3'>
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                                index === 0
                                  ? 'bg-yellow-500'
                                  : index === 1
                                    ? 'bg-gray-400'
                                    : index === 2
                                      ? 'bg-yellow-600'
                                      : 'bg-gray-300'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className='font-medium text-gray-900'>
                                {collection.unitName}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {collection.region}
                              </p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='font-medium text-gray-900'>
                              {collection.rating}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {collection.amount} kg
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

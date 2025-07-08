'use client';

import { useState } from 'react';

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [trips] = useState({
    ongoing: [
      {
        id: 1,
        route: 'Rute A - Surabaya Timur',
        startTime: '08:00',
        estimatedDuration: '4 jam',
        status: 'in-progress',
        locations: [
          'Jl. Raya Surabaya No. 123',
          'Jl. Pemuda No. 456',
          'Jl. Diponegoro No. 789',
        ],
        progress: 2,
        totalLocations: 3,
        driver: 'Budi Santoso',
        vehicle: 'Truck A - B 1234 CD',
      },
      {
        id: 2,
        route: 'Rute B - Surabaya Barat',
        startTime: '09:30',
        estimatedDuration: '3 jam',
        status: 'starting',
        locations: ['Jl. Darmo No. 101', 'Jl. Tunjungan No. 202'],
        progress: 0,
        totalLocations: 2,
        driver: 'Siti Aminah',
        vehicle: 'Truck B - B 5678 EF',
      },
    ],
    completed: [
      {
        id: 3,
        route: 'Rute C - Surabaya Utara',
        startTime: '07:00',
        endTime: '11:30',
        actualDuration: '4 jam 30 menit',
        status: 'completed',
        locations: ['Jl. Gubeng No. 321', 'Jl. Kertajaya No. 654'],
        wasteCollected: 125.5,
        driver: 'Ahmad Rizki',
        vehicle: 'Truck C - B 9012 GH',
        completedDate: '2025-07-08',
      },
      {
        id: 4,
        route: 'Rute D - Surabaya Selatan',
        startTime: '08:30',
        endTime: '12:00',
        actualDuration: '3 jam 30 menit',
        status: 'completed',
        locations: ['Jl. Mayjend Sungkono No. 111', 'Jl. Rungkut No. 222'],
        wasteCollected: 89.2,
        driver: 'Dewi Sartika',
        vehicle: 'Truck D - B 3456 IJ',
        completedDate: '2025-07-07',
      },
    ],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'starting':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'Sedang Berjalan';
      case 'starting':
        return 'Bersiap Mulai';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <h1 className='mb-2 text-2xl font-bold text-gray-900'>
          Manajemen Perjalanan
        </h1>
        <p className='text-gray-600'>
          Pantau dan kelola perjalanan pengumpulan sampah secara real-time.
        </p>
      </div>

      {/* Tabs */}
      <div className='rounded-lg bg-white shadow-sm'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'ongoing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Perjalanan Aktif
              <span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600'>
                {trips.ongoing.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Perjalanan Selesai
              <span className='ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-600'>
                {trips.completed.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {activeTab === 'ongoing' && (
            <div className='space-y-4'>
              {trips.ongoing.map((trip) => (
                <div
                  key={trip.id}
                  className='rounded-lg border border-gray-200 p-6'
                >
                  <div className='mb-4 flex items-start justify-between'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        {trip.route}
                      </h3>
                      <div className='mt-2 flex items-center space-x-4 text-sm text-gray-600'>
                        <span>🚚 {trip.vehicle}</span>
                        <span>👤 {trip.driver}</span>
                        <span>🕐 Mulai: {trip.startTime}</span>
                        <span>⏱️ Estimasi: {trip.estimatedDuration}</span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(trip.status)}`}
                    >
                      {getStatusText(trip.status)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className='mb-4'>
                    <div className='mb-1 flex justify-between text-sm text-gray-600'>
                      <span>
                        Progress: {trip.progress}/{trip.totalLocations} lokasi
                      </span>
                      <span>
                        {Math.round(
                          (trip.progress / trip.totalLocations) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                        style={{
                          width: `${(trip.progress / trip.totalLocations) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className='mb-4'>
                    <h4 className='mb-2 font-medium text-gray-900'>
                      Lokasi Pengumpulan:
                    </h4>
                    <div className='space-y-2'>
                      {trip.locations.map((location, index) => (
                        <div
                          key={index}
                          className='flex items-center space-x-2'
                        >
                          <div
                            className={`h-3 w-3 rounded-full ${
                              index < trip.progress
                                ? 'bg-green-500'
                                : index === trip.progress
                                  ? 'bg-blue-500'
                                  : 'bg-gray-300'
                            }`}
                          ></div>
                          <span
                            className={`text-sm ${
                              index < trip.progress
                                ? 'text-green-600 line-through'
                                : index === trip.progress
                                  ? 'font-medium text-blue-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            {location}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex space-x-3'>
                    <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                      Lacak Real-time
                    </button>
                    <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                      Hubungi Driver
                    </button>
                    <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className='space-y-4'>
              {trips.completed.map((trip) => (
                <div
                  key={trip.id}
                  className='rounded-lg border border-gray-200 p-6'
                >
                  <div className='mb-4 flex items-start justify-between'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        {trip.route}
                      </h3>
                      <div className='mt-2 flex items-center space-x-4 text-sm text-gray-600'>
                        <span>🚚 {trip.vehicle}</span>
                        <span>👤 {trip.driver}</span>
                        <span>📅 {trip.completedDate}</span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(trip.status)}`}
                    >
                      {getStatusText(trip.status)}
                    </span>
                  </div>

                  {/* Trip Summary */}
                  <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='rounded-lg bg-gray-50 p-3'>
                      <p className='text-sm text-gray-600'>Waktu Mulai</p>
                      <p className='font-medium'>{trip.startTime}</p>
                    </div>
                    <div className='rounded-lg bg-gray-50 p-3'>
                      <p className='text-sm text-gray-600'>Waktu Selesai</p>
                      <p className='font-medium'>{trip.endTime}</p>
                    </div>
                    <div className='rounded-lg bg-gray-50 p-3'>
                      <p className='text-sm text-gray-600'>Durasi Aktual</p>
                      <p className='font-medium'>{trip.actualDuration}</p>
                    </div>
                  </div>

                  {/* Waste Collected */}
                  <div className='mb-4'>
                    <div className='rounded-lg bg-green-50 p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm text-green-600'>
                            Total Sampah Terkumpul
                          </p>
                          <p className='text-2xl font-bold text-green-800'>
                            {trip.wasteCollected} kg
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
                  </div>

                  {/* Locations */}
                  <div className='mb-4'>
                    <h4 className='mb-2 font-medium text-gray-900'>
                      Lokasi yang Dikunjungi:
                    </h4>
                    <div className='space-y-2'>
                      {trip.locations.map((location, index) => (
                        <div
                          key={index}
                          className='flex items-center space-x-2'
                        >
                          <div className='h-3 w-3 rounded-full bg-green-500'></div>
                          <span className='text-sm text-gray-600'>
                            {location}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex space-x-3'>
                    <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                      Lihat Laporan
                    </button>
                    <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                      Unduh PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>Aksi Cepat</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
              <p className='font-medium text-gray-900'>Buat Perjalanan Baru</p>
              <p className='text-sm text-gray-600'>
                Jadwalkan rute pengumpulan
              </p>
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
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
            <div className='text-left'>
              <p className='font-medium text-gray-900'>Laporan Perjalanan</p>
              <p className='text-sm text-gray-600'>Analisis kinerja rute</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [filterRegion, setFilterRegion] = useState('all');

  const [tripsData] = useState({
    overview: {
      totalTrips: 1847,
      activeTrips: 12,
      completedToday: 89,
      totalDistance: 45670, // km
      totalFuel: 12450, // liters
      avgEfficiency: 85.6, // percentage
    },
    activeTrips: [
      {
        id: 1,
        unitName: 'PT. Surabaya Waste Collection',
        driverName: 'Budi Santoso',
        vehicle: 'B 1234 CD',
        route: 'Rute A - Surabaya Timur',
        region: 'Surabaya Timur',
        startTime: '06:30',
        estimatedDuration: '4 jam',
        currentLocation: 'Jl. Raya Surabaya No. 123',
        progress: 65,
        totalLocations: 8,
        completedLocations: 5,
        wasteCollected: 127.5,
        status: 'in-progress',
        priority: 'high',
        locations: [
          {
            name: 'Toko Sinar Jaya',
            status: 'completed',
            time: '06:45',
            waste: 25.5,
          },
          {
            name: 'Warung Pak Dedi',
            status: 'completed',
            time: '07:15',
            waste: 18.2,
          },
          {
            name: 'Restoran Sederhana',
            status: 'completed',
            time: '07:45',
            waste: 34.8,
          },
          {
            name: 'Pabrik Tekstil ABC',
            status: 'completed',
            time: '08:30',
            waste: 28.7,
          },
          {
            name: 'Mall Ciputra',
            status: 'completed',
            time: '09:15',
            waste: 20.3,
          },
          {
            name: 'Hotel Majapahit',
            status: 'current',
            time: '10:00',
            waste: 0,
          },
          { name: 'Pasar Atom', status: 'pending', time: '10:30', waste: 0 },
          {
            name: 'Gedung Perkantoran',
            status: 'pending',
            time: '11:00',
            waste: 0,
          },
        ],
        lastUpdate: '10:15',
        rating: 4.8,
      },
      {
        id: 2,
        unitName: 'CV. Bersih Lingkungan',
        driverName: 'Siti Aminah',
        vehicle: 'B 5678 EF',
        route: 'Rute B - Surabaya Barat',
        region: 'Surabaya Barat',
        startTime: '07:00',
        estimatedDuration: '3 jam',
        currentLocation: 'Jl. Darmo No. 456',
        progress: 40,
        totalLocations: 5,
        completedLocations: 2,
        wasteCollected: 89.3,
        status: 'in-progress',
        priority: 'medium',
        locations: [
          {
            name: 'Pasar Keputran',
            status: 'completed',
            time: '07:15',
            waste: 45.8,
          },
          {
            name: 'Restoran Darmo',
            status: 'completed',
            time: '08:00',
            waste: 43.5,
          },
          { name: 'Mall Galaxy', status: 'current', time: '08:30', waste: 0 },
          { name: 'Gedung BCA', status: 'pending', time: '09:00', waste: 0 },
          {
            name: 'Tunjungan Plaza',
            status: 'pending',
            time: '09:30',
            waste: 0,
          },
        ],
        lastUpdate: '08:45',
        rating: 4.6,
      },
      {
        id: 3,
        unitName: 'PT. Eco Waste Management',
        driverName: 'Ahmad Rizki',
        vehicle: 'B 9012 GH',
        route: 'Rute C - Surabaya Utara',
        region: 'Surabaya Utara',
        startTime: '08:00',
        estimatedDuration: '5 jam',
        currentLocation: 'Jl. Gubeng No. 789',
        progress: 20,
        totalLocations: 10,
        completedLocations: 2,
        wasteCollected: 67.1,
        status: 'in-progress',
        priority: 'low',
        locations: [
          {
            name: 'Universitas Airlangga',
            status: 'completed',
            time: '08:15',
            waste: 32.4,
          },
          {
            name: 'ITS Campus',
            status: 'completed',
            time: '08:45',
            waste: 34.7,
          },
          {
            name: 'RS Dr. Soetomo',
            status: 'current',
            time: '09:15',
            waste: 0,
          },
          {
            name: 'SMPN 1 Surabaya',
            status: 'pending',
            time: '09:45',
            waste: 0,
          },
          {
            name: 'Kantor Gubernur',
            status: 'pending',
            time: '10:15',
            waste: 0,
          },
        ],
        lastUpdate: '09:30',
        rating: 4.5,
      },
    ],
    completedTrips: [
      {
        id: 4,
        unitName: 'UD. Sampah Bersih',
        driverName: 'Dewi Sartika',
        vehicle: 'B 3456 IJ',
        route: 'Rute D - Surabaya Selatan',
        region: 'Surabaya Selatan',
        startTime: '06:00',
        endTime: '09:30',
        actualDuration: '3 jam 30 menit',
        totalDistance: 45.2,
        fuelUsed: 12.8,
        wasteCollected: 234.6,
        status: 'completed',
        completedDate: '2025-07-08',
        efficiency: 92.5,
        rating: 4.8,
        locations: [
          {
            name: 'Pasar Genteng',
            status: 'completed',
            time: '06:15',
            waste: 78.2,
          },
          {
            name: 'Mall Lenmarc',
            status: 'completed',
            time: '07:00',
            waste: 45.3,
          },
          {
            name: 'Pabrik Elektronik',
            status: 'completed',
            time: '07:45',
            waste: 67.8,
          },
          {
            name: 'Restoran Seafood',
            status: 'completed',
            time: '08:30',
            waste: 43.3,
          },
        ],
      },
      {
        id: 5,
        unitName: 'PT. Green Solution',
        driverName: 'Rudi Hermawan',
        vehicle: 'B 7890 KL',
        route: 'Rute E - Surabaya Pusat',
        region: 'Surabaya Pusat',
        startTime: '07:30',
        endTime: '11:00',
        actualDuration: '3 jam 30 menit',
        totalDistance: 38.7,
        fuelUsed: 10.5,
        wasteCollected: 189.4,
        status: 'completed',
        completedDate: '2025-07-08',
        efficiency: 89.3,
        rating: 4.6,
        locations: [
          {
            name: 'Gedung Grahadi',
            status: 'completed',
            time: '07:45',
            waste: 52.1,
          },
          {
            name: 'Hotel Bumi Surabaya',
            status: 'completed',
            time: '08:30',
            waste: 41.2,
          },
          {
            name: 'World Trade Center',
            status: 'completed',
            time: '09:15',
            waste: 58.3,
          },
          {
            name: 'Kantor Walikota',
            status: 'completed',
            time: '10:00',
            waste: 37.8,
          },
        ],
      },
    ],
    regions: [
      'Surabaya Timur',
      'Surabaya Barat',
      'Surabaya Utara',
      'Surabaya Selatan',
      'Surabaya Pusat',
    ],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'Sedang Berjalan';
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Menunggu';
      case 'delayed':
        return 'Terlambat';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'current':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Monitoring Perjalanan Central
            </h1>
            <p className='text-gray-600'>
              Pantau perjalanan pengumpulan sampah dari seluruh unit pengumpul
              secara real-time.
            </p>
          </div>
          <div className='flex space-x-3'>
            <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
              🗺️ Lihat Peta
            </button>
            <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6'>
        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Perjalanan</p>
              <p className='text-2xl font-bold text-gray-900'>
                {tripsData.overview.totalTrips}
              </p>
            </div>
            <div className='rounded-full bg-gray-100 p-3'>
              <svg
                className='h-6 w-6 text-gray-600'
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
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Perjalanan Aktif</p>
              <p className='text-2xl font-bold text-blue-600'>
                {tripsData.overview.activeTrips}
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
                  d='M13 10V3L4 14h7v7l9-11h-7z'
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
                {tripsData.overview.completedToday}
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
              <p className='text-sm text-gray-600'>Total Jarak (km)</p>
              <p className='text-2xl font-bold text-purple-600'>
                {tripsData.overview.totalDistance.toLocaleString()}
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
                  d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Konsumsi BBM (L)</p>
              <p className='text-2xl font-bold text-orange-600'>
                {tripsData.overview.totalFuel.toLocaleString()}
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
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Efisiensi (%)</p>
              <p className='text-2xl font-bold text-green-600'>
                {tripsData.overview.avgEfficiency}
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
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
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
              onClick={() => setActiveTab('monitoring')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Real-time Monitoring
              <span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600'>
                {tripsData.activeTrips.length}
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
                {tripsData.completedTrips.length}
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
              Analisis Performa
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {activeTab === 'monitoring' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Monitoring Real-time
                </h3>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-gray-600'>
                    Auto-refresh setiap 30 detik
                  </span>
                  <div className='h-3 w-3 animate-pulse rounded-full bg-green-500'></div>
                </div>
              </div>

              <div className='space-y-6'>
                {tripsData.activeTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className='rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md'
                  >
                    <div className='mb-4 flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center space-x-3'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {trip.unitName}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(trip.priority)}`}
                          >
                            {trip.priority.toUpperCase()}
                          </span>
                          <span className='text-sm text-gray-500'>
                            Last update: {trip.lastUpdate}
                          </span>
                        </div>
                        <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-4'>
                          <div>
                            <span className='font-medium'>Driver:</span>{' '}
                            {trip.driverName}
                          </div>
                          <div>
                            <span className='font-medium'>Kendaraan:</span>{' '}
                            {trip.vehicle}
                          </div>
                          <div>
                            <span className='font-medium'>Rute:</span>{' '}
                            {trip.route}
                          </div>
                          <div>
                            <span className='font-medium'>Mulai:</span>{' '}
                            {trip.startTime}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(trip.status)}`}
                      >
                        {getStatusText(trip.status)}
                      </span>
                    </div>

                    {/* Current Location */}
                    <div className='mb-4 rounded-lg bg-blue-50 p-3'>
                      <div className='flex items-center space-x-2'>
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
                            d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                        </svg>
                        <span className='text-sm font-medium text-blue-900'>
                          Lokasi Saat Ini: {trip.currentLocation}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='mb-4'>
                      <div className='mb-1 flex justify-between text-sm text-gray-600'>
                        <span>
                          Progress: {trip.completedLocations}/
                          {trip.totalLocations} lokasi
                        </span>
                        <span>{trip.progress}%</span>
                      </div>
                      <div className='h-2 w-full rounded-full bg-gray-200'>
                        <div
                          className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                          style={{ width: `${trip.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Waste Collected */}
                    <div className='mb-4'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-2'>
                          <svg
                            className='h-4 w-4 text-green-600'
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
                          <span className='text-sm font-medium text-green-700'>
                            Sampah Terkumpul: {trip.wasteCollected} kg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Locations Detail */}
                    <div className='mb-4'>
                      <h4 className='mb-3 font-medium text-gray-900'>
                        Detail Lokasi:
                      </h4>
                      <div className='space-y-2'>
                        {trip.locations.map((location, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between rounded-lg p-3 ${
                              location.status === 'completed'
                                ? 'bg-green-50'
                                : location.status === 'current'
                                  ? 'bg-blue-50'
                                  : 'bg-gray-50'
                            }`}
                          >
                            <div className='flex items-center space-x-3'>
                              <span className='text-lg'>
                                {getLocationStatusIcon(location.status)}
                              </span>
                              <div>
                                <p
                                  className={`font-medium ${
                                    location.status === 'completed'
                                      ? 'text-green-800'
                                      : location.status === 'current'
                                        ? 'text-blue-800'
                                        : 'text-gray-800'
                                  }`}
                                >
                                  {location.name}
                                </p>
                                <p className='text-xs text-gray-600'>
                                  {location.status === 'completed'
                                    ? `Selesai: ${location.time}`
                                    : location.status === 'current'
                                      ? `Sedang di lokasi`
                                      : `Estimasi: ${location.time}`}
                                </p>
                              </div>
                            </div>
                            <div className='text-right'>
                              <p className='text-sm font-medium text-gray-900'>
                                {location.waste > 0
                                  ? `${location.waste} kg`
                                  : '-'}
                              </p>
                            </div>
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
                        Detail Rute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'completed' && (
            <div className='space-y-6'>
              {/* Filters */}
              <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-600'>Regional:</span>
                    <select
                      value={filterRegion}
                      onChange={(e) => setFilterRegion(e.target.value)}
                      className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>Semua Region</option>
                      {tripsData.regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className='flex items-center space-x-4 text-sm'>
                  <span className='text-gray-600'>
                    Hari ini: {tripsData.completedTrips.length} perjalanan
                    selesai
                  </span>
                </div>
              </div>

              {/* Completed Trips */}
              <div className='space-y-4'>
                {tripsData.completedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className='rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md'
                  >
                    <div className='mb-4 flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center space-x-3'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {trip.unitName}
                          </h3>
                          <span className='inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800'>
                            ✓ Selesai
                          </span>
                          <div className='flex items-center space-x-1'>
                            <svg
                              className='h-4 w-4 text-yellow-400'
                              fill='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                            </svg>
                            <span className='text-sm text-gray-600'>
                              {trip.rating}
                            </span>
                          </div>
                        </div>
                        <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-4'>
                          <div>
                            <span className='font-medium'>Driver:</span>{' '}
                            {trip.driverName}
                          </div>
                          <div>
                            <span className='font-medium'>Kendaraan:</span>{' '}
                            {trip.vehicle}
                          </div>
                          <div>
                            <span className='font-medium'>Rute:</span>{' '}
                            {trip.route}
                          </div>
                          <div>
                            <span className='font-medium'>Tanggal:</span>{' '}
                            {trip.completedDate}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trip Summary */}
                    <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                      <div className='rounded-lg bg-gray-50 p-3'>
                        <p className='text-sm text-gray-600'>Durasi</p>
                        <p className='font-medium'>{trip.actualDuration}</p>
                        <p className='text-xs text-gray-500'>
                          {trip.startTime} - {trip.endTime}
                        </p>
                      </div>
                      <div className='rounded-lg bg-gray-50 p-3'>
                        <p className='text-sm text-gray-600'>Total Jarak</p>
                        <p className='font-medium'>{trip.totalDistance} km</p>
                      </div>
                      <div className='rounded-lg bg-gray-50 p-3'>
                        <p className='text-sm text-gray-600'>BBM</p>
                        <p className='font-medium'>{trip.fuelUsed} L</p>
                      </div>
                      <div className='rounded-lg bg-gray-50 p-3'>
                        <p className='text-sm text-gray-600'>Efisiensi</p>
                        <p className='font-medium text-green-600'>
                          {trip.efficiency}%
                        </p>
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
                      <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                        {trip.locations.map((location, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between rounded bg-gray-50 p-2'
                          >
                            <span className='text-sm text-gray-700'>
                              {location.name}
                            </span>
                            <span className='text-sm font-medium text-gray-900'>
                              {location.waste} kg
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
                      <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                        Lihat Rute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Analisis Performa Perjalanan
              </h3>

              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Efficiency by Unit */}
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-gray-900'>
                    Efisiensi per Unit
                  </h4>
                  <div className='space-y-4'>
                    {Array.from(
                      new Set(
                        [
                          ...tripsData.activeTrips,
                          ...tripsData.completedTrips,
                        ].map((trip) => trip.unitName)
                      )
                    ).map((unit) => {
                      const unitTrips = tripsData.completedTrips.filter(
                        (trip) => trip.unitName === unit
                      );
                      const avgEfficiency =
                        unitTrips.length > 0
                          ? unitTrips.reduce(
                              (sum, trip) => sum + trip.efficiency,
                              0
                            ) / unitTrips.length
                          : 0;
                      const totalWaste = unitTrips.reduce(
                        (sum, trip) => sum + trip.wasteCollected,
                        0
                      );

                      return (
                        <div key={unit} className='rounded-lg bg-white p-4'>
                          <div className='mb-2 flex items-center justify-between'>
                            <h5 className='font-medium text-gray-900'>
                              {unit}
                            </h5>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                avgEfficiency >= 90
                                  ? 'bg-green-100 text-green-800'
                                  : avgEfficiency >= 80
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {avgEfficiency.toFixed(1)}% efisiensi
                            </span>
                          </div>
                          <div className='grid grid-cols-2 gap-4 text-sm'>
                            <div>
                              <span className='text-gray-600'>
                                Total Sampah:
                              </span>
                              <span className='ml-2 font-medium'>
                                {totalWaste.toFixed(1)} kg
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-600'>Perjalanan:</span>
                              <span className='ml-2 font-medium'>
                                {unitTrips.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regional Performance */}
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-gray-900'>
                    Performa Regional
                  </h4>
                  <div className='space-y-3'>
                    {tripsData.regions.map((region) => {
                      const regionTrips = [
                        ...tripsData.activeTrips,
                        ...tripsData.completedTrips,
                      ].filter((trip) => trip.region === region);
                      const completedTrips = regionTrips.filter(
                        (trip) => trip.status === 'completed'
                      );
                      const avgRating =
                        completedTrips.length > 0
                          ? completedTrips.reduce(
                              (sum, trip) => sum + (trip.rating || 0),
                              0
                            ) / completedTrips.length
                          : 0;

                      return (
                        <div key={region} className='rounded-lg bg-white p-3'>
                          <div className='mb-2 flex items-center justify-between'>
                            <h5 className='font-medium text-gray-900'>
                              {region}
                            </h5>
                            <span className='text-sm text-gray-600'>
                              {regionTrips.length} perjalanan
                            </span>
                          </div>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='text-gray-600'>
                              Rating rata-rata: {avgRating.toFixed(1)}
                            </span>
                            <span className='text-gray-600'>
                              Selesai: {completedTrips.length}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Fleet Utilization */}
              <div className='rounded-lg bg-gray-50 p-6'>
                <h4 className='text-md mb-4 font-medium text-gray-900'>
                  Utilisasi Armada
                </h4>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='rounded-lg bg-white p-4'>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Armada Aktif
                      </span>
                      <span className='text-2xl font-bold text-blue-600'>
                        {tripsData.activeTrips.length}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500'>
                      Dari total{' '}
                      {tripsData.activeTrips.length +
                        tripsData.completedTrips.length}{' '}
                      unit
                    </p>
                  </div>
                  <div className='rounded-lg bg-white p-4'>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Avg Distance/Trip
                      </span>
                      <span className='text-2xl font-bold text-green-600'>
                        {(
                          tripsData.completedTrips.reduce(
                            (sum, trip) => sum + trip.totalDistance,
                            0
                          ) / tripsData.completedTrips.length
                        ).toFixed(1)}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500'>
                      Kilometer per perjalanan
                    </p>
                  </div>
                  <div className='rounded-lg bg-white p-4'>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>
                        Avg Fuel Efficiency
                      </span>
                      <span className='text-2xl font-bold text-purple-600'>
                        {(
                          tripsData.completedTrips.reduce(
                            (sum, trip) =>
                              sum + trip.totalDistance / trip.fuelUsed,
                            0
                          ) / tripsData.completedTrips.length
                        ).toFixed(1)}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500'>Km per liter</p>
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

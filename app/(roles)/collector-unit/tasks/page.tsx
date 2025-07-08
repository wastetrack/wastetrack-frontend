'use client';

import { useState } from 'react';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [tasks] = useState({
    pending: [
      {
        id: 1,
        title: 'Pengumpulan Sampah Rumah Tangga - Zona A',
        description:
          'Mengumpulkan sampah rumah tangga di area Jl. Raya Surabaya',
        priority: 'high',
        dueDate: '2025-07-08',
        dueTime: '10:00',
        assignedTo: 'Budi Santoso',
        vehicle: 'Truck A - B 1234 CD',
        locations: ['Jl. Raya Surabaya No. 123', 'Jl. Raya Surabaya No. 456'],
        estimatedDuration: '2 jam',
        wasteType: 'Organik & Anorganik',
        status: 'pending',
      },
      {
        id: 2,
        title: 'Pengumpulan Sampah Komersial - Mall',
        description: 'Pengumpulan sampah dari pusat perbelanjaan',
        priority: 'medium',
        dueDate: '2025-07-08',
        dueTime: '14:00',
        assignedTo: 'Siti Aminah',
        vehicle: 'Truck B - B 5678 EF',
        locations: ['Mall Surabaya Plaza', 'Mall Galaxy'],
        estimatedDuration: '3 jam',
        wasteType: 'Plastik & Kertas',
        status: 'pending',
      },
      {
        id: 3,
        title: 'Pengumpulan Sampah Industri',
        description: 'Mengumpulkan sampah dari kawasan industri',
        priority: 'low',
        dueDate: '2025-07-09',
        dueTime: '08:00',
        assignedTo: 'Ahmad Rizki',
        vehicle: 'Truck C - B 9012 GH',
        locations: ['Kawasan Industri Surabaya'],
        estimatedDuration: '4 jam',
        wasteType: 'Logam & Plastik',
        status: 'pending',
      },
    ],
    inProgress: [
      {
        id: 4,
        title: 'Pengumpulan Sampah Sekolah',
        description: 'Mengumpulkan sampah dari kompleks sekolah',
        priority: 'high',
        dueDate: '2025-07-08',
        dueTime: '09:00',
        assignedTo: 'Dewi Sartika',
        vehicle: 'Truck D - B 3456 IJ',
        locations: ['SDN 1 Surabaya', 'SMPN 2 Surabaya'],
        estimatedDuration: '2 jam',
        wasteType: 'Kertas & Organik',
        status: 'in-progress',
        startTime: '09:15',
        progress: 50,
      },
    ],
    completed: [
      {
        id: 5,
        title: 'Pengumpulan Sampah Pasar',
        description: 'Mengumpulkan sampah dari pasar tradisional',
        priority: 'high',
        dueDate: '2025-07-07',
        dueTime: '06:00',
        assignedTo: 'Budi Santoso',
        vehicle: 'Truck A - B 1234 CD',
        locations: ['Pasar Atom', 'Pasar Keputran'],
        estimatedDuration: '3 jam',
        wasteType: 'Organik',
        status: 'completed',
        startTime: '06:00',
        endTime: '08:45',
        wasteCollected: 156.8,
        completedDate: '2025-07-07',
      },
      {
        id: 6,
        title: 'Pengumpulan Sampah Perkantoran',
        description: 'Mengumpulkan sampah dari gedung perkantoran',
        priority: 'medium',
        dueDate: '2025-07-06',
        dueTime: '16:00',
        assignedTo: 'Siti Aminah',
        vehicle: 'Truck B - B 5678 EF',
        locations: ['Gedung Perkantoran A', 'Gedung Perkantoran B'],
        estimatedDuration: '2 jam',
        wasteType: 'Kertas & Plastik',
        status: 'completed',
        startTime: '16:00',
        endTime: '17:30',
        wasteCollected: 89.2,
        completedDate: '2025-07-06',
      },
    ],
  });

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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Tinggi';
      case 'medium':
        return 'Sedang';
      case 'low':
        return 'Rendah';
      default:
        return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'in-progress':
        return 'Sedang Berjalan';
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
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Manajemen Tugas
            </h1>
            <p className='text-gray-600'>
              Kelola dan pantau tugas pengumpulan sampah untuk unit pengumpul.
            </p>
          </div>
          <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
            + Buat Tugas Baru
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Tugas Pending</p>
              <p className='text-2xl font-bold text-orange-600'>
                {tasks.pending.length}
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
              <p className='text-sm text-gray-600'>Tugas Berjalan</p>
              <p className='text-2xl font-bold text-blue-600'>
                {tasks.inProgress.length}
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
              <p className='text-sm text-gray-600'>Tugas Selesai</p>
              <p className='text-2xl font-bold text-green-600'>
                {tasks.completed.length}
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
      </div>

      {/* Tabs */}
      <div className='rounded-lg bg-white shadow-sm'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            <button
              onClick={() => setActiveTab('pending')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Tugas Pending
              <span className='ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-600'>
                {tasks.pending.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('inProgress')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'inProgress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Sedang Berjalan
              <span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600'>
                {tasks.inProgress.length}
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
              Selesai
              <span className='ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-600'>
                {tasks.completed.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {activeTab === 'pending' && (
            <div className='space-y-4'>
              {tasks.pending.map((task) => (
                <div
                  key={task.id}
                  className='rounded-lg border border-gray-200 p-6'
                >
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center space-x-2'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {task.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                      <p className='mb-3 text-gray-600'>{task.description}</p>
                      <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2'>
                        <div>
                          <span className='font-medium'>Deadline:</span>{' '}
                          {task.dueDate} {task.dueTime}
                        </div>
                        <div>
                          <span className='font-medium'>Estimasi:</span>{' '}
                          {task.estimatedDuration}
                        </div>
                        <div>
                          <span className='font-medium'>Petugas:</span>{' '}
                          {task.assignedTo}
                        </div>
                        <div>
                          <span className='font-medium'>Kendaraan:</span>{' '}
                          {task.vehicle}
                        </div>
                        <div>
                          <span className='font-medium'>Jenis Sampah:</span>{' '}
                          {task.wasteType}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(task.status)}`}
                    >
                      {getStatusText(task.status)}
                    </span>
                  </div>

                  <div className='mb-4'>
                    <h4 className='mb-2 font-medium text-gray-900'>Lokasi:</h4>
                    <div className='space-y-1'>
                      {task.locations.map((location, index) => (
                        <div
                          key={index}
                          className='flex items-center space-x-2'
                        >
                          <div className='h-2 w-2 rounded-full bg-gray-400'></div>
                          <span className='text-sm text-gray-600'>
                            {location}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='flex space-x-3'>
                    <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                      Mulai Tugas
                    </button>
                    <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                      Edit
                    </button>
                    <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'inProgress' && (
            <div className='space-y-4'>
              {tasks.inProgress.map((task) => (
                <div
                  key={task.id}
                  className='rounded-lg border border-gray-200 p-6'
                >
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center space-x-2'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {task.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                      <p className='mb-3 text-gray-600'>{task.description}</p>
                      <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2'>
                        <div>
                          <span className='font-medium'>Mulai:</span>{' '}
                          {task.startTime}
                        </div>
                        <div>
                          <span className='font-medium'>Estimasi:</span>{' '}
                          {task.estimatedDuration}
                        </div>
                        <div>
                          <span className='font-medium'>Petugas:</span>{' '}
                          {task.assignedTo}
                        </div>
                        <div>
                          <span className='font-medium'>Kendaraan:</span>{' '}
                          {task.vehicle}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(task.status)}`}
                    >
                      {getStatusText(task.status)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className='mb-4'>
                    <div className='mb-1 flex justify-between text-sm text-gray-600'>
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className='mb-4'>
                    <h4 className='mb-2 font-medium text-gray-900'>Lokasi:</h4>
                    <div className='space-y-1'>
                      {task.locations.map((location, index) => (
                        <div
                          key={index}
                          className='flex items-center space-x-2'
                        >
                          <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                          <span className='text-sm text-gray-600'>
                            {location}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='flex space-x-3'>
                    <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                      Lacak Real-time
                    </button>
                    <button className='rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'>
                      Selesaikan
                    </button>
                    <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                      Hubungi Petugas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className='space-y-4'>
              {tasks.completed.map((task) => (
                <div
                  key={task.id}
                  className='rounded-lg border border-gray-200 p-6'
                >
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center space-x-2'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {task.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                      <p className='mb-3 text-gray-600'>{task.description}</p>
                      <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3'>
                        <div>
                          <span className='font-medium'>Tanggal:</span>{' '}
                          {task.completedDate}
                        </div>
                        <div>
                          <span className='font-medium'>Mulai:</span>{' '}
                          {task.startTime}
                        </div>
                        <div>
                          <span className='font-medium'>Selesai:</span>{' '}
                          {task.endTime}
                        </div>
                        <div>
                          <span className='font-medium'>Petugas:</span>{' '}
                          {task.assignedTo}
                        </div>
                        <div>
                          <span className='font-medium'>Kendaraan:</span>{' '}
                          {task.vehicle}
                        </div>
                        <div>
                          <span className='font-medium'>Sampah:</span>{' '}
                          {task.wasteCollected} kg
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(task.status)}`}
                    >
                      {getStatusText(task.status)}
                    </span>
                  </div>

                  <div className='mb-4'>
                    <div className='rounded-lg bg-green-50 p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm text-green-600'>
                            Total Sampah Terkumpul
                          </p>
                          <p className='text-xl font-bold text-green-800'>
                            {task.wasteCollected} kg
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
                  </div>

                  <div className='mb-4'>
                    <h4 className='mb-2 font-medium text-gray-900'>
                      Lokasi yang Dikunjungi:
                    </h4>
                    <div className='space-y-1'>
                      {task.locations.map((location, index) => (
                        <div
                          key={index}
                          className='flex items-center space-x-2'
                        >
                          <div className='h-2 w-2 rounded-full bg-green-500'></div>
                          <span className='text-sm text-gray-600'>
                            {location}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

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
    </div>
  );
}

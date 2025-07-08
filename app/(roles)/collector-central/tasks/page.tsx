'use client';

import { useState } from 'react';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [tasksData] = useState({
    overview: {
      totalTasks: 342,
      pendingTasks: 45,
      inProgressTasks: 23,
      completedTasks: 274,
      overdueTasks: 8,
      assignedUnits: 15,
    },
    tasks: [
      {
        id: 1,
        title: 'Pengumpulan Sampah Kawasan Industri',
        description:
          'Koordinasi pengumpulan sampah dari 15 pabrik di kawasan industri Surabaya',
        priority: 'high',
        status: 'pending',
        dueDate: '2025-07-08',
        dueTime: '14:00',
        assignedTo: 'PT. Surabaya Waste Collection',
        assignedUnit: 'Unit A',
        region: 'Surabaya Timur',
        estimatedWeight: 2500, // kg
        wasteTypes: ['Plastik', 'Logam', 'Kertas'],
        locations: [
          'Pabrik Tekstil ABC',
          'Pabrik Elektronik XYZ',
          'Pabrik Makanan 123',
        ],
        createdDate: '2025-07-05',
        createdBy: 'Admin Central',
        notes: 'Perlu koordinasi khusus dengan pihak keamanan pabrik',
      },
      {
        id: 2,
        title: 'Pengumpulan Sampah Pasar Traditional',
        description: 'Pengumpulan sampah organik dari 8 pasar tradisional',
        priority: 'medium',
        status: 'in-progress',
        dueDate: '2025-07-08',
        dueTime: '06:00',
        assignedTo: 'CV. Bersih Lingkungan',
        assignedUnit: 'Unit B',
        region: 'Surabaya Barat',
        estimatedWeight: 1800,
        wasteTypes: ['Organik'],
        locations: ['Pasar Atom', 'Pasar Keputran', 'Pasar Genteng'],
        createdDate: '2025-07-04',
        createdBy: 'Admin Central',
        notes: 'Mulai pengumpulan pagi hari sebelum jam 6',
        progress: 60,
        startTime: '05:30',
      },
      {
        id: 3,
        title: 'Pengumpulan Sampah Mall & Pusat Perbelanjaan',
        description: 'Pengumpulan sampah dari 5 mall besar di Surabaya',
        priority: 'high',
        status: 'pending',
        dueDate: '2025-07-09',
        dueTime: '10:00',
        assignedTo: 'PT. Eco Waste Management',
        assignedUnit: 'Unit C',
        region: 'Surabaya Pusat',
        estimatedWeight: 3200,
        wasteTypes: ['Plastik', 'Kertas', 'Organik'],
        locations: [
          'Mall Ciputra World',
          'Mall Galaxy',
          'Mall Tunjungan Plaza',
        ],
        createdDate: '2025-07-06',
        createdBy: 'Admin Central',
        notes: 'Koordinasi dengan manajemen mall untuk akses service area',
      },
      {
        id: 4,
        title: 'Pengumpulan Sampah Rumah Sakit',
        description:
          'Pengumpulan sampah medis dan non-medis dari 3 rumah sakit',
        priority: 'high',
        status: 'overdue',
        dueDate: '2025-07-07',
        dueTime: '08:00',
        assignedTo: 'UD. Sampah Bersih',
        assignedUnit: 'Unit D',
        region: 'Surabaya Selatan',
        estimatedWeight: 950,
        wasteTypes: ['Medis', 'Plastik', 'Organik'],
        locations: ['RSU Dr. Soetomo', 'RS Siloam', 'RS Mitra Keluarga'],
        createdDate: '2025-07-05',
        createdBy: 'Admin Central',
        notes: 'URGENT: Sampah medis harus ditangani sesuai protokol khusus',
      },
      {
        id: 5,
        title: 'Pengumpulan Sampah Sekolah & Universitas',
        description: 'Pengumpulan sampah dari 10 institusi pendidikan',
        priority: 'medium',
        status: 'completed',
        dueDate: '2025-07-07',
        dueTime: '15:00',
        assignedTo: 'PT. Green Solution',
        assignedUnit: 'Unit E',
        region: 'Surabaya Utara',
        estimatedWeight: 1400,
        wasteTypes: ['Kertas', 'Plastik', 'Organik'],
        locations: ['Universitas Airlangga', 'ITS', 'SMPN 1 Surabaya'],
        createdDate: '2025-07-04',
        createdBy: 'Admin Central',
        notes: 'Pengumpulan berhasil diselesaikan tepat waktu',
        completedDate: '2025-07-07',
        completedTime: '14:30',
        actualWeight: 1567,
      },
      {
        id: 6,
        title: 'Pengumpulan Sampah Perkantoran CBD',
        description: 'Pengumpulan sampah dari gedung-gedung perkantoran di CBD',
        priority: 'low',
        status: 'pending',
        dueDate: '2025-07-10',
        dueTime: '16:00',
        assignedTo: 'CV. Daur Ulang Mandiri',
        assignedUnit: 'Unit F',
        region: 'Surabaya Pusat',
        estimatedWeight: 2100,
        wasteTypes: ['Kertas', 'Plastik'],
        locations: ['Menara BCA', 'Gedung Grahadi', 'World Trade Center'],
        createdDate: '2025-07-07',
        createdBy: 'Admin Central',
        notes: 'Pengumpulan sore hari setelah jam kerja',
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
      case 'overdue':
        return 'bg-red-100 text-red-800';
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
      case 'overdue':
        return 'Terlambat';
      default:
        return status;
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasksData.tasks;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    return filtered;
  };

  const getTaskStats = () => {
    const tasks = getFilteredTasks();
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter((t) => t.status === 'overdue').length,
      totalWeight: tasks.reduce((sum, t) => sum + t.estimatedWeight, 0),
    };
  };

  const stats = getTaskStats();

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Manajemen Tugas Central
            </h1>
            <p className='text-gray-600'>
              Kelola dan distribusikan tugas pengumpulan sampah ke seluruh unit
              pengumpul.
            </p>
          </div>
          <div className='flex space-x-3'>
            <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
              📊 Laporan Tugas
            </button>
            <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
              + Buat Tugas Baru
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6'>
        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Tugas</p>
              <p className='text-2xl font-bold text-gray-900'>
                {tasksData.overview.totalTasks}
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
                  d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Pending</p>
              <p className='text-2xl font-bold text-orange-600'>
                {tasksData.overview.pendingTasks}
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
              <p className='text-sm text-gray-600'>Sedang Berjalan</p>
              <p className='text-2xl font-bold text-blue-600'>
                {tasksData.overview.inProgressTasks}
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
              <p className='text-sm text-gray-600'>Selesai</p>
              <p className='text-2xl font-bold text-green-600'>
                {tasksData.overview.completedTasks}
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
              <p className='text-sm text-gray-600'>Terlambat</p>
              <p className='text-2xl font-bold text-red-600'>
                {tasksData.overview.overdueTasks}
              </p>
            </div>
            <div className='rounded-full bg-red-100 p-3'>
              <svg
                className='h-6 w-6 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Unit Ditugaskan</p>
              <p className='text-2xl font-bold text-purple-600'>
                {tasksData.overview.assignedUnits}
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
              onClick={() => setActiveTab('tasks')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Daftar Tugas
              <span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600'>
                {stats.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('assignment')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'assignment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Penugasan
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Overview Tugas
              </h3>

              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Urgent Tasks */}
                <div className='rounded-lg bg-red-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-red-900'>
                    Tugas Urgent
                  </h4>
                  <div className='space-y-3'>
                    {tasksData.tasks
                      .filter(
                        (task) =>
                          task.status === 'overdue' ||
                          (task.priority === 'high' &&
                            task.status === 'pending')
                      )
                      .slice(0, 3)
                      .map((task) => (
                        <div
                          key={task.id}
                          className='rounded-lg border border-red-200 bg-white p-3'
                        >
                          <div className='mb-2 flex items-center justify-between'>
                            <h5 className='font-medium text-gray-900'>
                              {task.title}
                            </h5>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                            >
                              {getStatusText(task.status)}
                            </span>
                          </div>
                          <p className='mb-2 text-sm text-gray-600'>
                            {task.assignedTo}
                          </p>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='text-gray-600'>
                              Due: {task.dueDate} {task.dueTime}
                            </span>
                            <span className='text-gray-600'>
                              {task.estimatedWeight} kg
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Task Distribution */}
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-gray-900'>
                    Distribusi Tugas per Unit
                  </h4>
                  <div className='space-y-3'>
                    {Array.from(
                      new Set(tasksData.tasks.map((task) => task.assignedTo))
                    ).map((unit) => {
                      const unitTasks = tasksData.tasks.filter(
                        (task) => task.assignedTo === unit
                      );
                      const completedTasks = unitTasks.filter(
                        (task) => task.status === 'completed'
                      ).length;
                      const completionRate =
                        (completedTasks / unitTasks.length) * 100;

                      return (
                        <div key={unit} className='rounded-lg bg-white p-3'>
                          <div className='mb-2 flex items-center justify-between'>
                            <h5 className='font-medium text-gray-900'>
                              {unit}
                            </h5>
                            <span className='text-sm text-gray-600'>
                              {unitTasks.length} tugas
                            </span>
                          </div>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='text-gray-600'>
                              Selesai: {completedTasks}
                            </span>
                            <span className='text-gray-600'>
                              Rate: {completionRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className='mt-2 h-2 w-full rounded-full bg-gray-200'>
                            <div
                              className='h-2 rounded-full bg-green-500 transition-all duration-300'
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <h4 className='text-md mb-4 font-medium text-gray-900'>
                  Aktivitas Terbaru
                </h4>
                <div className='space-y-3'>
                  {tasksData.tasks
                    .sort(
                      (a, b) =>
                        new Date(b.createdDate).getTime() -
                        new Date(a.createdDate).getTime()
                    )
                    .slice(0, 5)
                    .map((task) => (
                      <div
                        key={task.id}
                        className='flex items-center justify-between rounded-lg bg-gray-50 p-4'
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`h-3 w-3 rounded-full ${
                              task.status === 'completed'
                                ? 'bg-green-500'
                                : task.status === 'in-progress'
                                  ? 'bg-blue-500'
                                  : task.status === 'overdue'
                                    ? 'bg-red-500'
                                    : 'bg-orange-500'
                            }`}
                          ></div>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {task.title}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {task.assignedTo} - {task.region}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-medium text-gray-900'>
                            {task.estimatedWeight} kg
                          </p>
                          <p className='text-xs text-gray-600'>
                            {task.createdDate}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
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
                      <option value='pending'>Menunggu</option>
                      <option value='in-progress'>Sedang Berjalan</option>
                      <option value='completed'>Selesai</option>
                      <option value='overdue'>Terlambat</option>
                    </select>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-600'>Prioritas:</span>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>Semua Prioritas</option>
                      <option value='high'>Tinggi</option>
                      <option value='medium'>Sedang</option>
                      <option value='low'>Rendah</option>
                    </select>
                  </div>
                </div>

                <div className='flex items-center space-x-4 text-sm'>
                  <span className='text-gray-600'>
                    Menampilkan {stats.total} dari {tasksData.tasks.length}{' '}
                    tugas
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className='space-y-4'>
                {getFilteredTasks().map((task) => (
                  <div
                    key={task.id}
                    className='rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md'
                  >
                    <div className='mb-4 flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center space-x-3'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {task.title}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                          >
                            {getPriorityText(task.priority)}
                          </span>
                          {task.status === 'overdue' && (
                            <span className='inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800'>
                              ⚠️ Overdue
                            </span>
                          )}
                        </div>
                        <p className='mb-3 text-gray-600'>{task.description}</p>
                        <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-3'>
                          <div>
                            <span className='font-medium'>Ditugaskan ke:</span>{' '}
                            {task.assignedTo}
                          </div>
                          <div>
                            <span className='font-medium'>Unit:</span>{' '}
                            {task.assignedUnit}
                          </div>
                          <div>
                            <span className='font-medium'>Region:</span>{' '}
                            {task.region}
                          </div>
                          <div>
                            <span className='font-medium'>Deadline:</span>{' '}
                            {task.dueDate} {task.dueTime}
                          </div>
                          <div>
                            <span className='font-medium'>Estimasi:</span>{' '}
                            {task.estimatedWeight} kg
                          </div>
                          <div>
                            <span className='font-medium'>Dibuat:</span>{' '}
                            {task.createdDate}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(task.status)}`}
                      >
                        {getStatusText(task.status)}
                      </span>
                    </div>

                    {/* Progress Bar for In-Progress Tasks */}
                    {task.status === 'in-progress' && task.progress && (
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
                    )}

                    {/* Waste Types */}
                    <div className='mb-4'>
                      <span className='mr-2 text-sm font-medium text-gray-700'>
                        Jenis Sampah:
                      </span>
                      <div className='inline-flex flex-wrap gap-2'>
                        {task.wasteTypes.map((type, index) => (
                          <span
                            key={index}
                            className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Locations */}
                    <div className='mb-4'>
                      <span className='mb-2 block text-sm font-medium text-gray-700'>
                        Lokasi:
                      </span>
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

                    {/* Notes */}
                    {task.notes && (
                      <div className='mb-4 rounded-lg bg-gray-50 p-3'>
                        <p className='text-sm text-gray-700'>
                          <span className='font-medium'>Catatan:</span>{' '}
                          {task.notes}
                        </p>
                      </div>
                    )}

                    {/* Completed Task Info */}
                    {task.status === 'completed' && task.completedDate && (
                      <div className='mb-4 rounded-lg bg-green-50 p-3'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm text-green-700'>
                              <span className='font-medium'>Selesai:</span>{' '}
                              {task.completedDate} {task.completedTime}
                            </p>
                            {task.actualWeight && (
                              <p className='text-sm text-green-700'>
                                <span className='font-medium'>
                                  Berat Aktual:
                                </span>{' '}
                                {task.actualWeight} kg
                              </p>
                            )}
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
                    )}

                    {/* Actions */}
                    <div className='flex space-x-3'>
                      <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                        Detail
                      </button>
                      <button className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'>
                        Edit
                      </button>
                      {task.status === 'pending' && (
                        <button className='rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'>
                          Assign Ulang
                        </button>
                      )}
                      {task.status === 'in-progress' && (
                        <button className='rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700'>
                          Monitor
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignment' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Penugasan Unit
              </h3>

              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Unit Workload */}
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-gray-900'>
                    Beban Kerja Unit
                  </h4>
                  <div className='space-y-4'>
                    {Array.from(
                      new Set(tasksData.tasks.map((task) => task.assignedTo))
                    ).map((unit) => {
                      const unitTasks = tasksData.tasks.filter(
                        (task) => task.assignedTo === unit
                      );
                      const activeTasks = unitTasks.filter(
                        (task) =>
                          task.status === 'pending' ||
                          task.status === 'in-progress'
                      ).length;
                      const totalWeight = unitTasks.reduce(
                        (sum, task) => sum + task.estimatedWeight,
                        0
                      );

                      return (
                        <div key={unit} className='rounded-lg bg-white p-4'>
                          <div className='mb-3 flex items-center justify-between'>
                            <h5 className='font-medium text-gray-900'>
                              {unit}
                            </h5>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                activeTasks > 3
                                  ? 'bg-red-100 text-red-800'
                                  : activeTasks > 1
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {activeTasks} tugas aktif
                            </span>
                          </div>
                          <div className='grid grid-cols-3 gap-2 text-sm'>
                            <div>
                              <span className='text-gray-600'>Total:</span>
                              <span className='ml-1 font-medium'>
                                {unitTasks.length}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-600'>Berat:</span>
                              <span className='ml-1 font-medium'>
                                {totalWeight.toLocaleString()} kg
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-600'>Kapasitas:</span>
                              <span
                                className={`ml-1 font-medium ${
                                  activeTasks > 3
                                    ? 'text-red-600'
                                    : activeTasks > 1
                                      ? 'text-yellow-600'
                                      : 'text-green-600'
                                }`}
                              >
                                {activeTasks > 3
                                  ? 'Penuh'
                                  : activeTasks > 1
                                    ? 'Sedang'
                                    : 'Ringan'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assignment Rules */}
                <div className='rounded-lg bg-gray-50 p-6'>
                  <h4 className='text-md mb-4 font-medium text-gray-900'>
                    Aturan Penugasan
                  </h4>
                  <div className='space-y-3'>
                    <div className='rounded-lg bg-white p-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-900'>
                          Prioritas Tinggi
                        </span>
                        <span className='text-sm text-gray-600'>
                          Auto-assign unit terbaik
                        </span>
                      </div>
                    </div>
                    <div className='rounded-lg bg-white p-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-900'>
                          Distribusi Regional
                        </span>
                        <span className='text-sm text-gray-600'>
                          Sesuai zona operasi
                        </span>
                      </div>
                    </div>
                    <div className='rounded-lg bg-white p-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-900'>
                          Kapasitas Maksimal
                        </span>
                        <span className='text-sm text-gray-600'>
                          5 tugas aktif per unit
                        </span>
                      </div>
                    </div>
                    <div className='rounded-lg bg-white p-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-900'>
                          Sampah Medis
                        </span>
                        <span className='text-sm text-gray-600'>
                          Unit berlisensi khusus
                        </span>
                      </div>
                    </div>
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

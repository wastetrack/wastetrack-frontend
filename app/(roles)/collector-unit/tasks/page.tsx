'use client';

import { useState, useEffect } from 'react';
import { useLocation, type LocationType } from '@/lib/mapbox-utils';
import { encodeId } from '@/lib/id-utils';
import { getTokenManager } from '@/lib/token-manager';
import { useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  Clock,
  Zap,
  CheckCircle,
  Search,
  Filter,
  XCircle,
  CircleDollarSign,
} from 'lucide-react';
import {
  wasteDropRequestAPI,
  wasteTransferRequestAPI,
} from '@/services/api/user';
import { WasteDropRequest, WasteTransferRequest } from '@/types';

// Helper to get duration in minutes
function getDuration(start: string, end: string): string {
  try {
    const startTime = start.split('+')[0];
    const endTime = end.split('+')[0];

    const [sh, sm] = startTime.split(':');
    const [eh, em] = endTime.split(':');
    const startMins = parseInt(sh) * 60 + parseInt(sm);
    const endMins = parseInt(eh) * 60 + parseInt(em);
    return (endMins - startMins).toString();
  } catch {
    return '-';
  }
}

// Map API response to UI task format for Drop Request
function mapDropRequestToUiTask(task: WasteDropRequest) {
  const startTime = task.appointment_start_time?.split('+')[0]?.slice(0, 5);
  const endTime = task.appointment_end_time?.split('+')[0]?.slice(0, 5);
  return {
    id: task.id,
    title: `Drop Request - ${task.delivery_type === 'pickup' ? 'Penjemputan' : 'Antar Sendiri'}`,
    notes: task.notes || '-',
    dueDate: task.appointment_date,
    dueTime: startTime,
    total_price: task.total_price,
    locations: task.appointment_location ? [task.appointment_location] : [],
    estimatedDuration:
      task.appointment_start_time && task.appointment_end_time
        ? `${getDuration(task.appointment_start_time, task.appointment_end_time)} menit`
        : '-',
    status: mapApiStatusToUiStatus(task.status),
    startTime,
    endTime,
    completedDate:
      task.status === 'completed' ? task.appointment_date : undefined,
    phoneNumber: task.user_phone_number,
    deliveryType: task.delivery_type,
    update: task.updated_at,
    taskType: 'drop' as const,
    customerName: task.customer?.username || 'Tidak diketahui',
  };
}

// Map API response to UI task format for Transfer Request
function mapTransferRequestToUiTask(task: WasteTransferRequest) {
  const startTime = task.appointment_start_time?.split('+')[0]?.slice(0, 5);
  const endTime = task.appointment_end_time?.split('+')[0]?.slice(0, 5);
  return {
    id: task.id,
    title: `Transfer Request - ${task.form_type === 'industry_request' ? 'dari Industri' : 'dari Bank Sampah'}`,
    notes: task.notes || '-',
    dueDate: task.appointment_date,
    dueTime: startTime,
    total_price: 0, // Transfer request tidak punya total_price langsung
    locations: task.appointment_location ? [task.appointment_location] : [],
    estimatedDuration:
      task.appointment_start_time && task.appointment_end_time
        ? `${getDuration(task.appointment_start_time, task.appointment_end_time)} menit`
        : '-',
    status: mapApiStatusToUiStatus(task.status),
    startTime,
    endTime,
    completedDate:
      task.status === 'completed' ? task.appointment_date : undefined,
    phoneNumber: task.source_phone_number,
    deliveryType: 'pickup' as const, // Transfer request selalu pickup
    update: task.updated_at,
    taskType: 'transfer' as const,
    customerName:
      task.source_user?.institution ||
      task.source_user?.username ||
      'Tidak diketahui',
    sourceAddress: task.source_user?.address || 'Alamat tidak tersedia',
  };
}

// Map API status to UI status
function mapApiStatusToUiStatus(apiStatus: string): string {
  switch (apiStatus) {
    case 'pending':
    case 'assigned':
      return 'pending';
    case 'collecting':
      return 'in-progress';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return apiStatus;
  }
}

export default function TasksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  type UITask =
    | ReturnType<typeof mapDropRequestToUiTask>
    | ReturnType<typeof mapTransferRequestToUiTask>;

  const [tasks, setTasks] = useState<{
    pending: UITask[];
    inProgress: UITask[];
    completed: UITask[];
  }>({
    pending: [],
    inProgress: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Component untuk menampilkan lokasi
  const LocationDisplay = ({ location }: { location: LocationType }) => {
    const { formattedLocation, isLoading } = useLocation(location);
    return (
      <div className='flex items-center'>
        <div className='flex items-center'>
          {isLoading ? (
            <div className='flex items-center'>
              <div className='h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-gray-600'></div>
              <span className='font-medium text-gray-700'>
                Loading alamat...
              </span>
            </div>
          ) : (
            <span className='font-medium text-gray-700'>
              {formattedLocation}
            </span>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = getTokenManager().getCurrentUser();
        if (!user?.id) {
          setError('User tidak ditemukan. Silakan login kembali.');
          setLoading(false);
          return;
        }

        // Fetch drop requests
        const dropResponse = await wasteDropRequestAPI.getWasteDropRequests({
          assigned_collector_id: user.id,
          page: 1,
          size: 50,
        });

        // Fetch transfer requests - ambil list dulu untuk filter berdasarkan assigned_collector_id
        const transferListResponse =
          await wasteTransferRequestAPI.getWasteTransferRequests({
            page: 1,
            size: 50,
          });

        // Filter transfer requests yang assigned ke collector ini
        const assignedTransferIds = transferListResponse.data
          .filter(
            (request: WasteTransferRequest) =>
              request.assigned_collector_id === user.id
          )
          .map((request: WasteTransferRequest) => request.id);

        // Fetch detail untuk setiap transfer request yang assigned
        const assignedTransferRequests: WasteTransferRequest[] = [];
        for (const transferId of assignedTransferIds) {
          try {
            const transferDetailResponse =
              await wasteTransferRequestAPI.getWasteTransferRequestById(
                transferId
              );
            assignedTransferRequests.push(transferDetailResponse.data);
          } catch (error) {
            console.warn(
              `Failed to fetch transfer request detail for ID: ${transferId}`,
              error
            );
          }
        }

        console.log('Drop Requests:', dropResponse.data);
        console.log('Transfer Requests:', assignedTransferRequests);

        // Group tasks by status for tabs
        const pending: UITask[] = [];
        const inProgress: UITask[] = [];
        const completed: UITask[] = [];

        // Process drop requests
        dropResponse.data.forEach((task: WasteDropRequest) => {
          const uiTask = mapDropRequestToUiTask(task);
          if (uiTask.status === 'pending') {
            pending.push(uiTask);
          } else if (uiTask.status === 'in-progress') {
            inProgress.push(uiTask);
          } else if (uiTask.status === 'completed') {
            completed.push(uiTask);
          }
        });

        // Process transfer requests
        assignedTransferRequests.forEach((task: WasteTransferRequest) => {
          const uiTask = mapTransferRequestToUiTask(task);
          if (uiTask.status === 'pending') {
            pending.push(uiTask);
          } else if (uiTask.status === 'in-progress') {
            inProgress.push(uiTask);
          } else if (uiTask.status === 'completed') {
            completed.push(uiTask);
          }
        });

        // Sort by appointment date
        const sortByDate = (a: UITask, b: UITask) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        pending.sort(sortByDate);
        inProgress.sort(sortByDate);
        completed.sort(sortByDate);

        setTasks({ pending, inProgress, completed });
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError((err as Error).message || 'Gagal memuat tugas');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks based on search term and filter type
  const filterTasks = (taskList: UITask[]) => {
    return taskList.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'drop' && task.taskType === 'drop') ||
        (filterType === 'transfer' && task.taskType === 'transfer') ||
        (filterType === 'pickup' && task.deliveryType === 'pickup') ||
        (filterType === 'dropoff' && task.deliveryType === 'dropoff');

      return matchesSearch && matchesFilter;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-600'>Memuat tugas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 w-fit rounded-full bg-red-100 p-3'>
            <XCircle className='h-6 w-6 text-red-600' />
          </div>
          <p className='mb-4 text-red-600'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

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

  const currentTasks =
    activeTab === 'pending'
      ? filterTasks(tasks.pending)
      : activeTab === 'inProgress'
        ? filterTasks(tasks.inProgress)
        : filterTasks(tasks.completed);

  return (
    <div className='space-y-6 font-poppins'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
            <ClipboardCheck className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Manajemen Tugas
            </h1>
            <p className='mt-1 text-gray-600'>
              Kelola dan pantau tugas pengumpulan sampah Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Clock className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Tugas Pending
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {tasks.pending.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Zap className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Tugas Ongoing
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {tasks.inProgress.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <CheckCircle className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Tugas Selesai
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {tasks.completed.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-4'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-1 items-center space-x-4'>
            <div className='relative max-w-md flex-1'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <Search className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                placeholder='Cari tugas...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <Filter className='h-5 w-5 text-gray-400' />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className='appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>Semua Jenis</option>
                <option value='drop'>Drop Request</option>
                <option value='transfer'>Transfer Request</option>
                <option value='pickup'>Penjemputan</option>
                <option value='dropoff'>Antar Sendiri</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Navigation Tabs */}
      <div className='flex space-x-1 rounded-lg bg-gray-100 p-1'>
        <button
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === 'pending'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          <div className='flex items-center justify-center space-x-2'>
            <Clock className='h-4 w-4' />
            <span>Pending</span>
          </div>
        </button>

        <button
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === 'inProgress'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('inProgress')}
        >
          <div className='flex items-center justify-center space-x-2'>
            <Zap className='h-4 w-4' />
            <span>Berjalan</span>
          </div>
        </button>

        <button
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === 'completed'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          <div className='flex items-center justify-center space-x-2'>
            <CheckCircle className='h-4 w-4' />
            <span>Selesai</span>
          </div>
        </button>
      </div>

      {/* Tasks Content */}
      <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
        <div className='mb-6 text-center'>
          <h2 className='text-xl font-semibold text-gray-900'>
            {activeTab === 'pending' && 'Tugas Pending'}
            {activeTab === 'inProgress' && 'Tugas Sedang Berjalan'}
            {activeTab === 'completed' && 'Tugas Selesai'}
          </h2>
          <p className='text-sm text-gray-600'>
            Menampilkan {currentTasks.length} dari{' '}
            {activeTab === 'pending'
              ? tasks.pending.length
              : activeTab === 'inProgress'
                ? tasks.inProgress.length
                : tasks.completed.length}{' '}
            tugas
          </p>
        </div>

        <div className='space-y-4'>
          {currentTasks.length === 0 ? (
            <div className='py-8 text-center'>
              <div className='mx-auto mb-4 w-fit rounded-full bg-gray-100 p-3'>
                <ClipboardCheck className='h-6 w-6 text-gray-400' />
              </div>
              <p className='text-gray-500'>
                {searchTerm || filterType !== 'all'
                  ? 'Tidak ada tugas yang sesuai dengan pencarian atau filter'
                  : `Tidak ada tugas ${activeTab === 'pending' ? 'pending' : activeTab === 'inProgress' ? 'yang sedang berjalan' : 'yang selesai'}`}
              </p>
            </div>
          ) : (
            currentTasks.map((task) => (
              <div
                key={task.id}
                className='rounded-lg border border-gray-200 p-6 transition-shadow'
              >
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-3 flex items-center space-x-2'>
                      <div className='flex items-center space-x-2'>
                        {task.taskType === 'transfer' ? (
                          <CircleDollarSign className='h-5 w-5 text-blue-600' />
                        ) : (
                          <ClipboardCheck className='h-5 w-5 text-emerald-600' />
                        )}
                        <h3 className='text-lg font-semibold text-gray-900'>
                          {task.title}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${getStatusColor(task.status)}`}
                      >
                        {getStatusText(task.status)}
                      </span>
                    </div>

                    <div className='text-md grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      <div>
                        <div className='text-sm text-gray-600'>ID</div>
                        <div className='font-medium text-gray-700'>
                          {task.id.substring(0, 7)}...
                        </div>
                      </div>

                      <div>
                        <div className='text-sm text-gray-600'>
                          {task.taskType === 'drop' ? 'Customer' : 'Pengirim'}
                        </div>
                        <div className='font-medium text-gray-700'>
                          {task.customerName}
                        </div>
                      </div>

                      <div>
                        <div className='text-sm text-gray-600'>
                          Jadwal Pengambilan
                        </div>
                        <div className='font-medium text-gray-700'>
                          {new Date(task.dueDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      </div>

                      <div>
                        <div className='text-sm text-gray-600'>
                          Waktu Pengambilan
                        </div>
                        <div className='font-medium text-gray-700'>
                          {task.startTime && task.endTime
                            ? `${task.startTime} - ${task.endTime}`
                            : task.estimatedDuration}
                        </div>
                      </div>

                      <div>
                        <div className='text-sm text-gray-600'>
                          Nomor Telepon
                        </div>
                        <div className='font-medium text-gray-700'>
                          {task.phoneNumber}
                        </div>
                      </div>

                      <div className='md:col-span-2 lg:col-span-3'>
                        <div className='text-sm text-gray-600'>Alamat</div>
                        <div>
                          {task.taskType === 'transfer' ? (
                            <span className='font-medium text-gray-700'>
                              {task.sourceAddress}
                            </span>
                          ) : task.locations.length === 0 ? (
                            <span className='font-medium text-gray-700'>
                              Lokasi tidak tersedia
                            </span>
                          ) : (
                            task.locations.map((location, index) => (
                              <LocationDisplay
                                key={index}
                                location={location}
                              />
                            ))
                          )}
                        </div>
                      </div>

                      <div className='md:col-span-2 lg:col-span-3'>
                        <div className='text-sm text-gray-600'>Notes</div>
                        <div className='font-medium text-gray-700'>
                          {task.notes}
                        </div>
                      </div>

                      <div>
                        <div className='text-sm text-gray-600'>
                          Diperbarui pada
                        </div>
                        <div className='font-medium text-gray-700'>
                          {new Date(task.update).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {activeTab === 'completed' &&
                        task.taskType === 'drop' && (
                          <div>
                            <div className='text-sm text-gray-600'>
                              Total Harga
                            </div>
                            <div className='font-medium text-gray-700'>
                              {task.total_price
                                ? `Rp ${task.total_price.toLocaleString('id-ID')}`
                                : 'Tidak tersedia'}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className='flex space-x-3 pt-4'>
                  {activeTab === 'pending' && (
                    <>
                      <button
                        className='rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50'
                        onClick={() =>
                          router.push(
                            `/collector-unit/tasks/${encodeId(task.id)}`
                          )
                        }
                      >
                        Detail
                      </button>
                    </>
                  )}
                  {activeTab === 'inProgress' && (
                    <>
                      <button
                        className='rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50'
                        onClick={() => {
                          // Remove non-digit characters, add country code if needed
                          let phone = task.phoneNumber.replace(/\D/g, '');
                          if (phone.startsWith('0')) {
                            phone = '62' + phone.slice(1);
                          }
                          window.open(`https://wa.me/${phone}`, '_blank');
                        }}
                      >
                        Hubungi{' '}
                        {task.taskType === 'drop' ? 'Customer' : 'Pengirim'}
                      </button>
                      <button
                        className='rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50'
                        onClick={() =>
                          router.push(
                            `/collector-unit/tasks/${encodeId(task.id)}`
                          )
                        }
                      >
                        Detail
                      </button>
                    </>
                  )}
                  {activeTab === 'completed' && (
                    <>
                      <button
                        className='rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50'
                        onClick={() =>
                          router.push(
                            `/collector-unit/tasks/${encodeId(task.id)}`
                          )
                        }
                      >
                        Detail
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

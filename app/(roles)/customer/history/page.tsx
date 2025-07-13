'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Package,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { wasteDropRequestAPI } from '@/services/api/user';
import { currentUserAPI } from '@/services/api/user';
import {
  WasteDropRequest,
  WasteDropRequestListParams,
} from '@/types/waste-drop-request';

// Utility functions (tidak ada perubahan)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  const time = timeString.split('+')[0];
  return time.slice(0, 5);
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Hari ini';
  if (diffInDays === 1) return '1 hari yang lalu';
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} minggu yang lalu`;
  return `${Math.floor(diffInDays / 30)} bulan yang lalu`;
};

const getStatusInfo = (status: WasteDropRequest['status']) => {
  const statusMap = {
    pending: {
      label: 'Menunggu',
      color: 'bg-yellow-100 text-yellow-700',
      icon: Clock,
      bgColor: 'bg-yellow-100',
    },
    assigned: {
      label: 'Dikonfirmasi',
      color: 'bg-blue-100 text-blue-700',
      icon: CheckCircle,
      bgColor: 'bg-blue-100',
    },
    collecting: {
      label: 'Dalam Proses',
      color: 'bg-purple-100 text-purple-700',
      icon: Truck,
      bgColor: 'bg-purple-100',
    },
    completed: {
      label: 'Selesai',
      color: 'bg-emerald-100 text-emerald-700',
      icon: CheckCircle,
      bgColor: 'bg-emerald-100',
    },
    cancelled: {
      label: 'Dibatalkan',
      color: 'bg-red-100 text-red-700',
      icon: XCircle,
      bgColor: 'bg-red-100',
    },
  };
  return statusMap[status] || statusMap.pending;
};

const getDeliveryTypeInfo = (type: WasteDropRequest['delivery_type']) => {
  return type === 'pickup'
    ? { label: 'Penjemputan', icon: Truck, color: 'text-blue-600' }
    : { label: 'Antar Mandiri', icon: Package, color: 'text-green-600' };
};

export default function HistoryPage() {
  const [requests, setRequests] = useState<WasteDropRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // PERBAIKAN 1: Mengubah nama state filter tanggal
  const [filters, setFilters] = useState<{
    status:
      | 'pending'
      | 'assigned'
      | 'collecting'
      | 'completed'
      | 'cancelled'
      | 'all';
    delivery_type: WasteDropRequest['delivery_type'] | 'all';
    appointment_date_from?: string; // Option 2: Specific appointment date
    appointment_date_to?: string;
  }>({
    status: 'all',
    delivery_type: 'all',
    appointment_date_from: '', // Diubah dari appointment_date ke date_from
    appointment_date_to: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    assigned: 0,
    collecting: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userId = await currentUserAPI.getUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Failed to get current user:', error);
        setError('Gagal memuat informasi pengguna. Silakan login kembali.');
      }
    };
    getCurrentUser();
  }, []);

  const fetchRequests = useCallback(
    async (page: number = 1, isRefresh = false) => {
      if (!currentUserId) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params: WasteDropRequestListParams = {
          customer_id: currentUserId,
          page,
          size: pageSize,
          sort_by: 'created_at',
          sort_order: 'desc',
        };

        if (filters.status !== 'all') params.status = filters.status;
        if (filters.delivery_type !== 'all')
          params.delivery_type = filters.delivery_type;

        // PERBAIKAN 2: Mengirim parameter date_from dan date_to ke API
        // API akan menggunakan ini untuk memfilter kolom 'appointment_date'
        if (filters.appointment_date_from)
          params.date_from = filters.appointment_date_from;
        if (filters.appointment_date_to)
          params.date_to = filters.appointment_date_to;

        // Search dinonaktifkan sementara sesuai kode Anda, bisa diaktifkan kembali jika perlu
        // if (searchQuery.trim()) (params as any).search = searchQuery.trim();

        console.log('🔍 Fetching requests with params:', params);

        const response = await wasteDropRequestAPI.getCustomerWasteDropRequests(
          currentUserId,
          params
        );

        console.log('📊 API Response:', response);

        const requestsData = response.data || [];
        const paginationInfo =
          (response.paging as { total_item?: number; total_page?: number }) ||
          {};
        const totalItems = paginationInfo.total_item || 0;
        const totalPagesFromAPI = paginationInfo.total_page || 1;

        setRequests(requestsData);
        setTotalCount(totalItems);
        setTotalPages(totalPagesFromAPI);
        setCurrentPage(page);

        setSummaryStats({
          total: totalItems,
          completed: requestsData.filter((r) => r.status === 'completed')
            .length,
          pending: requestsData.filter((r) => r.status === 'pending').length,
          assigned: requestsData.filter((r) => r.status === 'assigned').length,
          collecting: requestsData.filter((r) => r.status === 'collecting')
            .length,
          cancelled: requestsData.filter((r) => r.status === 'cancelled')
            .length,
        });
      } catch (error) {
        console.error('❌ Failed to fetch requests:', error);
        setError(
          error instanceof Error ? error.message : 'Gagal memuat riwayat'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUserId, filters, pageSize, searchQuery]
  );

  useEffect(() => {
    if (currentUserId) {
      fetchRequests(1);
    }
  }, [currentUserId, filters, fetchRequests]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentUserId) {
        fetchRequests(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchRequests, currentUserId]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchRequests(page);
  };

  const handleRefresh = () => {
    fetchRequests(currentPage, true);
  };

  if (loading && !refreshing) {
    return (
      <div className='flex min-h-96 items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='mx-auto mb-4 h-8 w-8 animate-spin text-emerald-500' />
          <p className='text-gray-600'>Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12 text-center'>
        <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-500' />
        <h3 className='mb-2 text-lg font-semibold text-gray-800'>
          Terjadi Kesalahan
        </h3>
        <p className='mb-4 text-gray-600'>{error}</p>
        <button
          onClick={() => fetchRequests(1)}
          className='rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600'
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header & Summary Cards (Tidak ada perubahan) */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            Riwayat Penyetoran
          </h1>
          <p className='mt-2 text-gray-600'>
            Lihat riwayat penyetoran sampah dan status permintaan Anda.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className='flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50'
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Memuat...' : 'Refresh'}
        </button>
      </div>
      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-6'>
        <div className='rounded-lg border bg-white p-4 shadow-sm'>
          <h3 className='mb-1 text-sm font-medium text-gray-600'>Total</h3>
          <p className='text-2xl font-bold text-blue-600'>
            {summaryStats.total}
          </p>
        </div>
        <div className='rounded-lg border bg-white p-4 shadow-sm'>
          <h3 className='mb-1 text-sm font-medium text-gray-600'>Menunggu</h3>
          <p className='text-2xl font-bold text-yellow-600'>
            {summaryStats.pending}
          </p>
        </div>
        <div className='rounded-lg border bg-white p-4 shadow-sm'>
          <h3 className='mb-1 text-sm font-medium text-gray-600'>
            Dikonfirmasi
          </h3>
          <p className='text-2xl font-bold text-blue-600'>
            {summaryStats.assigned}
          </p>
        </div>
        <div className='rounded-lg border bg-white p-4 shadow-sm'>
          <h3 className='mb-1 text-sm font-medium text-gray-600'>Proses</h3>
          <p className='text-2xl font-bold text-purple-600'>
            {summaryStats.collecting}
          </p>
        </div>
        <div className='rounded-lg border bg-white p-4 shadow-sm'>
          <h3 className='mb-1 text-sm font-medium text-gray-600'>Selesai</h3>
          <p className='text-2xl font-bold text-emerald-600'>
            {summaryStats.completed}
          </p>
        </div>
        <div className='rounded-lg border bg-white p-4 shadow-sm'>
          <h3 className='mb-1 text-sm font-medium text-gray-600'>Batal</h3>
          <p className='text-2xl font-bold text-red-600'>
            {summaryStats.cancelled}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className='mb-6 rounded-lg border bg-white p-4 shadow-sm'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <input
                type='text'
                placeholder='Cari berdasarkan catatan atau ID...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-emerald-500 focus:ring-emerald-500'
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50'
          >
            <Filter className='h-4 w-4' /> Filter{' '}
            {showFilters ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </button>
        </div>

        {showFilters && (
          <div className='mt-4 border-t border-gray-200 pt-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className='w-full rounded-lg border border-gray-200 p-2 focus:border-emerald-500 focus:ring-emerald-500'
                >
                  <option value='all'>Semua Status</option>
                  <option value='pending'>Menunggu</option>
                  <option value='assigned'>Dikonfirmasi</option>
                  <option value='collecting'>Dalam Proses</option>
                  <option value='completed'>Selesai</option>
                  <option value='cancelled'>Dibatalkan</option>
                </select>
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Jenis Layanan
                </label>
                <select
                  value={filters.delivery_type}
                  onChange={(e) =>
                    handleFilterChange('delivery_type', e.target.value)
                  }
                  className='w-full rounded-lg border border-gray-200 p-2 focus:border-emerald-500 focus:ring-emerald-500'
                >
                  <option value='all'>Semua Jenis</option>
                  <option value='pickup'>Penjemputan</option>
                  <option value='dropoff'>Antar Mandiri</option>
                </select>
              </div>

              {/* PERBAIKAN 3: Menyesuaikan input dengan state date_from */}
              <div className='hidden'>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Dari Tanggal
                </label>
                <input
                  type='date'
                  value={filters.appointment_date_from}
                  onChange={(e) =>
                    handleFilterChange('date_from', e.target.value)
                  }
                  className='w-full rounded-lg border border-gray-200 p-2 focus:border-emerald-500 focus:ring-emerald-500'
                />
              </div>
              <div className='hidden'>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Sampai Tanggal
                </label>
                <input
                  type='date'
                  value={filters.appointment_date_to}
                  onChange={(e) =>
                    handleFilterChange('date_to', e.target.value)
                  }
                  className='w-full rounded-lg border border-gray-200 p-2 focus:border-emerald-500 focus:ring-emerald-500'
                />
              </div>
            </div>
            <div className='mt-4 flex justify-end'>
              <button
                onClick={() => {
                  setFilters({
                    status: 'all',
                    delivery_type: 'all',
                    appointment_date_from: '',
                    appointment_date_to: '',
                  }); // PERBAIKAN: Reset filter
                  setSearchQuery('');
                }}
                className='text-sm text-gray-600 hover:text-gray-800'
              >
                Hapus Semua Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className='mb-4 flex items-center justify-between text-sm text-gray-600'>
        <div>
          <p>
            Menampilkan{' '}
            <span className='font-medium'>
              {totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{' '}
            dari <span className='font-medium'>{totalCount}</span> hasil
          </p>
          {(filters.status !== 'all' ||
            filters.delivery_type !== 'all' ||
            filters.appointment_date_from ||
            filters.appointment_date_to ||
            searchQuery) && ( // PERBAIKAN: Cek filter
            <p className='mt-1 text-xs text-gray-500'>
              📊 Hasil difilter •
              <button
                onClick={() => {
                  setFilters({
                    status: 'all',
                    delivery_type: 'all',
                    appointment_date_from: '',
                    appointment_date_to: '',
                  }); // PERBAIKAN: Reset filter
                  setSearchQuery('');
                }}
                className='ml-1 text-emerald-600 underline hover:text-emerald-700'
              >
                Lihat semua data
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Request List & Pagination (Tidak ada perubahan) */}
      <div className='rounded-lg border bg-white shadow-sm'>
        {requests.length === 0 ? (
          <div className='py-12 text-center'>
            <Package className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-semibold text-gray-800'>
              Belum Ada Riwayat
            </h3>
            <p className='text-gray-600'>
              Anda belum melakukan penyetoran sampah.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-gray-200'>
            {requests.map((request) => {
              const statusInfo = getStatusInfo(request.status);
              const deliveryInfo = getDeliveryTypeInfo(request.delivery_type);
              const StatusIcon = statusInfo.icon;
              const DeliveryIcon = deliveryInfo.icon;

              return (
                <div
                  key={request.id}
                  className='p-6 transition-colors hover:bg-gray-50'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex flex-1 items-start gap-4'>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${statusInfo.bgColor}`}
                      >
                        <StatusIcon
                          className={`h-6 w-6 ${statusInfo.color.split(' ')[1]}`}
                        />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='mb-1 flex items-center gap-2'>
                          <DeliveryIcon
                            className={`h-4 w-4 ${deliveryInfo.color}`}
                          />
                          <h3 className='font-semibold text-gray-800'>
                            {deliveryInfo.label}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className='space-y-1 text-sm text-gray-600'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4' />
                            <span>
                              {formatDate(request.appointment_date)} •{' '}
                              {formatTime(request.appointment_start_time)}-
                              {formatTime(request.appointment_end_time)}
                            </span>
                          </div>
                          {request.appointment_location && (
                            <div className='flex items-center gap-2'>
                              <MapPin className='h-4 w-4' />
                              <span>
                                {request.appointment_location.latitude.toFixed(
                                  4
                                )}
                                ,{' '}
                                {request.appointment_location.longitude.toFixed(
                                  4
                                )}
                              </span>
                            </div>
                          )}
                          {request.notes && (
                            <div className='flex items-start gap-2'>
                              <Package className='mt-0.5 h-4 w-4' />
                              <span>{request.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='ml-4 text-right'>
                      <p className='mb-1 text-sm text-gray-500'>
                        {getRelativeTime(request.created_at)}
                      </p>
                      <p className='text-xs text-gray-400'>
                        ID: {request.id.slice(0, 8)}...
                      </p>
                      {request.total_price > 0 && (
                        <p className='mt-1 text-sm font-semibold text-emerald-600'>
                          Rp {request.total_price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className='border-t border-gray-200 bg-gray-50 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'
              >
                ← Sebelumnya
              </button>
              <div className='flex items-center gap-1'>
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisible / 2)
                  );
                  const endPage = Math.min(
                    totalPages,
                    startPage + maxVisible - 1
                  );
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className='rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100'
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key='ellipsis1' className='px-2 text-gray-400'>
                          ...
                        </span>
                      );
                    }
                  }
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`rounded px-3 py-1 text-sm transition-colors ${i === currentPage ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {i}
                      </button>
                    );
                  }
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key='ellipsis2' className='px-2 text-gray-400'>
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className='rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100'
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'
              >
                Selanjutnya →
              </button>
            </div>
            <div className='mt-3 text-center text-xs text-gray-500'>
              Halaman {currentPage} dari {totalPages} • Menampilkan {pageSize}{' '}
              item per halaman
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

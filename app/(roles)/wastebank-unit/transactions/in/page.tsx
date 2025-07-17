'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Plus,
  Calendar,
  TrendingUp,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { wasteDropRequestAPI } from '@/services/api/user';
import { currentUserAPI } from '@/services/api/user';
import { WasteDropRequest, WasteDropRequestListResponse } from '@/types';
import { encodeId } from '@/lib/id-utils';

interface TransactionStats {
  totalTransactions: number;
  totalWeight: number;
  totalRevenue: number;
  avgTransaction: number;
}

interface ClientPagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export default function TransactionsInPage() {
  const router = useRouter();
  const [allTransactions, setAllTransactions] = useState<WasteDropRequest[]>(
    []
  );
  const [filteredTransactions, setFilteredTransactions] = useState<
    WasteDropRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(''); // kosong = tampilkan semua
  const [selectedType, setSelectedType] = useState(''); // kosong = semua tipe
  const [selectedStatus, setSelectedStatus] = useState(''); // kosong = semua status
  const [wasteBankId, setWasteBankId] = useState<string | null>(null);

  // Client-side pagination state
  const [pagination, setPagination] = useState<ClientPagination>({
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 1,
  });

  // Calculate displayed transactions based on pagination
  const displayedTransactions = React.useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, pagination.currentPage, pagination.itemsPerPage]);

  // Fungsi redirect ke detail transaksi dengan encodeId
  const handleViewDetail = (transactionId: string) => {
    const encoded = encodeId(transactionId);
    router.push(`/wastebank-unit/transactions/in/${encoded}`);
  };

  // Calculate today's stats from all filtered transactions
  const todayStats: TransactionStats = React.useMemo(() => {
    const completedTransactions = filteredTransactions.filter(
      (t) => t.status === 'completed'
    );
    const totalTransactions = completedTransactions.length;
    const totalRevenue = completedTransactions.reduce(
      (sum, t) => sum + t.total_price,
      0
    );

    return {
      totalTransactions,
      totalWeight: 0, // Weight data not available in current API response
      totalRevenue,
      avgTransaction:
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
    };
  }, [filteredTransactions]);

  // Filter transactions based on selected date
  const filterTransactions = useCallback(() => {
    let filtered = allTransactions;

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.appointment_date)
          .toISOString()
          .split('T')[0];
        return transactionDate === selectedDate;
      });
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(
        (transaction) => transaction.delivery_type === selectedType
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(
        (transaction) => transaction.status === selectedStatus
      );
    }

    setFilteredTransactions(filtered);

    // Update pagination info
    const totalPages = Math.ceil(filtered.length / pagination.itemsPerPage);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1, // Reset to first page when filtering
      totalItems: filtered.length,
      totalPages: totalPages || 1,
    }));
  }, [
    allTransactions,
    selectedDate,
    selectedType,
    selectedStatus,
    pagination.itemsPerPage,
  ]);

  // Fetch all transactions from API (100 items)
  const fetchAllTransactions = useCallback(async () => {
    if (!wasteBankId) return;
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: 1,
        size: 100, // Fetch 100 items at once
        sort_by: 'created_at' as const,
        sort_order: 'desc' as const,
      };

      const response: WasteDropRequestListResponse =
        await wasteDropRequestAPI.getWasteBankRequests(wasteBankId, params);

      setAllTransactions(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch transactions'
      );
    } finally {
      setLoading(false);
    }
  }, [wasteBankId]);

  // Get current user (waste bank) ID on mount
  useEffect(() => {
    const getCurrentWasteBankId = async () => {
      try {
        const userId = await currentUserAPI.getUserId();
        setWasteBankId(userId);
        setSelectedDate(''); // reset ke semua saat refresh/mount
      } catch {
        setError('Gagal mendapatkan data user.');
      }
    };
    getCurrentWasteBankId();
  }, []);

  // Fetch transactions when wasteBankId changes
  useEffect(() => {
    if (wasteBankId) {
      fetchAllTransactions();
    }
  }, [wasteBankId, fetchAllTransactions]);

  // Filter transactions when allTransactions or selectedDate changes
  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  // Handle items per page change
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    const totalPages = Math.ceil(filteredTransactions.length / newItemsPerPage);
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
      totalPages: totalPages || 1,
    }));
  };

  // Handle date filter
  const handleDateFilter = () => {
    filterTransactions();
  };

  // Handle tampilkan semua
  const handleShowAll = () => {
    setSelectedDate('');
    setSelectedType('');
    setSelectedStatus('');
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  // Format status for display
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      pending: { text: 'Pending', color: 'text-yellow-600 bg-yellow-50' },
      assigned: { text: 'Ditugaskan', color: 'text-blue-600 bg-blue-50' },
      collecting: {
        text: 'Pengambilan',
        color: 'text-purple-600 bg-purple-50',
      },
      completed: { text: 'Selesai', color: 'text-green-600 bg-green-50' },
      cancelled: { text: 'Dibatalkan', color: 'text-red-600 bg-red-50' },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        text: status,
        color: 'text-gray-600 bg-gray-50',
      }
    );
  };

  // Format time display (remove timezone and show only HH:MM)
  const formatTime = (timeString: string) => {
    return timeString.replace(/\+\d{2}:\d{2}$/, '').substring(0, 5);
  };

  // Format delivery type for display with chip
  const getDeliveryTypeChip = (deliveryType: string) => {
    if (deliveryType === 'pickup') {
      return (
        <span className='inline-flex rounded-full bg-green-100 px-2 py-1 text-xs text-green-800'>
          Pickup
        </span>
      );
    } else {
      return (
        <span className='inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
          Drop-off
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='flex items-center gap-2'>
          <Loader2 className='animate-spin' size={24} />
          <span>Memuat transaksi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
            <CreditCard className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Transaksi Masuk
            </h1>
            <p className='mt-1 text-gray-600'>
              Catat dan pantau transaksi sampah masuk
            </p>
          </div>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button className='hidden rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'>
            <Plus size={20} className='mr-2 inline' />
            Transaksi Baru
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4'>
          <AlertCircle className='text-red-600' size={20} />
          <span className='text-red-700'>{error}</span>
          <button
            onClick={() => fetchAllTransactions()}
            className='ml-auto text-red-600 underline hover:text-red-800'
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Stats Card */}
      <div className='my-6 grid grid-cols-1 gap-6 text-left md:grid-cols-4'>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <CreditCard className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Transaksi Sukses
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {todayStats.totalTransactions}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <TrendingUp className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Transaksi Masuk
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {filteredTransactions.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <CreditCard className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Pendapatan
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  Rp {todayStats.totalRevenue.toLocaleString('id-ID')}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <TrendingUp className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Rata-rata/Transaksi
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  Rp{' '}
                  {Math.round(todayStats.avgTransaction).toLocaleString(
                    'id-ID'
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-4'>
        <div className='mb-4 flex flex-col items-center gap-4 sm:flex-row'>
          <div className='flex items-center gap-2'>
            <Calendar className='text-gray-400' size={20} />
            <span className='text-sm font-medium text-gray-700'>
              Filter Tanggal:
            </span>
          </div>
          <div className='flex gap-4'>
            <input
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            />
            {/* Filter Tipe */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            >
              <option value=''>Semua Tipe</option>
              <option value='pickup'>Pickup</option>
              <option value='dropoff'>Drop-off</option>
            </select>
            {/* Filter Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            >
              <option value=''>Semua Status</option>
              <option value='pending'>Pending</option>
              <option value='assigned'>Ditugaskan</option>
              <option value='collecting'>Pengambilan</option>
              <option value='completed'>Selesai</option>
              <option value='cancelled'>Dibatalkan</option>
            </select>
            <button
              onClick={handleDateFilter}
              disabled={loading}
              className='rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-700 disabled:opacity-50'
            >
              {loading ? 'Loading...' : 'Filter'}
            </button>
            <button
              onClick={handleShowAll}
              disabled={loading}
              className='rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50'
            >
              Tampilkan Semua
            </button>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-700'>Tampilkan</span>
          <select
            value={pagination.itemsPerPage}
            onChange={handleItemsPerPageChange}
            className='rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className='text-sm text-gray-700'>data per halaman</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Tipe
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Customer ID
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Tanggal Janji
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Waktu
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Total Harga
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Kolektor
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    {filteredTransactions.length === 0
                      ? 'Tidak ada transaksi ditemukan'
                      : 'Tidak ada data di halaman ini'}
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((transaction) => {
                  const status = getStatusDisplay(transaction.status);
                  return (
                    <tr key={transaction.id} className='hover:bg-gray-50'>
                      <td className='whitespace-nowrap px-6 py-4'>
                        {getDeliveryTypeChip(transaction.delivery_type)}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          {transaction.customer_id.substring(0, 7)}...
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          {new Date(
                            transaction.appointment_date
                          ).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          {formatTime(transaction.appointment_start_time)} -{' '}
                          {formatTime(transaction.appointment_end_time)}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm font-bold text-emerald-600'>
                          Rp {transaction.total_price.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2 text-xs ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm text-gray-500'>
                          {transaction.assigned_collector_id
                            ? `${transaction.assigned_collector_id.substring(0, 7)}...`
                            : '-'}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <button
                          className='rounded-md p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                          title='Lihat Detail'
                          onClick={() => handleViewDetail(transaction.id)}
                        >
                          <Eye className='h-4 w-4' />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className='border-t border-gray-200 bg-gray-50 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-700'>
                Menampilkan{' '}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} -{' '}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{' '}
                dari {pagination.totalItems} hasil
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className='rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Sebelumnya
                </button>
                <span className='text-sm text-gray-700'>
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className='rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

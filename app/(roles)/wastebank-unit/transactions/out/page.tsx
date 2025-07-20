'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CircleDollarSign,
  Loader2,
  AlertCircle,
  Calendar,
  Plus,
  TrendingUp,
  Eye,
} from 'lucide-react';
import {
  wasteTransferRequestAPI,
  currentUserAPI,
} from '@/services/api/user';
import { encodeId } from '@/lib/id-utils';
import type {
  WasteTransferRequest,
  GetWasteTransferRequestsResponse,
} from '@/types';

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

export default function TransactionsOutPage() {
  const router = useRouter();
  const [allTransactions, setAllTransactions] = useState<
    WasteTransferRequest[]
  >([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    WasteTransferRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [pagination, setPagination] = useState<ClientPagination>({
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 1,
  });

  const displayedTransactions = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, pagination.currentPage, pagination.itemsPerPage]);

  const handleViewDetail = (transactionId: string) => {
    const encoded = encodeId(transactionId);
    // TODO: Implement navigation to detail page if needed
    router.push(`/wastebank-unit/transactions/out/${encoded}`);
  };

  const todayStats: TransactionStats = useMemo(() => {
    const completedTransactions = filteredTransactions.filter(
      (t) => t.status === 'completed'
    );
    const totalTransactions = completedTransactions.length;
    const totalRevenue = completedTransactions.reduce(
      (sum, t) => sum + (t.total_price || 0),
      0
    );
    return {
      totalTransactions,
      totalWeight: 0, // Not available
      totalRevenue,
      avgTransaction:
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
    };
  }, [filteredTransactions]);

  const filterTransactions = useCallback(() => {
    let filtered = allTransactions;
    if (selectedDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.appointment_date)
          .toISOString()
          .split('T')[0];
        return transactionDate === selectedDate;
      });
    }
    if (selectedType) {
      filtered = filtered.filter(
        (transaction) => transaction.form_type === selectedType
      );
    }
    if (selectedStatus) {
      filtered = filtered.filter(
        (transaction) => transaction.status === selectedStatus
      );
    }
    setFilteredTransactions(filtered);
    const totalPages = Math.ceil(filtered.length / pagination.itemsPerPage);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
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

  const fetchAllTransactions = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: 1,
        size: 100,
        source_user_id: userId,
      };
      const response: GetWasteTransferRequestsResponse =
        await wasteTransferRequestAPI.getWasteTransferRequests(params);
      setAllTransactions(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch transactions'
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const id = await currentUserAPI.getUserId();
        setUserId(id);
        setSelectedDate('');
      } catch {
        setError('Gagal mendapatkan data user.');
      }
    };
    getCurrentUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAllTransactions();
    }
  }, [userId, fetchAllTransactions]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

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

  const handleDateFilter = () => {
    filterTransactions();
  };

  const handleShowAll = () => {
    setSelectedDate('');
    setSelectedType('');
    setSelectedStatus('');
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

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

  const formatTime = (timeString: string) => {
    return timeString.replace(/\+\d{2}:\d{2}$/, '').substring(0, 5);
  };

  const getFormTypeChip = (formType: string) => {
    if (formType === 'industry_request') {
      return (
        <span className='inline-flex rounded-full bg-green-100 px-2 py-1 text-xs text-green-800'>
          Industri
        </span>
      );
    } else {
      return (
        <span className='inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
          Bank Sampah
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
            <CircleDollarSign className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Transaksi Keluar
            </h1>
            <p className='mt-1 text-gray-600'>
              Catat dan pantau transaksi keluar dari Bank Sampah
            </p>
          </div>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button
            className='rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-700'
            onClick={() => router.push('/wastebank-unit/transactions/out/add')}
          >
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
                <CircleDollarSign className='h-5 w-5' />
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
                  Total Transaksi Keluar
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
                <CircleDollarSign className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Nilai Transaksi
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
              <option value='industry_request'>Industri</option>
              <option value='waste_bank_request'>Bank Sampah</option>
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
                  Tipe Tujuan
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Telp. Tujuan
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Tanggal Janji
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Waktu
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Total Berat
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Total Harga
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
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    Tidak ada transaksi keluar.
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((transaction) => {
                  const status = getStatusDisplay(transaction.status);
                  return (
                    <tr key={transaction.id} className='hover:bg-gray-50'>
                      <td className='whitespace-nowrap px-6 py-4'>
                        {getFormTypeChip(transaction.form_type)}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          <a
                              href={`https://wa.me/${transaction.destination_phone_number?.replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline"
                            >
                              {transaction.destination_phone_number}
                            </a>
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
                          {formatTime(
                            transaction.appointment_start_time || '00:00'
                          )}{' '}
                          -{' '}
                          {formatTime(
                            transaction.appointment_end_time || '00:00'
                          )}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          {transaction.total_weight || 0} kg
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm font-bold text-emerald-600'>
                          Rp {transaction.total_price?.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <span
                          className={`rounded px-2 py-1 text-xs ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <button
                          onClick={() => handleViewDetail(transaction.id)}
                          title='Lihat Detail'
                          className='rounded-md p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-800'
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
                <span className='text-sm text-gray-700'>/</span>
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

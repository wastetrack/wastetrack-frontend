'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  NotebookTabs,
  ChevronDown,
  ChevronUp,
  Scale,
} from 'lucide-react';
import {
  customerProfileAPI,
  type CustomerProfile,
} from '@/services/api/customer';
import { wasteDropRequestAPI } from '@/services/api/user';
import { wasteDropRequestItemAPI } from '@/services/api/user';
import { wasteTypeAPI } from '@/services/api/user';
import { userListAPI } from '@/services/api/user';
import { currentUserAPI } from '@/services/api/user';
import {
  WasteDropRequest,
  WasteDropRequestListParams,
  WasteDropRequestItem,
  WasteType,
  UserListItem,
} from '@/types';

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
  const [, setTotalCount] = useState(0);
  const [pageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);

  // States for items
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(
    new Set()
  );
  const [requestItems, setRequestItems] = useState<
    Record<string, WasteDropRequestItem[]>
  >({});
  const [wasteTypes, setWasteTypes] = useState<Record<string, WasteType>>({});
  const [wasteBanks, setWasteBanks] = useState<Record<string, UserListItem>>(
    {}
  );
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<{
    status:
      | 'pending'
      | 'assigned'
      | 'collecting'
      | 'completed'
      | 'cancelled'
      | 'all';
    delivery_type: WasteDropRequest['delivery_type'] | 'all';
    appointment_date_from?: string;
    appointment_date_to?: string;
  }>({
    status: 'all',
    delivery_type: 'all',
    appointment_date_from: '',
    appointment_date_to: '',
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const [showFilters, setShowFilters] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    assigned: 0,
    collecting: 0,
    cancelled: 0,
  });

  // Function to filter requests based on search query (only bank name)
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) {
      return requests;
    }

    const query = searchQuery.toLowerCase().trim();

    return requests.filter((request) => {
      // Search only by waste bank institution name
      const wasteBankName =
        wasteBanks[request.waste_bank_id]?.institution?.toLowerCase() || '';
      return wasteBankName.includes(query);
    });
  }, [requests, searchQuery, wasteBanks]);

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

  const fetchCustomerProfile = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const response = await customerProfileAPI.getProfile(currentUserId);
      if (response.data) {
        setCustomerProfile(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer profile:', error);
      // Don't set error state here, as this is not critical for the page functionality
    }
  }, [currentUserId]);

  // Function to fetch waste bank information
  const fetchWasteBankInfo = useCallback(
    async (wasteBankIds: string[]) => {
      const newWasteBankIds = wasteBankIds.filter(
        (id) => id && !wasteBanks[id]
      );

      if (newWasteBankIds.length === 0) {
        return;
      }

      try {
        // Fetch user list to find waste banks
        const response = await userListAPI.getFlatUserList({
          page: 1,
          size: 100, // Get enough results to find our waste banks
        });

        // Response structure: { data: [UserListItem...] }
        const users = response.data || [];

        // console.log('Fetched waste banks:', users);
        const foundWasteBanks: Record<string, UserListItem> = {};

        // Find waste banks by ID
        users.forEach((user: UserListItem) => {
          if (newWasteBankIds.includes(user.id)) {
            // console.log(
            //   'Found matching waste bank:',
            //   user.id,
            //   user.institution
            // );
            foundWasteBanks[user.id] = user;
          }
        });

        // console.log('Found waste banks:', foundWasteBanks);

        // Create fallback entries for missing ones
        newWasteBankIds.forEach((id) => {
          if (!foundWasteBanks[id]) {
            foundWasteBanks[id] = {
              id,
              username: '',
              email: '',
              role: '',
              phone_number: '',
              institution: 'Bank Sampah',
              address: '',
              city: '',
              province: '',
              points: 0,
              balance: 0,
              location: { latitude: 0, longitude: 0 },
              is_email_verified: false,
              created_at: '',
              updated_at: '',
            };
          }
        });

        setWasteBanks((prev) => ({
          ...prev,
          ...foundWasteBanks,
        }));
      } catch (error) {
        console.error('Failed to fetch waste bank info:', error);

        // Create fallback entries for failed fetches
        const fallbackWasteBanks: Record<string, UserListItem> = {};
        newWasteBankIds.forEach((id) => {
          fallbackWasteBanks[id] = {
            id,
            username: '',
            email: '',
            role: '',
            phone_number: '',
            institution: 'Bank Sampah',
            address: '',
            city: '',
            province: '',
            points: 0,
            balance: 0,
            location: { latitude: 0, longitude: 0 },
            is_email_verified: false,
            created_at: '',
            updated_at: '',
          };
        });

        setWasteBanks((prev) => ({
          ...prev,
          ...fallbackWasteBanks,
        }));
      }
    },
    [wasteBanks]
  );

  // Function to fetch items for a specific request
  const fetchRequestItems = useCallback(
    async (requestId: string) => {
      if (requestItems[requestId] || loadingItems.has(requestId)) {
        return; // Already loaded or loading
      }

      setLoadingItems((prev) => new Set(prev).add(requestId));

      try {
        const response = await wasteDropRequestItemAPI.getWasteDropRequestItems(
          {
            request_id: requestId,
            page: 1,
            size: 100, // Get all items for the request
          }
        );

        setRequestItems((prev) => ({
          ...prev,
          [requestId]: response.data,
        }));

        // Fetch waste types for items that don't have cached data
        const uniqueWasteTypeIds = [
          ...new Set(response.data.map((item) => item.waste_type_id)),
        ];
        const newWasteTypeIds = uniqueWasteTypeIds.filter(
          (id) => !wasteTypes[id]
        );

        if (newWasteTypeIds.length > 0) {
          // Fetch waste types concurrently
          const wasteTypePromises = newWasteTypeIds.map(async (wasteTypeId) => {
            try {
              const wasteTypeResponse =
                await wasteTypeAPI.getWasteTypeById(wasteTypeId);
              return { id: wasteTypeId, data: wasteTypeResponse.data };
            } catch (error) {
              console.error(
                `Failed to fetch waste type ${wasteTypeId}:`,
                error
              );
              return {
                id: wasteTypeId,
                data: {
                  id: wasteTypeId,
                  category_id: '',
                  name: 'Unknown Type',
                  description: '',
                },
              };
            }
          });

          const wasteTypeResults = await Promise.all(wasteTypePromises);

          const newWasteTypesData = wasteTypeResults.reduce(
            (acc, result) => {
              acc[result.id] = result.data;
              return acc;
            },
            {} as Record<string, WasteType>
          );

          setWasteTypes((prev) => ({
            ...prev,
            ...newWasteTypesData,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch request items:', error);
      } finally {
        setLoadingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    [requestItems, loadingItems, wasteTypes]
  );

  // Toggle expanded request
  const toggleRequestExpansion = useCallback(
    (requestId: string) => {
      const newExpanded = new Set(expandedRequests);

      if (newExpanded.has(requestId)) {
        newExpanded.delete(requestId);
      } else {
        newExpanded.add(requestId);
        // Fetch items when expanding
        fetchRequestItems(requestId);
      }

      setExpandedRequests(newExpanded);
    },
    [expandedRequests, fetchRequestItems]
  );

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

        if (filters.appointment_date_from)
          params.date_from = filters.appointment_date_from;
        if (filters.appointment_date_to)
          params.date_to = filters.appointment_date_to;

        const response = await wasteDropRequestAPI.getCustomerWasteDropRequests(
          currentUserId,
          params
        );

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

        // Fetch waste bank information for the requests
        const uniqueWasteBankIds = [
          ...new Set(
            requestsData
              .map((r: WasteDropRequest) => r.waste_bank_id)
              .filter((id) => id)
          ),
        ];

        if (uniqueWasteBankIds.length > 0) {
          fetchWasteBankInfo(uniqueWasteBankIds);
        }

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
        // console.error('❌ Failed to fetch requests:', error);
        setError(
          error instanceof Error ? error.message : 'Gagal memuat riwayat'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUserId, filters, pageSize, searchQuery, fetchWasteBankInfo]
  );

  useEffect(() => {
    if (currentUserId) {
      fetchRequests(1);
      fetchCustomerProfile(); // Fetch balance info
    }
  }, [currentUserId, filters, fetchRequests, fetchCustomerProfile]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentUserId) {
        fetchRequests(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchRequests, currentUserId]);

  const handlePageChange = (page: number) => {
    fetchRequests(page);
  };

  const handleOpenFilters = () => {
    setTempFilters(filters); // Set temp filters to current filters
    setShowFilters(true);
  };

  const handleSaveFilters = () => {
    setFilters(tempFilters); // Apply temp filters to actual filters
    setCurrentPage(1); // Reset to first page
    setShowFilters(false);
  };

  const handleTempFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Component for rendering items
  const renderRequestItems = (requestId: string) => {
    const items = requestItems[requestId] || [];
    const isLoading = loadingItems.has(requestId);

    if (isLoading) {
      return (
        <div className='flex items-center justify-center py-4'>
          <Loader2 className='h-4 w-4 animate-spin text-emerald-500' />
          <span className='ml-2 text-xs text-gray-500'>Memuat items...</span>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className='py-4 text-center'>
          <Package className='mx-auto mb-2 h-6 w-6 text-gray-400' />
          <p className='text-xs text-gray-500'>Belum ada detail sampah</p>
        </div>
      );
    }

    return (
      <div className='space-y-2'>
        {items.map((item) => {
          const wasteType = wasteTypes[item.waste_type_id];
          const wasteTypeName = wasteType?.name || 'Loading...';
          const wasteTypeDescription = wasteType?.description || '';

          return (
            <div
              key={item.id}
              className='rounded-lg border border-gray-100 bg-gray-50 p-3'
            >
              <div className='flex items-start justify-between'>
                <div className='flex flex-1 items-start gap-2'>
                  <Package className='mt-0.5 h-4 w-4 text-gray-400' />
                  <div className='flex-1'>
                    <p className='text-xs font-medium text-gray-800'>
                      {wasteTypeName}
                    </p>
                    {wasteTypeDescription && (
                      <p className='mt-0.5 text-xs text-gray-500'>
                        {wasteTypeDescription}
                      </p>
                    )}
                    <div className='mt-1 flex items-center gap-3 text-xs text-gray-500'>
                      <span className='flex items-center gap-1 text-[9px]'>
                        Qty: {item.quantity} kantong
                      </span>
                      {item.verified_weight > 0 && (
                        <span className='flex items-center gap-1 text-[9px]'>
                          <Scale className='h-3 w-3' />
                          {item.verified_weight}kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {item.verified_subtotal > 0 && (
                  <div className='ml-2 text-right'>
                    <p className='text-xs font-semibold text-emerald-600'>
                      Rp {item.verified_subtotal.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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

  // Determine which requests to display
  const requestsToDisplay = searchQuery.trim() ? filteredRequests : requests;

  return (
    <div className='space-y-6'>
      {/* Header & Summary Cards */}
      <div>
        <div className='rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 p-4 text-center text-white'>
          <h1 className='mb-2 text-lg font-bold sm:text-2xl'>
            Tabungan dan Riwayat Penyetoran
          </h1>
          <p className='sm:text-md text-sm text-emerald-50'>
            Lihat riwayat penyetoran sampah dan status permintaan Anda.
          </p>
        </div>
      </div>
      <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-4'>
          <h3 className='mb-1 text-xs font-medium text-gray-600 sm:text-sm'>
            Balance
          </h3>
          <p className='text-xl font-bold text-emerald-600 sm:text-2xl'>
            Rp {customerProfile?.user?.balance?.toLocaleString() || 0}
          </p>
        </div>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-4'>
          <h3 className='mb-1 text-xs font-medium text-gray-600 sm:text-sm'>
            Total Setor
          </h3>
          <p className='text-xl font-bold text-blue-600 sm:text-2xl'>
            {summaryStats.total}
          </p>
        </div>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-4'>
          <h3 className='mb-1 text-xs font-medium text-gray-600 sm:text-sm'>
            Selesai
          </h3>
          <p className='text-xl font-bold text-green-600 sm:text-2xl'>
            {summaryStats.completed}
          </p>
        </div>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-4'>
          <h3 className='mb-1 text-xs font-medium text-gray-600 sm:text-sm'>
            Batal
          </h3>
          <p className='text-xl font-bold text-red-600 sm:text-2xl'>
            {summaryStats.cancelled}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className='rounded-lg sm:bg-white sm:p-4 sm:shadow-sm'>
        <div className='mb-2 rounded-xl sm:mb-8 sm:bg-white sm:p-3 sm:p-4 sm:shadow-lg'>
          <div className='flex items-center gap-2'>
            {/* Search Input */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:h-5 sm:w-5' />
              <input
                type='text'
                placeholder='Cari berdasarkan nama bank sampah...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full rounded-lg border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm transition-all placeholder:text-xs focus:border-transparent focus:ring-2 focus:ring-emerald-500 sm:py-2.5 sm:pl-10 sm:text-base'
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={handleOpenFilters}
              className='flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 transition-colors hover:bg-emerald-100 sm:p-2.5'
              aria-label='Open filters'
            >
              <Filter className='h-4 w-4 sm:h-5 sm:w-5' />
              <span className='hidden text-sm sm:inline'>Filter</span>
            </button>
          </div>
        </div>

        {/* Bottom Filter Modal */}
        {showFilters && (
          <div
            className='animate-fadeIn fixed inset-0 z-50 flex items-end justify-center bg-black/60'
            style={{ animationDuration: '0.2s' }}
          >
            <div
              className={`max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white ${showFilters ? 'animate-slideUp' : 'animate-slideDown'}`}
              style={{ animationDuration: '0.3s' }}
            >
              <div className='p-6'>
                {/* Modal Header with Title */}
                <div className='mb-6 flex items-center justify-between'>
                  <h2 className='text-xl font-bold'>Filter</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className='p-2 text-gray-500'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </div>

                {/* Filter Status */}
                <div className='mb-4'>
                  <h3 className='mb-2 text-left text-sm font-medium sm:text-lg'>
                    Status
                  </h3>
                  <select
                    value={tempFilters.status}
                    onChange={(e) =>
                      handleTempFilterChange('status', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 sm:text-base'
                  >
                    <option value='all'>Semua Status</option>
                    <option value='pending'>Menunggu</option>
                    <option value='assigned'>Dikonfirmasi</option>
                    <option value='collecting'>Dalam Proses</option>
                    <option value='completed'>Selesai</option>
                    <option value='cancelled'>Dibatalkan</option>
                  </select>
                </div>

                {/* Filter Jenis Layanan */}
                <div className='mb-4'>
                  <h3 className='mb-2 text-left text-sm font-medium sm:text-lg'>
                    Jenis Layanan
                  </h3>
                  <select
                    value={tempFilters.delivery_type}
                    onChange={(e) =>
                      handleTempFilterChange('delivery_type', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 sm:text-base'
                  >
                    <option value='all'>Semua Jenis</option>
                    <option value='pickup'>Penjemputan</option>
                    <option value='dropoff'>Antar Mandiri</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t border-gray-100 pt-4'>
                  <button
                    onClick={handleSaveFilters}
                    className='w-full rounded-lg bg-emerald-600 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700'
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setTempFilters({
                        status: 'all',
                        delivery_type: 'all',
                      });
                    }}
                    className='hidden w-full rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request List & Pagination */}
      <div className='shadow-xs rounded-lg border border-gray-200 bg-white'>
        {requestsToDisplay.length === 0 ? (
          <div className='px-4 py-8 text-center sm:py-12'>
            <Package className='mx-auto mb-4 h-10 w-10 text-gray-400 sm:h-12 sm:w-12' />
            <h3 className='mb-2 text-base font-semibold text-gray-800 sm:text-lg'>
              {searchQuery.trim() ? 'Tidak Ada Hasil' : 'Belum Ada Riwayat'}
            </h3>
            <p className='text-sm text-gray-600 sm:text-base'>
              {searchQuery.trim()
                ? `Tidak ditemukan bank sampah yang sesuai dengan pencarian "${searchQuery}"`
                : 'Anda belum melakukan penyetoran sampah.'}
            </p>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery('')}
                className='mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600'
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className='divide-y divide-gray-200'>
            {requestsToDisplay.map((request) => {
              const statusInfo = getStatusInfo(request.status);
              const deliveryInfo = getDeliveryTypeInfo(request.delivery_type);
              const StatusIcon = statusInfo.icon;
              const DeliveryIcon = deliveryInfo.icon;
              const isExpanded = expandedRequests.has(request.id);

              return (
                <div
                  key={request.id}
                  className='transition-colors hover:bg-gray-50'
                >
                  <div className='p-3 sm:p-6'>
                    {/* Mobile Layout - Stack */}
                    <div className='flex flex-col gap-3 sm:hidden'>
                      {/* Header */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${statusInfo.bgColor}`}
                          >
                            <StatusIcon
                              className={`h-4 w-4 ${statusInfo.color.split(' ')[1]}`}
                            />
                          </div>
                          <div className='flex items-center gap-2'>
                            <DeliveryIcon
                              className={`h-4 w-4 ${deliveryInfo.color}`}
                            />
                            <h3 className='text-sm font-semibold text-gray-800'>
                              {deliveryInfo.label}
                            </h3>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[8px] font-medium sm:text-xs ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className='space-y-2 text-xs text-gray-600'>
                        {request.waste_bank_id && (
                          <div className='flex items-center gap-2'>
                            <Package className='h-3 w-3' />
                            <span>
                              {wasteBanks[request.waste_bank_id]?.institution ||
                                'Memuat bank sampah...'}
                            </span>
                          </div>
                        )}
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-3 w-3' />
                          <span>
                            {formatDate(request.appointment_date)} •{' '}
                            {formatTime(request.appointment_start_time)}-
                            {formatTime(request.appointment_end_time)}
                          </span>
                        </div>
                        {request.notes && (
                          <div className='flex items-start gap-2'>
                            <NotebookTabs className='mt-0.5 h-3 w-3' />
                            <span className='line-clamp-2'>
                              {request.notes}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className='flex items-center justify-between pt-2'>
                        <div className='text-[9px] text-gray-400'>
                          {getRelativeTime(request.created_at)}
                        </div>
                        <div className='flex items-center gap-2'>
                          {request.total_price > 0 && (
                            <div className='text-sm font-semibold text-emerald-600'>
                              Rp {request.total_price.toLocaleString()}
                            </div>
                          )}
                          <button
                            onClick={() => toggleRequestExpansion(request.id)}
                            className='flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100'
                          >
                            <Package className='h-3 w-3' />
                            {isExpanded ? (
                              <ChevronUp className='h-3 w-3' />
                            ) : (
                              <ChevronDown className='h-3 w-3' />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Items Section - Mobile */}
                      {isExpanded && (
                        <div className='mt-3 border-t border-gray-100 pt-3'>
                          <h4 className='mb-2 text-xs font-medium text-gray-700'>
                            Detail Sampah:
                          </h4>
                          {renderRequestItems(request.id)}
                        </div>
                      )}
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className='hidden items-start justify-between sm:flex'>
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
                            {request.waste_bank_id && (
                              <div className='flex items-center gap-2'>
                                <Package className='h-4 w-4' />
                                <span className='font-medium text-gray-700'>
                                  {wasteBanks[request.waste_bank_id]
                                    ?.institution || 'Memuat bank sampah...'}
                                </span>
                              </div>
                            )}
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4' />
                              <span>
                                {formatDate(request.appointment_date)} •{' '}
                                {formatTime(request.appointment_start_time)}-
                                {formatTime(request.appointment_end_time)}
                              </span>
                            </div>
                            {request.notes && (
                              <div className='flex items-start gap-2'>
                                <NotebookTabs className='mt-0.5 h-4 w-4' />
                                <span>{request.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='ml-4 text-right'>
                        <div className='flex items-center gap-2'>
                          <div>
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
                          <button
                            onClick={() => toggleRequestExpansion(request.id)}
                            className='flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50'
                          >
                            <Package className='h-4 w-4' />
                            Items
                            {isExpanded ? (
                              <ChevronUp className='h-4 w-4' />
                            ) : (
                              <ChevronDown className='h-4 w-4' />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Items Section - Desktop */}
                  {isExpanded && (
                    <div className='hidden border-t border-gray-100 bg-gray-50 px-6 py-4 sm:block'>
                      <h4 className='mb-3 text-sm font-medium text-gray-700'>
                        Detail Sampah:
                      </h4>
                      {renderRequestItems(request.id)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination - Only show if not searching */}
        {totalPages > 1 && !searchQuery.trim() && (
          <div className='border-t border-gray-200 bg-gray-50 px-3 py-3 sm:px-6 sm:py-4'>
            {/* Mobile Pagination */}
            <div className='flex items-center justify-between sm:hidden'>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='rounded-lg border border-gray-200 px-3 py-2 text-xs hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'
              >
                ← Prev
              </button>

              <div className='flex items-center gap-1'>
                <span className='text-xs text-gray-600'>
                  {currentPage} / {totalPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='rounded-lg border border-gray-200 px-3 py-2 text-xs hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'
              >
                Next →
              </button>
            </div>

            {/* Desktop Pagination */}
            <div className='hidden items-center justify-between sm:flex'>
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
          </div>
        )}
      </div>
    </div>
  );
}

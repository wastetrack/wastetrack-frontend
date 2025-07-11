'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  Plus,
  Search,
  Loader,
  Eye,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react';
import {
  getCollectorManagements,
  updateCollectorManagement,
  deleteCollectorManagement,
} from '@/services/api/wastebank';
import { collectorProfileAPI } from '@/services/api/collector';
import { getTokenManager } from '@/lib/token-manager';
import { encodeId } from '@/lib/id-utils';
import {
  CollectorManagement,
  CollectorManagementParams,
  UpdateCollectorManagementRequest,
  CollectorStatus,
} from '@/types';
import { Alert } from '@/components/ui/Alert';
import { showToast } from '@/components/ui/Toast';

interface CollectorWithUserInfo extends CollectorManagement {
  username?: string;
  phone_number?: string;
}

export default function CollectorsPage() {
  const router = useRouter();
  const [collectors, setCollectors] = useState<CollectorWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [wasteBankId, setWasteBankId] = useState<string | null>(null);

  // Get waste bank ID from authenticated user
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const tokenManager = getTokenManager();

        // Check if user is authenticated
        if (!tokenManager.isAuthenticated()) {
          setError('Anda belum login. Silakan login terlebih dahulu.');
          return;
        }

        // Get user data from token manager
        const userData = tokenManager.getCurrentUser();
        if (!userData) {
          setError('Data pengguna tidak ditemukan. Silakan login kembali.');
          return;
        }

        // For waste bank users, the user ID should be the waste bank ID
        if (userData.role === 'waste_bank_unit') {
          setWasteBankId(userData.id);
        } else {
          setError('Akses ditolak. Anda bukan pengguna bank sampah.');
          return;
        }
      } catch (err) {
        console.error('Failed to get user profile:', err);
        setError('Gagal mendapatkan profil pengguna. Silakan coba lagi.');
      }
    };

    getUserProfile();
  }, []);

  // Fetch collectors when wasteBankId is available
  useEffect(() => {
    if (!wasteBankId) return;

    const fetchCollectors = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: CollectorManagementParams = {
          waste_bank_id: wasteBankId,
        };

        const response = await getCollectorManagements(params);

        // Handle the actual API response structure
        let collectorsData: CollectorManagement[] = [];
        if (Array.isArray(response.data)) {
          // If data is directly an array
          collectorsData = response.data;
        } else if (response.data && 'collector_managements' in response.data) {
          // If data has collector_managements property
          collectorsData = response.data.collector_managements;
        }

        // Fetch user details for each collector
        const collectorsWithUserInfo: CollectorWithUserInfo[] =
          await Promise.all(
            collectorsData.map(async (collector) => {
              try {
                const profileResponse = await collectorProfileAPI.getProfile(
                  collector.collector_id
                );
                const userInfo = profileResponse.data.user;
                return {
                  ...collector,
                  username: userInfo.username,
                  phone_number: userInfo.phone_number,
                };
              } catch (error) {
                console.error(
                  `Failed to fetch profile for collector ${collector.collector_id}:`,
                  error
                );
                return {
                  ...collector,
                  username: 'Tidak tersedia',
                  phone_number: 'Tidak tersedia',
                };
              }
            })
          );

        // Set collectors data
        setCollectors(collectorsWithUserInfo);
      } catch (err) {
        console.error('Failed to fetch collectors:', err);
        setError('Gagal memuat data kolektor. Silakan coba lagi.');
        setCollectors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectors();
  }, [wasteBankId]);

  // Refresh data when page becomes visible (when returning from add page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && wasteBankId) {
        // Refresh data when page becomes visible again
        const fetchCollectors = async () => {
          try {
            const params: CollectorManagementParams = {
              waste_bank_id: wasteBankId,
            };

            const response = await getCollectorManagements(params);

            // Handle the actual API response structure
            let collectorsData: CollectorManagement[] = [];
            if (Array.isArray(response.data)) {
              collectorsData = response.data;
            } else if (
              response.data &&
              'collector_managements' in response.data
            ) {
              collectorsData = response.data.collector_managements;
            }

            // Fetch user details for each collector
            const collectorsWithUserInfo: CollectorWithUserInfo[] =
              await Promise.all(
                collectorsData.map(async (collector) => {
                  try {
                    const profileResponse =
                      await collectorProfileAPI.getProfile(
                        collector.collector_id
                      );
                    const userInfo = profileResponse.data.user;
                    return {
                      ...collector,
                      username: userInfo.username,
                      phone_number: userInfo.phone_number,
                    };
                  } catch (error) {
                    console.error(
                      `Failed to fetch profile for collector ${collector.collector_id}:`,
                      error
                    );
                    return {
                      ...collector,
                      username: 'Tidak tersedia',
                      phone_number: 'Tidak tersedia',
                    };
                  }
                })
              );

            setCollectors(collectorsWithUserInfo);
          } catch (err) {
            console.error('Failed to refresh collectors:', err);
          }
        };

        fetchCollectors();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wasteBankId]);

  // Update collector status
  const handleUpdateStatus = async (id: string, newStatus: CollectorStatus) => {
    try {
      setError(null);
      const data: UpdateCollectorManagementRequest = {
        status: newStatus,
      };

      await updateCollectorManagement(id, data);

      // Update local state to reflect the change immediately
      setCollectors(
        (collectors || []).map((collector) =>
          collector.id === id ? { ...collector, status: newStatus } : collector
        )
      );
    } catch (err) {
      console.error('Failed to update collector status:', err);
      setError('Gagal mengubah status kolektor. Silakan coba lagi.');
    }
  };

  // Navigate to collector detail
  const handleViewDetail = (collectorId: string) => {
    const encodedId = encodeId(collectorId);
    router.push(`/wastebank-unit/collectors/${encodedId}`);
  };
  const handleDeleteCollector = async (id: string) => {
    const alert = await Alert.confirm({
      title: 'Konfirmasi Hapus Kolektor',
      text: 'Apakah Anda yakin ingin menghapus kolektor ini? Tindakan ini tidak dapat dibatalkan.',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });
    if (!alert.isConfirmed) return;
    try {
      setError(null);
      await deleteCollectorManagement(id);
      setCollectors(
        (collectors || []).filter((collector) => collector.id !== id)
      );
      showToast.success('Kolektor berhasil dihapus!');
    } catch (err) {
      console.error('Failed to delete collector:', err);
      setError('Gagal menghapus kolektor. Silakan coba lagi.');
      showToast.error('Gagal menghapus kolektor. Silakan coba lagi.');
    }
  };

  // Filter collectors by search query and status
  const filteredCollectors = (collectors || []).filter((collector) => {
    const matchesSearch =
      collector.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collector.phone_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      collector.collector_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || collector.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
            <UserCheck className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Manajemen Kolektor
            </h1>
            <p className='mt-1 text-gray-600'>
              Kelola kolektor yang terdaftar di bank sampah Anda.
            </p>
          </div>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button
            className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'
            onClick={() => router.push('/wastebank-unit/collectors/add')}
          >
            <Plus size={20} />
            Tambah Kolektor
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-emerald-600'>
              {(collectors || []).filter((c) => c.status === 'active').length}
            </div>
            <div className='text-sm text-gray-600'>Kolektor Aktif</div>
          </div>
        </div>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-600'>
              {(collectors || []).filter((c) => c.status === 'inactive').length}
            </div>
            <div className='text-sm text-gray-600'>Kolektor Tidak Aktif</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-4'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='relative flex-1'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400'
              size={20}
            />
            <input
              type='text'
              placeholder='Cari nama atau nomor telepon...'
              className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
            }
            className='flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50'
          >
            <option value='all'>Semua Status</option>
            <option value='active'>Aktif</option>
            <option value='inactive'>Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Show error message if any */}
      {error && (
        <div className='rounded-lg bg-red-50 p-4 text-red-700'>
          <p>{error}</p>
        </div>
      )}

      {/* Collectors Table */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='hidden border-b border-gray-200 px-6 py-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Daftar Kolektor
          </h3>
          <p className='text-sm text-gray-500'>
            {filteredCollectors.length} dari {(collectors || []).length}{' '}
            kolektor
            {statusFilter !== 'all' &&
              ` (${statusFilter === 'active' ? 'aktif' : 'tidak aktif'})`}
            {searchQuery && ` yang sesuai dengan "${searchQuery}"`}
          </p>
        </div>
        <div className='overflow-x-auto'>
          {loading ? (
            <div className='flex justify-center p-10'>
              <Loader className='animate-spin text-emerald-600' size={32} />
            </div>
          ) : filteredCollectors.length === 0 ? (
            <div className='p-10 text-center text-gray-500'>
              {searchQuery ? (
                <div>
                  <p className='mb-2'>
                    Tidak ada kolektor yang sesuai dengan pencarian &quot;
                    {searchQuery}&quot;.
                  </p>
                  <p className='text-sm'>
                    Coba gunakan kata kunci yang berbeda.
                  </p>
                </div>
              ) : (
                <div>
                  <p className='mb-2'>Belum ada kolektor yang terdaftar.</p>
                  <p className='text-sm'>
                    Klik tombol &quot;Tambah Kolektor&quot; untuk menambahkan
                    kolektor baru.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <table className='min-w-full divide-y divide-gray-200'>
              <thead>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Nama
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                    No. Telepon
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
                {filteredCollectors.map((collector) => (
                  <tr key={collector.id} className='hover:bg-gray-50'>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {collector.username || 'Tidak tersedia'}
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='text-sm text-gray-900'>
                        {collector.phone_number || 'Tidak tersedia'}
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          collector.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {collector.status === 'active'
                          ? 'Aktif'
                          : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className='space-x-3 whitespace-nowrap px-6 py-4 text-sm font-medium'>
                      <button
                        className='text-blue-600 transition-colors hover:text-blue-900'
                        onClick={() => handleViewDetail(collector.collector_id)}
                        title='Lihat Detail'
                      >
                        <Eye className='h-4 w-4' />
                      </button>
                      <button
                        className='text-emerald-600 transition-colors hover:text-emerald-900'
                        onClick={() =>
                          handleUpdateStatus(
                            collector.id,
                            collector.status === 'active'
                              ? 'inactive'
                              : 'active'
                          )
                        }
                        title={
                          collector.status === 'active'
                            ? 'Nonaktifkan'
                            : 'Aktifkan'
                        }
                      >
                        {collector.status === 'active' ? (
                          <Lock className='h-4 w-4' />
                        ) : (
                          <Unlock className='h-4 w-4' />
                        )}
                      </button>
                      <button
                        className='text-red-600 transition-colors hover:text-red-900'
                        onClick={() => handleDeleteCollector(collector.id)}
                        title='Hapus'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

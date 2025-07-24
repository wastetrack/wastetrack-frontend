'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle,
  User,
  Save,
  CircleDollarSign,
} from 'lucide-react';
import {
  wasteTransferRequestAPI,
  wasteTransferItemOfferingsAPI,
  wasteTypeAPI,
  wasteCategoryAPI,
} from '@/services/api/user';
import { industryTransferRequestAPI } from '@/services/api/offtaker';
import { decodeId, generateHashId } from '@/lib/id-utils';
import {
  WasteType,
  WasteCategory,
  WasteTransferRequest,
  WasteTransferItemOffering,
} from '@/types';
import { showToast } from '@/components/ui';

// Interface untuk waste item dengan detail lengkap (Transfer Request)
interface TransferItemWithDetails extends WasteTransferItemOffering {
  wasteType?: WasteType;
  wasteCategory?: WasteCategory;
}

export default function TransactionInDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id: encodedId } = params as { id: string };

  // State untuk transaction (hanya transfer)
  const [transaction, setTransaction] = useState<WasteTransferRequest | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transferItems, setTransferItems] = useState<TransferItemWithDetails[]>(
    []
  );
  const [, setTransferItemsLoading] = useState(false);
  const [wasteTypesMap, setWasteTypesMap] = useState<{
    [key: string]: WasteType;
  }>({});
  const [wasteCategoriesMap, setWasteCategoriesMap] = useState<{
    [key: string]: WasteCategory;
  }>({});
  const [sourceUserName, setSourceUserName] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<
    'pending' | 'assigned' | 'collecting' | 'completed' | 'cancelled'
  >('pending');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [, setUpdateSuccess] = useState<string | null>(null);
  const [, setUpdateError] = useState<string | null>(null);

  const handleItemsUpdate = (updatedItems: TransferItemWithDetails[]): void => {
    setTransferItems(updatedItems);
  };

  // Decode ID
  const realId = decodeId(encodedId);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!realId) {
        setError('ID tidak valid.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        let wasteBankId = null;
        try {
          const userId = await (
            await import('@/services/api/user')
          ).currentUserAPI.getUserId();
          wasteBankId = userId;
        } catch {}

        if (!wasteBankId) {
          setError('Gagal mendapatkan waste bank id.');
          setLoading(false);
          return;
        }

        try {
          const transferResponse =
            await wasteTransferRequestAPI.getWasteTransferRequestById(realId);

          const foundTransfer = transferResponse.data;

          // Validasi apakah transfer request ini untuk waste bank ini
          if (
            foundTransfer &&
            foundTransfer.destination_user_id === wasteBankId
          ) {
            setTransaction(foundTransfer);
            setSelectedStatus(
              foundTransfer.status as
                | 'pending'
                | 'assigned'
                | 'collecting'
                | 'completed'
                | 'cancelled'
            );

            // Fetch source user name untuk transfer request - langsung dari nested object
            const sourceInstitution =
              foundTransfer.source_user?.institution ||
              foundTransfer.source_user?.username ||
              'Tidak diketahui';
            setSourceUserName(sourceInstitution);
            await fetchTransferItems(foundTransfer.id);

            setLoading(false);
            return;
          } else {
            // Transfer request ditemukan tapi bukan untuk waste bank ini
            setError(
              'Transaksi tidak ditemukan atau Anda tidak berhak mengakses.'
            );
          }
        } catch {
          setError('Gagal memuat detail transaksi.');
        }

        // Jika tidak ditemukan
        setError('Transaksi tidak ditemukan.');
      } catch (generalError) {
        console.warn('Error umum saat memuat transaksi:', generalError);
        setError('Gagal memuat detail transaksi.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [realId]);

  const fetchTransferItems = async (transferFormId: string) => {
    setTransferItemsLoading(true);
    try {
      // Fetch all item offerings for this transfer form
      const itemsResponse =
        await wasteTransferItemOfferingsAPI.getOfferingsByTransferForm(
          transferFormId,
          { page: 1, size: 100 }
        );

      const items = itemsResponse.data;
      setTransferItems(items);

      // Get unique waste type IDs from the items
      const wasteTypeIds = [
        ...new Set(items.map((item) => item.waste_type_id)),
      ].filter(Boolean);

      if (wasteTypeIds.length > 0) {
        // Fetch waste types details one by one and build the map
        const wasteTypePromises = wasteTypeIds.map(async (id) => {
          try {
            const res = await wasteTypeAPI.getWasteTypeById(id);
            return { id, data: res.data };
          } catch (error) {
            console.error(`Failed to fetch waste type ${id}:`, error);
            return {
              id,
              data: {
                id,
                category_id: '',
                name: 'Unknown Type',
                description: '',
              },
            };
          }
        });

        const wasteTypeResults = await Promise.all(wasteTypePromises);

        const wasteTypesData = wasteTypeResults.reduce(
          (acc, result) => {
            acc[result.id] = result.data;
            return acc;
          },
          {} as Record<string, WasteType>
        );

        setWasteTypesMap(wasteTypesData);

        // Get category IDs from waste types
        const categoryIds = [
          ...new Set(
            Object.values(wasteTypesData)
              .map((wt) => wt.category_id)
              .filter(Boolean)
          ),
        ];

        if (categoryIds.length > 0) {
          // Fetch waste categories details one by one and build the map
          const categoryPromises = categoryIds.map(async (id) => {
            try {
              const res = await wasteCategoryAPI.getWasteCategoryById(id);
              return { id, data: res.data };
            } catch (error) {
              console.error(`Failed to fetch waste category ${id}:`, error);
              return {
                id,
                data: {
                  id,
                  name: 'Unknown Category',
                  description: '',
                },
              };
            }
          });

          const categoryResults = await Promise.all(categoryPromises);

          const categoriesData = categoryResults.reduce(
            (acc, result) => {
              acc[result.id] = result.data;
              return acc;
            },
            {} as Record<string, WasteCategory>
          );

          setWasteCategoriesMap(categoriesData);
        }
      }
    } catch (error) {
      console.error('Error fetching transfer items:', error);
      setTransferItems([]);
    } finally {
      setTransferItemsLoading(false);
    }
  };

  interface IsInputEditableParams {
    fieldType: 'weight' | 'price' | string;
    status:
      | 'pending'
      | 'assigned'
      | 'collecting'
      | 'completed'
      | 'cancelled'
      | string;
  }

  const isInputEditable = (
    fieldType: IsInputEditableParams['fieldType'],
    status: IsInputEditableParams['status']
  ): boolean => {
    switch (fieldType) {
      case 'weight':
        // Berat bisa diedit di pending dan collecting
        return ['pending', 'collecting'].includes(status);
      case 'price':
        // Harga hanya bisa diedit di pending
        return ['pending'].includes(status);
      default:
        return false;
    }
  };

  const handleUpdateTransferStatus = async () => {
    if (!transaction || !realId) {
      return;
    }

    if (updateLoading) {
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      // Validasi HANYA jika status bukan 'cancelled'
      if (selectedStatus !== 'cancelled') {
        if (!transferItems || transferItems.length === 0) {
          const errorMessage = 'Tidak ada item untuk diproses';
          setUpdateError(errorMessage);
          showToast.error(errorMessage);
          setUpdateLoading(false);
          return;
        }

        const invalidItems = transferItems.filter(
          (item) =>
            item.accepted_weight <= 0 || item.accepted_price_per_kgs <= 0
        );

        if (invalidItems.length > 0) {
          const errorMessage =
            'Berat dan harga per kg tidak boleh kosong atau 0';
          setUpdateError(errorMessage);
          showToast.error(errorMessage);
          setUpdateLoading(false);
          return;
        }
      }

      // Tambahan: Jika status sekarang pending dan selectedStatus juga pending, tampilkan toast error
      if (
        transaction.status === 'pending' &&
        (selectedStatus === 'pending' || selectedStatus === 'collecting')
      ) {
        const errorMessage = 'Status harus diubah ke assigned/ditugaskan';
        setUpdateError(errorMessage);
        showToast.error(errorMessage);
        setUpdateLoading(false);
        return;
      }

      // FLOW 1: Dari pending ke assigned (dengan perubahan harga/berat) - assignCollector
      if (transaction.status === 'pending' && selectedStatus === 'assigned') {
        const assignItems = transferItems.map((item) => ({
          waste_type_id: item.waste_type_id,
          accepted_weight: item.accepted_weight,
          accepted_price_per_kgs: item.accepted_price_per_kgs,
        }));

        await industryTransferRequestAPI.assignCollectorToWasteTransferRequest(
          realId,
          {
            assigned_collector_id: null,
            items: assignItems,
          }
        );
      }

      // FLOW 2: Dari assigned ke collecting - updateStatus
      else if (
        transaction.status === 'assigned' &&
        selectedStatus === 'collecting'
      ) {
        await industryTransferRequestAPI.updateWasteTransferRequestStatus(
          realId,
          {
            status: selectedStatus as 'collecting',
          }
        );
      }
      // Prevent going back to pending from assigned
      else if (
        transaction.status === 'assigned' &&
        selectedStatus === 'pending'
      ) {
        const errorMessage =
          'Status tidak dapat diubah kembali ke pending setelah assigned.';
        setUpdateError(errorMessage);
        showToast.error(errorMessage);
        setUpdateLoading(false);
        return;
      }

      // Prevent going back to pending or assigned from collecting
      else if (
        transaction.status === 'collecting' &&
        (selectedStatus === 'pending' || selectedStatus === 'assigned')
      ) {
        const errorMessage =
          selectedStatus === 'pending'
            ? 'Status tidak dapat diubah kembali ke pending setelah collecting.'
            : 'Status tidak dapat diubah kembali ke assigned setelah collecting.';
        setUpdateError(errorMessage);
        showToast.error(errorMessage);
        setUpdateLoading(false);
        return;
      }

      // FLOW 3: Cancel dari status manapun (kecuali completed) - updateStatus
      else if (
        selectedStatus === 'cancelled' &&
        transaction.status !== 'completed'
      ) {
        await industryTransferRequestAPI.updateWasteTransferRequestStatus(
          realId,
          {
            status: selectedStatus as 'cancelled',
          }
        );
      }

      // Toast message
      showToast.success('Transaksi berhasil diperbarui.');

      // Update local state
      setTransaction((prev) =>
        prev
          ? {
              ...prev,
              status: selectedStatus,
            }
          : prev
      );

      setUpdateSuccess('Transaksi berhasil diperbarui!');
      setTimeout(() => {
        setUpdateSuccess(null);
        router.push('/offtaker/transactions');
      }, 1000);
    } catch (error) {
      console.error('Error dalam handleUpdateTransferStatus:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Gagal memperbarui transaksi';
      setUpdateError(errorMessage);
      showToast.error(errorMessage);

      setTimeout(() => {
        setUpdateError(null);
      }, 5000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCompleteTransferStatus = async () => {
    if (!transaction || !realId) return;

    const allowedStatuses = ['assigned', 'collecting'];
    if (!allowedStatuses.includes(transaction.status)) {
      setUpdateError(
        `Transaksi harus dalam status "assigned" atau "collecting" untuk dapat diselesaikan. Status saat ini: ${transaction.status}`
      );
      showToast.error(
        `Status tidak valid untuk menyelesaikan transaksi: ${transaction.status}`
      );
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      // Hanya kirim berat saja
      const wasteTypeIds = transferItems.map((item) => item.waste_type_id);
      const weights = transferItems.map((item) => item.accepted_weight);

      const completeParams = {
        items: {
          waste_type_ids: wasteTypeIds,
          weights: weights, // Hanya berat yang dikirim
        },
      };

      await industryTransferRequestAPI.completeWasteTransferRequest(
        realId,
        completeParams
      );

      setTransaction((prev) =>
        prev ? { ...prev, status: 'completed' } : prev
      );

      setUpdateSuccess('Transaksi berhasil diselesaikan!');
      showToast.success('Transaksi berhasil diselesaikan.');
      setTimeout(() => {
        setUpdateSuccess(null);
        router.push('/offtaker/transactions');
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Gagal menyelesaikan transaksi';
      setUpdateError(errorMessage);
      showToast.error(errorMessage);
      setTimeout(() => {
        setUpdateError(null);
      }, 5000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
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
  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return timeString.replace(/\+\d{2}:\d{2}$/, '').substring(0, 5);
  };

  // Check if there are changes to enable/disable save button
  // const hasChanges = () => {
  //   if (!transaction) return false;
  //   return selectedStatus !== transaction.status;
  // };

  // Calculate totals
  const calculateTotals = () => {
    let totalPrice = 0;
    if (transaction?.status === 'completed') {
      totalPrice = transaction.total_price || 0;
    } else {
      totalPrice = transferItems.reduce(
        (total, item) =>
          total +
          (item.accepted_weight || 0) * (item.accepted_price_per_kgs || 0),
        0
      );
    }

    const totalWeight = transferItems.reduce(
      (total, item) =>
        transaction?.status === 'completed'
          ? total + (item.verified_weight || 0)
          : total + (item.accepted_weight || 0),
      0
    );

    return { totalPrice, totalWeight };
  };

  // Loading state
  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>Memuat detail transaksi...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex flex-col items-center gap-2 text-red-600'>
          <AlertCircle className='h-8 w-8' />
          <span>{error}</span>
          <button
            onClick={handleBack}
            className='mt-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200'
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!transaction) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center text-gray-600'>
          <CircleDollarSign className='mx-auto h-12 w-12 text-gray-400' />
          <p className='mt-2'>Data transaksi tidak ditemukan</p>
          <button
            onClick={handleBack}
            className='mt-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200'
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusDisplay(transaction.status);
  const hashId = generateHashId(transaction.id);
  const { totalPrice, totalWeight } = calculateTotals();

  return (
    <div className='space-y-6 font-poppins'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={handleBack}
            className='flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-50'
          >
            <ArrowLeft className='h-5 w-5 text-gray-600' />
          </button>
          <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
            <CircleDollarSign className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Detail Transaksi Transfer
            </h1>
            <p className='mt-1 text-gray-600'>
              Informasi lengkap transaksi {hashId}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='my-6 grid grid-cols-1 gap-6 text-left md:grid-cols-3'>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <DollarSign className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Harga
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  Rp {totalPrice.toLocaleString('id-ID')}
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
                  Status
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  <span
                    className={`inline-flex rounded-full px-2 text-sm ${status.color}`}
                  >
                    {status.text}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Calendar className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Tanggal Janji
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {transaction.appointment_date
                    ? new Date(transaction.appointment_date).toLocaleDateString(
                        'id-ID',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )
                    : '-'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Transaction Card */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='p-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Transaction Information */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Informasi Transaksi
              </h3>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    ID Transaksi
                  </p>
                  <p className='text-gray-900'>{hashId || 'Tidak tersedia'}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Tipe Transaksi
                  </p>
                  <div className='mt-1'>
                    Transfer dari{' '}
                    {transaction.form_type === 'industry_request'
                      ? 'Bank Sampah'
                      : 'Industri'}
                  </div>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Pengirim</p>
                  <p className='text-gray-900'>
                    {sourceUserName || 'Tidak diketahui'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    No. Telepon Pengirim
                  </p>
                  <p className='text-gray-900'>
                    {transaction.source_phone_number || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Status</p>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs ${status.color}`}
                  >
                    {status.text}
                  </span>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Total Harga
                  </p>
                  <p className='text-lg font-bold text-emerald-600'>
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Information */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Informasi Janji Temu
              </h3>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Tanggal</p>
                  <p className='text-gray-900'>
                    {transaction.appointment_date
                      ? new Date(
                          transaction.appointment_date
                        ).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Waktu</p>
                  <p className='text-gray-900'>
                    {formatTime(transaction.appointment_start_time)} -{' '}
                    {formatTime(transaction.appointment_end_time)}
                  </p>
                </div>
                {transaction.appointment_location && (
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Lokasi</p>
                    <p className='text-gray-900'>
                      {transaction.source_user
                        ? [
                            transaction.source_user.address,
                            transaction.source_user.city,
                            transaction.source_user.province,
                          ]
                            .filter(Boolean)
                            .join(', ')
                        : '-'}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-sm font-medium text-gray-500'>Dibuat</p>
                  <p className='text-gray-900'>
                    {transaction.created_at
                      ? new Date(transaction.created_at).toLocaleDateString(
                          'id-ID',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )
                      : 'Tidak diketahui'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Terakhir Update
                  </p>
                  <p className='text-gray-900'>
                    {transaction.updated_at
                      ? new Date(transaction.updated_at).toLocaleDateString(
                          'id-ID',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )
                      : 'Belum pernah diperbarui'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Waste Items Information */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='p-6'>
          <div className='mb-6 flex items-center gap-3'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Informasi Sampah
            </h3>
          </div>

          <div className='space-y-4'>
            {/* Render Transfer Request Items */}
            {transferItems.map((item, index) => (
              <div
                key={item.id}
                className='rounded-lg border border-gray-200 bg-gray-50 p-4'
              >
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {/* Informasi Tipe Sampah */}
                  <div>
                    <h4 className='mb-2 font-medium text-gray-900'>
                      Item #{index + 1}
                    </h4>
                    <div className='space-y-2'>
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Tipe Sampah
                        </p>
                        <p className='text-gray-900'>
                          {wasteTypesMap[item.waste_type_id]?.name ||
                            'Tidak diketahui'}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Kategori
                        </p>
                        <p className='text-gray-900'>
                          {wasteTypesMap[item.waste_type_id]?.category_id
                            ? wasteCategoriesMap[
                                wasteTypesMap[item.waste_type_id].category_id
                              ]?.name || 'Tidak diketahui'
                            : 'Tidak diketahui'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='mb-2 font-medium text-gray-900'>
                      Kuantitas & Berat
                    </h4>
                    <div className='space-y-2'>
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Berat Ditawarkan (Asal)
                        </p>
                        <p className='text-gray-900'>
                          {item.offering_weight
                            .toLocaleString('id-ID', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })
                            .replace(/\./g, ',')}{' '}
                          kg
                        </p>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Berat Diterima
                        </p>
                        {transaction.status === 'completed' ? (
                          <p className='mt-1 text-gray-900'>
                            {item.verified_weight
                              .toLocaleString('id-ID', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              })
                              .replace(/\./g, ',')}{' '}
                            kg
                          </p>
                        ) : (
                          <input
                            type='number'
                            min='0.1'
                            step='0.001'
                            value={
                              typeof item.accepted_weight === 'number'
                                ? String(item.accepted_weight).replace(
                                    /^0+(\d)/,
                                    '$1'
                                  )
                                : item.accepted_weight
                            }
                            onChange={(e) => {
                              let val = e.target.value;
                              if (/^0+\d/.test(val) && !/^0\./.test(val)) {
                                val = val.replace(/^0+/, '');
                              }

                              let numValue = parseFloat(val) || 0;
                              const maxVal = parseFloat(
                                String(item.offering_weight)
                              );
                              if (numValue > maxVal) {
                                numValue = maxVal;
                                val = String(maxVal);
                              }

                              const updatedItems = [...transferItems];
                              updatedItems[index] = {
                                ...item,
                                accepted_weight: numValue,
                              };
                              setTransferItems(updatedItems);
                              handleItemsUpdate(updatedItems);
                            }}
                            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${
                              isInputEditable('weight', transaction.status)
                                ? 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
                                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500'
                            }`}
                            disabled={
                              updateLoading ||
                              !isInputEditable('weight', transaction.status)
                            }
                          />
                        )}
                        {transaction.status !== 'completed' && (
                          <span className='text-xs text-gray-600'>kg</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='mb-2 font-medium text-gray-900'>
                      Informasi Harga
                    </h4>
                    <div className='space-y-2'>
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Harga Ditawarkan per Kg (Asal)
                        </p>
                        <p className='text-gray-900'>
                          Rp{' '}
                          {item.offering_price_per_kgs.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Harga Diterima per Kg
                        </p>
                        {transaction.status === 'completed' ? (
                          <p className='mt-1 text-gray-900'>
                            Rp{' '}
                            {item.accepted_price_per_kgs.toLocaleString(
                              'id-ID'
                            )}
                          </p>
                        ) : (
                          <input
                            type='number'
                            min='0'
                            step='0.01'
                            value={
                              typeof item.accepted_price_per_kgs === 'number'
                                ? String(item.accepted_price_per_kgs).replace(
                                    /^0+(\d)/,
                                    '$1'
                                  )
                                : item.accepted_price_per_kgs
                            }
                            onChange={(e) => {
                              let val = e.target.value;
                              if (/^0+\d/.test(val) && !/^0\./.test(val)) {
                                val = val.replace(/^0+/, '');
                              }

                              let numValue = parseFloat(val) || 0;
                              const maxVal = item.offering_price_per_kgs;
                              if (numValue > maxVal) {
                                numValue = maxVal;
                                val = String(maxVal);
                              }

                              const updatedItems = [...transferItems];
                              updatedItems[index] = {
                                ...item,
                                accepted_price_per_kgs: numValue,
                              };
                              setTransferItems(updatedItems);
                              handleItemsUpdate(updatedItems);
                            }}
                            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${
                              isInputEditable('price', transaction.status)
                                ? 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
                                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500'
                            }`}
                            disabled={
                              updateLoading ||
                              !isInputEditable('price', transaction.status)
                            }
                          />
                        )}
                        {transaction.status !== 'completed' && (
                          <span className='text-xs text-gray-600'>Rp/kg</span>
                        )}
                        {transaction.status === 'collecting' && (
                          <p className='mt-1 text-xs text-gray-500'>
                            Harga tidak dapat diubah pada status collecting
                          </p>
                        )}
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Subtotal
                        </p>
                        <p className='font-medium text-emerald-600'>
                          Rp{' '}
                          {transaction.status === 'completed'
                            ? (
                                item.verified_weight *
                                  item.accepted_price_per_kgs || 0
                              ).toLocaleString('id-ID')
                            : (
                                item.accepted_weight *
                                item.accepted_price_per_kgs
                              ).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {transaction.notes && (
              <div className='border-y border-gray-200 py-4'>
                <p className='mb-1 text-sm font-medium text-gray-500'>
                  Catatan
                </p>
                <p className='text-sm text-gray-700'>{transaction.notes}</p>
              </div>
            )}

            {/* Summary */}
            <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium text-emerald-800'>
                    Total Item Sampah
                  </p>
                  <p className='text-sm text-emerald-600'>
                    {transferItems.length} jenis sampah
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-emerald-800'>
                    Total Berat Diterima
                  </p>
                  <p className='text-sm text-emerald-600'>
                    {totalWeight
                      .toLocaleString('id-ID', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                      .replace(/\./g, ',')}{' '}
                    kg
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-emerald-800'>Total Nilai</p>
                  <p className='text-lg font-bold text-emerald-700'>
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Section */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='p-6'>
          <div className='mb-6 flex items-center gap-3'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Update Status Transaksi
            </h3>
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Status Update */}
            <div>
              <h4 className='mb-4 font-medium text-gray-900'>Update Status</h4>
              <div className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Status Saat Ini
                  </label>
                  <div className='text-sm text-gray-600'>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor='status-select'
                    className='mb-2 block text-sm font-medium text-gray-700'
                  >
                    Ubah Status
                  </label>
                  <select
                    id='status-select'
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(
                        e.target.value as
                          | 'pending'
                          | 'assigned'
                          | 'collecting'
                          | 'cancelled'
                      )
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                      transaction.status === 'cancelled' ||
                      transaction.status === 'completed'
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500'
                        : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                    disabled={
                      transaction.status === 'cancelled' ||
                      transaction.status === 'completed'
                    }
                  >
                    <option value='pending'>Pending</option>
                    <option value='assigned'>Ditugaskan</option>
                    <option value='collecting'>Pengambilan</option>
                    <option value='cancelled'>Dibatalkan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Collector Information */}
            <div>
              <h4 className='mb-4 font-medium text-gray-900'>
                Informasi Collector
              </h4>
              <div className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Collector Saat Ini
                  </label>
                  <div className='text-sm text-gray-600'>
                    {transaction.assigned_collector_id ? (
                      <span className='inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700'>
                        <User className='h-3 w-3' />
                        Collector Assigned
                      </span>
                    ) : (
                      <span className='text-gray-500'>Belum ditugaskan</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3'>
            <div className='flex items-start space-x-2'>
              <div className='text-sm'>
                <ul className='list-disc space-y-1 pl-5 text-blue-700'>
                  <li>
                    Pastikan{' '}
                    <span className='font-semibold'>Harga Diterima</span> dan{' '}
                    <span className='font-semibold'>Berat Diterima</span> tidak
                    0 pada setiap item sebelum menyimpan perubahan atau
                    menyelesaikan transaksi.
                  </li>
                  <li>
                    Pastikan status transaksi masih{' '}
                    <span className='font-semibold'>Pending</span> sebelum
                    melakukan mengganti ke status assigned.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className='pt-6'>
            <button
              onClick={handleUpdateTransferStatus}
              disabled={
                updateLoading ||
                ['completed', 'cancelled'].includes(transaction.status)
              }
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                !updateLoading &&
                !['completed', 'cancelled'].includes(transaction.status)
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
            >
              {updateLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Save className='h-4 w-4' />
              )}
              {updateLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>

      {/* Complete Transaction Section */}
      {transaction.status === 'collecting' && (
        <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
          <div className='p-6'>
            <div className='space-y-4'>
              <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
                <div className='flex items-start space-x-2'>
                  <div className='text-sm'>
                    <p className='text-blue-700'>
                      Apabila semua transaksi sudah selesai dan sesuai, dari
                      mulai pengantaran dan persetujuan kedua belah pihak.
                      Silahkan konfirmasi melalui tombol di bawah ini.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Warning */}
              {transaction &&
                transaction.status &&
                !['assigned', 'collecting'].includes(transaction.status) && (
                  <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
                    <div className='flex items-start space-x-2'>
                      <div className='text-sm'>
                        <p className='text-yellow-700'>
                          Transaksi tidak dapat diselesaikan dalam status &quot;
                          {transaction.status}&quot;. Status harus
                          &quot;assigned&quot; atau &quot;collecting&quot;.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {(() => {
                const hasInvalidItem = transferItems.some(
                  (item) =>
                    item.accepted_weight <= 0 ||
                    item.accepted_price_per_kgs <= 0
                );

                const isStatusInvalid =
                  transaction &&
                  !['assigned', 'collecting'].includes(transaction.status);

                return (
                  <button
                    onClick={() => {
                      if (isStatusInvalid) {
                        showToast.error(
                          `Status tidak valid untuk menyelesaikan transaksi: ${transaction.status}`
                        );
                        return;
                      }

                      if (hasInvalidItem) {
                        showToast.error(
                          'Semua item harus memiliki berat dan harga per kg yang valid (lebih dari 0)'
                        );
                        return;
                      }

                      handleCompleteTransferStatus();
                    }}
                    disabled={
                      updateLoading || isStatusInvalid || hasInvalidItem
                    }
                    className='flex w-full items-center justify-center space-x-2 rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {updateLoading ? (
                      <>
                        <Loader2 className='h-5 w-5 animate-spin text-white' />
                        <span>Menyelesaikan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className='h-5 w-5 text-white' />
                        <span>Transaksi Selesai</span>
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

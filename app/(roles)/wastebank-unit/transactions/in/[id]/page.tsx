'use client';

import React, { useEffect, useState } from 'react';
import { formatLocation } from '@/lib/mapbox-utils';
import { useRouter, useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  Package,
  User,
  Save,
  CircleDollarSign,
} from 'lucide-react';
import {
  wasteDropRequestAPI,
  userListAPI,
  wasteDropRequestItemAPI,
  wastePriceAPI,
  wasteTransferRequestAPI,
  wasteTransferItemOfferingsAPI,
  wasteTypeAPI,
  wasteCategoryAPI,
} from '@/services/api/user';
import {
  wasteBankDropRequestAPI,
  getCollectorManagements,
  wasteBankTransferRequestAPI,
} from '@/services/api/wastebank';
import { decodeId, generateHashId } from '@/lib/id-utils';
import {
  WasteDropRequest,
  User as UserType,
  WasteDropRequestItem,
  WasteType,
  WasteCategory,
  WastePrice,
  CollectorManagement,
  CollectorManagementParams,
  WasteTransferRequest,
  WasteTransferItemOffering,
} from '@/types';
import { showToast } from '@/components/ui';

// Interface untuk waste item dengan detail lengkap (Drop Request)
interface WasteItemWithDetails extends WasteDropRequestItem {
  wasteType?: WasteType;
  wasteCategory?: WasteCategory;
  price?: number;
  notes?: string;
}

// Interface untuk waste item dengan detail lengkap (Transfer Request)
interface TransferItemWithDetails extends WasteTransferItemOffering {
  wasteType?: WasteType;
  wasteCategory?: WasteCategory;
}

// Union type untuk transaction
type Transaction = WasteDropRequest | WasteTransferRequest;

export default function TransactionInDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id: encodedId } = params as { id: string };

  // State untuk transaction (bisa drop atau transfer)
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [transactionType, setTransactionType] = useState<
    'drop' | 'transfer' | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');

  // State untuk waste items (drop request)
  const [wasteItems, setWasteItems] = useState<WasteItemWithDetails[]>([]);
  const [wasteItemsLoading, setWasteItemsLoading] = useState(false);

  // State untuk transfer items
  const [transferItems, setTransferItems] = useState<TransferItemWithDetails[]>(
    []
  );
  const [transferItemsLoading, setTransferItemsLoading] = useState(false);
  const [wasteTypesMap, setWasteTypesMap] = useState<{
    [key: string]: WasteType;
  }>({});
  const [wasteCategoriesMap, setWasteCategoriesMap] = useState<{
    [key: string]: WasteCategory;
  }>({});
  const [sourceUserName, setSourceUserName] = useState<string>('');

  // States untuk status update dan collector assignment (hanya untuk drop request)
  const [collectorsWithUser, setCollectorsWithUser] = useState<
    Array<CollectorManagement & { collector?: UserType }>
  >([]);
  const [collectorsLoading, setCollectorsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    'pending' | 'assigned' | 'collecting' | 'completed' | 'cancelled'
  >('pending');
  const [selectedCollector, setSelectedCollector] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [, setUpdateSuccess] = useState<string | null>(null);
  const [, setUpdateError] = useState<string | null>(null);

  // State & effect untuk alamat hasil reverse geocode lokasi janji temu untuk drop request
  const [appointmentAddress, setAppointmentAddress] = useState<string>('');
  const [addressLoading, setAddressLoading] = useState(false);

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

        // Coba drop request terlebih dahulu
        try {
          const dropRequest =
            await wasteDropRequestAPI.getWasteDropRequestById(realId);
          const foundDrop = dropRequest.data;

          if (foundDrop) {
            setTransaction(foundDrop);
            setTransactionType('drop');
            setSelectedStatus(foundDrop.status);
            setSelectedCollector(foundDrop.assigned_collector_id || '');

            const customerName =
              foundDrop.customer?.username || 'Tidak diketahui';
            setCustomerName(customerName);

            await fetchWasteItems(foundDrop.id);
            await fetchCollectors();

            // Fetch address untuk drop request
            if (
              foundDrop.appointment_location &&
              foundDrop.appointment_location.latitude &&
              foundDrop.appointment_location.longitude
            ) {
              setAddressLoading(true);
              try {
                const address = await formatLocation({
                  latitude: foundDrop.appointment_location.latitude,
                  longitude: foundDrop.appointment_location.longitude,
                });
                setAppointmentAddress(address);
              } catch (error) {
                console.warn('Error formatting location:', error);
                setAppointmentAddress('Gagal memuat alamat');
              } finally {
                setAddressLoading(false);
              }
            } else {
              setAppointmentAddress('Lokasi tidak tersedia');
            }

            setLoading(false);
            return;
          }
        } catch {
          // Tidak perlu console.error, ini flow normal
          console.log(
            'Drop request tidak ditemukan, mencoba transfer request...'
          );
        }

        // Jika tidak ditemukan sebagai drop request, coba sebagai transfer request
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
            setTransactionType('transfer');
            setSelectedStatus(
              foundTransfer.status as
                | 'pending'
                | 'assigned'
                | 'collecting'
                | 'completed'
                | 'cancelled'
            );
            setSelectedCollector(foundTransfer.assigned_collector_id || '');

            // Fetch source user name untuk transfer request - langsung dari nested object
            const sourceInstitution =
              foundTransfer.source_user?.institution ||
              foundTransfer.source_user?.username ||
              'Tidak diketahui';
            setSourceUserName(sourceInstitution);

            // Fetch transfer items
            await fetchTransferItems(foundTransfer.id);
            // Fetch collectors untuk transfer request juga
            await fetchCollectors();

            setLoading(false);
            return;
          } else {
            // Transfer request ditemukan tapi bukan untuk waste bank ini
            setError(
              'Transaksi tidak ditemukan atau Anda tidak berhak mengakses.'
            );
          }
        } catch {
          console.log('Transfer request juga tidak ditemukan');
        }

        // Jika tidak ditemukan di kedua endpoint
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

  const fetchWasteItems = async (transactionId: string) => {
    setWasteItemsLoading(true);
    try {
      // Fetch waste items untuk transaction ini
      const itemsResponse =
        await wasteDropRequestItemAPI.getWasteDropRequestItems({
          request_id: transactionId,
          page: 1,
          size: 100,
        });

      // Fetch waste prices untuk mendapatkan harga dan detail lengkap
      let wasteBankId = null;
      try {
        const userId = await (
          await import('@/services/api/user')
        ).currentUserAPI.getUserId();
        wasteBankId = userId;
      } catch {}

      let wastePrices: WastePrice[] = [];
      if (wasteBankId) {
        try {
          const pricesResponse = await wastePriceAPI.getWastePrices({
            waste_bank_id: wasteBankId,
            page: 1,
            size: 100,
          });
          wastePrices = pricesResponse.data;
        } catch (error) {
          console.log('Error fetching waste prices:', error);
        }
      }

      // Map items dengan detail dari waste prices
      const itemsWithDetails = itemsResponse.data.map(
        (item: WasteDropRequestItem) => {
          // Cari price data yang cocok dengan waste_type_id
          const priceData = wastePrices.find(
            (price) => price.waste_type_id === item.waste_type_id
          );

          if (priceData) {
            return {
              ...item,
              wasteType: priceData.waste_type,
              wasteCategory: priceData.waste_type?.waste_category,
              price: priceData.custom_price_per_kgs,
            } as WasteItemWithDetails;
          } else {
            // Jika tidak ditemukan di price data, fallback ke cara lama
            return {
              ...item,
              wasteType: undefined,
              wasteCategory: undefined,
              price:
                item.verified_weight > 0 && item.verified_subtotal > 0
                  ? item.verified_subtotal / item.verified_weight
                  : 0,
            } as WasteItemWithDetails;
          }
        }
      );

      setWasteItems(itemsWithDetails);
    } catch (error) {
      console.log('Error fetching waste items:', error);
      setWasteItems([]);
    } finally {
      setWasteItemsLoading(false);
    }
  };

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

  const fetchCollectors = async () => {
    setCollectorsLoading(true);
    try {
      // Get current waste bank ID
      let wasteBankId = null;
      try {
        const userId = await (
          await import('@/services/api/user')
        ).currentUserAPI.getUserId();
        wasteBankId = userId;
      } catch (error) {
        console.log('Error getting waste bank ID:', error);
      }

      if (!wasteBankId) {
        return;
      }

      // Get collector managements filtered by waste_bank_id
      const response = await getCollectorManagements({
        waste_bank_id: wasteBankId,
        status: 'active',
        page: 1,
        size: 100,
      } as CollectorManagementParams);

      const collectorManagements: CollectorManagement[] = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      // Get all users to map collector_id to username
      const usersResponse = await userListAPI.getFlatUserList({
        page: 1,
        size: 100,
        role: '',
        institution: '',
      });

      // Map collector managements with user details (for display)
      const collectorsWithUserData = collectorManagements.map(
        (collectorMgmt: CollectorManagement) => ({
          ...collectorMgmt,
          collector: usersResponse.data.find(
            (user: UserType) => user.id === collectorMgmt.collector_id
          ),
        })
      );
      setCollectorsWithUser(collectorsWithUserData);
    } catch (error) {
      console.log('Error fetching collectors:', error);
    } finally {
      setCollectorsLoading(false);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!transaction || !realId || transactionType !== 'drop') return;

    const dropTransaction = transaction as WasteDropRequest;
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      // Update status if changed
      if (selectedStatus !== dropTransaction.status) {
        if (
          ['pending', 'assigned', 'collecting', 'cancelled'].includes(
            selectedStatus
          )
        ) {
          await wasteBankDropRequestAPI.updateWasteDropRequestStatus(realId, {
            status: selectedStatus as
              | 'pending'
              | 'assigned'
              | 'collecting'
              | 'cancelled',
          });
        }
      }

      // Assign collector if changed
      if (
        selectedCollector !== (dropTransaction.assigned_collector_id || '') &&
        selectedCollector
      ) {
        await wasteBankDropRequestAPI.assignCollectorToWasteDropRequest(
          realId,
          selectedCollector
        );
        showToast.success('Collector berhasil di-assign.');
      }

      // Update local transaction state
      setTransaction((prev) =>
        prev && transactionType === 'drop'
          ? {
              ...prev,
              status: selectedStatus,
              assigned_collector_id: selectedCollector || undefined,
            }
          : prev
      );

      setUpdateSuccess('Transaksi berhasil diperbarui!');
      showToast.success('Transaksi berhasil diperbarui.');
      setTimeout(() => {
        setUpdateSuccess(null);
        router.push('/wastebank-unit/transactions/in');
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Gagal memperbarui transaksi';
      setUpdateError(errorMessage);
      showToast.error(errorMessage || 'Gagal memperbarui transaksi');
      setTimeout(() => {
        setUpdateError(null);
      }, 5000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateTransferStatus = async () => {
    if (!transaction || !realId || transactionType !== 'transfer') return;

    const transferTransaction = transaction as WasteTransferRequest;
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      // Update status untuk transfer request
      if (selectedStatus !== transferTransaction.status) {
        if (
          ['pending', 'assigned', 'collecting', 'cancelled'].includes(
            selectedStatus
          )
        ) {
          await wasteBankTransferRequestAPI.updateWasteTransferRequestStatus(
            realId,
            {
              status: selectedStatus as 'collecting' | 'cancelled',
            }
          );
        }
      }

      // Assign collector if changed untuk transfer request
      if (
        selectedCollector !==
          (transferTransaction.assigned_collector_id || '') &&
        selectedCollector
      ) {
        // Untuk transfer request, kita perlu menyiapkan items data
        const assignItems = transferItems.map((item) => ({
          waste_type_id: item.waste_type_id,
          accepted_weight: item.accepted_weight,
          accepted_price_per_kgs: item.accepted_price_per_kgs,
        }));

        await wasteBankTransferRequestAPI.assignCollectorToWasteTransferRequest(
          realId,
          {
            assigned_collector_id: selectedCollector,
            items: assignItems,
          }
        );
        showToast.success('Collector berhasil di-assign.');
      }

      // Update local transaction state
      setTransaction((prev) =>
        prev && transactionType === 'transfer'
          ? {
              ...prev,
              status: selectedStatus,
              assigned_collector_id: selectedCollector || undefined,
            }
          : prev
      );

      setUpdateSuccess('Transaksi berhasil diperbarui!');
      showToast.success('Transaksi berhasil diperbarui.');
      setTimeout(() => {
        setUpdateSuccess(null);
        router.push('/wastebank-unit/transactions/in');
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Gagal memperbarui transaksi';
      setUpdateError(errorMessage);
      showToast.error(errorMessage || 'Gagal memperbarui transaksi');
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
  const hasChanges = () => {
    if (!transaction) return false;
    if (transactionType === 'drop') {
      const dropTransaction = transaction as WasteDropRequest;
      return (
        selectedStatus !== dropTransaction.status ||
        selectedCollector !== (dropTransaction.assigned_collector_id || '')
      );
    } else if (transactionType === 'transfer') {
      const transferTransaction = transaction as WasteTransferRequest;
      return (
        selectedStatus !== transferTransaction.status ||
        selectedCollector !== (transferTransaction.assigned_collector_id || '')
      );
    }
    return false;
  };

  // Calculate totals based on transaction type
  const calculateTotals = () => {
    if (transactionType === 'drop') {
      const totalPrice = (transaction as WasteDropRequest)?.total_price || 0;
      const totalWeight = wasteItems.reduce(
        (total, item) => total + item.verified_weight,
        0
      );
      return { totalPrice, totalWeight };
    } else if (transactionType === 'transfer') {
      const totalPrice = transferItems.reduce((total, item) => {
        return total + item.accepted_weight * item.accepted_price_per_kgs;
      }, 0);
      const totalWeight = transferItems.reduce(
        (total, item) => total + item.accepted_weight,
        0
      );
      return { totalPrice, totalWeight };
    }
    return { totalPrice: 0, totalWeight: 0 };
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
          <CreditCard className='mx-auto h-12 w-12 text-gray-400' />
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
  const isDropRequest = transactionType === 'drop';
  const isTransferRequest = transactionType === 'transfer';

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
            {isDropRequest ? (
              <CreditCard className='text-emerald-600' size={28} />
            ) : (
              <CircleDollarSign className='text-emerald-600' size={28} />
            )}
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Detail Transaksi Masuk{' '}
              {isDropRequest ? '(Nasabah)' : '(Bank Sampah/Industri)'}
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
                  {status.text}
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
                        'id-ID'
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
                    {isDropRequest
                      ? (transaction as WasteDropRequest).delivery_type ===
                        'dropoff'
                        ? 'Antar Sendiri'
                        : (transaction as WasteDropRequest).delivery_type ===
                            'pickup'
                          ? 'Penjemputan'
                          : (transaction as WasteDropRequest).delivery_type
                      : 'Transfer dari ' +
                        ((transaction as WasteTransferRequest).form_type ===
                        'industry_request'
                          ? 'Industri'
                          : 'Bank Sampah')}
                  </div>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    {isDropRequest ? 'Customer' : 'Pengirim'}
                  </p>
                  <p className='text-gray-900'>
                    {isDropRequest
                      ? customerName || 'Tidak diketahui'
                      : sourceUserName || 'Tidak diketahui'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    No. Telepon Pengirim
                  </p>
                  <p className='text-gray-900'>
                    {isDropRequest
                      ? (transaction as WasteDropRequest).user_phone_number ||
                        'Tidak tersedia'
                      : (transaction as WasteTransferRequest)
                          .source_phone_number || 'Tidak tersedia'}
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
                      {isDropRequest
                        ? addressLoading
                          ? 'Memuat alamat...'
                          : appointmentAddress ||
                            `Lat: ${transaction.appointment_location.latitude}, Lng: ${transaction.appointment_location.longitude}`
                        : (transaction as WasteTransferRequest).source_user
                            ?.address || '-'}
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

          {(isDropRequest ? wasteItemsLoading : transferItemsLoading) ? (
            <div className='flex items-center justify-center py-8'>
              <div className='flex items-center gap-2 text-gray-600'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span>Memuat informasi sampah...</span>
              </div>
            </div>
          ) : (
              isDropRequest
                ? wasteItems.length === 0
                : transferItems.length === 0
            ) ? (
            <div className='py-8 text-center text-gray-500'>
              <Package className='mx-auto h-12 w-12 text-gray-300' />
              <p className='mt-2'>Tidak ada item sampah ditemukan</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Render Drop Request Items */}
              {isDropRequest &&
                wasteItems.map((item, index) => (
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
                              {item.wasteType?.name || 'Tidak diketahui'}
                            </p>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Kategori
                            </p>
                            <p className='text-gray-900'>
                              {item.wasteCategory?.name || 'Tidak diketahui'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informasi Kuantitas & Berat */}
                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>
                          Kuantitas & Berat
                        </h4>
                        <div className='space-y-2'>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Kuantitas
                            </p>
                            <p className='text-gray-900'>
                              {item.quantity} unit
                            </p>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Berat Terverifikasi
                            </p>
                            <p className='text-gray-900'>
                              {item.verified_weight > 0
                                ? `${item.verified_weight} kg`
                                : 'Belum diverifikasi'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informasi Harga */}
                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>
                          Informasi Harga
                        </h4>
                        <div className='space-y-2'>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Harga per Kg
                            </p>
                            <p className='text-gray-900'>
                              {(item.price ?? 0) > 0
                                ? `Rp ${(item.price ?? 0).toLocaleString('id-ID')}`
                                : 'Belum ditentukan'}
                            </p>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Subtotal
                            </p>
                            <p className='font-medium text-emerald-600'>
                              Rp{' '}
                              {item.verified_subtotal.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Render Transfer Request Items */}
              {isTransferRequest &&
                transferItems.map((item, index) => (
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
                                    wasteTypesMap[item.waste_type_id]
                                      .category_id
                                  ]?.name || 'Tidak diketahui'
                                : 'Tidak diketahui'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informasi Kuantitas & Berat */}
                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>
                          Kuantitas & Berat
                        </h4>
                        <div className='space-y-2'>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Berat Ditawarkan
                            </p>
                            <p className='text-gray-900'>
                              {item.offering_weight} kg
                            </p>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Berat Diterima
                            </p>
                            <p className='text-gray-900'>
                              {item.accepted_weight > 0
                                ? `${item.accepted_weight} kg`
                                : 'Belum diterima'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informasi Harga */}
                      <div>
                        <h4 className='mb-2 font-medium text-gray-900'>
                          Informasi Harga
                        </h4>
                        <div className='space-y-2'>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Harga Ditawarkan per Kg
                            </p>
                            <p className='text-gray-900'>
                              Rp{' '}
                              {item.offering_price_per_kgs.toLocaleString(
                                'id-ID'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Harga Diterima per Kg
                            </p>
                            <p className='text-gray-900'>
                              {item.accepted_price_per_kgs > 0
                                ? `Rp ${item.accepted_price_per_kgs.toLocaleString('id-ID')}`
                                : 'Belum ditentukan'}
                            </p>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-500'>
                              Subtotal
                            </p>
                            <p className='font-medium text-emerald-600'>
                              Rp{' '}
                              {(
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
                      {isDropRequest ? wasteItems.length : transferItems.length}{' '}
                      jenis sampah
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-emerald-800'>
                      Total Berat {isDropRequest ? 'Terverifikasi' : 'Diterima'}
                    </p>
                    <p className='text-sm text-emerald-600'>
                      {totalWeight.toFixed(2)} kg
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
          )}
        </div>
      </div>

      {/* Status Update and Collector Assignment - Only show for transactions that support it */}
      {(isDropRequest || isTransferRequest) && (
        <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
          <div className='p-6'>
            <div className='mb-6 flex items-center gap-3'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Update Status & Assign Collector
              </h3>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* Status Update */}
              <div>
                <h4 className='mb-4 font-medium text-gray-900'>
                  Update Status
                </h4>
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
                      className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    >
                      {isDropRequest && (
                        <>
                          <option value='pending'>Pending</option>
                          <option value='assigned'>Ditugaskan</option>
                          <option value='collecting'>Pengambilan</option>
                          <option value='cancelled'>Dibatalkan</option>
                        </>
                      )}
                      {isTransferRequest && (
                        <>
                          <option value='collecting'>Pengambilan</option>
                          <option value='cancelled'>Dibatalkan</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Collector Assignment */}
              <div>
                <h4 className='mb-4 font-medium text-gray-900'>
                  Assign Collector
                </h4>
                <div className='space-y-4'>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Collector Saat Ini
                    </label>
                    <div className='text-sm text-gray-600'>
                      {(
                        isDropRequest
                          ? (transaction as WasteDropRequest)
                              .assigned_collector_id
                          : (transaction as WasteTransferRequest)
                              .assigned_collector_id
                      ) ? (
                        <span className='inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700'>
                          <User className='h-3 w-3' />
                          {collectorsWithUser.find(
                            (c) =>
                              c.collector_id ===
                              (isDropRequest
                                ? (transaction as WasteDropRequest)
                                    .assigned_collector_id
                                : (transaction as WasteTransferRequest)
                                    .assigned_collector_id)
                          )?.collector?.username || 'Collector tidak ditemukan'}
                        </span>
                      ) : (
                        <span className='text-gray-500'>Belum ditugaskan</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor='collector-select'
                      className='mb-2 block text-sm font-medium text-gray-700'
                    >
                      Pilih Collector
                    </label>
                    {collectorsLoading ? (
                      <div className='flex items-center gap-2 text-gray-500'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        <span className='text-sm'>Memuat collector...</span>
                      </div>
                    ) : (
                      <select
                        id='collector-select'
                        value={selectedCollector}
                        onChange={(e) => setSelectedCollector(e.target.value)}
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      >
                        <option value=''>Pilih Collector</option>
                        {collectorsWithUser.map((collectorMgmt) => (
                          <option
                            key={collectorMgmt.id}
                            value={collectorMgmt.collector_id}
                          >
                            {collectorMgmt.collector?.username ||
                              `Collector ${collectorMgmt.collector_id}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {isTransferRequest && (
              <div className='mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3'>
                <div className='flex items-start space-x-2'>
                  <div className='text-sm'>
                    <p className='mt-1 text-blue-700'>
                      Pastikan status transaksi masih{' '}
                      <span className='font-semibold'>Pending</span> sebelum
                      melakukan assign collector. Jika status sudah{' '}
                      <span className='font-semibold'>Pengambilan</span> atau{' '}
                      <span className='font-semibold'>Dibatalkan</span>,
                      collector tidak dapat ditugaskan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className='pt-6'>
              <button
                onClick={
                  isDropRequest
                    ? handleUpdateTransaction
                    : handleUpdateTransferStatus
                }
                disabled={!hasChanges() || updateLoading}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  hasChanges() && !updateLoading
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
              {!hasChanges() && !updateLoading && (
                <p className='mt-2 text-xs text-gray-500'>
                  Tidak ada perubahan untuk disimpan
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

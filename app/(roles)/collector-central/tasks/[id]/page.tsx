'use client';

import React, { useEffect, useState } from 'react';
import { useLocation, type LocationType } from '@/lib/mapbox-utils';
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
  Edit,
  Save,
  X,
  CircleDollarSign,
} from 'lucide-react';
import {
  wasteDropRequestAPI,
  wasteTransferRequestAPI,
  wasteTransferItemOfferingsAPI,
  wasteDropRequestItemAPI,
  wastePriceAPI,
  wasteTypeAPI,
  wasteCategoryAPI,
} from '@/services/api/user';
import { wasteCollectorDropRequestAPI } from '@/services/api/collector';
import { decodeId, generateHashId } from '@/lib/id-utils';
import {
  WasteDropRequest,
  WasteTransferRequest,
  WasteTransferItemOffering,
  WasteDropRequestItem,
  WasteType,
  WasteCategory,
  WastePrice,
} from '@/types';
import { showToast } from '@/components/ui';

// Interface untuk waste item dengan detail lengkap (Drop Request)
interface WasteItemWithDetails extends WasteDropRequestItem {
  wasteType?: WasteType;
  wasteCategory?: WasteCategory;
  price?: number;
  notes?: string;
}

// Interface untuk transfer item dengan detail lengkap
interface TransferItemWithDetails extends WasteTransferItemOffering {
  wasteType?: WasteType;
  wasteCategory?: WasteCategory;
}

// Union type untuk transaction
type Transaction = WasteDropRequest | WasteTransferRequest;

function LocationAddress({ location }: { location: LocationType }) {
  const { formattedLocation, isLoading } = useLocation(location);
  return (
    <p className='font-medium text-gray-900'>
      {isLoading ? 'Memuat alamat...' : formattedLocation}
    </p>
  );
}

export default function TasksDetailPage() {
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

  // State untuk editing (hanya untuk drop request)
  const [isEditing, setIsEditing] = useState(false);
  const [editingWeights, setEditingWeights] = useState<{
    [key: string]: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

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
        // Coba sebagai drop request terlebih dahulu
        try {
          const dropResponse =
            await wasteDropRequestAPI.getWasteDropRequestById(realId);
          const dropRequest = dropResponse.data;

          if (dropRequest) {
            setTransaction(dropRequest);
            setTransactionType('drop');

            // Fetch customer name dari nested object
            const customerName =
              dropRequest.customer?.username || 'Tidak diketahui';
            setCustomerName(customerName);

            // Fetch waste items
            await fetchWasteItems(dropRequest.id);
            setLoading(false);
            return;
          }
        } catch {
          console.log(
            'Drop request tidak ditemukan, mencoba transfer request...'
          );
        }

        // Jika tidak ditemukan sebagai drop request, coba sebagai transfer request
        try {
          const transferResponse =
            await wasteTransferRequestAPI.getWasteTransferRequestById(realId);
          const transferRequest = transferResponse.data;

          if (transferRequest) {
            setTransaction(transferRequest);
            setTransactionType('transfer');

            // Fetch source user name dari nested object
            const sourceInstitution =
              transferRequest.source_user?.institution ||
              transferRequest.source_user?.username ||
              'Tidak diketahui';
            setSourceUserName(sourceInstitution);

            // Fetch transfer items
            await fetchTransferItems(transferRequest.id);
            setLoading(false);
            return;
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
      let wastePrices: WastePrice[] = [];
      try {
        const pricesResponse = await wastePriceAPI.getWastePrices({
          page: 1,
          size: 100,
        });
        wastePrices = pricesResponse.data;
      } catch (error) {
        console.log('Error fetching waste prices:', error);
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

      // Initialize editing weights
      const initialWeights: { [key: string]: string } = {};
      itemsWithDetails.forEach((item) => {
        initialWeights[item.waste_type_id] = item.verified_weight.toString();
      });
      setEditingWeights(initialWeights);
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
                data: { id, name: 'Unknown Category', description: '' },
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

  const handleBack = () => {
    router.back();
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset editing weights to original values
    const resetWeights: { [key: string]: string } = {};
    wasteItems.forEach((item) => {
      resetWeights[item.waste_type_id] = item.verified_weight.toString();
    });
    setEditingWeights(resetWeights);
  };

  const handleWeightChange = (wasteTypeId: string, value: string) => {
    // Validate input - only allow numbers and decimal point
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value)) {
      setEditingWeights((prev) => ({
        ...prev,
        [wasteTypeId]: value,
      }));
    }
  };

  const handleSubmitWeights = async () => {
    if (!transaction || !realId || transactionType !== 'drop') return;

    setSubmitting(true);
    try {
      // Prepare API payload
      const waste_type_ids: string[] = [];
      const weights: number[] = [];

      wasteItems.forEach((item) => {
        const weight = parseFloat(editingWeights[item.waste_type_id] || '0');
        if (weight > 0) {
          waste_type_ids.push(item.waste_type_id);
          weights.push(weight);
        }
      });

      const payload = {
        items: {
          waste_type_ids,
          weights,
        },
      };

      console.log('Submitting weights:', payload);

      // Submit to API
      await wasteCollectorDropRequestAPI.completeWasteDropRequest(
        realId,
        payload
      );

      // Refresh data
      await fetchDetail();
      setIsEditing(false);

      // Show success message
      showToast.success(
        'Berat berhasil diperbarui dan transaksi telah diselesaikan!'
      );
    } catch (error) {
      console.error('Error submitting weights:', error);
      showToast.error('Gagal memperbarui berat. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchDetail = async () => {
    if (!realId) return;

    try {
      if (transactionType === 'drop') {
        const response =
          await wasteDropRequestAPI.getWasteDropRequestById(realId);
        const dropRequest = response.data;
        if (dropRequest) {
          setTransaction(dropRequest);
          await fetchWasteItems(dropRequest.id);
        }
      } else if (transactionType === 'transfer') {
        const response =
          await wasteTransferRequestAPI.getWasteTransferRequestById(realId);
        const transferRequest = response.data;
        if (transferRequest) {
          setTransaction(transferRequest);
          await fetchTransferItems(transferRequest.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
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

  // Check if status allows editing (hanya untuk drop request)
  const canEditWeights = () => {
    return (
      transactionType === 'drop' &&
      transaction &&
      transaction.status === 'collecting'
    );
  };

  // Format time display (remove timezone and show only HH:MM)
  const formatTime = (timeString: string) => {
    return timeString?.replace(/\+\d{2}:\d{2}$/, '').substring(0, 5);
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
              Detail Tugas {isDropRequest ? 'Pengambilan' : 'Transfer'}
            </h1>
            <p className='mt-1 text-gray-600'>
              Informasi lengkap tugas {hashId}
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
                Informasi Tugas
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>Tipe Transaksi</p>
                    <div className='font-medium text-gray-900'>
                      {isDropRequest
                        ? (transaction as WasteDropRequest).delivery_type ===
                          'dropoff'
                          ? 'Drop Request - Antar Sendiri'
                          : 'Drop Request - Penjemputan'
                        : `Transfer Request - ${(transaction as WasteTransferRequest).form_type === 'industry_request' ? 'dari Industri' : 'dari Bank Sampah'}`}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>
                      {isDropRequest ? 'Customer' : 'Pengirim'}
                    </p>
                    <p className='font-medium text-gray-900'>
                      {isDropRequest ? customerName : sourceUserName}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>No. Telepon</p>
                    <p className='font-medium text-gray-900'>
                      {isDropRequest
                        ? (transaction as WasteDropRequest).user_phone_number
                        : (transaction as WasteTransferRequest)
                            .source_phone_number}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>Status</p>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs ${status.color}`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>Total Harga</p>
                    <p className='text-lg font-bold text-emerald-600'>
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Information */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Informasi Janji Temu
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>Tanggal</p>
                    <p className='font-medium text-gray-900'>
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
                </div>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-sm text-gray-500'>Waktu</p>
                    <p className='font-medium text-gray-900'>
                      {formatTime(transaction.appointment_start_time)} -{' '}
                      {formatTime(transaction.appointment_end_time)}
                    </p>
                  </div>
                </div>
                {transaction.appointment_location && (
                  <div className='flex items-start gap-3'>
                    <div>
                      <p className='text-sm text-gray-500'>Lokasi</p>
                      {isDropRequest ? (
                        <LocationAddress
                          location={transaction.appointment_location}
                        />
                      ) : (
                        <p className='font-medium text-gray-900'>
                          {(transaction as WasteTransferRequest).source_user
                            ?.address || 'Alamat tidak tersedia'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Waste Items Information */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Informasi Sampah
              </h3>
            </div>

            {/* Edit Controls - hanya untuk drop request */}
            {canEditWeights() && !wasteItemsLoading && (
              <div className='flex gap-2'>
                {!isEditing ? (
                  <button
                    onClick={handleStartEdit}
                    className='flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200'
                  >
                    <Edit className='h-4 w-4' />
                    Edit Berat
                  </button>
                ) : (
                  <div className='flex gap-2'>
                    <button
                      onClick={handleSubmitWeights}
                      disabled={submitting}
                      className='flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700 transition-colors hover:bg-green-200 disabled:opacity-50'
                    >
                      {submitting ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Save className='h-4 w-4' />
                      )}
                      {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className='flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50'
                    >
                      <X className='h-4 w-4' />
                      Batal
                    </button>
                  </div>
                )}
              </div>
            )}
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
                        <h4 className='font-medium text-gray-900'>
                          Kuantitas & Berat
                        </h4>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <div>
                              <p className='text-sm font-medium text-gray-500'>
                                Kuantitas
                              </p>
                              <p className='text-gray-900'>
                                {item.quantity} unit
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='w-full'>
                              <p className='text-sm font-medium text-gray-500'>
                                Berat Terverifikasi
                              </p>
                              {isEditing ? (
                                <div className='mt-1'>
                                  <input
                                    type='text'
                                    value={
                                      editingWeights[item.waste_type_id] || ''
                                    }
                                    onChange={(e) =>
                                      handleWeightChange(
                                        item.waste_type_id,
                                        e.target.value
                                      )
                                    }
                                    className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                                    placeholder='0.00'
                                  />
                                  <p className='mt-1 text-xs text-gray-500'>
                                    Dalam satuan kg (contoh: 1.5)
                                  </p>
                                </div>
                              ) : (
                                <p className='text-gray-900'>
                                  {item.verified_weight > 0
                                    ? `${item.verified_weight} kg`
                                    : 'Belum diverifikasi'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Informasi Harga */}
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          Informasi Harga
                        </h4>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
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
                          </div>
                          <div className='flex items-center gap-2'>
                            <div>
                              <p className='text-sm font-medium text-gray-500'>
                                Subtotal
                              </p>
                              <p className='font-medium text-emerald-600'>
                                {isEditing
                                  ? `Rp ${(parseFloat(editingWeights[item.waste_type_id] || '0') * (item.price ?? 0)).toLocaleString('id-ID')}`
                                  : `Rp ${item.verified_subtotal.toLocaleString('id-ID')}`}
                              </p>
                            </div>
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
                        <h4 className='font-medium text-gray-900'>
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
                        <h4 className='font-medium text-gray-900'>
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
                      {isDropRequest
                        ? isEditing
                          ? Object.values(editingWeights)
                              .reduce(
                                (total, weight) =>
                                  total + parseFloat(weight || '0'),
                                0
                              )
                              .toFixed(2)
                          : wasteItems
                              .reduce(
                                (total, item) => total + item.verified_weight,
                                0
                              )
                              .toFixed(2)
                        : totalWeight.toFixed(2)}{' '}
                      kg
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-emerald-800'>Total Nilai</p>
                    <p className='text-lg font-bold text-emerald-700'>
                      Rp{' '}
                      {isDropRequest
                        ? isEditing
                          ? wasteItems
                              .reduce((total, item) => {
                                const weight = parseFloat(
                                  editingWeights[item.waste_type_id] || '0'
                                );
                                return total + weight * (item.price ?? 0);
                              }, 0)
                              .toLocaleString('id-ID')
                          : wasteItems
                              .reduce(
                                (total, item) => total + item.verified_subtotal,
                                0
                              )
                              .toLocaleString('id-ID')
                        : totalPrice.toLocaleString('id-ID')}
                    </p>
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
